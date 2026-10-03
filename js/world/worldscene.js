/* WasteWise — reusable walkable world scene (camera, depth sorting, interactions,
   tap-to-walk, exits, objective markers). Chapter logic plugs in through `cfg`. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const D = WW.draw;
  const E = WW.engine;
  const TS = 48;

  WW.makeWorldScene = function (cfg) {
    const scene = {
      cfg,
      map: null,
      player: null,
      milo: null,
      actors: [],
      npcs: {},
      interacts: [],
      cam: { x: 0, y: 0 },
      busy: false,
      near: null,
      cache: null,
      cacheScale: 0,
      exits: [],
      t: 0,

      enter(params) {
        this.params = params || {};
        this.map = new WW.TileMap(cfg.mapDef, params);
        this.refreshObjects();
        this.bake();
        WW.fx.clear();
        this.actors = [];
        this.npcs = {};
        this.interacts = [];
        this.exits = [];
        this.busy = false;
        this.near = null;
        const spawn = params.spawn || this.map.extra.spawn;
        this.player = new WW.Player({ x: spawn.x, y: spawn.y, dir: params.dir || 'up' });
        this.actors.push(this.player);
        if (cfg.milo !== false) {
          this.milo = new WW.Follower({ x: spawn.x - 34, y: spawn.y + 6, dir: params.dir || 'up' });
          this.milo.lead = this.player;
          this.actors.push(this.milo);
        }
        this.snapCamera();
        if (cfg.music || cfg.mapDef.music) WW.audio.playMusic(cfg.music || cfg.mapDef.music);
        WW.ui.hud.show(true);
        WW.ui.showTouch(true);
        cfg.setup && cfg.setup(this, params);
        this.snapCamera();
        if (!this._resizeHook) {
          this._resizeHook = () => { if (E.scene === this) this.bake(); };
          E.onResize.push(this._resizeHook);
        }
      },
      exit() {
        WW.ui.showTouch(false);
        cfg.exit && cfg.exit(this);
      },
      bake() {
        const k = Math.min(2, Math.max(1, E.pixelRatio));
        // keep big maps within safe canvas limits
        const maxK = Math.sqrt(14e6 / (this.map.W * this.map.H));
        const scale = Math.min(k, maxK);
        if (this.cache && Math.abs(scale - this.cacheScale) < 0.05) return;
        this.cacheScale = scale;
        this.cache = WW.worldArt.bakeGround(this.map, scale);
      },
      refreshObjects() {
        let changed = false;
        for (const o of this.map.objects) {
          const hidden = o.show ? !o.show() : false;
          if (hidden !== !!o.hidden) { o.hidden = hidden; changed = true; }
        }
        if (changed || !this._solidOnce) { this.map.recomputeSolid(); this._solidOnce = true; }
      },
      addNPC(key, who, x, y, opts = {}) {
        const a = new WW.Actor(Object.assign({ who, x, y, dir: 'down', speed: 120, hw: 12, hh: 8 }, opts));
        this.npcs[key] = a;
        this.actors.push(a);
        return a;
      },
      removeNPC(key) {
        const a = this.npcs[key];
        if (!a) return;
        this.actors = this.actors.filter((x) => x !== a);
        delete this.npcs[key];
      },
      addInteract(it) {
        this.interacts = this.interacts.filter((x) => x.id !== it.id);
        this.interacts.push(Object.assign({ r: 58, icon: '✋' }, it));
      },
      removeInteract(id) {
        this.interacts = this.interacts.filter((x) => x.id !== id);
      },
      objPoint(id) {
        const o = this.map.get(id);
        if (!o) return null;
        if (o.ip) return { x: o.ip.x * TS, y: o.ip.y * TS };
        return { x: o.x + o.pw / 2, y: o.y + o.ph + 24 };
      },
      itPoint(it) {
        if (it.actor) return { x: it.actor.x, y: it.actor.y + 10 };
        if (it.obj) return this.objPoint(it.obj);
        return { x: it.x, y: it.y };
      },
      async runScript(fn) {
        if (this.busy) return;
        this.busy = true;
        this.player.path = null;
        this.player.moving = false;
        WW.input.clear();
        try {
          await fn(this);
        } catch (err) {
          console.error('Script error', err);
          WW.ui.toast('Oops! Something went wrong. Please try that again.');
        } finally {
          this.busy = false;
          this.moveOnly = false;
          WW.input.clear();
          this.player.path = null;
          WW.ui.hud.refresh();
        }
      },
      snapCamera() {
        if (!this.player) return;
        const t = this.camTarget();
        this.cam.x = t.x;
        this.cam.y = t.y;
      },
      camTarget() {
        const f = this.camFocus || this.player;
        let x = f.x - E.W / 2, y = f.y - 40 - E.H / 2;
        if (this.map.W <= E.W) x = (this.map.W - E.W) / 2;
        else x = U.clamp(x, 0, this.map.W - E.W);
        if (this.map.H <= E.H) y = (this.map.H - E.H) / 2;
        else y = U.clamp(y, -(cfg.camTopPad || 0), this.map.H - E.H);
        return { x, y };
      },
      focusPoint() {
        if (!this.player) return null;
        return { x: this.player.x - this.cam.x, y: this.player.y - 30 - this.cam.y };
      },

      update(dt) {
        this.t += dt;
        const p = this.player;
        const uiBlocking = WW.ui.isBlocking();
        if (this.busy && this.moveOnly && !uiBlocking) p.control(dt, this);
        if (!this.busy && !uiBlocking) {
          p.control(dt, this);
          // interactions
          this.near = null;
          let best = 1e9;
          for (const it of this.interacts) {
            if (it.enabled && !it.enabled()) continue;
            const pt = this.itPoint(it);
            if (!pt) continue;
            const d = Math.hypot(pt.x - p.x, pt.y - p.y);
            if (d < it.r && d < best) { best = d; this.near = it; }
          }
          if (this.near && WW.input.pressed('action')) {
            WW.input.consume('action');
            const it = this.near;
            p.path = null;
            const pt = this.itPoint(it);
            p.face(pt.x, pt.y - 20);
            WW.audio.sfx('click');
            this.runScript(it.run);
          }
          // tap target reached?
          if (this.tapIt && !p.path) {
            const it = this.tapIt;
            this.tapIt = null;
            const pt = this.itPoint(it);
            if (pt && Math.hypot(pt.x - p.x, pt.y - p.y) < it.r + 30 && (!it.enabled || it.enabled())) {
              p.face(pt.x, pt.y - 20);
              this.runScript(it.run);
            }
          }
          // exits
          for (const ex of this.exits) {
            if (p.x > ex.x0 && p.x < ex.x1 && p.y > ex.y0 && p.y < ex.y1) {
              if (!ex.enabled || ex.enabled()) {
                this.runScript(ex.run);
                break;
              }
            }
          }
        } else if (!(this.busy && this.moveOnly && !uiBlocking)) {
          p.moving = !!p.path;
          if (p.path) p.followPath(dt, this.map);
        }
        if (!this.busy && WW.input.pressed('pause')) WW.ui.menu.open();
        if (!this.busy && WW.input.pressed('notebook')) WW.ui.notebook.open();
        for (const a of this.actors) if (a !== p) a.update(dt, this);
        if (p.emote) { p.emoteT -= dt; if (p.emoteT <= 0) p.emote = null; }
        if (p.vz || p.z > 0) { p.vz -= 900 * dt; p.z += p.vz * dt; if (p.z <= 0) { p.z = 0; p.vz = 0; } }
        cfg.update && cfg.update(this, dt);
        // gentle nudge if a player stands still for a long time with nothing open
        if (!this.busy && !uiBlocking && !p.moving && !p.path && this.milo && WW.story.objective && WW.story.objective.text) {
          this.idleT = (this.idleT || 0) + dt;
          if (this.idleT > 28) {
            this.idleT = 0;
            this.milo.setEmote('?', 2.5);
            this.milo.jump(160);
            WW.ui.toast('🐭 Milo: “Psst! ' + U.esc(WW.story.objective.text) + ' — follow the yellow arrow!”', 'info', 4200);
          }
        } else this.idleT = 0;
        WW.fx.update(dt);
        // camera
        const tgt = this.camTarget();
        const k = 1 - Math.pow(0.0015, dt);
        this.cam.x += (tgt.x - this.cam.x) * k;
        this.cam.y += (tgt.y - this.cam.y) * k;
      },
      updateAlways(dt) {
        // keep ambient animation alive under menus/transitions
        WW.fx.update(dt);
      },

      draw(ctx, t) {
        const cam = { x: Math.round(this.cam.x * 2) / 2, y: Math.round(this.cam.y * 2) / 2 };
        ctx.fillStyle = cfg.bg || '#3f8a4f';
        ctx.fillRect(0, 0, E.W, E.H);
        ctx.save();
        ctx.translate(-cam.x, -cam.y);
        const view = { x: cam.x, y: cam.y, w: E.W, h: E.H };
        // ground cache
        const k = this.cacheScale;
        const sx = U.clamp(view.x, 0, this.map.W), sy = U.clamp(view.y, 0, this.map.H);
        const sw = Math.min(E.W, this.map.W - sx), sh = Math.min(E.H, this.map.H - sy);
        if (sw > 0 && sh > 0) ctx.drawImage(this.cache, sx * k, sy * k, sw * k, sh * k, sx, sy, sw, sh);
        WW.worldArt.drawWater(ctx, this.map, t, view);
        const ws = WW.save.data.world;
        // floor layer
        for (const o of this.map.objects) {
          if (o.layer !== 'floor' || o.hidden) continue;
          if (o.x > view.x + view.w + 60 || o.x + o.pw < view.x - 60 || o.y > view.y + view.h + 60 || o.y + o.ph < view.y - 60) continue;
          const fn = WW.worldArt.paint[o.type];
          fn && fn(ctx, o, ws, t, this);
        }
        cfg.drawFloor && cfg.drawFloor(this, ctx, t);
        // depth-sorted objects and actors
        const list = [];
        for (const o of this.map.objects) {
          if (o.layer !== 'sort' || o.hidden) continue;
          if (o.x > view.x + view.w + 140 || o.x + o.pw < view.x - 140 || o.y > view.y + view.h + 220 || o.y + o.ph < view.y - 60) continue;
          list.push({ y: o.sortY, o });
        }
        for (const a of this.actors) if (a.visible) list.push({ y: a.y, a });
        if (cfg.extraSorted) for (const e of cfg.extraSorted(this)) list.push(e);
        list.sort((a, b) => a.y - b.y);
        for (const e of list) {
          if (e.a) e.a.draw(ctx, t);
          else if (e.o) {
            const fn = WW.worldArt.paint[e.o.type];
            fn && fn(ctx, e.o, ws, t, this);
          } else if (e.draw) e.draw(ctx, t);
        }
        WW.fx.draw(ctx);
        cfg.drawOver && cfg.drawOver(this, ctx, t);
        this.drawMarkers(ctx, t);
        ctx.restore();
        cfg.drawScreen && cfg.drawScreen(this, ctx, t);
        this.drawOffscreenArrow(ctx, t, cam);
        WW.fx.drawScreen(ctx);
      },

      drawMarkers(ctx, t) {
        // objective marker
        const obj = WW.story && WW.story.objectivePoint(this);
        if (obj) {
          const bob = Math.sin(t * 5) * 5;
          ctx.save();
          ctx.translate(obj.x, obj.y - (obj.h || 90) + bob);
          D.poly(ctx, [-11, -14, 11, -14, 0, 4], '#ffd23f', '#9a6a00', 2.5);
          ctx.restore();
          ctx.strokeStyle = `rgba(255,210,63,${0.5 + Math.sin(t * 4) * 0.3})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(obj.x, obj.y + 2, 26 + Math.sin(t * 4) * 3, 10, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // interaction prompt
        if (this.near && !this.busy && !WW.ui.isBlocking()) {
          const it = this.near;
          const pt = it.actor ? { x: it.actor.x, y: it.actor.headY() - 12 } : (() => { const q = this.itPoint(it); return { x: q.x, y: q.y - (it.promptH || 70) }; })();
          const label = typeof it.label === 'function' ? it.label() : it.label;
          const key = WW.input.lastDevice === 'touch' ? '✋' : 'E';
          ctx.font = D.font(14, 800);
          const w = ctx.measureText(label).width + 44;
          const pop = 1 + Math.sin(t * 6) * 0.03;
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.scale(pop, pop);
          D.bubble(ctx, 0, 0, w, 30, '#fffdf2', '#2d5a45');
          D.rr(ctx, -w / 2 + 6, -26, 22, 22, 6, '#2fa36b', '#1f5f3a', 1.5);
          D.text(ctx, key, -w / 2 + 17, -15, 13, '#fff');
          D.text(ctx, label, 12, -15, 14, '#23443a');
          ctx.restore();
        }
      },
      drawOffscreenArrow(ctx, t, cam) {
        const obj = WW.story && WW.story.objectivePoint(this);
        if (!obj) return;
        const sx = obj.x - cam.x, sy = obj.y - 40 - cam.y;
        const m = 40;
        if (sx > 10 && sx < E.W - 10 && obj.y - cam.y > 10 && sy < E.H - 10) return;
        const cx = E.W / 2, cy = E.H / 2;
        const ang = Math.atan2(sy - cy, sx - cx);
        const ex = U.clamp(cx + Math.cos(ang) * 1000, m, E.W - m);
        const ey = U.clamp(cy + Math.sin(ang) * 1000, m + 50, E.H - m - 10);
        // project onto the border properly
        const tx = Math.abs(Math.cos(ang)) > 1e-3 ? ((Math.cos(ang) > 0 ? E.W - m : m) - cx) / Math.cos(ang) : 1e9;
        const ty = Math.abs(Math.sin(ang)) > 1e-3 ? ((Math.sin(ang) > 0 ? E.H - m - 10 : m + 50) - cy) / Math.sin(ang) : 1e9;
        const tt = Math.min(tx, ty);
        const px = cx + Math.cos(ang) * tt, py = cy + Math.sin(ang) * tt;
        ctx.save();
        ctx.translate(isFinite(px) ? px : ex, isFinite(py) ? py : ey);
        ctx.rotate(ang);
        const pulse = 1 + Math.sin(t * 6) * 0.08;
        ctx.scale(pulse, pulse);
        D.circle(ctx, 0, 0, 20, 'rgba(255,253,242,.95)', '#2d5a45', 3);
        D.poly(ctx, [12, 0, -6, -9, -2, 0, -6, 9], '#2fa36b', '#1f5f3a', 1.5);
        ctx.restore();
      },

      onPointerDown(x, y) {
        if ((this.busy && !this.moveOnly) || WW.ui.isBlocking()) return;
        const wx = x + this.cam.x, wy = y + this.cam.y;
        if (this.moveOnly) {
          const path = this.map.findPath(this.player.x, this.player.y, wx, wy);
          if (path) { this.player.path = path; this.player.pathRun = false; WW.fx.spawn('ring', wx, wy, { col: '#ffd23f' }); }
          return;
        }
        // tapped an interactable?
        let hit = null, best = 1e9;
        for (const it of this.interacts) {
          if (it.enabled && !it.enabled()) continue;
          const pt = this.itPoint(it);
          if (!pt) continue;
          const hy = it.actor ? it.actor.y - 30 : pt.y - 30;
          const d = Math.min(Math.hypot(pt.x - wx, pt.y - wy), Math.hypot(pt.x - wx, hy - wy));
          if (d < 64 && d < best) { best = d; hit = it; }
        }
        const p = this.player;
        if (hit) {
          const pt = this.itPoint(hit);
          if (Math.hypot(pt.x - p.x, pt.y - p.y) < hit.r) {
            p.face(pt.x, pt.y - 20);
            this.runScript(hit.run);
            return;
          }
          this.tapIt = hit;
          const path = this.map.findPath(p.x, p.y, pt.x, pt.y);
          if (path) { p.path = path; p.pathRun = false; }
          WW.fx.spawn('ring', pt.x, pt.y, { col: '#2fa36b' });
          return;
        }
        this.tapIt = null;
        const path = this.map.findPath(p.x, p.y, wx, wy);
        if (path) {
          p.path = path;
          p.pathRun = Math.hypot(wx - p.x, wy - p.y) > 300;
          WW.fx.spawn('ring', wx, wy, { col: '#ffd23f' });
        } else {
          WW.audio.sfx('thud');
        }
      },
    };
    return scene;
  };
})();
