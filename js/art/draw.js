/* WasteWise — vector drawing primitives shared by characters, world and UI icons.
   Every visual in the game is drawn procedurally by this code (original artwork, no image files). */
(function () {
  'use strict';
  const WW = window.WW;
  const D = (WW.draw = {});
  const TAU = Math.PI * 2;
  D.TAU = TAU;
  D.OUT = '#3b2a22';

  D.shade = function (hex, amt) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    let r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    if (amt >= 0) {
      r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt;
    } else {
      r *= 1 + amt; g *= 1 + amt; b *= 1 + amt;
    }
    const h = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
    return '#' + h(r) + h(g) + h(b);
  };
  D.alpha = function (hex, a) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    return `rgba(${parseInt(c.slice(0, 2), 16)},${parseInt(c.slice(2, 4), 16)},${parseInt(c.slice(4, 6), 16)},${a})`;
  };

  D.ell = function (ctx, x, y, rx, ry, fill, stroke, lw = 2, rot = 0) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.01, Math.abs(rx)), Math.max(0.01, Math.abs(ry)), rot, 0, TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  D.circle = (ctx, x, y, r, fill, stroke, lw) => D.ell(ctx, x, y, r, r, fill, stroke, lw);

  D.rrPath = function (ctx, x, y, w, h, r) {
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    const rad = Array.isArray(r) ? r : [r, r, r, r];
    const [tl, tr, br, bl] = rad.map((v) => Math.min(v, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
  };
  D.rr = function (ctx, x, y, w, h, r, fill, stroke, lw = 2) {
    D.rrPath(ctx, x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  D.poly = function (ctx, pts, fill, stroke, lw = 2) {
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  };
  D.line = function (ctx, x1, y1, x2, y2, color, lw = 2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
  };
  /** Pointed leaf, base at (x,y), pointing along angle. */
  D.leaf = function (ctx, x, y, len, wid, angle, fill, stroke, lw = 1.5, vein = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.45, -wid, len, 0);
    ctx.quadraticCurveTo(len * 0.45, wid, 0, 0);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
    if (vein) {
      ctx.beginPath();
      ctx.moveTo(len * 0.1, 0);
      ctx.lineTo(len * 0.85, 0);
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.lineWidth = Math.max(0.6, lw * 0.6);
      ctx.stroke();
    }
    ctx.restore();
  };
  D.star = function (ctx, x, y, r, points, fill, stroke, inner = 0.5, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rr = i % 2 ? r * inner : r;
      const a = rot + (i * Math.PI) / points;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  };
  D.shadow = function (ctx, x, y, rx, ry, a = 0.22) {
    D.ell(ctx, x, y, rx, ry, `rgba(30,60,40,${a})`);
  };
  D.font = (size, weight = 800) => `${weight} ${size}px Fredoka, "Baloo 2", Nunito, ui-rounded, "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif`;
  D.text = function (ctx, s, x, y, size = 16, fill = '#23443a', opts = {}) {
    ctx.font = D.font(size, opts.weight || 800);
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.baseline || 'middle';
    if (opts.outline) {
      ctx.lineJoin = 'round';
      ctx.strokeStyle = opts.outline;
      ctx.lineWidth = opts.outlineWidth || Math.max(3, size / 4);
      ctx.strokeText(s, x, y);
    }
    ctx.fillStyle = fill;
    ctx.fillText(s, x, y);
  };
  /** Speech/emote bubble. */
  D.bubble = function (ctx, x, y, w, h, fill = '#fffdf5', stroke = '#2d5a45') {
    D.rr(ctx, x - w / 2, y - h, w, h, Math.min(12, h / 2), fill, stroke, 2.5);
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 1);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x + 6, y - 1);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x + 6, y);
    ctx.stroke();
  };
  /** Draw into an offscreen canvas and return it (for caching / DOM icons). */
  D.offscreen = function (w, h, scale, fn) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * scale);
    c.height = Math.ceil(h * scale);
    const ctx = c.getContext('2d');
    ctx.scale(scale, scale);
    fn(ctx);
    return c;
  };
})();
