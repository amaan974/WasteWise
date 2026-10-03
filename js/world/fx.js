/* WasteWise — particle effects (sparkles, confetti, water drops, methane bubbles, dust...). */
(function () {
  'use strict';
  const WW = window.WW;
  const D = WW.draw;
  const FX = (WW.fx = { list: [], screen: [] });
  const COLORS = ['#ffd23f', '#2fa36b', '#ff7a59', '#3d8bfd', '#ff5d8f', '#9b6bff', '#7ed957'];

  FX.clear = function () {
    FX.list = [];
    FX.screen = [];
  };

  /** Spawn effect in world coordinates (or screen when opts.screen). */
  FX.spawn = function (type, x, y, opts = {}) {
    const reduced = WW.save.reducedMotion();
    const out = opts.screen ? FX.screen : FX.list;
    const add = (p) => out.push(Object.assign({ type, x, y, t: 0, life: 1, vx: 0, vy: 0 }, p));
    switch (type) {
      case 'sparkle':
        for (let i = 0; i < (reduced ? 4 : 10); i++) add({ vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 160 - 20, life: 0.7 + Math.random() * 0.4, r: 4 + Math.random() * 4, col: i % 2 ? '#ffd23f' : '#ffffff' });
        break;
      case 'confetti':
        for (let i = 0; i < (reduced ? 12 : 46); i++) add({ vx: (Math.random() - 0.5) * 420, vy: -Math.random() * 380 - 120, life: 1.6 + Math.random(), r: 3 + Math.random() * 3, col: COLORS[i % COLORS.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, g: 520 });
        break;
      case 'dust':
        add({ vx: (Math.random() - 0.5) * 30, vy: -10, life: 0.45, r: 4 + Math.random() * 3 });
        break;
      case 'puff':
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; add({ vx: Math.cos(a) * 70, vy: Math.sin(a) * 50, life: 0.5, r: 7 }); }
        break;
      case 'drop':
        for (let i = 0; i < (opts.n || 6); i++) add({ vx: (Math.random() - 0.5) * 120, vy: -Math.random() * 150, life: 0.7, r: 3, g: 600, col: '#5fbfe2' });
        break;
      case 'rain':
        for (let i = 0; i < (reduced ? 20 : 70); i++) add({ x: x + (Math.random() - 0.5) * (opts.w || 400), y: y - Math.random() * 200, vx: -20, vy: 380 + Math.random() * 120, life: 0.6 + Math.random() * 0.8, r: 2, col: '#7cc8ef', streak: true });
        break;
      case 'heart':
        for (let i = 0; i < 4; i++) add({ vx: (Math.random() - 0.5) * 50, vy: -60 - Math.random() * 40, life: 1.2, r: 7 });
        break;
      case 'leaf':
        for (let i = 0; i < (reduced ? 3 : 8); i++) add({ vx: (Math.random() - 0.5) * 140, vy: -Math.random() * 140, life: 1.2, r: 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 8, g: 160 });
        break;
      case 'bubble':
        for (let i = 0; i < (opts.n || 5); i++) add({ x: x + (Math.random() - 0.5) * 30, vy: -40 - Math.random() * 30, vx: (Math.random() - 0.5) * 20, life: 1.8 + Math.random(), r: 5 + Math.random() * 5, col: '#a3c06a' });
        break;
      case 'stink':
        add({ vy: -30, life: 1.4, r: 10 });
        break;
      case 'text':
        add({ vy: -50, life: 1.3, text: opts.text, col: opts.col || '#2fa36b', size: opts.size || 18 });
        break;
      case 'ring':
        add({ life: 0.6, r: 6, col: opts.col || '#ffd23f' });
        break;
      case 'grow':
        for (let i = 0; i < 6; i++) add({ x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 20, vy: -30, life: 1, r: 5, col: '#7ed957' });
        break;
    }
  };

  FX.update = function (dt) {
    for (const arr of [FX.list, FX.screen]) {
      for (const p of arr) {
        p.t += dt;
        p.vy += (p.g || 0) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.vr) p.rot += p.vr * dt;
      }
    }
    FX.list = FX.list.filter((p) => p.t < p.life);
    FX.screen = FX.screen.filter((p) => p.t < p.life);
  };

  function drawP(ctx, p) {
    const k = p.t / p.life;
    const a = Math.max(0, 1 - k);
    ctx.save();
    ctx.globalAlpha = a;
    switch (p.type) {
      case 'sparkle': D.star(ctx, p.x, p.y, p.r * (1 - k * 0.5), 4, p.col, null, 0.35, p.t * 4); break;
      case 'confetti':
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.col;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        break;
      case 'dust': case 'puff': D.circle(ctx, p.x, p.y, p.r * (1 + k), 'rgba(255,255,255,.85)'); break;
      case 'drop': case 'rain':
        if (p.streak) D.line(ctx, p.x, p.y, p.x - 2, p.y - 10, p.col, 2);
        else D.circle(ctx, p.x, p.y, p.r, p.col);
        break;
      case 'heart': D.text(ctx, '♥', p.x, p.y, 14, '#ff5d8f'); break;
      case 'leaf':
        D.leaf(ctx, p.x, p.y, 12, 5, p.rot, '#7ed957', '#2e7a45', 1);
        break;
      case 'bubble':
        D.circle(ctx, p.x + Math.sin(p.t * 4) * 4, p.y, p.r, 'rgba(163,192,106,.35)', 'rgba(110,140,60,.8)', 1.5);
        if (p.r > 7) D.text(ctx, 'CH₄', p.x + Math.sin(p.t * 4) * 4, p.y, 7, '#4a5a2a');
        break;
      case 'stink':
        ctx.strokeStyle = 'rgba(120,160,60,.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(p.x + 6, p.y - 6, p.x, p.y - 12);
        ctx.quadraticCurveTo(p.x - 6, p.y - 18, p.x, p.y - 24);
        ctx.stroke();
        break;
      case 'text': D.text(ctx, p.text, p.x, p.y, p.size, p.col, { outline: '#fff', outlineWidth: 4 }); break;
      case 'ring':
        ctx.strokeStyle = p.col;
        ctx.lineWidth = 4 * (1 - k);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + k * 50, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'grow': D.leaf(ctx, p.x, p.y, 10, 4, -1.57, p.col, null, 1, false); break;
    }
    ctx.restore();
  }
  FX.draw = function (ctx) { for (const p of FX.list) drawP(ctx, p); };
  FX.drawScreen = function (ctx) { for (const p of FX.screen) drawP(ctx, p); };
})();
