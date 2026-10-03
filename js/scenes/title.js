/* WasteWise — animated title screen and Eco Crew setup (optional nickname + avatar + audio). */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const D = WW.draw;
  const el = U.el;
  const E = WW.engine;

  /* ---------- shared animated backdrop ---------- */
  const leaves = Array.from({ length: 14 }, (_, i) => ({ x: Math.random() * 960, y: Math.random() * 540, s: 0.6 + Math.random() * 0.8, sp: 20 + Math.random() * 30, ph: Math.random() * 6, col: ['#7ed957', '#5cc15f', '#ffd23f', '#ff9f6b'][i % 4] }));
  function backdrop(ctx, t, opts = {}) {
    const W = E.W, H = E.H;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#8fdcf2');
    g.addColorStop(0.55, '#d9f6ef');
    g.addColorStop(0.56, '#a6dd84');
    g.addColorStop(1, '#78c46a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // sun + rays
    ctx.save();
    ctx.translate(820, 92);
    ctx.rotate(t * 0.15);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = 'rgba(255,236,140,.35)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-16, 120);
      ctx.lineTo(16, 120);
      ctx.fill();
    }
    ctx.restore();
    D.circle(ctx, 820, 92, 50, '#ffe066', '#f2b705', 4);
    D.ell(ctx, 805, 90, 5, 7, '#7a5200');
    D.ell(ctx, 835, 90, 5, 7, '#7a5200');
    ctx.beginPath();
    ctx.arc(820, 102, 12, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#7a5200';
    ctx.lineWidth = 3;
    ctx.stroke();
    // clouds
    for (let i = 0; i < 4; i++) {
      const x = ((t * (12 + i * 4) + i * 300) % 1200) - 150, y = 60 + (i % 2) * 70;
      for (const [dx, dy, r] of [[0, 0, 26], [28, -10, 32], [58, 0, 26], [28, 8, 28]]) D.circle(ctx, x + dx, y + dy, r, 'rgba(255,255,255,.92)');
    }
    // hills
    D.ell(ctx, 180, 470, 380, 150, '#8fd06f');
    D.ell(ctx, 760, 480, 420, 160, '#82c765');
    // school
    const P = WW.worldArt.paint;
    const ws = WW.save.data.world;
    ctx.save();
    ctx.translate(opts.schoolX ?? 520, opts.schoolY ?? 170);
    ctx.scale(0.8, 0.8);
    P.building(ctx, { x: 0, y: 0, pw: 430, ph: 230, roof: '#ef8a62', wall: '#fff4d6', label: 'SUNNY SCHOOL', icon: '🌻', doorCol: 4, doorOffset: -9, solar: 5 }, ws, t);
    ctx.restore();
    // trees
    P.tree(ctx, { x: 430, y: 300, pw: 48, ph: 48, scale: 1.3, c: 1 }, ws, t);
    P.tree(ctx, { x: 880, y: 330, pw: 48, ph: 48, scale: 1.1, c: 2, fruit: true }, ws, t);
    P.bush(ctx, { x: 520, y: 360 });
    P.bush(ctx, { x: 830, y: 380, flowers: '#ff8fab' });
    // falling leaves
    for (const l of leaves) {
      const y = (l.y + t * l.sp) % 600 - 30;
      const x = l.x + Math.sin(t + l.ph) * 30;
      D.leaf(ctx, x, y, 14 * l.s, 6 * l.s, t * 1.5 + l.ph, l.col, '#2e7a45', 1);
    }
  }
  WW.titleBackdrop = backdrop;

  /* ---------- Title ---------- */
  const title = {
    enter() {
      WW.ui.hud.show(false);
      WW.ui.showTouch(false);
      WW.audio.playMusic('title');
      const has = WW.save.hasProgress();
      const scr = el('div', { class: 'screen title-screen' },
        el('div', null,
          el('h1', { class: 'title-logo', 'aria-label': 'WasteWise' }, 'Waste', el('span', null, 'Wise!')),
          el('div', { class: 'title-sub' }, '🌿 The Eco Crew Adventure'),
          el('p', { class: 'title-tag' }, 'Explore Sunny School with Milo the Eco Mouse. Save water, sort the canteen chaos and solve a waste mystery!'),
          el('div', { class: 'title-buttons' },
            el('button', { class: 'btn primary big', type: 'button', autofocus: true, onclick: () => this.newGame() }, '▶ New adventure'),
            has ? el('button', { class: 'btn green', type: 'button', onclick: () => { WW.audio.unlock(); WW.audio.sfx('click'); WW.story.continueGame(); } }, '↻ Continue (' + WW.save.name() + ')') : null,
            el('div', { class: 'title-small' },
              el('button', { class: 'btn small', type: 'button', onclick: () => { WW.audio.unlock(); WW.ui.menu.open('help'); } }, '❓ How to play'),
              el('button', { class: 'btn small', type: 'button', onclick: () => { WW.audio.unlock(); WW.ui.menu.open('settings'); } }, '⚙ Sound'),
              el('button', { class: 'btn small', type: 'button', onclick: () => { WW.audio.unlock(); teacherInfo(); } }, '👩‍🏫 For teachers'),
            ),
          ),
        ),
        el('div'),
        el('div', { class: 'title-foot' }, 'Climate Hack-tion 2026 · Victorian Levels 3–4 Geography (VC2HG4K09 focus) · Fictional school · No sign-in, nothing uploaded'),
      );
      WW.ui.showScreen(scr);
      setTimeout(() => { const b = scr.querySelector('[autofocus]'); b && b.focus(); }, 50);
    },
    newGame() {
      WW.audio.unlock();
      WW.audio.sfx('click');
      if (WW.save.hasProgress()) {
        WW.ui.panel.open({
          title: 'Start a new adventure?',
          build(body, api) {
            body.append(el('p', null, 'Your saved progress on this device will be replaced.'), el('div', { class: 'row end' },
              el('button', { class: 'btn', type: 'button', onclick: () => api.done(false) }, 'Keep my progress'),
              el('button', { class: 'btn primary', type: 'button', autofocus: true, onclick: () => api.done(true) }, 'Start new')));
          },
        }).then((yes) => { if (yes) E.go('setup', {}, { type: 'fade' }); });
      } else E.go('setup', {}, { type: 'fade' });
    },
    update() {},
    draw(ctx, t) {
      backdrop(ctx, t);
      // Milo waving on the hill
      const bounce = Math.abs(Math.sin(t * 2.6)) * 14;
      WW.chars.draw(ctx, 'milo', { x: 700, y: 470, t, pose: 'wave', emotion: 'excited', scale: 3.2, z: bounce, dir: 'down' });
      D.bubble(ctx, 790, 250, 150, 44);
      D.text(ctx, 'Let’s go, Eco Crew!', 790, 228, 15, '#23443a');
    },
  };

  function teacherInfo() {
    WW.ui.panel.open({
      kicker: 'FOR TEACHERS',
      title: '👩‍🏫 About WasteWise',
      wide: true,
      build(body, api) {
        body.innerHTML = `
          <p><b>Audience:</b> Victorian Grade 4 (Levels 3–4 Geography). <b>Focus:</b> sustainable use of natural resources and waste management (team mapping: <b>VC2HG4K09</b>), plus geographical inquiry skills (questioning, collecting and representing data, maps, conclusions and proposed actions). Please confirm wording against the current VCAA Victorian Curriculum F–10 Version 2.0 before formal use.</p>
          <p><b>Session (about 30–40 min):</b> Chapter 1 garden resources → Chapter 2 canteen waste maze → Chapter 3 waste detective (map + chart) → untimed 20-mark final challenge.</p>
          <p><b>Marking:</b> 14 marks are auto-marked from fixed answer keys. 6 marks (written plan) are <b>teacher-reviewed</b> using a 3-part rubric on the results screen — never auto-awarded.</p>
          <p><b>Accuracy & safety:</b> Sunny School and Hilltop School are fictional; their bin rules are stated in-game and may differ from your council. Data in the game is fictional. Students are never asked to handle real waste.</p>
          <p><b>Privacy:</b> optional nickname only; progress stays on this device (localStorage). The final report is a local download — nothing is uploaded.</p>
          <p><b>Demo shortcuts:</b> Pause menu → Teacher & demo options → unlock all chapters or jump to a chapter.</p>`;
        body.appendChild(el('div', { class: 'row end' }, el('button', { class: 'btn', type: 'button', onclick: () => { api.done(); WW.story.openChapterSelect(); } }, '🗺 Jump to a chapter'), el('button', { class: 'btn primary', type: 'button', onclick: () => api.done() }, 'Close')));
      },
    });
  }
  WW.teacherInfo = teacherInfo;

  /* ---------- Setup ---------- */
  const setup = {
    enter() {
      WW.ui.hud.show(false);
      this.look = Object.assign({}, WW.save.data.avatar);
      this.dirI = 0;
      const A = WW.chars.AVATAR;
      const preview = el('canvas', { width: 460, height: 520, 'aria-label': 'Preview of your explorer' });
      this.pctx = preview.getContext('2d');
      const nameIn = el('input', { type: 'text', id: 'nick', maxlength: 16, placeholder: 'Eco Explorer', autocomplete: 'off', 'aria-describedby': 'nickhelp', value: '' });
      const sw = (label, arr, key, isColor = true, names) => {
        const row = el('div', { class: 'opt-row' }, el('b', null, label));
        const wrap = el('div', { class: 'swatches', role: 'radiogroup', 'aria-label': label });
        arr.forEach((v, i) => {
          const b = el('button', { type: 'button', class: (isColor ? 'swatch' : 'pill-btn') + (this.look[key] === i ? ' on' : ''), role: 'radio', 'aria-checked': String(this.look[key] === i), 'aria-label': names ? names[i] : `${label} ${i + 1}`, style: isColor ? { background: v } : null }, isColor ? '' : names[i]);
          b.addEventListener('click', () => {
            this.look[key] = i;
            wrap.querySelectorAll('button').forEach((x, k) => { x.classList.toggle('on', k === i); x.setAttribute('aria-checked', String(k === i)); });
            WW.audio.sfx('pop');
          });
          wrap.appendChild(b);
        });
        row.appendChild(wrap);
        return row;
      };
      const s = WW.save.settings;
      const voiceRow = el('div', { class: 'opt-row' }, el('b', null, 'Voices'));
      const vw = el('div', { class: 'swatches' });
      [['speech', '🗣 Read aloud'], ['chatter', '🎵 Cartoon chatter'], ['off', '🔇 Text only']].forEach(([v, l]) => {
        const b = el('button', { type: 'button', class: 'pill-btn' + (s.voiceMode === v ? ' on' : '') }, l);
        b.addEventListener('click', () => {
          s.voiceMode = v;
          WW.save.commitSettings();
          WW.audio.applySettings({ voiceMode: v });
          vw.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
          if (v === 'speech') WW.audio.speak('milo', 'Hi! I’m Milo!');
          if (v === 'chatter') for (let i = 0; i < 6; i++) setTimeout(() => WW.audio.chatter('milo'), i * 70);
        });
        vw.appendChild(b);
      });
      voiceRow.appendChild(vw);
      const card = el('div', { class: 'setup-card' },
        el('div', { class: 'setup-preview' }, preview),
        el('div', null,
          el('h2', { class: 'setup-title' }, 'Join the Eco Crew!'),
          el('label', { class: 'field', for: 'nick' }, 'Your explorer nickname (optional)', nameIn,
            el('span', { id: 'nickhelp', class: 'fine' }, 'Please use a fun nickname — not your real full name. It stays on this device.')),
          sw('Skin', A.skins, 'skin'),
          sw('Hair', A.hairStyles, 'hair', false, A.hairStyleNames),
          sw(this.look.hair === 5 ? 'Colour' : 'Colour', A.hairColors, 'hairColor'),
          sw('Shirt', A.shirts, 'shirt'),
          voiceRow,
          el('div', { class: 'row end', style: { marginTop: 'calc(var(--u) * 10)' } },
            el('button', { class: 'btn', type: 'button', onclick: () => E.go('title', {}, { type: 'fade' }) }, '← Back'),
            el('button', { class: 'btn primary big', type: 'button', onclick: () => this.start(nameIn.value) }, 'Start adventure! →')),
        ),
      );
      nameIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.start(nameIn.value); });
      const scr = el('div', { class: 'screen setup-screen' }, card);
      WW.ui.showScreen(scr);
      setTimeout(() => nameIn.focus(), 60);
    },
    start(name) {
      WW.audio.unlock();
      const clean = String(name || '').replace(/[<>]/g, '').trim().slice(0, 16);
      WW.save.newGame(clean, this.look);
      WW.audio.sfx('fanfare');
      E.go('hub', {});
    },
    update(dt) {
      this.t2 = (this.t2 || 0) + dt;
      if (this.t2 > 1.6) { this.t2 = 0; this.dirI = (this.dirI + 1) % 4; }
    },
    draw(ctx, t) {
      backdrop(ctx, t, { schoolX: 560 });
      ctx.fillStyle = 'rgba(18,48,38,.25)';
      ctx.fillRect(0, 0, E.W, E.H);
      const p = this.pctx;
      if (!p) return;
      p.setTransform(1, 0, 0, 1, 0, 0);
      p.clearRect(0, 0, 460, 520);
      const dir = ['down', 'right', 'up', 'left'][this.dirI];
      WW.chars.draw(p, 'kid', { x: 200, y: 450, dir, t, anim: t * 9, moving: true, look: this.look, scale: 4.6 });
      WW.chars.draw(p, 'milo', { x: 370, y: 470, dir: 'down', t, pose: 'wave', emotion: 'excited', scale: 2.6 });
    },
  };

  E.register('title', title);
  E.register('setup', setup);
})();
