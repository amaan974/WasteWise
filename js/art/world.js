/* WasteWise — world art: tiles, buildings, garden, playground, interiors and maze props.
   Original procedural cartoon artwork. `ws` = save.data.world (environment state) so the
   school visibly changes with the player's choices. */
(function () {
  'use strict';
  const WW = window.WW;
  const D = WW.draw;
  const U = WW.util;
  const OUT = '#2f4a3a';
  const WA = (WW.worldArt = {});
  const TS = 48;

  /* ======================= GROUND TILES ======================= */
  const GROUND_COL = {
    '.': '#93d36b', ',': '#93d36b', h: '#93d36b', f: '#93d36b', g: '#f2deb0', '=': '#f2deb0', ':': '#f4e6c6',
    d: '#bf8a58', s: '#f7e09b', p: '#7fd1c0', '~': '#6cc7e8', w: '#e9c491', t: '#fff4dc', '#': '#f6dfb8', k: '#d9dee3', c: '#d9dee3', B: '#93d36b', x: '#93d36b', r: '#e8eef0',
  };
  WA.GROUND_COL = GROUND_COL;
  const same = (map, c, r, set) => {
    if (c < 0 || r < 0 || c >= map.cols || r >= map.rows) return true;
    return set.indexOf(map.ground[r][c]) !== -1;
  };

  function grass(ctx, x, y, c, r) {
    const h = U.hash(c, r);
    ctx.fillStyle = h < 0.5 ? '#91d169' : '#97d76f';
    ctx.fillRect(x, y, TS, TS);
    for (let i = 0; i < 3; i++) {
      const hx = U.hash(c, r, i + 1), hy = U.hash(c, r, i + 11);
      const px = x + 6 + hx * (TS - 12), py = y + 8 + hy * (TS - 14);
      ctx.strokeStyle = '#74b956';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px - 3, py);
      ctx.lineTo(px - 1, py - 4);
      ctx.moveTo(px + 1, py);
      ctx.lineTo(px + 3, py - 5);
      ctx.stroke();
    }
    if (h > 0.9) {
      const col = ['#ffffff', '#ffd23f', '#ff8fab', '#b8a1ff'][Math.floor(U.hash(c, r, 7) * 4)];
      const px = x + 10 + U.hash(c, r, 3) * 28, py = y + 10 + U.hash(c, r, 4) * 28;
      for (let a = 0; a < 5; a++) D.circle(ctx, px + Math.cos(a * 1.26) * 2.6, py + Math.sin(a * 1.26) * 2.6, 2, col);
      D.circle(ctx, px, py, 1.6, '#ffb703');
    }
  }

  WA.drawTile = function (ctx, map, c, r) {
    const ch = map.ground[r][c];
    const x = c * TS, y = r * TS;
    switch (ch) {
      case '=': case 'g': {
        ctx.fillStyle = '#f2deb0';
        ctx.fillRect(x, y, TS, TS);
        for (let i = 0; i < 4; i++) {
          const px = x + 4 + U.hash(c, r, i + 20) * 40, py = y + 4 + U.hash(c, r, i + 30) * 40;
          D.ell(ctx, px, py, 2.4, 1.6, '#e2c992');
        }
        const set = ['=', 'g', ':', 'd', 's', 'p', 'r'];
        ctx.fillStyle = '#ddc187';
        if (!same(map, c, r - 1, set)) ctx.fillRect(x, y, TS, 3);
        if (!same(map, c, r + 1, set)) ctx.fillRect(x, y + TS - 3, TS, 3);
        if (!same(map, c - 1, r, set)) ctx.fillRect(x, y, 3, TS);
        if (!same(map, c + 1, r, set)) ctx.fillRect(x + TS - 3, y, 3, TS);
        break;
      }
      case ':': {
        const h = U.hash(c, r, 5);
        ctx.fillStyle = h < 0.5 ? '#f4e6c6' : '#f1e1bd';
        ctx.fillRect(x, y, TS, TS);
        ctx.strokeStyle = '#e1cda0';
        ctx.lineWidth = 1.5;
        for (let k = 0; k <= TS; k += 24) {
          ctx.beginPath(); ctx.moveTo(x + k, y); ctx.lineTo(x + k, y + TS); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y + k); ctx.lineTo(x + TS, y + k); ctx.stroke();
        }
        if (U.hash(c, r, 9) > 0.85) D.rr(ctx, x + 25, y + 25, 21, 21, 2, '#ead8b0');
        break;
      }
      case 'd':
        ctx.fillStyle = '#c4915e';
        ctx.fillRect(x, y, TS, TS);
        for (let i = 0; i < 7; i++) D.ell(ctx, x + U.hash(c, r, i) * TS, y + U.hash(c, r, i + 50) * TS, 3, 1.4, i % 2 ? '#a8774a' : '#d6a674', null, 1, U.hash(c, r, i + 9) * 3);
        break;
      case 's': {
        ctx.fillStyle = '#f7e09b';
        ctx.fillRect(x, y, TS, TS);
        for (let i = 0; i < 6; i++) D.circle(ctx, x + U.hash(c, r, i) * TS, y + U.hash(c, r, i + 40) * TS, 1.2, '#e3c475');
        const set = ['s'];
        ctx.fillStyle = '#c98b5a';
        if (!same(map, c, r - 1, set)) ctx.fillRect(x, y, TS, 6);
        if (!same(map, c, r + 1, set)) ctx.fillRect(x, y + TS - 6, TS, 6);
        if (!same(map, c - 1, r, set)) ctx.fillRect(x, y, 6, TS);
        if (!same(map, c + 1, r, set)) ctx.fillRect(x + TS - 6, y, 6, TS);
        break;
      }
      case 'p':
        ctx.fillStyle = '#7fd1c0';
        ctx.fillRect(x, y, TS, TS);
        for (let i = 0; i < 8; i++) D.circle(ctx, x + U.hash(c, r, i) * TS, y + U.hash(c, r, i + 70) * TS, 1.1, i % 2 ? '#5fb9a7' : '#a6e3d6');
        break;
      case '~': {
        ctx.fillStyle = '#5fbfe2';
        ctx.fillRect(x, y, TS, TS);
        const set = ['~'];
        const stone = (sx, sy) => D.ell(ctx, sx, sy, 7, 5, '#b9c3c9', '#7e8b93', 1.4);
        if (!same(map, c, r - 1, set)) for (let k = 4; k < TS; k += 14) stone(x + k + 3, y + 3);
        if (!same(map, c, r + 1, set)) for (let k = 4; k < TS; k += 14) stone(x + k + 3, y + TS - 3);
        if (!same(map, c - 1, r, set)) for (let k = 4; k < TS; k += 14) stone(x + 3, y + k + 3);
        if (!same(map, c + 1, r, set)) for (let k = 4; k < TS; k += 14) stone(x + TS - 3, y + k + 3);
        break;
      }
      case 'w':
        ctx.fillStyle = r % 2 ? '#e9c491' : '#e4bb84';
        ctx.fillRect(x, y, TS, TS);
        ctx.strokeStyle = '#cf9f66';
        ctx.lineWidth = 1.4;
        for (let k = 0; k < TS; k += 12) { ctx.beginPath(); ctx.moveTo(x, y + k); ctx.lineTo(x + TS, y + k); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(x + ((c * 17 + r * 7) % 4) * 12, y); ctx.lineTo(x + ((c * 17 + r * 7) % 4) * 12, y + 12); ctx.stroke();
        break;
      case 't':
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
          ctx.fillStyle = (i + j + c + r) % 2 ? '#fff4dc' : '#ffd9a0';
          ctx.fillRect(x + i * 24, y + j * 24, 24, 24);
        }
        break;
      case 'r':
        ctx.fillStyle = (c + r) % 2 ? '#e8eef0' : '#dfe7ea';
        ctx.fillRect(x, y, TS, TS);
        break;
      case 'c':
        ctx.fillStyle = '#d5dde2';
        ctx.fillRect(x, y, TS, TS);
        ctx.strokeStyle = '#c4ced4';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TS - 1, TS - 1);
        if (U.hash(c, r, 3) > 0.8) D.ell(ctx, x + 24, y + 24, 9, 5, 'rgba(160,175,185,.35)');
        break;
      case 'k': {
        // stacked crate wall (maze)
        ctx.fillStyle = '#d5dde2';
        ctx.fillRect(x, y, TS, TS);
        const top = same(map, c, r - 1, ['k']);
        const below = same(map, c, r + 1, ['k']);
        D.rr(ctx, x + 1, y + (top ? 0 : 2), TS - 2, TS - (top ? 0 : 2) - (below ? 0 : 0), 4, '#e2b277', '#8a5a32', 2);
        if (!below) D.rr(ctx, x + 1, y + TS - 16, TS - 2, 16, [0, 0, 4, 4], '#c48a52', '#8a5a32', 2);
        ctx.strokeStyle = 'rgba(138,90,50,.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + TS - 6, y + (below ? TS - 6 : TS - 20));
        ctx.moveTo(x + TS - 6, y + 6); ctx.lineTo(x + 6, y + (below ? TS - 6 : TS - 20));
        ctx.stroke();
        break;
      }
      case '#': {
        const above = same(map, c, r - 1, ['#']);
        const below = same(map, c, r + 1, ['#']);
        const side = c === 0 || c === map.cols - 1;
        ctx.fillStyle = side ? '#e6c79a' : map.wallColor || '#f6dfb8';
        ctx.fillRect(x, y, TS, TS);
        if (!above || r === 0) { ctx.fillStyle = map.trimColor || '#8f6a4a'; ctx.fillRect(x, y, TS, 10); }
        if (!below && !side) { ctx.fillStyle = '#c9a274'; ctx.fillRect(x, y + TS - 8, TS, 8); }
        if (side) { ctx.fillStyle = map.trimColor || '#8f6a4a'; ctx.fillRect(c === 0 ? x + TS - 8 : x, y, 8, TS); }
        break;
      }
      default:
        grass(ctx, x, y, c, r);
    }
    // overlays needing grass underneath
    if (ch === 'h') hedge(ctx, map, c, r, x, y);
    if (ch === 'f') fence(ctx, map, c, r, x, y);
    if (ch === 'g') gatePosts(ctx, map, c, r, x, y);
  };

  function hedge(ctx, map, c, r, x, y) {
    D.rr(ctx, x - 2, y + 4, TS + 4, TS - 2, 14, '#3f9150');
    for (let i = 0; i < 3; i++) {
      const cx = x + 8 + i * 16, cy = y + 16 + (U.hash(c, r, i) - 0.5) * 6;
      D.circle(ctx, cx, cy, 13, '#4fa35a');
      D.circle(ctx, cx - 4, cy - 4, 5, '#6cbf6e');
    }
    if (U.hash(c, r, 12) > 0.75) D.circle(ctx, x + 12 + U.hash(c, r, 2) * 24, y + 22, 3, '#ff8fab');
  }
  function fence(ctx, map, c, r, x, y) {
    const horiz = same(map, c - 1, r, ['f', 'g']) && c > 0 || same(map, c + 1, r, ['f', 'g']) && c < map.cols - 1;
    const isH = horiz && !(same(map, c, r - 1, ['f']) && r > 0 && same(map, c, r + 1, ['f']));
    ctx.lineJoin = 'round';
    if (isH) {
      D.rr(ctx, x, y + 18, TS, 5, 2, '#c48a52', '#7a4d2b', 1.2);
      D.rr(ctx, x, y + 30, TS, 5, 2, '#c48a52', '#7a4d2b', 1.2);
      for (let k = 3; k < TS; k += 12) D.poly(ctx, [x + k, y + 40, x + k, y + 12, x + k + 4, y + 6, x + k + 8, y + 12, x + k + 8, y + 40], '#e2b277', '#7a4d2b', 1.4);
    } else {
      D.rr(ctx, x + 21, y, 6, TS, 2, '#c48a52', '#7a4d2b', 1.2);
      for (let k = 2; k < TS; k += 16) D.rr(ctx, x + 17, y + k, 14, 12, 3, '#e2b277', '#7a4d2b', 1.4);
    }
  }
  function gatePosts(ctx, map, c, r, x, y) {
    const vertical = same(map, c, r - 1, ['f', 'g']) || same(map, c, r + 1, ['f', 'g']);
    if (vertical) {
      if (map.ground[r - 1] && map.ground[r - 1][c] === 'f') D.rr(ctx, x + 18, y - 4, 12, 14, 3, '#a8703f', '#7a4d2b', 1.4);
      if (map.ground[r + 1] && map.ground[r + 1][c] === 'f') D.rr(ctx, x + 18, y + TS - 12, 12, 14, 3, '#a8703f', '#7a4d2b', 1.4);
    }
  }

  /** Bake static ground into an offscreen canvas. */
  WA.bakeGround = function (map, scale) {
    const w = map.cols * TS, h = map.rows * TS;
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * scale);
    c.height = Math.ceil(h * scale);
    const ctx = c.getContext('2d');
    ctx.scale(scale, scale);
    for (let r = 0; r < map.rows; r++) for (let col = 0; col < map.cols; col++) WA.drawTile(ctx, map, col, r);
    for (const o of map.objects) if (o.layer === 'ground' && PAINT[o.type]) PAINT[o.type](ctx, o, null, 0);
    return c;
  };

  /** Animated water shimmer on top of baked pond tiles. */
  WA.drawWater = function (ctx, map, t, view) {
    const c0 = Math.max(0, Math.floor(view.x / TS)), c1 = Math.min(map.cols - 1, Math.ceil((view.x + view.w) / TS));
    const r0 = Math.max(0, Math.floor(view.y / TS)), r1 = Math.min(map.rows - 1, Math.ceil((view.y + view.h) / TS));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      if (map.ground[r][c] !== '~') continue;
      const x = c * TS, y = r * TS;
      for (let i = 0; i < 2; i++) {
        const ph = (t * 0.6 + U.hash(c, r, i)) % 1;
        ctx.strokeStyle = `rgba(255,255,255,${0.55 * (1 - ph)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x + 12 + U.hash(c, r, i + 3) * 24, y + 12 + U.hash(c, r, i + 5) * 24, 4 + ph * 10, 2 + ph * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  /* ======================= OBJECTS ======================= */
  const PAINT = (WA.paint = {});

  function wallWindows(ctx, X, wallY, W, wallH, doorX, color = '#9fdcf0', boxes = true) {
    const n = Math.max(1, Math.floor(W / 96));
    for (let i = 0; i < n; i++) {
      const wx = X + (W / n) * (i + 0.5) - 18;
      if (doorX != null && Math.abs(wx + 18 - doorX) < 46) continue;
      const wy = wallY + 18;
      D.rr(ctx, wx, wy, 36, 34, 6, color, '#5b6f7a', 2.5);
      D.line(ctx, wx + 18, wy + 2, wx + 18, wy + 32, '#ffffff', 2.5);
      D.line(ctx, wx + 2, wy + 17, wx + 34, wy + 17, '#ffffff', 2.5);
      D.poly(ctx, [wx + 5, wy + 14, wx + 13, wy + 4, wx + 16, wy + 4, wx + 8, wy + 14], 'rgba(255,255,255,.55)');
      if (boxes) {
        D.rr(ctx, wx - 3, wy + 36, 42, 8, 3, '#b8743f', '#7a4d2b', 1.5);
        for (let k = 0; k < 4; k++) D.circle(ctx, wx + 4 + k * 10, wy + 35, 3.6, ['#ff8fab', '#ffd23f', '#ff7a59', '#b8a1ff'][k], '#7a4d2b', 1);
      }
    }
  }

  PAINT.building = function (ctx, o, ws, t, scene) {
    const X = o.x, Y = o.y, W = o.pw, H = o.ph;
    const wallH = Math.min(H * 0.58, 120);
    const wallY = Y + H - wallH;
    // shadow
    ctx.fillStyle = 'rgba(30,70,45,.18)';
    ctx.beginPath();
    ctx.moveTo(X + W, wallY + 10);
    ctx.lineTo(X + W + 22, wallY + 30);
    ctx.lineTo(X + W + 22, Y + H + 12);
    ctx.lineTo(X + 14, Y + H + 12);
    ctx.lineTo(X, Y + H);
    ctx.closePath();
    ctx.fill();
    // wall
    D.rr(ctx, X, wallY, W, wallH, 6, o.wall || '#fff4d6', OUT, 3);
    ctx.fillStyle = D.shade(o.wall || '#fff4d6', -0.12);
    ctx.fillRect(X + 2, Y + H - 12, W - 4, 10);
    const doorX = o.doorCol != null ? o.doorCol * TS + TS / 2 + (o.doorOffset || 0) : null;
    wallWindows(ctx, X, wallY, W, wallH, doorX, o.lightsOn === false ? '#5d7a8a' : '#9fdcf0', o.boxes !== false);
    // roof
    const ov = 12;
    ctx.beginPath();
    ctx.moveTo(X - ov, wallY + 6);
    ctx.lineTo(X + W + ov, wallY + 6);
    ctx.lineTo(X + W - 14, Y);
    ctx.lineTo(X + 14, Y);
    ctx.closePath();
    ctx.fillStyle = o.roof;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = D.shade(o.roof, -0.15);
    ctx.lineWidth = 3;
    for (let yy = Y + 10; yy < wallY + 6; yy += 12) { ctx.beginPath(); ctx.moveTo(X - ov, yy); ctx.lineTo(X + W + ov, yy); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(X - ov, wallY + 6);
    ctx.lineTo(X + W + ov, wallY + 6);
    ctx.lineTo(X + W - 14, Y);
    ctx.lineTo(X + 14, Y);
    ctx.closePath();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 3;
    ctx.stroke();
    D.rr(ctx, X - ov, wallY, W + ov * 2, 10, 4, D.shade(o.roof, -0.25), OUT, 2.5);
    // solar panels (eco touch)
    if (o.solar) {
      const n = Math.floor((W - 60) / 46);
      for (let i = 0; i < Math.min(n, o.solar); i++) {
        const px = X + 30 + i * 46, py = Y + 8;
        D.rr(ctx, px, py, 40, Math.max(18, wallY - Y - 20), 3, '#2c4f8a', '#1b2f52', 2);
        ctx.strokeStyle = 'rgba(160,200,255,.6)';
        ctx.lineWidth = 1;
        for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(px + k * 13.3, py + 2); ctx.lineTo(px + k * 13.3, py + wallY - Y - 22); ctx.stroke(); }
      }
    }
    // door
    if (doorX != null) {
      const dw = 46, dh = 66;
      const dx = doorX - dw / 2, dy = Y + H - dh;
      const locked = o.locked && o.locked();
      const glow = o.glow && o.glow();
      if (glow) {
        const p = 0.5 + Math.sin(t * 4) * 0.5;
        D.rr(ctx, dx - 8, dy - 8, dw + 16, dh + 8, 12, `rgba(255,215,64,${0.25 + p * 0.35})`);
      }
      D.rr(ctx, dx, dy, dw, dh, [12, 12, 0, 0], o.door || '#7cc6a0', OUT, 3);
      D.rr(ctx, dx + 6, dy + 8, dw - 12, 20, 6, 'rgba(255,255,255,.45)');
      D.circle(ctx, dx + dw - 10, dy + 40, 3, '#ffd23f', OUT, 1.2);
      D.rr(ctx, dx - 6, Y + H - 4, dw + 12, 6, 2, '#d8c6a8', OUT, 1.5);
      if (locked) {
        D.rr(ctx, doorX - 9, dy + 26, 18, 15, 3, '#ffcf3f', '#7a5a12', 2);
        ctx.beginPath();
        ctx.arc(doorX, dy + 26, 6, Math.PI, 0);
        ctx.strokeStyle = '#7a5a12';
        ctx.lineWidth = 3;
        ctx.stroke();
        D.circle(ctx, doorX, dy + 33, 2, '#7a5a12');
      }
    }
    // sign
    if (o.label) {
      ctx.font = D.font(15, 800);
      const tw = ctx.measureText(o.label).width + (o.icon ? 30 : 18);
      const sx = (doorX != null ? doorX : X + W / 2) - tw / 2;
      const sy = wallY - 16;
      D.rr(ctx, sx, sy, tw, 26, 10, '#fffdf2', OUT, 2.5);
      if (o.icon) D.text(ctx, o.icon, sx + 16, sy + 14, 14);
      D.text(ctx, o.label, sx + (o.icon ? 28 : 9) + (tw - (o.icon ? 30 : 18)) / 2, sy + 14, 15, '#245241', { align: 'center' });
    }
    if (o.extra) o.extra(ctx, o, ws, t, scene);
  };

  PAINT.tree = function (ctx, o, ws, t) {
    const x = o.x + (o.pw || TS) / 2, y = o.y + (o.ph || TS) - 6;
    const s = o.scale || 1;
    const sway = Math.sin(t * 1.3 + (o.c || 0)) * 1.5;
    D.shadow(ctx, x + 6, y + 2, 34 * s, 10 * s, 0.2);
    D.rr(ctx, x - 7 * s, y - 40 * s, 14 * s, 42 * s, 5, '#9a6a45', '#5e3e26', 2);
    const g = o.fruit ? '#4fae62' : o.dark ? '#3f9a55' : '#52b46a';
    const blobs = [[-22, -58, 24], [20, -62, 25], [0, -82, 30], [-12, -74, 22], [14, -78, 22]];
    for (const [bx, by, br] of blobs) D.circle(ctx, x + bx * s + sway, y + by * s, br * s, g, '#2e7a45', 3);
    for (const [bx, by, br] of blobs) D.circle(ctx, x + bx * s + sway, y + by * s, br * s - 2, g);
    D.circle(ctx, x - 10 * s + sway, y - 88 * s, 9 * s, 'rgba(255,255,255,.22)');
    if (o.fruit) for (const [fx, fy] of [[-18, -58], [12, -66], [-2, -88], [20, -78]]) D.circle(ctx, x + fx * s + sway, y + fy * s, 4.2 * s, '#ff7a59', '#9a3a22', 1.2);
  };
  PAINT.bigtree = function (ctx, o, ws, t) {
    const x = o.x + o.pw / 2, y = o.y + o.ph - 4;
    const sway = Math.sin(t * 1.1) * 2;
    D.shadow(ctx, x + 10, y + 4, 90, 26, 0.18);
    D.rr(ctx, x - 14, y - 70, 28, 74, 8, '#9a6a45', '#5e3e26', 3);
    D.line(ctx, x - 6, y - 50, x - 10, y - 20, '#7f5534', 2);
    const blobs = [[-55, -95, 44], [52, -100, 46], [0, -140, 56], [-30, -128, 40], [32, -132, 42], [0, -92, 40]];
    for (const [bx, by, br] of blobs) D.circle(ctx, x + bx + sway, y + by, br, '#4bab5f', '#2e7a45', 3.5);
    for (const [bx, by, br] of blobs) D.circle(ctx, x + bx + sway, y + by, br - 3, '#4bab5f');
    D.circle(ctx, x - 22 + sway, y - 160, 16, 'rgba(255,255,255,.18)');
    D.circle(ctx, x + 40 + sway, y - 120, 10, 'rgba(255,255,255,.15)');
  };
  PAINT.bush = function (ctx, o) {
    const x = o.x + TS / 2, y = o.y + TS - 8;
    D.shadow(ctx, x, y + 4, 22, 6, 0.18);
    for (const [bx, by, br] of [[-10, -6, 12], [10, -6, 12], [0, -14, 14]]) D.circle(ctx, x + bx, y + by, br, '#55b066', '#2e7a45', 2.5);
    for (const [bx, by, br] of [[-10, -6, 12], [10, -6, 12], [0, -14, 14]]) D.circle(ctx, x + bx, y + by, br - 2, '#55b066');
    if (o.flowers) for (const [fx, fy] of [[-8, -12], [6, -18], [10, -6]]) D.circle(ctx, x + fx, y + fy, 3, o.flowers, '#7a3a4a', 1);
  };
  PAINT.bench = function (ctx, o) {
    const x = o.x, y = o.y, w = o.pw;
    D.shadow(ctx, x + w / 2, y + 40, w / 2, 6, 0.15);
    D.rr(ctx, x + 6, y + 26, 6, 16, 2, '#6b4a2b');
    D.rr(ctx, x + w - 12, y + 26, 6, 16, 2, '#6b4a2b');
    D.rr(ctx, x + 2, y + 6, w - 4, 10, 3, '#c98b55', '#6b4a2b', 2);
    D.rr(ctx, x + 2, y + 20, w - 4, 10, 3, '#d99a62', '#6b4a2b', 2);
  };

  const BIN = {
    landfill: { lid: '#e5484d', label: 'LANDFILL', short: 'Landfill', icon: 'bin' },
    recycle: { lid: '#f2c12e', label: 'RECYCLE', short: 'Recycling', icon: 'recycle' },
    compost: { lid: '#2fa36b', label: 'COMPOST', short: 'Compost', icon: 'leaf' },
    reuse: { lid: '#3d8bfd', label: 'REUSE', short: 'Share & Reuse', icon: 'loop' },
  };
  WA.BIN = BIN;
  function binIcon(ctx, kind, x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (kind === 'recycle') {
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.arc(0, 0, 6, -0.3, 1.25);
        ctx.strokeStyle = '#1f5f3a';
        ctx.lineWidth = 2.4;
        ctx.stroke();
        D.poly(ctx, [Math.cos(1.25) * 6 - 2.5, Math.sin(1.25) * 6, Math.cos(1.25) * 6 + 2.5, Math.sin(1.25) * 6, Math.cos(1.6) * 6, Math.sin(1.6) * 6 + 1], '#1f5f3a');
        ctx.restore();
      }
    } else if (kind === 'leaf') {
      D.leaf(ctx, -6, 5, 13, 5.5, -0.9, '#2fa36b', '#1f5f3a', 1.4);
    } else if (kind === 'loop') {
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0.4, Math.PI * 1.8);
      ctx.strokeStyle = '#1d3f8a';
      ctx.lineWidth = 2.6;
      ctx.stroke();
      D.poly(ctx, [5, -6, 9, -1, 3, 0], '#1d3f8a');
    } else {
      D.rr(ctx, -5, -4, 10, 11, 2, null, '#5a1f22', 2);
      D.line(ctx, -7, -5, 7, -5, '#5a1f22', 2);
      D.line(ctx, -2, -8, 2, -8, '#5a1f22', 2);
    }
    ctx.restore();
  }
  WA.binIcon = binIcon;

  /** Wheelie bin. o.kind = landfill|recycle|compost|reuse ; o.overflow = bool or fn */
  PAINT.bin = function (ctx, o, ws, t) {
    const kind = BIN[o.kind] || BIN.landfill;
    const x = o.x + (o.pw || TS) / 2, y = o.y + (o.ph || TS) - 4;
    const s = o.scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    D.shadow(ctx, 2, 0, 18, 5, 0.2);
    const lidBounce = o.bounce ? Math.max(0, Math.sin((t - o.bounce) * 14)) * 6 * Math.max(0, 1 - (t - o.bounce) * 1.5) : 0;
    D.rr(ctx, -15, -40, 30, 40, [3, 3, 6, 6], '#4a5560', '#26303a', 2.2);
    D.rr(ctx, -12, -34, 24, 22, 4, '#fffdf2', '#26303a', 1.4);
    binIcon(ctx, kind.icon, 0, -23, 1);
    D.circle(ctx, -9, -1, 3.5, '#26303a');
    D.circle(ctx, 9, -1, 3.5, '#26303a');
    const overflow = typeof o.overflow === 'function' ? o.overflow(ws) : o.overflow;
    if (overflow) {
      WW.items.draw(ctx, 'bottle', -6, -48, 0.7, -0.5);
      WW.items.draw(ctx, 'chips', 7, -49, 0.55, 0.4);
      WW.items.draw(ctx, 'bottle', 2, -54, 0.6, 0.9);
    }
    D.rr(ctx, -17, -46 - lidBounce, 34, 8, 3, kind.lid, '#26303a', 2.2);
    ctx.restore();
    const showSign = typeof o.sign === 'function' ? o.sign() : o.sign;
    if (showSign) {
      const sy = o.y - 18;
      D.rr(ctx, x - 26, sy - 2, 52, 18, 5, kind.lid, '#26303a', 1.6);
      D.text(ctx, kind.label, x, sy + 7, 9.5, '#fff', { outline: 'rgba(0,0,0,.35)', outlineWidth: 2.5 });
    }
  };

  PAINT.tank = function (ctx, o, ws, t) {
    const x = o.x + 6, y = o.y - 30, w = o.pw - 12, h = o.ph + 24;
    D.shadow(ctx, x + w / 2 + 6, o.y + o.ph - 2, w / 2 + 6, 9, 0.2);
    D.rr(ctx, x, y + 10, w, h - 10, 8, '#cfd8dc', '#56636b', 3);
    ctx.strokeStyle = '#aebac1';
    ctx.lineWidth = 2;
    for (let k = x + 8; k < x + w - 4; k += 8) { ctx.beginPath(); ctx.moveTo(k, y + 14); ctx.lineTo(k, y + h - 4); ctx.stroke(); }
    D.ell(ctx, x + w / 2, y + 10, w / 2, 10, '#e3eaed', '#56636b', 3);
    // gauge window
    const level = U.clamp((ws ? ws.tank : 50) / 100, 0, 1);
    const gx = x + w / 2 - 9, gy = y + 26, gh = h - 44;
    D.rr(ctx, gx, gy, 18, gh, 5, '#f4fbff', '#56636b', 2);
    const lh = (gh - 4) * level;
    D.rr(ctx, gx + 2, gy + gh - 2 - lh, 14, lh, 3, level < 0.3 ? '#4fb0d8' : '#3a9fd6');
    if (level > 0.05) {
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.fillRect(gx + 3, gy + gh - 2 - lh, 12, 2);
    }
    D.rr(ctx, x + 4, y + h - 26, w - 8, 18, 5, '#fffdf2', '#56636b', 1.5);
    D.text(ctx, `RAIN TANK ${Math.round(level * 100)}%`, x + w / 2, y + h - 17, 9.5, '#245241');
    // pipe from tank to tap
    D.rr(ctx, x - 10, y + h - 40, 14, 7, 3, '#8c9aa3', '#56636b', 1.5);
  };

  PAINT.tap = function (ctx, o, ws, t, scene) {
    const x = o.x + TS / 2, y = o.y + TS - 6;
    D.shadow(ctx, x, y + 2, 10, 4, 0.2);
    D.rr(ctx, x - 5, y - 40, 10, 42, 3, '#8c9aa3', '#56636b', 2);
    D.rr(ctx, x - 3, y - 44, 22, 8, 3, '#b8c4ca', '#56636b', 2);
    D.rr(ctx, x + 12, y - 44, 8, 14, 3, '#b8c4ca', '#56636b', 2);
    D.circle(ctx, x, y - 46, 6, '#3d8bfd', '#1d3f8a', 2);
    D.line(ctx, x - 5, y - 46, x + 5, y - 46, '#cfe2ff', 2);
    const leaking = ws ? !ws.leakFixed : true;
    if (leaking) {
      const ph = (t * 1.6) % 1;
      D.ell(ctx, x + 16, y - 30 + ph * 26, 2.6, 3.6, '#5fbfe2', '#2f7fa8', 1.2);
      if (scene && ph < 0.05 && !scene._dripCooldown) {
        scene._dripCooldown = true;
        setTimeout(() => (scene._dripCooldown = false), 200);
      }
    } else {
      D.star(ctx, x + 22, y - 54, 5, 4, '#fff7a8', null, 0.4, t);
    }
  };
  /** Puddle under the tap; grows while leaking (ground layer, drawn each frame). */
  PAINT.puddle = function (ctx, o, ws, t) {
    const leaking = ws ? !ws.leakFixed : true;
    const size = leaking ? 1 + (ws && ws.puddle ? ws.puddle : 0) : 0.35;
    const x = o.x + TS / 2 + 8, y = o.y + TS / 2;
    D.ell(ctx, x, y, 18 * size, 8 * size, 'rgba(95,191,226,.55)', 'rgba(47,127,168,.5)', 1.5);
    if (leaking) {
      const ph = (t * 1.6) % 1;
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - ph)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y - 18 + 18, 3 + ph * 12, 1.5 + ph * 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  PAINT.sprinkler = function (ctx, o, ws, t) {
    const x = o.x + TS / 2, y = o.y + TS - 10;
    D.shadow(ctx, x, y + 3, 9, 3, 0.2);
    D.rr(ctx, x - 4, y - 14, 8, 16, 2, '#56636b', '#2f3a40', 1.5);
    D.circle(ctx, x, y - 16, 5, '#ffd23f', '#7a5a12', 1.5);
    const on = ws ? !ws.sprinklerFixed : true;
    if (on) {
      const dir = o.sprayDir || 1;
      for (let i = 0; i < 14; i++) {
        const ph = (t * 1.4 + i / 14) % 1;
        const ang = -Math.PI / 2 + dir * (0.35 + (i % 4) * 0.22);
        const dist = ph * 70;
        const px = x + Math.cos(ang) * dist * 1.25;
        const py = y - 16 + Math.sin(ang) * dist * 0.5 + ph * ph * 62;
        D.circle(ctx, px, py, 2.4 * (1 - ph * 0.4), `rgba(120,200,240,${0.85 - ph * 0.5})`);
      }
      // wet patch on the path
      D.ell(ctx, x + dir * 62, y + 4, 26, 10, 'rgba(95,170,210,.35)');
    }
  };

  PAINT.bed = function (ctx, o, ws, t) {
    const x = o.x + 4, y = o.y + 6, w = o.pw - 8, h = o.ph - 10;
    D.shadow(ctx, x + w / 2 + 4, y + h + 4, w / 2 + 4, 8, 0.18);
    D.rr(ctx, x, y + 8, w, h, 6, '#b8743f', '#6b4a2b', 2.5);
    D.rr(ctx, x + 5, y + 12, w - 10, h - 14, 4, '#7a5136');
    const health = ws ? ws.gardenHealth / 100 : 1;
    const rows = 2, cols = Math.max(3, Math.floor(w / 26));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const px = x + 14 + (c * (w - 28)) / (cols - 1), py = y + 18 + r * ((h - 22) / rows) + 6;
      const sway = Math.sin(t * 2 + c + r) * 0.08;
      if (health < 0.45) {
        // wilted
        ctx.strokeStyle = '#9a8a4a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py + 4);
        ctx.quadraticCurveTo(px + 2, py - 6, px + 8, py - 2);
        ctx.stroke();
        D.leaf(ctx, px + 1, py, 8, 3, 0.9, '#b5a55a', '#7a6a3a', 1, false);
        D.leaf(ctx, px, py + 2, 7, 3, 2.4, '#a8994f', '#7a6a3a', 1, false);
      } else {
        const g = health > 0.8 ? 1.15 : 0.95;
        D.leaf(ctx, px, py + 4, 13 * g, 5 * g, -2.2 + sway, '#4caf50', '#2e7a45', 1.3);
        D.leaf(ctx, px, py + 4, 13 * g, 5 * g, -0.9 + sway, '#5cc15f', '#2e7a45', 1.3);
        D.leaf(ctx, px, py + 4, 15 * g, 5 * g, -1.57 + sway, '#66cc66', '#2e7a45', 1.3);
        if (health > 0.75) {
          const kind = (c + r + (o.c || 0)) % 3;
          if (kind === 0) D.circle(ctx, px + 6, py - 6, 4, '#ff5a4a', '#9a2a22', 1.2);
          if (kind === 1) D.poly(ctx, [px - 3, py + 2, px + 3, py + 2, px, py + 12], '#ff9f1c', '#9a5a12', 1);
          if (kind === 2) { for (let k = 0; k < 5; k++) D.circle(ctx, px + Math.cos(k * 1.26) * 3, py - 10 + Math.sin(k * 1.26) * 3, 2.2, '#ffd23f'); D.circle(ctx, px, py - 10, 1.8, '#ff7a59'); }
        }
      }
    }
    if (o.dripLine && ws && ws.sprinklerFixed) {
      ctx.strokeStyle = '#2f3a40';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + h - 2);
      ctx.lineTo(x + w - 6, y + h - 2);
      ctx.stroke();
      for (let k = x + 14; k < x + w - 8; k += 22) {
        const ph = (t * 1.2 + k * 0.01) % 1;
        D.circle(ctx, k, y + h + ph * 4, 1.8, `rgba(95,191,226,${1 - ph})`);
      }
    }
  };

  PAINT.shed = function (ctx, o, ws, t) {
    const X = o.x, Y = o.y, W = o.pw, H = o.ph;
    const wallY = Y + H - 62;
    D.shadow(ctx, X + W / 2 + 10, Y + H + 2, W / 2 + 6, 10, 0.2);
    D.rr(ctx, X + 4, wallY, W - 8, 62, 4, '#d99a62', '#6b4a2b', 3);
    ctx.strokeStyle = '#b8743f';
    ctx.lineWidth = 2;
    for (let k = X + 14; k < X + W - 8; k += 12) { ctx.beginPath(); ctx.moveTo(k, wallY + 4); ctx.lineTo(k, wallY + 58); ctx.stroke(); }
    D.poly(ctx, [X - 6, wallY + 4, X + W + 6, wallY + 4, X + W - 10, Y + 6, X + 10, Y + 6], '#6aa86a', OUT, 3);
    const lit = ws ? ws.shedLightOn : true;
    // window shows whether the light is on
    D.rr(ctx, X + 16, wallY + 14, 32, 26, 4, lit ? '#fff3a0' : '#4d6470', '#6b4a2b', 2.5);
    if (lit) {
      const p = 0.5 + Math.sin(t * 3) * 0.15;
      D.circle(ctx, X + 32, wallY + 27, 26, `rgba(255,240,140,${0.22 * p})`);
      D.circle(ctx, X + 32, wallY + 22, 4, '#fffbe0');
    }
    D.line(ctx, X + 32, wallY + 14, X + 32, wallY + 40, '#6b4a2b', 2);
    D.rr(ctx, X + W - 46, wallY + 12, 30, 50, [6, 6, 0, 0], '#a8703f', '#6b4a2b', 2.5);
    D.circle(ctx, X + W - 22, wallY + 40, 2.5, '#ffd23f');
    // light switch box beside door
    D.rr(ctx, X + W - 12, wallY + 26, 8, 12, 2, '#fffdf2', '#56636b', 1.5);
    D.rr(ctx, X + W - 10, wallY + (lit ? 28 : 33), 4, 4, 1, lit ? '#e5484d' : '#2fa36b');
  };

  PAINT.compost = function (ctx, o) {
    const x = o.x + 4, y = o.y + 14, w = o.pw - 8, h = o.ph - 18;
    D.shadow(ctx, x + w / 2, y + h + 4, w / 2, 7, 0.18);
    D.rr(ctx, x, y, w, h, 4, '#8a5a32', '#5e3e26', 2.5);
    D.rr(ctx, x + 4, y + 4, w - 8, h - 14, 3, '#5a3a22');
    for (let i = 0; i < 6; i++) D.circle(ctx, x + 10 + i * ((w - 20) / 5), y + 10 + (i % 2) * 6, 3, ['#7a5136', '#e5484d', '#f7d046', '#6aa84f'][i % 4]);
    ctx.strokeStyle = '#c48a52';
    ctx.lineWidth = 3;
    for (let k = y + h - 12; k < y + h; k += 6) { ctx.beginPath(); ctx.moveTo(x + 2, k); ctx.lineTo(x + w - 2, k); ctx.stroke(); }
    D.rr(ctx, x + w / 2 - 28, y - 14, 56, 16, 5, '#2fa36b', '#1f5f3a', 1.5);
    D.text(ctx, 'COMPOST', x + w / 2, y - 6, 9.5, '#fff');
  };

  PAINT.pond = function () {};
  /** Rules board in the middle of the sorting maze. */
  PAINT.rulesign = function (ctx, o, ws, t) {
    const x = o.x + TS / 2, y = o.y + TS - 4;
    D.shadow(ctx, x, y + 2, 26, 6, 0.2);
    D.rr(ctx, x - 4, y - 30, 8, 32, 2, '#8a5a32');
    D.rr(ctx, x - 34, y - 78, 68, 52, 8, '#fffdf2', '#2d5a45', 3);
    D.text(ctx, 'RULES', x, y - 68, 11, '#2d5a45');
    const kinds = ['compost', 'recycle', 'reuse', 'landfill'];
    kinds.forEach((k, i) => {
      const bx = x - 24 + (i % 2) * 30, by = y - 56 + Math.floor(i / 2) * 20;
      D.rr(ctx, bx - 4, by - 2, 26, 16, 4, BIN[k].lid, '#26303a', 1.2);
      binIcon(ctx, BIN[k].icon, bx + 9, by + 6, 0.65);
    });
    const p = 0.5 + Math.sin(t * 4) * 0.5;
    D.circle(ctx, x + 30, y - 76, 9, `rgba(255,210,63,${0.6 + p * 0.4})`, '#9a6a00', 2);
    D.text(ctx, '?', x + 30, y - 76, 12, '#7a4a00');
  };

  PAINT.slide = function (ctx, o) {
    const x = o.x, y = o.y, w = o.pw, h = o.ph;
    D.shadow(ctx, x + w / 2, y + h - 2, w / 2, 8, 0.18);
    D.rr(ctx, x + 6, y - 30, 10, h + 26, 3, '#ff7a59', '#9a3a22', 2);
    D.rr(ctx, x + 22, y - 30, 10, h + 26, 3, '#ff7a59', '#9a3a22', 2);
    for (let k = y - 20; k < y + h - 6; k += 12) D.line(ctx, x + 12, k, x + 26, k, '#9a3a22', 3);
    D.rr(ctx, x + 2, y - 40, 36, 12, 4, '#ffd23f', '#7a5a12', 2);
    ctx.beginPath();
    ctx.moveTo(x + 36, y - 34);
    ctx.quadraticCurveTo(x + w - 10, y - 20, x + w - 4, y + h - 8);
    ctx.lineTo(x + w - 22, y + h - 8);
    ctx.quadraticCurveTo(x + w - 28, y - 4, x + 36, y - 22);
    ctx.closePath();
    ctx.fillStyle = '#3d8bfd';
    ctx.fill();
    ctx.strokeStyle = '#1d3f8a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };
  PAINT.swings = function (ctx, o, ws, t) {
    const x = o.x, y = o.y, w = o.pw;
    D.shadow(ctx, x + w / 2, y + 44, w / 2, 7, 0.18);
    D.line(ctx, x + 6, y + 44, x + 14, y - 30, '#7b2cbf', 5);
    D.line(ctx, x + w - 6, y + 44, x + w - 14, y - 30, '#7b2cbf', 5);
    D.line(ctx, x + 10, y - 30, x + w - 10, y - 30, '#5a1f9a', 6);
    for (let i = 0; i < 2; i++) {
      const sx = x + w * (0.33 + i * 0.34);
      const sw = Math.sin(t * 2.4 + i * 2) * 7;
      D.line(ctx, sx - 8, y - 28, sx - 8 + sw, y + 22, '#56636b', 1.6);
      D.line(ctx, sx + 8, y - 28, sx + 8 + sw, y + 22, '#56636b', 1.6);
      D.rr(ctx, sx - 12 + sw, y + 20, 24, 6, 2, '#ffd23f', '#7a5a12', 1.6);
    }
  };
  PAINT.bubbler = function (ctx, o, ws, t) {
    const x = o.x + TS / 2, y = o.y + TS - 6;
    D.shadow(ctx, x, y + 2, 14, 5, 0.2);
    D.rr(ctx, x - 9, y - 36, 18, 38, 4, '#9aa5b0', '#4a5560', 2);
    D.ell(ctx, x, y - 38, 15, 7, '#cfd8dc', '#4a5560', 2);
    D.ell(ctx, x, y - 38, 9, 3.5, '#8fcfe8');
    const arc = (t * 2) % 1;
    D.circle(ctx, x + 3 - arc * 2, y - 45 + Math.abs(arc - 0.5) * 6, 1.8, '#5fbfe2');
  };
  PAINT.refill = function (ctx, o, ws, t) {
    const x = o.x + TS / 2, y = o.y + TS - 6;
    D.shadow(ctx, x, y + 2, 16, 5, 0.2);
    D.rr(ctx, x - 14, y - 54, 28, 56, 6, '#22b8b0', '#126e69', 2.5);
    D.rr(ctx, x - 9, y - 44, 18, 20, 4, '#e8fbff', '#126e69', 1.6);
    WW.items.draw(ctx, 'refill', x, y - 14, 0.45);
    D.rr(ctx, x - 22, y - 74, 44, 16, 5, '#fffdf2', '#126e69', 1.5);
    D.text(ctx, 'REFILL', x, y - 66, 9.5, '#126e69');
  };
  PAINT.noticeboard = function (ctx, o, ws, t) {
    const x = o.x + TS / 2, y = o.y + TS - 4;
    D.shadow(ctx, x, y + 2, 26, 6, 0.18);
    D.rr(ctx, x - 26, y - 24, 6, 26, 2, '#8a5a32');
    D.rr(ctx, x + 20, y - 24, 6, 26, 2, '#8a5a32');
    D.rr(ctx, x - 32, y - 66, 64, 46, 6, '#d9a066', '#6b4a2b', 3);
    D.rr(ctx, x - 26, y - 60, 22, 16, 1, '#fff');
    D.rr(ctx, x + 2, y - 62, 22, 20, 1, '#fff7a8');
    D.rr(ctx, x - 20, y - 40, 30, 14, 1, '#cde9ff');
    for (const [px, py] of [[-15, -60], [13, -62], [-5, -40]]) D.circle(ctx, x + px, y + py, 2, '#e5484d');
  };
  PAINT.lamp = function (ctx, o, ws, t) {
    const x = o.x + TS / 2, y = o.y + TS - 6;
    D.shadow(ctx, x, y + 2, 8, 3, 0.2);
    D.rr(ctx, x - 3, y - 70, 6, 72, 2, '#4a5560');
    D.rr(ctx, x - 10, y - 82, 20, 14, 5, '#fffbe0', '#4a5560', 2);
    D.rr(ctx, x - 12, y - 86, 24, 6, 3, '#4a5560');
  };
  PAINT.flowers = function (ctx, o, ws, t) {
    const x = o.x, y = o.y;
    const n = o.n || 6;
    for (let i = 0; i < n; i++) {
      const fx = x + 6 + U.hash(o.c, o.r, i) * (o.pw - 12), fy = y + 14 + U.hash(o.c, o.r, i + 9) * (o.ph - 20);
      const sway = Math.sin(t * 2 + i) * 1.5;
      D.line(ctx, fx, fy + 10, fx + sway, fy, '#3e8a2e', 1.6);
      const col = o.color || ['#ff8fab', '#ffd23f', '#ffffff', '#b8a1ff', '#ff7a59'][i % 5];
      for (let a = 0; a < 5; a++) D.circle(ctx, fx + sway + Math.cos(a * 1.26) * 3, fy + Math.sin(a * 1.26) * 3, 2.6, col);
      D.circle(ctx, fx + sway, fy, 2, '#ffb703');
    }
  };
  PAINT.sandtoys = function (ctx, o) {
    const x = o.x + 20, y = o.y + 30;
    D.poly(ctx, [x - 8, y - 12, x + 8, y - 12, x + 6, y + 2, x - 6, y + 2], '#ff5d8f', '#9a2a4a', 1.6);
    D.line(ctx, x + 12, y - 4, x + 24, y - 16, '#3d8bfd', 3);
    D.ell(ctx, x + 26, y - 18, 5, 3, '#3d8bfd');
    D.ell(ctx, x - 2, y + 10, 12, 4, '#e9c97a');
  };
  PAINT.litter = function (ctx, o, ws, t) {
    WW.items.draw(ctx, o.item || 'wrapper', o.x + TS / 2, o.y + TS / 2 + 6, 0.55, o.rot || 0);
  };

  /* --- Hub extras: improvements unlocked by choices --- */
  PAINT.banner = function (ctx, o, ws, t) {
    const x = o.x, y = o.y, w = o.pw;
    const wave = Math.sin(t * 2) * 2;
    D.line(ctx, x, y, x, y + 70, '#6b4a2b', 4);
    D.line(ctx, x + w, y, x + w, y + 70, '#6b4a2b', 4);
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.quadraticCurveTo(x + w / 2, y + 10 + wave, x + w, y + 4);
    ctx.lineTo(x + w, y + 30);
    ctx.quadraticCurveTo(x + w / 2, y + 36 + wave, x, y + 30);
    ctx.closePath();
    ctx.fillStyle = o.color || '#2fa36b';
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 2;
    ctx.stroke();
    D.text(ctx, o.text || '', x + w / 2, y + 19 + wave * 0.5, 13, '#fff', { outline: 'rgba(0,0,0,.25)', outlineWidth: 3 });
  };
  PAINT.sharetable = function (ctx, o) {
    const x = o.x, y = o.y, w = o.pw;
    D.shadow(ctx, x + w / 2, y + 44, w / 2, 7, 0.18);
    D.rr(ctx, x + 6, y + 26, 6, 18, 2, '#6b4a2b');
    D.rr(ctx, x + w - 12, y + 26, 6, 18, 2, '#6b4a2b');
    D.rr(ctx, x, y + 14, w, 16, 4, '#3d8bfd', '#1d3f8a', 2);
    WW.items.draw(ctx, 'muesli', x + 20, y + 10, 0.55);
    WW.items.draw(ctx, 'lunchbox', x + 46, y + 8, 0.55);
    D.ell(ctx, x + w - 22, y + 10, 14, 7, '#c98b55', '#6b4a2b', 1.5);
    for (const [fx, col] of [[-6, '#e5484d'], [2, '#ff9f1c'], [9, '#f7d046']]) D.circle(ctx, x + w - 22 + fx, y + 5, 4.5, col, '#6b4a2b', 1);
    D.rr(ctx, x + w / 2 - 36, y - 16, 72, 16, 5, '#fffdf2', '#1d3f8a', 1.5);
    D.text(ctx, 'SHARE TABLE', x + w / 2, y - 8, 9.5, '#1d3f8a');
  };

  PAINT.papertray = function (ctx, o, ws, t) {
    const x = o.x + TS / 2, y = o.y + TS - 6;
    D.shadow(ctx, x, y + 2, 20, 5, 0.2);
    D.rr(ctx, x - 18, y - 22, 36, 24, 4, '#3d8bfd', '#1d3f8a', 2);
    for (let i = 0; i < 3; i++) D.rr(ctx, x - 14 + i * 2, y - 30 + i * 3, 28, 12, 2, '#ffffff', '#9ab8d8', 1.2);
    D.rr(ctx, x - 30, y - 50, 60, 16, 5, '#fffdf2', '#1d3f8a', 1.5);
    D.text(ctx, 'REUSE PAPER', x, y - 42, 8.5, '#1d3f8a');
  };

  /* --- Interiors --- */
  PAINT.counter = function (ctx, o, ws, t) {
    const x = o.x, y = o.y, w = o.pw, h = o.ph;
    D.rr(ctx, x, y + 10, w, h - 10, 6, '#ff9f6b', '#7a3a22', 3);
    D.rr(ctx, x - 4, y + 4, w + 8, 16, 5, '#fff4dc', '#7a3a22', 2.5);
    for (let k = x + 20; k < x + w - 20; k += 60) {
      D.rr(ctx, k, y - 6, 40, 14, 4, '#d6dde6', '#56636b', 2);
      D.circle(ctx, k + 12, y - 4, 5, '#7ed957');
      D.circle(ctx, k + 26, y - 4, 5, '#ffd23f');
    }
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    for (let k = x + 12; k < x + w - 12; k += 40) ctx.fillRect(k, y + 26, 22, h - 34);
  };
  PAINT.table = function (ctx, o, ws, t, scene) {
    const x = o.x + 4, y = o.y + 8, w = o.pw - 8, h = o.ph - 14;
    D.shadow(ctx, x + w / 2, y + h + 6, w / 2 + 4, 7, 0.18);
    D.rr(ctx, x, y - 10, w, 8, 3, '#7cc6a0', '#2f6a4a', 2);
    D.rr(ctx, x, y + h + 2, w, 8, 3, '#7cc6a0', '#2f6a4a', 2);
    D.rr(ctx, x + 4, y, w - 8, h, 6, '#ffe8b8', '#8a5a32', 2.5);
    const clean = ws && ws.canteenClean;
    if (!clean && o.mess) o.mess.forEach((m, i) => WW.items.draw(ctx, m, x + 18 + i * ((w - 36) / Math.max(1, o.mess.length - 1)), y + h / 2, 0.55, (i % 3 - 1) * 0.5));
    if (clean) {
      D.circle(ctx, x + w / 2, y + h / 2, 9, '#ffffff', '#56636b', 1.5);
      D.circle(ctx, x + w / 2, y + h / 2, 5, '#7ed957');
    }
  };
  PAINT.bigbin = function (ctx, o, ws, t) {
    const x = o.x + o.pw / 2, y = o.y + o.ph - 4;
    const clean = ws && ws.canteenClean;
    D.shadow(ctx, x, y, 30, 8, 0.2);
    D.rr(ctx, x - 26, y - 60, 52, 60, 6, '#4a5560', '#26303a', 3);
    D.rr(ctx, x - 29, y - 66, 58, 10, 3, '#e5484d', '#26303a', 2.5);
    if (!clean) {
      const items = ['chips', 'banana', 'bottle', 'paper', 'apple', 'wrapper', 'can', 'muesli'];
      items.forEach((it, i) => WW.items.draw(ctx, it, x - 22 + (i % 4) * 15, y - 74 - Math.floor(i / 4) * 14, 0.6, (i - 3) * 0.3));
      for (let i = 0; i < 3; i++) {
        const ph = (t * 0.7 + i / 3) % 1;
        ctx.strokeStyle = `rgba(120,160,60,${0.7 * (1 - ph)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const bx = x - 16 + i * 16, by = y - 96 - ph * 34;
        ctx.moveTo(bx, by + 12);
        ctx.quadraticCurveTo(bx + 6, by + 6, bx, by);
        ctx.quadraticCurveTo(bx - 6, by - 6, bx, by - 12);
        ctx.stroke();
      }
      // cartoon flies
      for (let i = 0; i < 2; i++) {
        const fx = x + Math.cos(t * 3 + i * 3) * 30, fy = y - 100 + Math.sin(t * 5 + i) * 12;
        D.circle(ctx, fx, fy, 2.2, '#26303a');
        D.ell(ctx, fx - 2, fy - 3, 2.5, 1.5, 'rgba(255,255,255,.8)');
        D.ell(ctx, fx + 2, fy - 3, 2.5, 1.5, 'rgba(255,255,255,.8)');
      }
    }
  };
  PAINT.poster = function (ctx, o) {
    const x = o.x + 6, y = o.y + 8, w = o.pw - 12, h = o.ph - 18;
    D.rr(ctx, x, y, w, h, 4, o.color || '#fffdf2', '#8a5a32', 2.5);
    if (o.title) D.text(ctx, o.title, x + w / 2, y + 12, 10, '#245241');
    if (o.lines) o.lines.forEach((l, i) => D.text(ctx, l, x + w / 2, y + 26 + i * 12, 8.5, '#3b5a4a', { weight: 700 }));
    if (o.art) o.art(ctx, x, y, w, h);
  };
  PAINT.window = function (ctx, o) {
    const x = o.x + 6, y = o.y + 8, w = o.pw - 12, h = o.ph - 16;
    D.rr(ctx, x, y, w, h, 6, '#9fdcf0', '#5b6f7a', 3);
    D.line(ctx, x + w / 2, y + 2, x + w / 2, y + h - 2, '#fff', 3);
    D.poly(ctx, [x + 6, y + h * 0.5, x + w * 0.3, y + 4, x + w * 0.38, y + 4, x + 12, y + h * 0.5], 'rgba(255,255,255,.5)');
    D.circle(ctx, x + w * 0.75, y + h * 0.75, 8, '#7ed957');
  };
  PAINT.doormat = function (ctx, o, ws, t) {
    const x = o.x + 4, y = o.y + 10, w = o.pw - 8;
    D.rr(ctx, x, y, w, 26, 6, '#7cc6a0', '#2f6a4a', 2);
    D.text(ctx, o.text || 'EXIT ▼', x + w / 2, y + 13, 11, '#fff');
  };
  PAINT.plantshelf = function (ctx, o, ws, t) {
    const x = o.x + 4, y = o.y, w = o.pw - 8;
    D.rr(ctx, x, y + 26, w, 8, 2, '#a8703f', '#6b4a2b', 2);
    for (let k = 0; k < Math.floor(w / 28); k++) {
      const px = x + 14 + k * 28;
      D.poly(ctx, [px - 8, y + 14, px + 8, y + 14, px + 6, y + 27, px - 6, y + 27], '#ff7a59', '#9a3a22', 1.5);
      D.leaf(ctx, px, y + 14, 12, 4.5, -2 + Math.sin(t * 2 + k) * 0.1, '#5cc15f', '#2e7a45', 1.2);
      D.leaf(ctx, px, y + 14, 12, 4.5, -1.1 + Math.sin(t * 2 + k) * 0.1, '#4caf50', '#2e7a45', 1.2);
    }
  };
  PAINT.desk = function (ctx, o, ws, t) {
    const x = o.x + 2, y = o.y + 6, w = o.pw - 4, h = o.ph - 10;
    D.shadow(ctx, x + w / 2, y + h + 4, w / 2, 7, 0.18);
    D.rr(ctx, x, y + h - 14, 8, 16, 2, '#6b4a2b');
    D.rr(ctx, x + w - 8, y + h - 14, 8, 16, 2, '#6b4a2b');
    D.rr(ctx, x, y, w, h - 12, 6, o.color || '#c9b5df', '#5a4a7a', 2.5);
    if (o.top) o.top(ctx, x, y, w, h, t);
  };
  PAINT.screen = function (ctx, o, ws, t, scene) {
    const x = o.x + 6, y = o.y + 4, w = o.pw - 12, h = o.ph - 10;
    D.rr(ctx, x, y, w, h, 8, '#26303a', '#111820', 3);
    D.rr(ctx, x + 6, y + 6, w - 12, h - 12, 5, '#123a4a');
    const vals = (o.values && o.values()) || [3, 5, 2, 1];
    const max = Math.max(5, ...vals);
    const cols = ['#e5484d', '#9b6bff', '#3d8bfd', '#9aa5b0'];
    vals.forEach((v, i) => {
      const bh = ((h - 40) * v) / max;
      const bx = x + 20 + i * ((w - 40) / vals.length);
      D.rr(ctx, bx, y + h - 14 - bh, (w - 60) / vals.length, bh, 3, cols[i % 4]);
    });
    D.text(ctx, o.title || 'DATA SCREEN', x + w / 2, y + 16, 10, '#9fe8ff');
  };
})();
