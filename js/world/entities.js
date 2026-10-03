/* WasteWise — actors: player, Milo (follower), staff NPCs and wandering students. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const D = WW.draw;

  class Actor {
    constructor(o) {
      Object.assign(this, {
        who: 'kid', x: 0, y: 0, dir: 'down', speed: 150, anim: 0, moving: false, run: false,
        emotion: 'happy', pose: 'idle', talking: false, visible: true, z: 0, vz: 0, scale: 1,
        path: null, solid: true, hw: 10, hh: 7, emote: null, emoteT: 0, name: '', seed: Math.random() * 10,
        hold: null, label: null, faceTarget: null,
      }, o);
    }
    setEmote(icon, dur = 1.6) {
      this.emote = icon;
      this.emoteT = dur;
    }
    face(x, y) {
      this.dir = U.dirFromVec(x - this.x, y - this.y, this.dir);
    }
    /** Walk along a path (pathfinding). Resolves on arrival. */
    walkTo(map, x, y, opts = {}) {
      return new Promise((resolve) => {
        const pts = opts.direct ? [{ x, y }] : map.findPath(this.x, this.y, x, y);
        if (!pts || !pts.length) { this.x = x; this.y = y; resolve(); return; }
        this.path = pts;
        this.pathRun = !!opts.run;
        this._arrive = resolve;
      });
    }
    followPath(dt, map) {
      if (!this.path || !this.path.length) return false;
      const p = this.path[0];
      const dx = p.x - this.x, dy = p.y - this.y;
      const d = Math.hypot(dx, dy);
      const sp = this.speed * (this.pathRun ? 1.7 : 1) * dt;
      if (d <= sp + 0.5) {
        this.x = p.x;
        this.y = p.y;
        this.path.shift();
        if (!this.path.length) {
          this.path = null;
          this.moving = false;
          const r = this._arrive;
          this._arrive = null;
          r && r();
          return false;
        }
      } else {
        this.x += (dx / d) * sp;
        this.y += (dy / d) * sp;
        this.dir = U.dirFromVec(dx, dy, this.dir);
      }
      this.moving = true;
      this.run = this.pathRun;
      this.anim += dt * (this.run ? 15 : 10);
      return true;
    }
    update(dt, scene) {
      if (this.emote) {
        this.emoteT -= dt;
        if (this.emoteT <= 0) this.emote = null;
      }
      if (this.vz || this.z > 0) {
        this.vz -= 900 * dt;
        this.z += this.vz * dt;
        if (this.z <= 0) { this.z = 0; this.vz = 0; }
      }
      if (!this.followPath(dt, scene.map)) {
        this.moving = false;
      }
      if (this.faceTarget && !this.moving) this.face(this.faceTarget.x, this.faceTarget.y);
    }
    jump(v = 260) {
      if (this.z <= 0.01) this.vz = WW.save.reducedMotion() ? 140 : v;
    }
    draw(ctx, t) {
      if (!this.visible) return;
      WW.chars.draw(ctx, this.who, {
        x: this.x, y: this.y, dir: this.dir, t, anim: this.anim, moving: this.moving, run: this.run,
        emotion: this.emotion, talking: this.talking || (WW.ui && WW.ui.isSpeaking(this.who)), pose: this.pose, z: this.z,
        scale: this.scale, seed: this.seed, spec: this.spec, look: this.look,
        hold: this.hold ? (c, len) => WW.items.draw(c, this.hold, 0, len + 6, 0.45) : null,
      });
      if (this.carry) WW.items.draw(ctx, this.carry, this.x, this.y - 84 * this.scale - this.z + Math.sin(t * 5) * 2, 0.75);
      if (this.emote) this.drawEmote(ctx, t);
      if (this.label) D.text(ctx, this.label, this.x, this.y + 14, 11, '#fff', { outline: 'rgba(30,60,45,.75)', outlineWidth: 3.5 });
    }
    headY() {
      const h = this.who === 'milo' ? 58 : this.who === 'kid' || this.spec ? 66 : 84;
      return this.y - h * this.scale - this.z;
    }
    drawEmote(ctx, t) {
      const y = this.headY() - 6 + Math.sin(t * 6) * 2;
      const k = Math.min(1, (1.6 - this.emoteT) * 6 + 0.2);
      ctx.save();
      ctx.translate(this.x + 14, y);
      ctx.scale(k, k);
      D.bubble(ctx, 0, 0, 30, 28);
      const icon = this.emote;
      if (icon === '!' || icon === '?') D.text(ctx, icon, 0, -14, 20, icon === '!' ? '#e5484d' : '#3d8bfd');
      else if (icon === 'heart') D.text(ctx, '♥', 0, -14, 18, '#ff5d8f');
      else if (icon === 'idea') { D.circle(ctx, 0, -16, 6, '#ffd23f', '#9a7a12', 1.4); D.rr(ctx, -3, -11, 6, 4, 1, '#9aa5b0'); }
      else if (icon === 'note') D.text(ctx, '♪', 0, -14, 18, '#2fa36b');
      else if (icon === 'drop') D.ell(ctx, 0, -14, 4.5, 6, '#5fbfe2', '#2f7fa8', 1.4);
      else if (icon === '...') D.text(ctx, '…', 0, -16, 18, '#2d5a45');
      else if (icon === 'star') D.star(ctx, 0, -14, 8, 5, '#ffd23f', '#9a7a12');
      else D.text(ctx, icon, 0, -14, 16);
      ctx.restore();
    }
  }

  class Player extends Actor {
    constructor(o) {
      super(Object.assign({ who: 'kid', speed: 165, hw: 11, hh: 8 }, o));
      this.stepT = 0;
      this.trail = [];
      this.tapPath = null;
    }
    control(dt, scene) {
      const v = WW.input.moveVector();
      const map = scene.map;
      let moved = false;
      if (v.len > 0.05) {
        this.path = null;
        this.tapTarget = null;
        this.run = WW.input.running();
        const sp = this.speed * (this.run ? 1.65 : 1) * dt;
        const before = { x: this.x, y: this.y };
        map.move(this, v.x * sp, v.y * sp);
        this.dir = U.dirFromVec(v.x, v.y, this.dir);
        moved = Math.hypot(this.x - before.x, this.y - before.y) > 0.2;
        this.moving = true;
      } else if (this.path) {
        const before = { x: this.x, y: this.y };
        this.followPath(dt, map);
        moved = Math.hypot(this.x - before.x, this.y - before.y) > 0.2;
      } else {
        this.moving = false;
      }
      if (this.moving) {
        this.anim += dt * (this.run ? 15 : 10);
        this.stepT += dt * (this.run ? 1.6 : 1);
        if (this.stepT > 0.3) {
          this.stepT = 0;
          this._alt = !this._alt;
          WW.audio.sfx('step', { alt: this._alt });
          if (this.run && Math.random() < 0.5) WW.fx.spawn('dust', this.x - (this.dir === 'right' ? 8 : this.dir === 'left' ? -8 : 0), this.y - 2);
        }
      }
      if (moved || !this.trail.length) {
        this.trail.push({ x: this.x, y: this.y, dir: this.dir });
        if (this.trail.length > 120) this.trail.shift();
      }
    }
  }

  /** Milo follows the player's trail like a cheerful companion. */
  class Follower extends Actor {
    constructor(o) {
      super(Object.assign({ who: 'milo', speed: 175, solid: false, scale: 1 }, o));
      this.lead = null;
      this.idleT = 0;
      this.scripted = false;
    }
    update(dt, scene) {
      super.update(dt, scene);
      if (this.scripted || this.path || !this.lead) return;
      const trail = this.lead.trail;
      const target = trail.length > 16 ? trail[trail.length - 16] : null;
      const dL = Math.hypot(this.lead.x - this.x, this.lead.y - this.y);
      if (dL > 420) {
        // too far behind (e.g. after a fast tap-walk): pop next to the player
        WW.fx.spawn('puff', this.x, this.y - 20);
        this.x = this.lead.x - 30;
        this.y = this.lead.y + 4;
        WW.fx.spawn('puff', this.x, this.y - 20);
        return;
      }
      if (target && dL > 52) {
        const dx = target.x - this.x, dy = target.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d > 3) {
          const sp = Math.min(d, (this.lead.run ? 290 : 185) * dt * (dL > 120 ? 1.4 : 1));
          this.x += (dx / d) * sp;
          this.y += (dy / d) * sp;
          this.dir = U.dirFromVec(dx, dy, this.dir);
          this.moving = true;
          this.anim += dt * 13;
          this.idleT = 0;
          return;
        }
      }
      this.moving = false;
      this.idleT += dt;
      if (!this.faceTarget) this.face(this.lead.x, this.lead.y);
      // idle personality: occasional hop or look-around
      if (this.idleT > 5 && Math.random() < dt * 0.4) {
        this.idleT = 0;
        if (Math.random() < 0.5) this.jump(200);
        else this.setEmote(Math.random() < 0.5 ? 'note' : 'heart', 1.2);
      }
    }
  }

  /** Background students who stroll around the school. */
  class Wanderer extends Actor {
    constructor(o) {
      super(Object.assign({ who: 'student', speed: 70, solid: false, scale: 0.92 }, o));
      this.spec = WW.chars.studentSpec(o.seed || 1);
      this.i = 0;
      this.wait = Math.random() * 2;
    }
    update(dt, scene) {
      if (this.emote) { this.emoteT -= dt; if (this.emoteT <= 0) this.emote = null; }
      if (this.path) { this.followPath(dt, scene.map); return; }
      this.moving = false;
      this.wait -= dt;
      if (this.wait > 0) return;
      const p = this.route[this.i % this.route.length];
      this.i++;
      this.wait = this.pause || 0.5;
      this.walkTo(scene.map, p[0] * 48 + 24, p[1] * 48 + 30);
    }
  }

  WW.Actor = Actor;
  WW.Player = Player;
  WW.Follower = Follower;
  WW.Wanderer = Wanderer;
})();
