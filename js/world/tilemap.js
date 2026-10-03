/* WasteWise — tile map with collision, line of sight and A* pathfinding. */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const WW = (root.WW = root.WW || {});
  const TS = 48;
  const SOLID_GROUND = new Set(['h', 'f', '~', '#', 'k', 'x', 'B']);

  class TileMap {
    constructor(def, params = {}) {
      const built = def.build(params);
      this.def = def;
      this.id = def.id;
      this.ts = TS;
      this.ground = built.ground;
      this.rows = this.ground.length;
      this.cols = this.ground[0].length;
      this.W = this.cols * TS;
      this.H = this.rows * TS;
      this.wallColor = def.wallColor;
      this.trimColor = def.trimColor;
      this.objects = (built.objects || []).map((o) => this.prep(o));
      this.extra = built.extra || {};
      this.solid = new Uint8Array(this.cols * this.rows);
      this.recomputeSolid();
    }
    prep(o) {
      o.w = o.w || 1;
      o.h = o.h || 1;
      o.x = o.c * TS;
      o.y = o.r * TS;
      o.pw = o.w * TS;
      o.ph = o.h * TS;
      if (o.solid === undefined) o.solid = true;
      o.layer = o.layer || 'sort';
      o.sortY = o.sortY != null ? o.sortY : o.y + o.ph;
      return o;
    }
    addObject(o) {
      const p = this.prep(o);
      this.objects.push(p);
      if (p.solid) this.stamp(p, 1);
      return p;
    }
    removeObject(id) {
      const o = this.objects.find((x) => x.id === id);
      if (!o) return;
      this.objects = this.objects.filter((x) => x !== o);
      this.recomputeSolid();
    }
    get(id) {
      return this.objects.find((o) => o.id === id);
    }
    stamp(o, v) {
      for (let r = o.r; r < o.r + o.h; r++) for (let c = o.c; c < o.c + o.w; c++) if (this.inBounds(c, r)) this.solid[r * this.cols + c] = v;
    }
    recomputeSolid() {
      for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) this.solid[r * this.cols + c] = SOLID_GROUND.has(this.ground[r][c]) ? 1 : 0;
      for (const o of this.objects) if (o.solid && !o.hidden) this.stamp(o, 1);
    }
    inBounds(c, r) {
      return c >= 0 && r >= 0 && c < this.cols && r < this.rows;
    }
    blocked(c, r) {
      if (!this.inBounds(c, r)) return true;
      return this.solid[r * this.cols + c] === 1;
    }
    blockedAt(x, y) {
      return this.blocked(Math.floor(x / TS), Math.floor(y / TS));
    }
    /** Does an axis-aligned box (centre x, feet y) overlap a solid tile? */
    boxBlocked(x, y, hw, hh) {
      const x0 = Math.floor((x - hw) / TS), x1 = Math.floor((x + hw - 0.01) / TS);
      const y0 = Math.floor((y - hh) / TS), y1 = Math.floor((y - 0.01) / TS);
      for (let r = y0; r <= y1; r++) for (let c = x0; c <= x1; c++) if (this.blocked(c, r)) return true;
      return false;
    }
    /** Move an entity with wall sliding and gentle corner assistance. */
    move(ent, dx, dy) {
      const hw = ent.hw || 10, hh = ent.hh || 8;
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 8));
      const sx = dx / steps, sy = dy / steps;
      let hitX = false, hitY = false;
      for (let i = 0; i < steps; i++) {
        if (sx) {
          if (!this.boxBlocked(ent.x + sx, ent.y, hw, hh)) ent.x += sx;
          else {
            hitX = true;
            // corner assist: slide around a corner if the player is only slightly misaligned
            if (!sy) for (const n of [2, -2, 4, -4, 6, -6, 8, -8, 10, -10, 12, -12, 14, -14, 16, -16]) {
              if (!this.boxBlocked(ent.x + sx, ent.y + n, hw, hh) && !this.boxBlocked(ent.x, ent.y + Math.sign(n) * 2, hw, hh)) { ent.y += Math.sign(n) * Math.min(Math.abs(sx) + 0.6, 2.4); break; }
            }
          }
        }
        if (sy) {
          if (!this.boxBlocked(ent.x, ent.y + sy, hw, hh)) ent.y += sy;
          else {
            hitY = true;
            if (!sx) for (const n of [2, -2, 4, -4, 6, -6, 8, -8, 10, -10, 12, -12, 14, -14, 16, -16]) {
              if (!this.boxBlocked(ent.x + n, ent.y + sy, hw, hh) && !this.boxBlocked(ent.x + Math.sign(n) * 2, ent.y, hw, hh)) { ent.x += Math.sign(n) * Math.min(Math.abs(sy) + 0.6, 2.4); break; }
            }
          }
        }
      }
      ent.x = Math.max(hw, Math.min(this.W - hw, ent.x));
      ent.y = Math.max(hh, Math.min(this.H, ent.y));
      return { hitX, hitY };
    }
    tileOf(x, y) {
      return { c: Math.floor(x / TS), r: Math.floor(y / TS) };
    }
    center(c, r) {
      return { x: c * TS + TS / 2, y: r * TS + TS / 2 + 10 };
    }
    nearestWalkable(c, r, maxR = 6) {
      if (!this.blocked(c, r)) return { c, r };
      for (let d = 1; d <= maxR; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue;
        if (!this.blocked(c + dx, r + dy)) return { c: c + dx, r: r + dy };
      }
      return null;
    }
    /** A* with 8 directions (no corner cutting). Returns array of world points or null. */
    findPath(sx, sy, tx, ty) {
      const s = this.tileOf(sx, sy - 4);
      const s2 = this.nearestWalkable(s.c, s.r, 2);
      const tt = this.tileOf(tx, ty);
      const t = this.nearestWalkable(tt.c, tt.r);
      if (!s2 || !t) return null;
      const cols = this.cols, rows = this.rows;
      const key = (c, r) => r * cols + c;
      const g = new Float32Array(cols * rows).fill(Infinity);
      const came = new Int32Array(cols * rows).fill(-1);
      const closed = new Uint8Array(cols * rows);
      const open = [];
      const h = (c, r) => Math.hypot(c - t.c, r - t.r);
      g[key(s2.c, s2.r)] = 0;
      open.push({ c: s2.c, r: s2.r, f: h(s2.c, s2.r) });
      let found = false;
      let guard = 0;
      while (open.length && guard++ < 20000) {
        let bi = 0;
        for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
        const cur = open.splice(bi, 1)[0];
        const ck = key(cur.c, cur.r);
        if (closed[ck]) continue;
        closed[ck] = 1;
        if (cur.c === t.c && cur.r === t.r) { found = true; break; }
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nc = cur.c + dx, nr = cur.r + dy;
          if (this.blocked(nc, nr)) continue;
          if (dx && dy && (this.blocked(cur.c + dx, cur.r) || this.blocked(cur.c, cur.r + dy))) continue;
          const nk = key(nc, nr);
          if (closed[nk]) continue;
          const ng = g[ck] + (dx && dy ? 1.414 : 1);
          if (ng < g[nk]) {
            g[nk] = ng;
            came[nk] = ck;
            open.push({ c: nc, r: nr, f: ng + h(nc, nr) });
          }
        }
      }
      if (!found) return null;
      const pts = [];
      let k = key(t.c, t.r);
      while (k !== -1) {
        const c = k % cols, r = Math.floor(k / cols);
        pts.unshift({ x: c * TS + TS / 2, y: r * TS + TS / 2 + 10 });
        k = came[k];
      }
      // final point: exact target if it is walkable
      if (!this.boxBlocked(tx, ty, 8, 6) && tt.c === t.c && tt.r === t.r) pts[pts.length - 1] = { x: tx, y: ty };
      return this.smooth(pts);
    }
    /** Remove intermediate points where a straight line is clear. */
    smooth(pts) {
      if (pts.length < 3) return pts;
      const out = [pts[0]];
      let i = 0;
      while (i < pts.length - 1) {
        let j = pts.length - 1;
        while (j > i + 1 && !this.clearLine(pts[i], pts[j])) j--;
        out.push(pts[j]);
        i = j;
      }
      return out;
    }
    clearLine(a, b) {
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const n = Math.ceil(d / 6);
      for (let i = 1; i < n; i++) {
        const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
        if (this.boxBlocked(x, y, 11, 9)) return false;
      }
      return true;
    }
    /** ASCII dump (debug/tests). */
    ascii() {
      return this.ground.map((row, r) => row.map((ch, c) => (this.solid[r * this.cols + c] ? (SOLID_GROUND.has(ch) ? ch : 'o') : ch)).join('')).join('\n');
    }
  }
  WW.TileMap = TileMap;
  WW.TS = TS;
})();
