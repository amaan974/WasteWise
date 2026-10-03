/* WasteWise — original cast, drawn procedurally.
   Milo the Eco Mouse is an ORIGINAL design: sandy fur, side-set oval ears with pink insides,
   a green leaf explorer hat, teal backpack, sunny-yellow scarf and buck teeth.
   (Deliberately unlike any famous cartoon mouse: no black round ears, no shorts, no gloves.) */
(function () {
  'use strict';
  const WW = window.WW;
  const D = WW.draw;
  const C = (WW.chars = {});
  const OUT = D.OUT;

  /* ---------- Player avatar options (inclusive choices) ---------- */
  C.AVATAR = {
    skins: ['#ffdcbf', '#f3c393', '#d29a6a', '#9c6440', '#64402a'],
    hairStyles: ['short', 'ponytail', 'curly', 'bun', 'spiky', 'hijab'],
    hairStyleNames: ['Short', 'Ponytail', 'Curly', 'Bun', 'Spiky', 'Hijab'],
    hairColors: ['#3b2a20', '#15100d', '#a5502a', '#e8be62', '#7b4b2a'],
    hijabColors: ['#2f7f86', '#6c5ce7', '#e07a5f', '#1aa37a', '#e9a23b'],
    shirts: ['#2fa36b', '#3d8bfd', '#ff7a59', '#9b6bff', '#f2a900'],
  };

  C.INFO = {
    milo: { name: 'Milo the Eco Mouse', color: '#22b8b0', short: 'Milo' },
    maple: { name: 'Principal Maple', color: '#e0583e', short: 'Principal Maple' },
    sunny: { name: 'Chef Sunny', color: '#f2a900', short: 'Chef Sunny' },
    sprout: { name: 'Professor Sprout', color: '#8e5cd6', short: 'Professor Sprout' },
    kid: { name: 'You', color: '#2fa36b', short: 'You' },
    narrator: { name: 'Story', color: '#2d5a45', short: 'Story' },
  };

  function kidSpec(look) {
    const A = C.AVATAR;
    const style = A.hairStyles[look.hair % A.hairStyles.length];
    return {
      size: 'kid',
      skin: A.skins[look.skin % A.skins.length],
      hair: { style, color: style === 'hijab' ? A.hijabColors[look.hairColor % 5] : A.hairColors[look.hairColor % 5] },
      shirt: A.shirts[look.shirt % A.shirts.length],
      pants: '#35507d',
      shoes: '#2c2c3a',
      badge: true,
      backpack: '#2e9e5b',
    };
  }
  C.kidSpec = kidSpec;

  const SPECS = {
    maple: { size: 'adult', skin: '#f0c39c', hair: { style: 'maplebun', color: '#cfcadb' }, shirt: '#e0583e', inner: '#fff7ea', pants: '#3d4f7d', shoes: '#5b3b2b', glasses: '#6b3f2a', lanyard: true, brooch: true },
    sunny: { size: 'adult', skin: '#9a6440', hair: { style: 'curlyShort', color: '#2b1a12' }, shirt: '#ff8f3f', pants: '#3d4a6b', shoes: '#2a2a2a', apron: '#ffd23f', hat: 'chef', wide: 1.15 },
    sprout: { size: 'adult', skin: '#ffd9b8', hair: { style: 'sprout', color: '#76c043' }, shirt: '#fbfdff', inner: '#9ad0f5', pants: '#6b5b95', shoes: '#3b2f4a', glasses: '#3b3b5c', bowtie: '#8e5cd6', coat: true },
  };
  C.SPECS = SPECS;

  /* ---------- Faces ---------- */
  const FACE = {
    happy: { brow: 'normal', mouth: 'smile' },
    neutral: { brow: 'normal', mouth: 'small' },
    excited: { brow: 'raised', mouth: 'grin', eyes: 'big' },
    proud: { brow: 'normal', mouth: 'grin', eyes: 'closed' },
    laugh: { brow: 'raised', mouth: 'grin', eyes: 'closed' },
    worried: { brow: 'worried', mouth: 'wobble' },
    sad: { brow: 'sad', mouth: 'frown' },
    surprised: { brow: 'high', mouth: 'o', eyes: 'big' },
    thinking: { brow: 'one', mouth: 'flat' },
  };

  function drawEyes(ctx, ex, ey, rx, ry, face, blink, side, lookX = 0) {
    const eyes = blink ? 'blink' : face.eyes;
    const xs = side ? [ex] : [-ex, ex];
    for (const x of xs) {
      if (eyes === 'blink') {
        D.line(ctx, x - rx, ey, x + rx, ey, '#2b211c', 1.6);
      } else if (eyes === 'closed') {
        ctx.beginPath();
        ctx.arc(x, ey + 1, rx * 1.1, Math.PI * 1.1, Math.PI * 1.9);
        ctx.strokeStyle = '#2b211c';
        ctx.lineWidth = 1.7;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else {
        const k = eyes === 'big' ? 1.18 : 1;
        D.ell(ctx, x + lookX, ey, rx * k, ry * k, '#2b211c');
        D.circle(ctx, x + lookX + rx * 0.35, ey - ry * 0.38, Math.max(0.6, rx * 0.42), '#fff');
      }
    }
  }
  function drawBrows(ctx, ex, by, w, kind, side) {
    const xs = side ? [1] : [-1, 1];
    ctx.strokeStyle = '#3b2a22';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (const s of xs) {
      const cx = side ? ex : s * ex;
      let inY = 0, outY = 0;
      if (kind === 'raised') { inY = outY = -1.6; }
      if (kind === 'high') { inY = outY = -2.6; }
      if (kind === 'worried' || kind === 'sad') { inY = -1.8; outY = 0.8; }
      if (kind === 'one') { if (s < 0) { inY = outY = -2; } else { inY = 0.6; outY = 0; } }
      const inner = side ? cx - w : cx - s * w;
      const outer = side ? cx + w : cx + s * w;
      ctx.beginPath();
      ctx.moveTo(inner, by + inY);
      ctx.lineTo(outer, by + outY);
      ctx.stroke();
    }
  }
  function drawMouth(ctx, mx, my, kind, talkOpen, scale = 1) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.7;
    if (talkOpen) {
      const big = kind === 'grin' || kind === 'o' ? 1.2 : 1;
      D.ell(ctx, mx, my + 0.6, 3.1 * big * scale, 2.6 * big * scale, '#7a2e2a', OUT, 1.2);
      D.ell(ctx, mx, my + 1.8 * scale, 1.8 * scale, 0.9 * scale, '#ff8a8a');
      return;
    }
    switch (kind) {
      case 'grin':
        ctx.beginPath();
        ctx.moveTo(mx - 4.6 * scale, my - 1);
        ctx.quadraticCurveTo(mx, my + 6.5 * scale, mx + 4.6 * scale, my - 1);
        ctx.closePath();
        ctx.fillStyle = '#7a2e2a';
        ctx.fill();
        ctx.stroke();
        D.ell(ctx, mx, my + 2.6 * scale, 2 * scale, 1 * scale, '#ff8a8a');
        break;
      case 'o': D.ell(ctx, mx, my + 0.8, 2 * scale, 2.6 * scale, '#7a2e2a', OUT, 1.2); break;
      case 'frown':
        ctx.beginPath();
        ctx.arc(mx, my + 3.4, 3.4 * scale, Math.PI * 1.18, Math.PI * 1.82);
        ctx.stroke();
        break;
      case 'wobble':
        ctx.beginPath();
        ctx.moveTo(mx - 3.4, my + 1);
        ctx.quadraticCurveTo(mx - 1.7, my - 0.6, mx, my + 1);
        ctx.quadraticCurveTo(mx + 1.7, my + 2.4, mx + 3.4, my + 0.6);
        ctx.stroke();
        break;
      case 'flat': D.line(ctx, mx - 3, my + 1.4, mx + 2.4, my + 0.4, OUT, 1.7); break;
      case 'small':
        ctx.beginPath();
        ctx.arc(mx, my - 1, 2.5 * scale, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        break;
      default:
        ctx.beginPath();
        ctx.arc(mx, my - 2.2, 3.9 * scale, Math.PI * 0.16, Math.PI * 0.84);
        ctx.stroke();
    }
  }

  /* ---------- Arms ---------- */
  function drawArm(ctx, sx, sy, ang, len, w, sleeve, skin, hold) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang);
    D.rr(ctx, -w / 2, -w / 2, w, len * 0.78 + w / 2, w / 2, sleeve, OUT, 1.6);
    D.circle(ctx, 0, len, w * 0.62, skin, OUT, 1.4);
    if (hold) hold(ctx, len);
    ctx.restore();
  }
  function armPose(pose, t, sw, moving, run) {
    const swing = moving ? sw * (run ? 0.55 : 0.35) : Math.sin(t * 2.2) * 0.04;
    switch (pose) {
      case 'wave': return [0.15 + swing, -2.55 + Math.sin(t * 12) * 0.35, 1, 1];
      case 'point': return [0.12, -1.45, 1, 1];
      case 'think': return [0.12, 1.95, 1, 0.78];
      case 'celebrate': return [2.55 + Math.sin(t * 14) * 0.15, -2.55 - Math.sin(t * 14) * 0.15, 1, 1];
      case 'carry': return [2.85, -2.85, 1, 1];
      case 'shrug': return [0.95, -0.95, 0.8, 0.8];
      case 'present': return [0.5, -1.1, 1, 1];
      case 'clipboard': return [0.12 + swing, -0.9, 1, 0.85];
      default: return [0.12 + swing, -0.12 + swing, 1, 1];
    }
  }

  /* ---------- Hair ---------- */
  function hairFront(ctx, s, hx, hy, R, view, t) {
    const col = s.hair.color;
    const st = s.hair.style;
    if (st === 'hijab') return; // drawn separately
    ctx.lineJoin = 'round';
    if (view === 'back') {
      // back of head covered
      D.ell(ctx, hx, hy - 1, R + 1.2, R + 0.8, col, OUT, 2);
      if (st === 'ponytail') {
        const sway = Math.sin(t * 5) * 2;
        D.ell(ctx, hx + sway, hy + R + 2, 4, 8, col, OUT, 1.8);
        D.ell(ctx, hx, hy + R - 3, 3.2, 2, '#ff6f91', OUT, 1.2);
      }
      if (st === 'bun' || st === 'maplebun') D.circle(ctx, hx, hy - R - 2, 6.5, col, OUT, 2);
      if (st === 'curly') for (let a = 0; a < 9; a++) { const an = Math.PI * (0.9 + a * 0.15); D.circle(ctx, hx + Math.cos(an) * R, hy + Math.sin(an) * R * 0.95, 5, col, OUT, 1.5); }
      if (st === 'sprout') sproutTufts(ctx, hx, hy - R + 1, t);
      if (st === 'spiky') spikes(ctx, hx, hy, R, col);
      return;
    }
    if (view === 'side') {
      ctx.beginPath();
      ctx.arc(hx, hy, R + 1.4, Math.PI * 0.58, Math.PI * 1.9);
      ctx.quadraticCurveTo(hx + R * 0.75, hy - R * 0.42, hx + R * 0.35, hy - R * 0.48);
      ctx.quadraticCurveTo(hx + R * 0.05, hy - R * 0.62, hx - R * 0.1, hy - R * 0.38);
      ctx.quadraticCurveTo(hx - R * 0.42, hy - R * 0.05, hx - R * 0.38, hy + R * 0.95);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (st === 'ponytail') {
        const sway = Math.sin(t * 5) * 0.2;
        ctx.save();
        ctx.translate(hx - R * 0.9, hy - 2);
        ctx.rotate(0.5 + sway);
        D.ell(ctx, 0, 7, 3.6, 8, col, OUT, 1.8);
        ctx.restore();
      }
      if (st === 'bun' || st === 'maplebun') D.circle(ctx, hx - R * 0.55, hy - R * 0.85, 6, col, OUT, 2);
      if (st === 'curly') for (let a = 0; a < 7; a++) { const an = Math.PI * (0.75 + a * 0.18); D.circle(ctx, hx + Math.cos(an) * R, hy + Math.sin(an) * R, 4.6, col, OUT, 1.4); }
      if (st === 'sprout') sproutTufts(ctx, hx - 2, hy - R + 1, t);
      if (st === 'spiky') spikes(ctx, hx, hy, R, col);
      if (st === 'curlyShort') for (const [dx, dy] of [[-R * 0.8, -2], [-R * 0.55, -R * 0.5]]) D.circle(ctx, hx + dx, hy + dy, 4, col, OUT, 1.2);
      return;
    }
    // front
    if (st === 'curlyShort') {
      for (const s2 of [-1, 1]) {
        D.circle(ctx, hx + s2 * R * 0.92, hy - 3, 4, col, OUT, 1.2);
        D.circle(ctx, hx + s2 * R * 0.78, hy - 8, 4, col, OUT, 1.2);
      }
      return;
    }
    if (st === 'curly') {
      for (let a = 0; a < 11; a++) {
        const an = Math.PI * (1.0 + a * 0.1);
        D.circle(ctx, hx + Math.cos(an) * R * 1.02, hy + Math.sin(an) * R * 0.95 - 1, 5.4, col, OUT, 1.5);
      }
      D.ell(ctx, hx, hy - R * 0.55, R * 0.85, R * 0.42, col);
      return;
    }
    ctx.beginPath();
    ctx.arc(hx, hy, R + 1.4, Math.PI * 0.96, Math.PI * 2.04);
    // fringe
    const fy = hy - R * 0.22;
    ctx.lineTo(hx + R * 0.95, fy + 2);
    ctx.quadraticCurveTo(hx + R * 0.55, fy - 3, hx + R * 0.3, fy + 1);
    ctx.quadraticCurveTo(hx, fy - 4, hx - R * 0.25, fy + 1);
    ctx.quadraticCurveTo(hx - R * 0.55, fy - 3, hx - R * 0.95, fy + 3);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (st === 'ponytail') {
      const sway = Math.sin(t * 5) * 0.15;
      ctx.save();
      ctx.translate(hx + R * 0.9, hy - 3);
      ctx.rotate(-0.25 + sway);
      D.ell(ctx, 3, 7, 3.4, 7.5, col, OUT, 1.8);
      ctx.restore();
    }
    if (st === 'bun') D.circle(ctx, hx, hy - R - 3, 6.2, col, OUT, 2);
    if (st === 'maplebun') {
      D.circle(ctx, hx, hy - R - 3, 6.5, col, OUT, 2);
      D.ell(ctx, hx - R * 0.95, hy - 1, 3.5, 6, col, OUT, 1.5);
      D.ell(ctx, hx + R * 0.95, hy - 1, 3.5, 6, col, OUT, 1.5);
    }
    if (st === 'spiky') spikes(ctx, hx, hy, R, col);
    if (st === 'sprout') sproutTufts(ctx, hx, hy - R + 1, t);
  }
  function spikes(ctx, hx, hy, R, col) {
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const an = Math.PI * (1.05 + i * 0.15);
      const r = i % 2 ? R + 7 : R + 1;
      pts.push(hx + Math.cos(an) * r, hy + Math.sin(an) * r);
    }
    pts.push(hx + R * 0.6, hy - R * 0.3, hx - R * 0.6, hy - R * 0.3);
    D.poly(ctx, pts, col, OUT, 1.8);
  }
  function sproutTufts(ctx, x, y, t) {
    const sway = Math.sin(t * 3) * 0.12;
    D.leaf(ctx, x - 2, y, 12, 4.5, -2.1 + sway, '#8fd85a', '#3f7f2a', 1.3);
    D.leaf(ctx, x, y - 1, 14, 5, -1.57 + sway, '#a6e36b', '#3f7f2a', 1.3);
    D.leaf(ctx, x + 2, y, 12, 4.5, -1.05 + sway, '#8fd85a', '#3f7f2a', 1.3);
  }
  function hijab(ctx, hx, hy, R, col, view) {
    if (view === 'back') {
      D.ell(ctx, hx, hy + 1, R + 3.5, R + 4, col, OUT, 2);
      D.rr(ctx, hx - R - 1, hy + 4, (R + 1) * 2, R + 2, 6, col, OUT, 2);
      return;
    }
    D.rr(ctx, hx - R - 2, hy + 3, (R + 2) * 2, R + 3, 7, col, OUT, 2);
    D.ell(ctx, hx, hy + 1, R + 3.5, R + 4, col, OUT, 2);
  }

  /* ---------- Humans (player, staff, students) ---------- */
  function drawHuman(ctx, s, o) {
    const t = o.t || 0, dir = o.dir || 'down', anim = o.anim || 0;
    const moving = !!o.moving, run = !!o.run;
    const adult = s.size === 'adult';
    const L = adult ? { leg: 20, bodyH: 27, bodyW: 26 * (s.wide || 1), R: 14.5 } : { leg: 13, bodyH: 19, bodyW: 23, R: 15.5 };
    const hipY = -L.leg, shY = hipY - L.bodyH, headY = shY - L.R + (adult ? 2 : 4);
    const sw = moving ? Math.sin(anim) : 0;
    const bob = moving ? Math.abs(Math.cos(anim)) * (run ? 3 : 2) : Math.sin(t * 2.2 + (o.seed || 0)) * 0.7;
    const face = FACE[o.emotion] || FACE.happy;
    const blink = ((t + (o.seed || 0) * 1.7) % 3.6) < 0.12;
    const talkOpen = o.talking && Math.sin(t * 19) > -0.1;
    const view = dir === 'up' ? 'back' : dir === 'left' || dir === 'right' ? 'side' : 'front';
    const pose = o.pose || 'idle';

    ctx.save();
    ctx.translate(o.x || 0, o.y || 0);
    if (o.scale) ctx.scale(o.scale, o.scale);
    if (!o.noShadow) D.shadow(ctx, 0, 0, L.bodyW * 0.6, 5);
    ctx.translate(0, -bob - (o.z || 0));
    if (dir === 'left') ctx.scale(-1, 1);
    const sleeve = s.shirt;
    const W = L.bodyW;

    if (view === 'side') {
      const lean = run && moving ? 0.08 : 0;
      ctx.rotate(lean);
      const legAmp = run ? 0.75 : 0.5;
      const pa = armPose(pose, t, sw, moving, run);
      const armSide = pose === 'idle' || !pose ? [sw * (run ? 0.9 : 0.6), -sw * (run ? 0.9 : 0.6)] : pose === 'carry' ? [-2.9, -2.9] : pose === 'celebrate' ? [-2.7, 2.7] : pose === 'point' ? [-1.5, 0.2] : pose === 'wave' ? [-2.5 + Math.sin(t * 12) * 0.35, 0.2] : pose === 'think' ? [-2.3, 0.2] : [pa[1], -pa[1] * 0.5];
      // back arm
      drawArm(ctx, -1, shY + 4, armSide[1], adult ? 17 : 14, 5.5, D.shade(sleeve, -0.18), D.shade(s.skin, -0.1));
      // back leg
      leg(ctx, -1, hipY, -sw * legAmp, L.leg, D.shade(s.pants, -0.2), s.shoes, true);
      if (s.coat) D.poly(ctx, [-W * 0.38, shY + 6, W * 0.38, shY + 6, W * 0.45, hipY + 9, -W * 0.48, hipY + 9], '#f4f8fb', OUT, 1.6);
      // body
      D.rr(ctx, -W * 0.38, shY, W * 0.76, L.bodyH + 3, [8, 8, 5, 5], s.shirt, OUT, 2);
      if (s.backpack) D.rr(ctx, -W * 0.38 - 6, shY + 3, 8, 15, 3, s.backpack, OUT, 1.6);
      if (s.apron) D.rr(ctx, 0, shY + 6, W * 0.4, L.bodyH + 2, 4, s.apron, OUT, 1.5);
      if (s.lanyard) D.line(ctx, 3, shY + 2, 6, shY + 12, '#3d6bd9', 1.6);
      leg(ctx, 1, hipY, sw * legAmp, L.leg, s.pants, s.shoes, false);
      // head
      const hx = 1, hy = headY;
      if (adult) D.rr(ctx, -3, shY - 4, 7, 6, 2, s.skin, OUT, 1.2);
      if (s.hair.style === 'hijab') hijab(ctx, hx, hy, L.R, s.hair.color, 'side');
      D.circle(ctx, hx, hy, L.R, s.skin, OUT, 2);
      if (s.hair.style === 'hijab') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hx, hy, L.R + 4, Math.PI * 0.55, Math.PI * 1.75);
        ctx.lineTo(hx + L.R * 0.15, hy - L.R * 0.3);
        ctx.closePath();
        ctx.fillStyle = s.hair.color;
        ctx.fill();
        ctx.strokeStyle = OUT;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      // nose
      ctx.beginPath();
      ctx.arc(hx + L.R - 0.5, hy + 3, 2.4, -Math.PI / 2, Math.PI / 2);
      ctx.fillStyle = s.skin;
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      const ex = hx + L.R * 0.42;
      drawEyes(ctx, ex, hy, 2.1, 3, face, blink, true);
      drawBrows(ctx, ex, hy - 5.5, 2.4, face.brow, true);
      drawMouth(ctx, hx + L.R * 0.55, hy + L.R * 0.5, face.mouth, talkOpen, 0.85);
      D.ell(ctx, hx + L.R * 0.25, hy + 5, 2.6, 1.6, 'rgba(255,120,120,.4)');
      if (s.glasses) {
        D.circle(ctx, ex, hy, 4.6, null, s.glasses, 1.6);
        D.line(ctx, ex - 4.6, hy - 1, hx - 1, hy - 1, s.glasses, 1.4);
      }
      hairFront(ctx, s, hx, hy, L.R, 'side', t);
      if (s.hair.style !== 'hijab') D.ell(ctx, hx - 2.5, hy + 2, 3, 4, s.skin, OUT, 1.4);
      if (s.hat === 'chef') chefHat(ctx, hx - 1, hy, L.R);
      if (s.bowtie) { D.poly(ctx, [2, shY + 1, 7, shY - 2, 7, shY + 4], s.bowtie, OUT, 1.2); }
      // front arm (with optional held item)
      drawArm(ctx, 1, shY + 4, armSide[0], adult ? 17 : 14, 5.5, sleeve, s.skin, o.hold);
      ctx.restore();
      return;
    }

    // ----- front & back views -----
    const [la, ra, ll, rl] = armPose(pose, t, sw, moving, run);
    const armLen = adult ? 18 : 14;
    const back = view === 'back';
    // legs
    for (const i of [-1, 1]) {
      const lift = moving ? Math.max(0, i * sw) * (run ? 5 : 3.5) : 0;
      const x = i * W * 0.22;
      D.rr(ctx, x - 4.6, hipY - 3, 9.2, L.leg - lift + 3, 4, s.pants, OUT, 1.8);
      D.ell(ctx, x + i * 0.8, -lift - 1.5, 5.8, 3.6, s.shoes, OUT, 1.6);
    }
    if (s.coat) D.poly(ctx, [-W / 2, shY + 6, W / 2, shY + 6, W / 2 + 3, hipY + 9, -W / 2 - 3, hipY + 9], '#f4f8fb', OUT, 1.6);
    if (back) {
      drawArm(ctx, -W / 2 + 1.5, shY + 4, la, armLen * ll, 5.6, sleeve, s.skin);
      drawArm(ctx, W / 2 - 1.5, shY + 4, ra, armLen * rl, 5.6, sleeve, s.skin, o.hold);
    }
    // body
    D.rr(ctx, -W / 2, shY, W, L.bodyH + 3, [9, 9, 6, 6], s.shirt, OUT, 2);
    if (!back) {
      if (s.inner && !s.coat) D.rr(ctx, -3.5, shY + 1, 7, L.bodyH, 2, s.inner);
      if (s.coat) {
        D.poly(ctx, [-5, shY + 1, 5, shY + 1, 0, shY + 12], s.inner, OUT, 1.2);
        D.rr(ctx, W * 0.16, shY + 13, 6, 6, 1.5, '#e8eef3', OUT, 1);
        D.line(ctx, W * 0.16 + 2, shY + 13, W * 0.16 + 2, shY + 10, '#e05a5a', 1.6);
        D.line(ctx, W * 0.16 + 4, shY + 13, W * 0.16 + 4, shY + 10.5, '#3d6bd9', 1.6);
      }
      if (s.badge) {
        D.circle(ctx, -W * 0.24, shY + 8, 3.4, '#fffbe8', OUT, 1.2);
        D.leaf(ctx, -W * 0.24 - 2, shY + 9.5, 5, 2.2, -0.9, '#2fa36b', null, 1, false);
      }
      if (s.apron) {
        D.rr(ctx, -W * 0.36, shY + 7, W * 0.72, L.bodyH + 3, 5, s.apron, OUT, 1.6);
        D.line(ctx, -W * 0.3, shY + 7, -W * 0.38, shY, OUT, 1.4);
        D.line(ctx, W * 0.3, shY + 7, W * 0.38, shY, OUT, 1.4);
        D.circle(ctx, 0, shY + 17, 4.2, '#ff8f3f', OUT, 1.1);
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          D.line(ctx, Math.cos(a) * 5.6, shY + 17 + Math.sin(a) * 5.6, Math.cos(a) * 7.4, shY + 17 + Math.sin(a) * 7.4, '#ff8f3f', 1.3);
        }
      }
      if (s.lanyard) {
        D.line(ctx, -4, shY + 1, 0, shY + 13, '#3d6bd9', 1.6);
        D.line(ctx, 4, shY + 1, 0, shY + 13, '#3d6bd9', 1.6);
        D.rr(ctx, -3.5, shY + 12, 7, 8, 1.5, '#fff', OUT, 1);
      }
      if (s.brooch) D.star(ctx, -W * 0.28, shY + 7, 3.6, 5, '#ffb703', null, 0.5);
      if (s.bowtie) {
        D.poly(ctx, [0, shY + 1, -6, shY - 2, -6, shY + 4], s.bowtie, OUT, 1.2);
        D.poly(ctx, [0, shY + 1, 6, shY - 2, 6, shY + 4], s.bowtie, OUT, 1.2);
      }
    } else {
      if (s.backpack) {
        D.rr(ctx, -8.5, shY + 3, 17, 15, 4, s.backpack, OUT, 1.8);
        D.rr(ctx, -8.5, shY + 3, 17, 6, [4, 4, 1, 1], D.shade(s.backpack, -0.15), OUT, 1.4);
        D.leaf(ctx, -3, shY + 13, 7, 3, -0.6, '#c9f29b', null, 1, false);
      }
      if (s.apron) {
        D.line(ctx, -W / 2 + 2, hipY - 6, W / 2 - 2, hipY - 6, '#e0b52c', 2);
        D.ell(ctx, -2.5, hipY - 6, 3, 2, s.apron, OUT, 1);
        D.ell(ctx, 2.5, hipY - 6, 3, 2, s.apron, OUT, 1);
      }
    }
    // head
    if (adult) D.rr(ctx, -3.5, shY - 4, 7, 6, 2, s.skin, OUT, 1.2);
    const hy = headY;
    if (s.hair.style === 'hijab') hijab(ctx, 0, hy, L.R, s.hair.color, view);
    if (back) {
      if (s.hair.style !== 'hijab') D.circle(ctx, 0, hy, L.R, s.skin, OUT, 2);
      hairFront(ctx, s, 0, hy, L.R, 'back', t);
      if (s.hat === 'chef') chefHat(ctx, 0, hy, L.R);
    } else {
      if (s.hair.style === 'hijab') D.ell(ctx, 0, hy + 1.5, L.R * 0.8, L.R * 0.88, s.skin, OUT, 1.5);
      else {
        D.ell(ctx, -L.R + 0.5, hy + 1.5, 3, 4, s.skin, OUT, 1.4);
        D.ell(ctx, L.R - 0.5, hy + 1.5, 3, 4, s.skin, OUT, 1.4);
        D.circle(ctx, 0, hy, L.R, s.skin, OUT, 2);
      }
      const ex = L.R * 0.36;
      const lookX = o.lookX || 0;
      drawEyes(ctx, ex, hy + 1, adult ? 2 : 2.3, adult ? 2.9 : 3.3, face, blink, false, lookX);
      drawBrows(ctx, ex, hy - 4.5, 2.6, face.brow, false);
      drawMouth(ctx, 0, hy + L.R * 0.5, face.mouth, talkOpen);
      D.ell(ctx, -L.R * 0.62, hy + L.R * 0.36, 3, 1.8, 'rgba(255,120,120,.42)');
      D.ell(ctx, L.R * 0.62, hy + L.R * 0.36, 3, 1.8, 'rgba(255,120,120,.42)');
      if (s.glasses) {
        D.circle(ctx, -ex, hy + 1, 4.8, 'rgba(255,255,255,.15)', s.glasses, 1.6);
        D.circle(ctx, ex, hy + 1, 4.8, 'rgba(255,255,255,.15)', s.glasses, 1.6);
        D.line(ctx, -ex + 4.8, hy + 0.5, ex - 4.8, hy + 0.5, s.glasses, 1.4);
      }
      hairFront(ctx, s, 0, hy, L.R, 'front', t);
      if (s.hat === 'chef') chefHat(ctx, 0, hy, L.R);
      if (face.mouth === 'wobble' && o.emotion === 'worried') D.ell(ctx, L.R * 0.9, hy - L.R * 0.4, 1.6, 2.6, '#8fd3ff');
      drawArm(ctx, -W / 2 + 1.5, shY + 4, la, armLen * ll, 5.6, sleeve, s.skin);
      drawArm(ctx, W / 2 - 1.5, shY + 4, ra, armLen * rl, 5.6, sleeve, s.skin, o.hold);
    }
    ctx.restore();
  }
  function leg(ctx, x, hipY, ang, len, pants, shoes, backLeg) {
    ctx.save();
    ctx.translate(x, hipY - 2);
    ctx.rotate(-ang);
    D.rr(ctx, -4.4, 0, 8.8, len + 1, 4, pants, OUT, 1.8);
    D.ell(ctx, 2.2, len + 0.5, 6, 3.4, backLeg ? D.shade(shoes, 0.1) : shoes, OUT, 1.5);
    ctx.restore();
  }
  function chefHat(ctx, x, hy, R) {
    D.rr(ctx, x - R * 0.85, hy - R - 3, R * 1.7, 7, 2, '#ffffff', OUT, 1.8);
    for (const [dx, dy, r] of [[-7, -12, 7.5], [7, -12, 7.5], [0, -16, 8.5]]) D.circle(ctx, x + dx, hy - R + dy, r, '#ffffff', OUT, 1.8);
    D.rr(ctx, x - R * 0.82, hy - R - 9, R * 1.64, 8, 2, '#ffffff');
  }

  /* ---------- Milo the Eco Mouse ---------- */
  const M = {
    fur: '#f0bf86', furD: '#d99d5f', belly: '#fff0d8', earIn: '#ffb6c1', nose: '#ff7f9a',
    hat: '#4caf50', hatD: '#2f8a3c', leaf: '#8ee05a', pack: '#22b8b0', packD: '#138f89', scarf: '#ffd23f', tail: '#f3a9a2', out: '#5a3a22',
  };
  C.MILO_COLORS = M;

  function miloTail(ctx, x, y, t, flip = 1) {
    const sw = Math.sin(t * 3) * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 10 * flip, y + 2, x + 18 * flip + sw, y - 4, x + 15 * flip + sw, y - 14);
    ctx.quadraticCurveTo(x + 13 * flip + sw, y - 20, x + 18 * flip + sw, y - 21);
    ctx.strokeStyle = M.out;
    ctx.lineWidth = 4.6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = M.tail;
    ctx.lineWidth = 2.6;
    ctx.stroke();
  }
  function miloHat(ctx, x, y, t, tilt = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    D.ell(ctx, 0, 0, 14, 3.6, M.hatD, M.out, 1.8);
    ctx.beginPath();
    ctx.ellipse(0, -1, 9.8, 7.5, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = M.hat;
    ctx.fill();
    ctx.strokeStyle = M.out;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    D.rr(ctx, -9.6, -3.4, 19.2, 3, 1.2, '#2a6e33');
    D.ell(ctx, -4, -5.2, 2.6, 1.6, 'rgba(255,255,255,.35)');
    const sway = Math.sin(t * 2.6) * 0.18;
    D.line(ctx, 0.5, -8, 1.5, -10.5, '#3e8a2e', 1.6);
    D.leaf(ctx, 1.2, -10, 13, 5.6, -1.25 + sway, M.leaf, '#3e8a2e', 1.4);
    ctx.restore();
  }
  function miloArm(ctx, sx, sy, ang, len = 8.5) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang);
    D.rr(ctx, -2.4, -1.5, 4.8, len, 2.4, M.fur, M.out, 1.4);
    D.circle(ctx, 0, len, 2.9, M.belly, M.out, 1.3);
    ctx.restore();
  }

  function drawMilo(ctx, o) {
    const t = o.t || 0, dir = o.dir || 'down', anim = o.anim || 0;
    const moving = !!o.moving;
    const face = FACE[o.emotion] || FACE.happy;
    const blink = ((t + 0.7) % 3.2) < 0.13;
    const talkOpen = o.talking && Math.sin(t * 20) > -0.1;
    const view = dir === 'up' ? 'back' : dir === 'left' || dir === 'right' ? 'side' : 'front';
    const sw = moving ? Math.sin(anim) : 0;
    const bob = moving ? Math.abs(Math.sin(anim)) * 3.4 : Math.sin(t * 2.6) * 0.9;
    const pose = o.pose || 'idle';
    const emo = o.emotion || 'happy';
    let earRot = 0.45 + Math.sin(t * 9) * (Math.sin(t * 0.7) > 0.93 ? 0.12 : 0);
    let earY = 0;
    if (emo === 'sad' || emo === 'worried') { earRot = 0.95; earY = 3; }
    if (emo === 'surprised' || emo === 'excited') { earRot = 0.22; earY = -2; }

    ctx.save();
    ctx.translate(o.x || 0, o.y || 0);
    if (o.scale) ctx.scale(o.scale, o.scale);
    if (!o.noShadow) D.shadow(ctx, 0, 0, 13, 4.2);
    ctx.translate(0, -bob - (o.z || 0));
    if (dir === 'left') ctx.scale(-1, 1);

    if (view === 'side') {
      miloTail(ctx, -7, -7, t, -1);
      // back foot
      D.ell(ctx, -2 - sw * 4, -2, 5.5, 3.2, M.furD, M.out, 1.4);
      // backpack
      D.rr(ctx, -15, -25, 9, 15, 3.5, M.pack, M.out, 1.6);
      D.rr(ctx, -15, -25, 9, 5, [3.5, 3.5, 1, 1], M.packD, M.out, 1.2);
      // body
      D.ell(ctx, 0, -12.5, 9.4, 11, M.fur, M.out, 2);
      D.ell(ctx, 3.5, -10.5, 5.2, 7.5, M.belly);
      D.rr(ctx, -9, -24, 17, 5, 2.5, M.scarf, M.out, 1.4);
      // front foot
      D.ell(ctx, 3 + sw * 4, -2, 6, 3.3, M.furD, M.out, 1.4);
      // ears (far ear then head then near ear)
      D.ell(ctx, 4, -42 + earY, 5, 6.5, M.fur, M.out, 1.6, 0.2);
      D.ell(ctx, 1.5, -33, 12.2, 11.2, M.fur, M.out, 2);
      ctx.save();
      ctx.translate(-4, -41 + earY);
      ctx.rotate(-earRot * 0.7);
      D.ell(ctx, 0, 0, 7, 8.6, M.fur, M.out, 1.8);
      D.ell(ctx, 0.6, 0.6, 4.4, 5.8, M.earIn);
      ctx.restore();
      // snout
      D.ell(ctx, 10.5, -29, 6.4, 4.8, M.belly, M.out, 1.6);
      D.circle(ctx, 16.6, -30.2, 2.5, M.nose, M.out, 1.2);
      D.circle(ctx, 16, -31, 0.8, '#fff');
      for (const dy of [-1.5, 0.8, 3]) D.line(ctx, 15, -28.5 + dy * 0.6, 22, -29.5 + dy, 'rgba(90,58,34,.6)', 0.9);
      drawEyes(ctx, 6.5, -34, 2.4, 3.4, face, blink, true);
      drawBrows(ctx, 6.5, -39.5, 2.4, face.brow, true);
      if (talkOpen || face.mouth === 'grin' || face.mouth === 'o') drawMouth(ctx, 10, -25.5, face.mouth, talkOpen, 0.75);
      else { ctx.beginPath(); ctx.arc(9.5, -27.2, 2.3, 0.2, Math.PI * 0.75); ctx.strokeStyle = M.out; ctx.lineWidth = 1.4; ctx.stroke(); }
      D.ell(ctx, 4.5, -28, 2.6, 1.6, 'rgba(255,120,140,.45)');
      miloHat(ctx, 0.5, -43, t, -0.05);
      const fa = pose === 'wave' ? -2.5 + Math.sin(t * 12) * 0.35 : pose === 'point' ? -1.5 : pose === 'celebrate' ? -2.7 : pose === 'carry' ? -2.9 : pose === 'think' ? -2.5 : -sw * 0.7;
      miloArm(ctx, 1, -20, fa, pose === 'think' ? 7 : 8.5);
      ctx.restore();
      return;
    }

    const back = view === 'back';
    const pa = armPose(pose, t, sw, moving, false);
    if (!back) miloTail(ctx, 6, -6, t, 1);
    // feet
    for (const i of [-1, 1]) {
      const lift = moving ? Math.max(0, i * sw) * 3 : 0;
      D.ell(ctx, i * 5.8, -2 - lift, 5.6, 3.5, M.furD, M.out, 1.5);
    }
    // body
    D.ell(ctx, 0, -12.5, 10.2, 11, M.fur, M.out, 2);
    if (!back) {
      D.ell(ctx, 0, -10.5, 6.6, 7.6, M.belly);
      D.line(ctx, -6, -21, -5, -9, M.pack, 2.4);
      D.line(ctx, 6, -21, 5, -9, M.pack, 2.4);
    } else {
      D.rr(ctx, -9, -25, 18, 17, 4.5, M.pack, M.out, 1.8);
      D.rr(ctx, -9, -25, 18, 6.5, [4.5, 4.5, 1.5, 1.5], M.packD, M.out, 1.4);
      D.leaf(ctx, -3.5, -12.5, 8, 3.4, -0.6, '#c9f29b', null, 1, false);
      miloTail(ctx, 0, -5, t, 1);
    }
    // scarf
    D.rr(ctx, -9.5, -24.5, 19, 5.2, 2.6, M.scarf, M.out, 1.5);
    if (!back) D.poly(ctx, [3, -20, 7.5, -15, 9, -20], M.scarf, M.out, 1.2);
    // arms
    miloArm(ctx, -8.5, -20.5, pa[0], 8.5 * pa[2]);
    miloArm(ctx, 8.5, -20.5, pa[1], 8.5 * pa[3]);
    // ears
    for (const s2 of [-1, 1]) {
      ctx.save();
      ctx.translate(s2 * 12.5, -41 + earY);
      ctx.rotate(s2 * earRot);
      D.ell(ctx, 0, 0, 7.6, 9, M.fur, M.out, 1.8);
      if (!back) D.ell(ctx, 0, 0.8, 4.8, 6.2, M.earIn);
      ctx.restore();
    }
    // head
    D.ell(ctx, 0, -33, 13.6, 12, M.fur, M.out, 2);
    if (!back) {
      D.ell(ctx, 0, -27.5, 7.4, 5.2, M.belly);
      const lookX = o.lookX || 0;
      drawEyes(ctx, 5, -34, 2.5, 3.5, face, blink, false, lookX);
      drawBrows(ctx, 5, -39.5, 2.4, face.brow, false);
      D.circle(ctx, 0, -29.6, 2.4, M.nose, M.out, 1.2);
      D.circle(ctx, -0.7, -30.4, 0.8, '#fff');
      for (const s2 of [-1, 1]) {
        D.line(ctx, s2 * 4.5, -28.5, s2 * 12, -30, 'rgba(90,58,34,.55)', 0.9);
        D.line(ctx, s2 * 4.5, -27.3, s2 * 12, -26.8, 'rgba(90,58,34,.55)', 0.9);
      }
      if (talkOpen || face.mouth === 'grin' || face.mouth === 'o' || face.mouth === 'frown' || face.mouth === 'wobble') {
        drawMouth(ctx, 0, -24.4, face.mouth, talkOpen, 0.8);
      } else {
        // mouse "w" smile + buck teeth
        ctx.beginPath();
        ctx.moveTo(-3.4, -26.4);
        ctx.quadraticCurveTo(-1.7, -24.2, 0, -26);
        ctx.quadraticCurveTo(1.7, -24.2, 3.4, -26.4);
        ctx.strokeStyle = M.out;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.stroke();
        D.rr(ctx, -1.6, -25.9, 3.2, 2.6, 0.6, '#fff', M.out, 0.8);
      }
      D.ell(ctx, -8.4, -28.2, 2.8, 1.7, 'rgba(255,120,140,.45)');
      D.ell(ctx, 8.4, -28.2, 2.8, 1.7, 'rgba(255,120,140,.45)');
    }
    miloHat(ctx, 0, -43.5, t, emo === 'thinking' ? 0.12 : 0);
    ctx.restore();
  }

  /* ---------- Public API ---------- */
  C.draw = function (ctx, who, o) {
    if (who === 'milo') return drawMilo(ctx, o);
    if (who === 'kid') return drawHuman(ctx, kidSpec(o.look || WW.save.data.avatar), o);
    if (SPECS[who]) return drawHuman(ctx, SPECS[who], o);
    if (o.spec) return drawHuman(ctx, o.spec, o);
  };

  /** Head-and-shoulders portrait for the dialogue box. */
  C.portrait = function (ctx, who, w, h, o) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    const info = C.INFO[who] || C.INFO.narrator;
    const g = ctx.createRadialGradient(w / 2, h * 0.4, 4, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, D.shade(info.color, 0.75));
    g.addColorStop(1, D.shade(info.color, 0.35));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    let sc, fy;
    if (who === 'milo') { sc = h / 46; fy = h * 0.98 + 0 * sc; }
    else if (who === 'kid') { sc = h / 44; fy = h + 30 * sc; }
    else if (who === 'narrator') { ctx.restore(); return; }
    else { sc = h / 46; fy = h + 44 * sc; }
    if (who === 'milo') fy = h + 6 * sc;
    C.draw(ctx, who, Object.assign({ x: w / 2, y: fy, dir: 'down', scale: sc, noShadow: true }, o));
    ctx.restore();
  };

  /** Random-but-stable student appearance for background characters. */
  C.studentSpec = function (seed) {
    const r = WW.util.rng(seed * 9973 + 17);
    const A = C.AVATAR;
    const look = { skin: Math.floor(r() * 5), hair: Math.floor(r() * 6), hairColor: Math.floor(r() * 5), shirt: Math.floor(r() * 5) };
    const s = kidSpec(look);
    s.backpack = ['#e85d75', '#4d96ff', '#ffb703', '#6bcb77'][Math.floor(r() * 4)];
    s.shirt = ['#ff9f1c', '#2ec4b6', '#e71d36', '#7b2cbf', '#4361ee', '#80b918'][Math.floor(r() * 6)];
    s.badge = false;
    return s;
  };
})();
