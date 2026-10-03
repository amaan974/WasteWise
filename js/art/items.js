/* WasteWise — illustrated waste / resource items (original vector drawings).
   Used in the waste maze, the audit tally and the final assessment. */
(function () {
  'use strict';
  const WW = window.WW;
  const D = WW.draw;
  const OUT = '#3b2a22';
  const I = (WW.items = {});

  // each painter draws an item centred at (0,0) roughly within a 40x40 box
  const P = {
    banana(ctx) {
      ctx.save();
      ctx.rotate(-0.3);
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.quadraticCurveTo(0, 14, 15, -6);
      ctx.quadraticCurveTo(2, 4, -14, -4);
      ctx.fillStyle = '#f7d046';
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2;
      ctx.stroke();
      // peel flaps
      D.poly(ctx, [-6, 2, -14, 10, -8, 4], '#e9bb2b', OUT, 1.6);
      D.poly(ctx, [4, 3, 6, 13, 9, 2], '#e9bb2b', OUT, 1.6);
      D.rr(ctx, 13, -9, 4, 4, 1, '#6b4a2b');
      D.circle(ctx, -4, 2, 1, '#8a6a2a');
      D.circle(ctx, 5, 1, 1, '#8a6a2a');
      ctx.restore();
    },
    apple(ctx) {
      // apple core
      ctx.beginPath();
      ctx.moveTo(-9, -12);
      ctx.quadraticCurveTo(-3, -6, -4, 0);
      ctx.quadraticCurveTo(-3, 6, -9, 12);
      ctx.lineTo(9, 12);
      ctx.quadraticCurveTo(3, 6, 4, 0);
      ctx.quadraticCurveTo(3, -6, 9, -12);
      ctx.closePath();
      ctx.fillStyle = '#fff3cf';
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2;
      ctx.stroke();
      D.ell(ctx, 0, -13, 10, 3.5, '#e5484d', OUT, 1.8);
      D.ell(ctx, 0, 13, 10, 3.5, '#e5484d', OUT, 1.8);
      D.line(ctx, 0, -16, 2, -21, '#6b4a2b', 2);
      D.leaf(ctx, 2, -19, 8, 3, -0.4, '#5cb85c', null, 1, false);
      D.ell(ctx, -1, -2, 1.2, 2, '#5b3a22');
      D.ell(ctx, 1.5, 3, 1.2, 2, '#5b3a22');
    },
    orange(ctx) {
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(-0.8 + i * 0.8);
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.quadraticCurveTo(-8, -10, 0, -16);
        ctx.quadraticCurveTo(8, -10, 0, 2);
        ctx.fillStyle = '#ff9f1c';
        ctx.fill();
        ctx.strokeStyle = OUT;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        D.ell(ctx, 0, -8, 2.5, 4, '#fff1c9');
        ctx.restore();
      }
    },
    bread(ctx) {
      D.rr(ctx, -13, -9, 26, 18, 7, '#e7b36a', OUT, 2);
      D.rr(ctx, -9, -5, 18, 11, 4, '#fff1d0');
    },
    paper(ctx) {
      ctx.save();
      ctx.rotate(-0.12);
      D.poly(ctx, [-11, -15, 7, -15, 12, -10, 12, 15, -11, 15], '#ffffff', OUT, 2);
      D.poly(ctx, [7, -15, 7, -10, 12, -10], '#dfe7ef', OUT, 1.4);
      for (let y = -7; y <= 10; y += 4.5) D.line(ctx, -7, y, 7, y, '#9ab8d8', 1.4);
      D.star(ctx, -4, -10, 3, 5, '#ffcf3f');
      ctx.restore();
    },
    cardboard(ctx) {
      D.poly(ctx, [-15, -6, 0, -13, 15, -6, 0, 1], '#e0b07a', OUT, 2);
      D.poly(ctx, [-15, -6, 0, 1, 0, 14, -15, 7], '#c98f55', OUT, 2);
      D.poly(ctx, [15, -6, 0, 1, 0, 14, 15, 7], '#d79f62', OUT, 2);
      D.line(ctx, -8, -9, 8, -2, '#f7e1b5', 2);
    },
    can(ctx) {
      D.rr(ctx, -9, -14, 18, 28, 4, '#d6dde6', OUT, 2);
      D.rr(ctx, -9, -6, 18, 12, 1, '#e5484d');
      D.ell(ctx, 0, -14, 9, 3, '#eef3f8', OUT, 1.6);
      D.rr(ctx, -2, -16, 4, 2.4, 1, '#a9b3be', OUT, 1);
      D.line(ctx, -5, -10, -5, 10, 'rgba(255,255,255,.7)', 2);
    },
    bottle(ctx) {
      // empty single-use plastic drink bottle
      D.rr(ctx, -3.5, -18, 7, 5, 1.5, '#4d96ff', OUT, 1.6);
      ctx.beginPath();
      ctx.moveTo(-4, -13);
      ctx.quadraticCurveTo(-9, -8, -9, -2);
      ctx.lineTo(-9, 14);
      ctx.quadraticCurveTo(0, 18, 9, 14);
      ctx.lineTo(9, -2);
      ctx.quadraticCurveTo(9, -8, 4, -13);
      ctx.closePath();
      ctx.fillStyle = 'rgba(190,230,255,.85)';
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2;
      ctx.stroke();
      D.rr(ctx, -9, 0, 18, 6, 1, '#7ed3a1');
      D.line(ctx, -5, -6, -5, 12, 'rgba(255,255,255,.8)', 1.6);
    },
    refill(ctx) {
      // reusable refillable drink bottle
      D.rr(ctx, -8, -12, 16, 28, 6, '#22b8b0', OUT, 2);
      D.rr(ctx, -6, -19, 12, 8, 3, '#2a6f8f', OUT, 1.8);
      D.rr(ctx, -2, -23, 9, 4, 2, '#2a6f8f', OUT, 1.4);
      D.leaf(ctx, -3, 6, 9, 3.5, -0.8, '#c9f29b', null, 1, false);
      D.line(ctx, -4, -8, -4, 10, 'rgba(255,255,255,.55)', 2);
    },
    lunchbox(ctx) {
      D.rr(ctx, -16, -10, 32, 22, 6, '#ff7a59', OUT, 2);
      D.rr(ctx, -16, -10, 32, 8, [6, 6, 1, 1], '#ff9f80', OUT, 1.6);
      D.rr(ctx, -4, -4, 8, 5, 1.5, '#ffd23f', OUT, 1.2);
      D.circle(ctx, -9, 5, 2.5, '#fff');
      D.circle(ctx, 9, 5, 2.5, '#fff');
    },
    chips(ctx) {
      // chip packet (soft plastic, foil-lined)
      ctx.beginPath();
      ctx.moveTo(-12, -15);
      ctx.lineTo(12, -15);
      ctx.lineTo(13, 15);
      ctx.lineTo(-13, 15);
      ctx.closePath();
      ctx.fillStyle = '#9b6bff';
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2;
      ctx.stroke();
      for (let x = -11; x <= 11; x += 3.6) { D.line(ctx, x, -15, x + 1.8, -12, '#7a4fe0', 1.2); D.line(ctx, x, 15, x + 1.8, 12, '#7a4fe0', 1.2); }
      D.circle(ctx, 0, 1, 7, '#ffd23f', OUT, 1.4);
      D.ell(ctx, -1, 0, 3.5, 2.5, '#f2a900');
      D.line(ctx, 6, -10, 9, 8, 'rgba(255,255,255,.4)', 2);
    },
    wrapper(ctx) {
      // lolly / muesli-bar wrapper (scrunched)
      D.poly(ctx, [-14, -5, -8, -8, 8, -8, 14, -4, 12, 0, 14, 5, 8, 8, -8, 8, -14, 5, -12, 0], '#ff5d8f', OUT, 2);
      D.line(ctx, -6, -4, 6, 3, 'rgba(255,255,255,.6)', 2);
      D.poly(ctx, [-8, -8, -8, 8, -5, 0], '#e04577');
      D.poly(ctx, [8, -8, 8, 8, 5, 0], '#e04577');
    },
    muesli(ctx) {
      // unopened muesli bar (still sealed)
      D.rr(ctx, -16, -7, 32, 14, 3, '#3aa76d', OUT, 2);
      D.rr(ctx, -9, -4, 18, 8, 2, '#f7e1b5', OUT, 1.2);
      for (const x of [-6, -2, 2, 6]) D.circle(ctx, x, 0, 1.2, '#c98f55');
      D.line(ctx, -16, -4, -19, -6, OUT, 1.4);
      D.line(ctx, 16, -4, 19, -6, OUT, 1.4);
    },
    cling(ctx) {
      // used cling wrap (soft plastic)
      ctx.beginPath();
      ctx.moveTo(-13, -6);
      ctx.bezierCurveTo(-6, -16, 6, -2, 13, -9);
      ctx.bezierCurveTo(16, 0, 8, 6, 13, 12);
      ctx.bezierCurveTo(4, 16, -6, 6, -13, 11);
      ctx.bezierCurveTo(-16, 4, -10, 0, -13, -6);
      ctx.fillStyle = 'rgba(220,240,255,.8)';
      ctx.fill();
      ctx.strokeStyle = '#7aa7c7';
      ctx.lineWidth = 2;
      ctx.stroke();
      D.line(ctx, -6, -2, 4, 4, 'rgba(255,255,255,.9)', 2);
    },
    pouch(ctx) {
      // squeeze yoghurt pouch (mixed plastic/foil)
      D.poly(ctx, [-11, -8, 11, -8, 12, 15, -12, 15], '#ffb3c6', OUT, 2);
      D.rr(ctx, -4, -16, 8, 9, 2, '#f2a900', OUT, 1.6);
      D.circle(ctx, 0, 4, 5, '#ff5d8f', OUT, 1.2);
    },
    breadbag(ctx) {
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.quadraticCurveTo(0, -16, 12, -10);
      ctx.lineTo(13, 13);
      ctx.quadraticCurveTo(0, 17, -13, 13);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,240,200,.9)';
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2;
      ctx.stroke();
      D.rr(ctx, -3, -16, 6, 5, 1.5, '#4d96ff', OUT, 1);
      D.circle(ctx, -4, 3, 1.5, '#e0b07a');
      D.circle(ctx, 4, 6, 1.5, '#e0b07a');
    },
    tissue(ctx) {
      for (const [x, y, r] of [[-5, 2, 8], [5, 0, 8], [0, -6, 7]]) D.circle(ctx, x, y, r, '#f5f7fb', '#9aa5b5', 1.6);
    },
    jar(ctx) {
      D.rr(ctx, -10, -10, 20, 24, 5, 'rgba(200,235,220,.85)', OUT, 2);
      D.rr(ctx, -11, -15, 22, 6, 2, '#d6dde6', OUT, 1.6);
    },
  };
  I.painters = P;

  I.draw = function (ctx, id, x, y, size = 1, rot = 0) {
    const p = P[id];
    if (!p) return;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale(size, size);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    p(ctx);
    ctx.restore();
  };

  const cache = {};
  /** Data-URL icon for DOM use (cached). */
  I.icon = function (id, px = 64) {
    const key = id + '@' + px;
    if (cache[key]) return cache[key];
    const c = D.offscreen(48, 48, px / 48, (ctx) => I.draw(ctx, id, 24, 25, 1));
    cache[key] = c.toDataURL();
    return cache[key];
  };
  I.img = function (id, px = 64, alt = '') {
    return `<img class="item-icon" src="${I.icon(id, px)}" width="${px}" height="${px}" alt="${alt}">`;
  };
})();
