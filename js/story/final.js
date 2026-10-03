/* WasteWise — Final challenge "Save Hilltop School" (20 marks, untimed) + results + teacher report.
   14 marks are auto-marked from fixed answer keys; 6 marks are teacher-reviewed (never auto-awarded).
   Answers stay in memory only; the report is a local download/print. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const el = U.el;
  const S = WW.script;
  const DR = WW.draw;
  const E = WW.engine;
  const F = (WW.final = { answers: null, teacher: null });
  const BANK = () => WW.data.assessment;

  /* ---------------- Hall backdrop ---------------- */
  function hall(ctx, t, celebrate) {
    const W = E.W, H = E.H;
    ctx.fillStyle = '#e9c491';
    ctx.fillRect(0, 0, W, H);
    // back wall
    const g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, '#fff2d6');
    g.addColorStop(1, '#ffe6b8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 300);
    // windows
    for (let i = 0; i < 4; i++) DR.rr(ctx, 40 + i * 240, 40, 120, 90, 10, '#9fdcf0', '#5b6f7a', 4);
    // stage
    DR.rr(ctx, 140, 170, 680, 150, 10, '#b8743f', '#6b4a2b', 4);
    DR.rr(ctx, 140, 160, 680, 24, 8, '#d99a62', '#6b4a2b', 4);
    // curtains
    for (const side of [-1, 1]) {
      const x = side < 0 ? 120 : 840;
      ctx.fillStyle = '#2fa36b';
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x + side * -110, 20);
      ctx.quadraticCurveTo(x + side * -40, 140, x + side * -10, 310);
      ctx.lineTo(x, 310);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1f7a4f';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    DR.rr(ctx, 100, 10, 760, 30, 10, '#1f7a4f');
    // banner
    const wave = Math.sin(t * 2) * 2;
    DR.rr(ctx, 290, 104 + wave, 380, 46, 12, '#ffd23f', '#9a6a00', 3);
    DR.text(ctx, celebrate ? '🌟 ECO CREW HEROES 🌟' : 'SAVE HILLTOP SCHOOL CHALLENGE', 480, 128 + wave, 19, '#5a3a00');
    // floor boards
    ctx.strokeStyle = '#cf9f66';
    ctx.lineWidth = 2;
    for (let y = 330; y < H; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // cast
    const jump = celebrate ? Math.abs(Math.sin(t * 5)) * 12 : 0;
    WW.chars.draw(ctx, 'maple', { x: 330, y: 300, t, scale: 1.7, pose: celebrate ? 'celebrate' : 'present', emotion: celebrate ? 'laugh' : 'happy', talking: WW.ui.isSpeaking('maple') });
    WW.chars.draw(ctx, 'milo', { x: 470, y: 305, t, scale: 1.8, pose: celebrate ? 'celebrate' : 'wave', emotion: 'excited', z: jump, talking: WW.ui.isSpeaking('milo') });
    if (celebrate) {
      WW.chars.draw(ctx, 'sunny', { x: 600, y: 300, t, scale: 1.7, pose: 'celebrate', emotion: 'laugh', z: Math.abs(Math.sin(t * 5 + 1)) * 10 });
      WW.chars.draw(ctx, 'sprout', { x: 720, y: 300, t, scale: 1.7, pose: 'wave', emotion: 'excited' });
      WW.chars.draw(ctx, 'kid', { x: 400, y: 470, t, scale: 2, pose: 'celebrate', emotion: 'laugh', dir: 'down', z: Math.abs(Math.sin(t * 5 + 2)) * 14 });
    } else {
      // audience chairs
      for (let i = 0; i < 6; i++) DR.rr(ctx, 120 + i * 130, 440, 90, 22, 6, '#7cc6a0', '#2f6a4a', 3);
    }
  }

  /* ---------------- Hilltop School picture (Section A) ---------------- */
  function drawHilltop(ctx, w, h, t) {
    const P = WW.worldArt.paint;
    ctx.fillStyle = '#a6dd84';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f2deb0';
    ctx.fillRect(0, h * 0.5, w, 40);
    ctx.fillRect(w * 0.44, 0, 40, h);
    DR.text(ctx, 'HILLTOP SCHOOL (fictional)', w / 2, 14, 13, '#2d5a45');
    const at = (px, py) => ({ x: (px / 100) * w, y: (py / 100) * h });
    // empty classroom with lights + fan on
    let p = at(40, 28);
    DR.rr(ctx, p.x - 80, p.y - 62, 160, 100, 8, '#fff4d6', '#2f4a3a', 3);
    DR.rr(ctx, p.x - 70, p.y - 50, 140, 70, 6, '#fff3a0', '#5b6f7a', 3);
    DR.circle(ctx, p.x - 30, p.y - 36, 9, '#fffbe0', '#e9a400', 2);
    DR.circle(ctx, p.x + 30, p.y - 36, 9, '#fffbe0', '#e9a400', 2);
    ctx.save();
    ctx.translate(p.x, p.y - 2);
    ctx.rotate(t * 8);
    for (let i = 0; i < 3; i++) { ctx.rotate((Math.PI * 2) / 3); DR.ell(ctx, 0, -10, 4, 10, '#9aa5b0', '#56636b', 1); }
    ctx.restore();
    for (let i = 0; i < 4; i++) DR.rr(ctx, p.x - 60 + i * 32, p.y + 6, 22, 10, 2, '#c98b55');
    // printer with paper printed on one side
    p = at(84, 30);
    DR.rr(ctx, p.x - 40, p.y - 6, 80, 44, 6, '#c9b5df', '#5a4a7a', 3);
    DR.rr(ctx, p.x - 26, p.y - 30, 52, 26, 5, '#e3eaed', '#56636b', 2);
    for (let i = 0; i < 5; i++) DR.rr(ctx, p.x + 16 + i * 2, p.y + 10 - i * 4, 26, 14, 2, '#ffffff', '#9ab8d8', 1);
    WW.items.draw(ctx, 'paper', p.x - 22, p.y + 18, 0.6, -0.4);
    WW.items.draw(ctx, 'paper', p.x - 6, p.y + 20, 0.6, 0.5);
    // garden tap running
    p = at(14, 70);
    DR.rr(ctx, p.x - 30, p.y + 10, 70, 30, 6, '#7a5136');
    for (let i = 0; i < 4; i++) DR.leaf(ctx, p.x - 20 + i * 15, p.y + 14, 12, 4, -1.6, '#5cc15f', '#2e7a45', 1);
    DR.rr(ctx, p.x - 4, p.y - 40, 8, 44, 3, '#8c9aa3', '#56636b', 2);
    DR.rr(ctx, p.x - 3, p.y - 44, 22, 8, 3, '#b8c4ca', '#56636b', 2);
    const fl = (t * 3) % 1;
    DR.rr(ctx, p.x + 14, p.y - 36, 5, 40, 2, 'rgba(95,191,226,.9)');
    DR.ell(ctx, p.x + 16, p.y + 6, 24 + fl * 4, 8, 'rgba(95,191,226,.55)');
    // canteen landfill bin full of food
    p = at(64, 64);
    P.bin(ctx, { x: p.x - 24, y: p.y - 30, kind: 'landfill' }, null, t);
    for (const [it, dx, dy, r] of [['apple', -10, -40, -0.4], ['bread', 6, -44, 0.3], ['banana', -2, -52, 0.6], ['orange', 12, -36, 0]]) WW.items.draw(ctx, it, p.x + dx, p.y + dy, 0.5, r);
    // drink station with a student refilling a bottle (fine)
    p = at(30, 82);
    P.refill(ctx, { x: p.x - 24, y: p.y - 30 }, null, t);
    WW.chars.draw(ctx, 'kid', { x: p.x + 30, y: p.y + 20, t, scale: 0.8, dir: 'left', pose: 'present', look: { skin: 3, hair: 1, hairColor: 1, shirt: 1 } });
    // compost bin with peels (fine)
    p = at(52, 84);
    P.bin(ctx, { x: p.x - 24, y: p.y - 30, kind: 'compost' }, null, t);
    WW.items.draw(ctx, 'banana', p.x, p.y - 44, 0.45);
    // bike rack (fine)
    p = at(88, 76);
    for (let i = 0; i < 2; i++) {
      const bx = p.x - 30 + i * 36, by = p.y;
      DR.circle(ctx, bx - 8, by, 9, null, '#26303a', 3);
      DR.circle(ctx, bx + 12, by, 9, null, '#26303a', 3);
      DR.poly(ctx, [bx - 8, by, bx + 2, by - 12, bx + 12, by, bx + 2, by], null, i ? '#3d8bfd' : '#e5484d', 3);
    }
  }

  /* ---------------- Hilltop map + chart (Section C) ---------------- */
  function drawHilltopMap(ctx, w, h) {
    ctx.fillStyle = '#a6dd84';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f2deb0';
    ctx.fillRect(w / 2 - 14, 0, 28, h);
    ctx.fillRect(0, h / 2 - 14, w, 28);
    const box = (x, y, bw, bh, fill, label) => { DR.rr(ctx, x - bw / 2, y - bh / 2, bw, bh, 10, fill, '#2d5a45', 3); DR.text(ctx, label, x, y, 13, '#23443a'); };
    box(w / 2, h / 2, 100, 56, '#8fd8c8', 'Playground');
    box(w / 2, 34, 110, 44, '#b49ce0', 'Library');
    box(w - 64, h / 2, 100, 50, '#7ed957', 'Garden');
    box(64, h / 2, 100, 50, '#ffcb52', 'Canteen');
    box(w / 2, h - 32, 100, 40, '#cfd8dc', 'Bike racks');
    const cx = w - 40, cy = 40;
    DR.circle(ctx, cx, cy, 26, '#fffdf2', '#2d5a45', 3);
    DR.poly(ctx, [cx, cy - 20, cx - 6, cy, cx + 6, cy], '#e5484d');
    DR.poly(ctx, [cx, cy + 20, cx - 6, cy, cx + 6, cy], '#ffffff', '#2d5a45', 1);
    DR.text(ctx, 'N', cx, cy - 32, 12, '#e5484d');
  }
  function chartHTML(data) {
    const max = 50;
    return `<div class="chart" style="grid-template-columns:calc(var(--u)*30) 1fr"><div class="chart-y" style="height:calc(var(--u)*170)">${[0, 10, 20, 30, 40, 50].map((v) => `<span>${v}</span>`).join('')}</div>
      <div class="chart-bars" style="height:calc(var(--u)*170)">${data.map((d) => `<div class="chart-col"><div class="chart-val">${d.value}</div><div class="chart-bar" style="height:${(d.value / max) * 100}%;background:${d.color}"></div></div>`).join('')}</div></div>
      <div class="chart-labels">${data.map((d) => `<div>${U.esc(d.name)}</div>`).join('')}</div>`;
  }

  /* ---------------- Assessment flow ---------------- */
  const finalScene = {
    enter() {
      WW.ui.hud.show(true);
      WW.ui.showTouch(false);
      WW.audio.playMusic('assess');
      WW.story.setObjective('Complete the Save Hilltop School Challenge (untimed)');
      F.answers = { A: [], B: {}, C: {}, D: '' };
      F.teacher = null;
      this.running = true;
      this.flow();
    },
    async flow() {
      await E.after(0.4);
      await S.lines(['fin.maple.01', 'fin.maple.02', 'fin.maple.03', 'fin.milo.01']);
      let step = 0;
      const steps = [secA, secB, secC, secD];
      while (step < steps.length) {
        const r = await steps[step](step);
        if (r === 'back') step = Math.max(0, step - 1);
        else if (r === 'exit') return;
        else step++;
      }
      E.go('results', {}, { type: 'fade' });
    },
    update() {},
    draw(ctx, t) { hall(ctx, t, false); },
  };
  E.register('final', finalScene);

  function header(step, title) {
    const bank = BANK();
    const secs = [bank.A, bank.B, bank.C, bank.D];
    return el('div', null,
      el('div', { class: 'assess-progress' }, ...secs.map((s, i) => el('span', { class: i < step ? 'done' : i === step ? 'now' : '' }))),
      el('p', { class: 'fine', style: { margin: '0 0 calc(var(--u) * 6)' } }, `Part ${step + 1} of 4 · ${secs[step].max} marks · No timer — take your time. You can go back and change answers.`));
  }
  function navRow(api, step, canNext, nextLabel = 'Next part →') {
    const next = el('button', { class: 'btn primary', type: 'button', disabled: !canNext(), onclick: () => api.done('next') }, nextLabel);
    const row = el('div', { class: 'row', style: { marginTop: 'calc(var(--u) * 10)' } },
      step > 0 ? el('button', { class: 'btn', type: 'button', onclick: () => api.done('back') }, '← Back') : el('button', { class: 'btn ghost', type: 'button', onclick: () => confirmExit(api) }, '⌂ Leave'),
      el('span', { class: 'spacer' }), next);
    row.refresh = () => (next.disabled = !canNext());
    return row;
  }
  function confirmExit(api) {
    if (confirm('Leave the final challenge? Your answers will not be saved.')) {
      api.done('exit');
      const doors = WW.maps.hub.build().extra.doors;
      E.go('hub', { spawn: { x: doors.hall.x, y: doors.hall.y + 34 }, dir: 'down' });
    }
  }

  // Part A — spot the problems
  function secA(step) {
    const A = BANK().A;
    return S.panel({
      kicker: 'FINAL CHALLENGE · PART A',
      title: '🔍 ' + A.title,
      wide: true,
      closable: false,
      build(body, api) {
        body.appendChild(header(step));
        const cw = 640, ch = 300;
        const cv = el('canvas', { width: cw * 2, height: ch * 2, 'aria-label': 'Picture of Hilltop School' });
        const ctx = cv.getContext('2d');
        const draw = () => { if (!cv.isConnected && cv._d) return; cv._d = 1; ctx.setTransform(2, 0, 0, 2, 0, 0); drawHilltop(ctx, cw, ch, performance.now() / 1000); requestAnimationFrame(draw); };
        requestAnimationFrame(draw);
        const pick = el('div', { class: 'scene-pick' }, cv);
        const counter = el('span', { class: 'tag' });
        const sel = new Set(F.answers.A);
        const nav = navRow(api, step, () => sel.size === A.pick);
        for (const hs of A.hotspots) {
          const b = el('button', { class: 'hotspot' + (sel.has(hs.id) ? ' on' : ''), type: 'button', style: { left: hs.x + '%', top: hs.y + '%' }, 'aria-pressed': String(sel.has(hs.id)) }, hs.label);
          b.addEventListener('click', () => {
            if (sel.has(hs.id)) sel.delete(hs.id);
            else {
              if (sel.size >= A.pick) { WW.audio.sfx('thud'); api.feedback(`You can choose ${A.pick}. Tap one you chose to un-choose it first.`, 'bad'); return; }
              sel.add(hs.id);
            }
            WW.audio.sfx('pop');
            b.classList.toggle('on', sel.has(hs.id));
            b.setAttribute('aria-pressed', String(sel.has(hs.id)));
            F.answers.A = [...sel];
            update();
          });
          pick.appendChild(b);
        }
        const update = () => { counter.textContent = `Chosen: ${sel.size} / ${A.pick}`; nav.refresh(); };
        body.append(el('p', { style: { margin: '0 0 calc(var(--u) * 6)' } }, A.intro, ' ', counter), pick, nav);
        update();
      },
    });
  }

  // Part B — sustainable actions
  function secB(step) {
    const B = BANK().B;
    const stations = WW.data.stations;
    return S.panel({
      kicker: 'FINAL CHALLENGE · PART B',
      title: '♻️ ' + B.title,
      wide: true,
      closable: false,
      build(body, api) {
        body.appendChild(header(step));
        body.appendChild(el('p', { class: 'callout', style: { margin: '0 0 calc(var(--u) * 6)' } }, BANK().rulesText));
        const ans = F.answers.B;
        const done = () => B.sort.every((s) => ans[s.id]) && B.mcq.every((q) => ans[q.id] != null);
        const nav = navRow(api, step, done);
        body.appendChild(el('p', { style: { margin: 'calc(var(--u) * 4) 0' } }, el('b', null, B.sortIntro)));
        for (const s of B.sort) {
          const row = el('div', { class: 'sort-row' }, el('div', { class: 'what', html: WW.items.img(s.item, 40) + U.esc(s.name) }));
          for (const k of ['compost', 'recycle', 'reuse', 'landfill']) {
            const b = el('button', { class: 'sort-opt' + (ans[s.id] === k ? ' on' : ''), type: 'button', 'aria-pressed': String(ans[s.id] === k) }, stations[k].icon + ' ' + stations[k].name);
            b.addEventListener('click', () => { ans[s.id] = k; row.querySelectorAll('.sort-opt').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); WW.audio.sfx('pop'); nav.refresh(); });
            row.appendChild(b);
          }
          body.appendChild(row);
        }
        for (const q of B.mcq) body.appendChild(mcq(q, ans, nav));
        body.appendChild(nav);
      },
    });
  }
  function mcq(q, ans, nav) {
    const wrap = el('div', { style: { marginTop: 'calc(var(--u) * 8)' } }, el('p', { style: { margin: '0 0 calc(var(--u) * 4)' } }, el('b', null, q.q)));
    const grid = el('div', { class: 'answer-grid cols3' });
    q.options.forEach((o, i) => {
      const b = el('button', { class: 'answer' + (ans[q.id] === i ? ' selected' : ''), type: 'button', 'aria-pressed': String(ans[q.id] === i) }, el('span', { class: 'choice-num' }, String.fromCharCode(65 + i)), el('span', null, o));
      b.addEventListener('click', () => { ans[q.id] = i; grid.querySelectorAll('.answer').forEach((x) => { x.classList.toggle('selected', x === b); x.setAttribute('aria-pressed', String(x === b)); }); WW.audio.sfx('pop'); nav && nav.refresh(); });
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  // Part C — geographical evidence
  function secC(step) {
    const C = BANK().C;
    return S.panel({
      kicker: 'FINAL CHALLENGE · PART C',
      title: '📊 ' + C.title,
      wide: true,
      closable: false,
      build(body, api) {
        body.appendChild(header(step));
        body.appendChild(el('p', { style: { margin: '0 0 calc(var(--u) * 6)' } }, C.intro));
        const ans = F.answers.C;
        const nav = navRow(api, step, () => C.mcq.every((q) => ans[q.id] != null));
        const mw = 300, mh = 210;
        const cv = el('canvas', { width: mw * 2, height: mh * 2, 'aria-label': 'Map of Hilltop School: playground in the centre, library north, garden east, canteen west, bike racks south.' });
        const ctx = cv.getContext('2d');
        ctx.scale(2, 2);
        drawHilltopMap(ctx, mw, mh);
        const left = el('div', null, el('b', null, '📊 Rubbish sample (100 items, fictional)'), el('div', { html: chartHTML(C.chart), 'aria-label': 'Bar chart: ' + C.chart.map((d) => `${d.name} ${d.value}`).join(', ') }), el('b', { style: { display: 'block', marginTop: 'calc(var(--u) * 8)' } }, '🗺 Hilltop School map'), el('div', { class: 'mapbox' }, cv));
        const right = el('div');
        for (const q of C.mcq) right.appendChild(mcq(q, ans, nav));
        body.appendChild(el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 'calc(var(--u) * 14)' } }, left, right));
        body.appendChild(nav);
      },
    });
  }

  // Part D — explain your plan (teacher-reviewed)
  function secD(step) {
    const Dd = BANK().D;
    return S.panel({
      kicker: 'FINAL CHALLENGE · PART D (TEACHER-REVIEWED)',
      title: '✍️ ' + Dd.title,
      wide: true,
      closable: false,
      build(body, api) {
        body.appendChild(header(step));
        body.appendChild(el('p', { style: { margin: '0 0 calc(var(--u) * 6)' } }, Dd.prompt));
        const ta = el('textarea', { class: 'plan', maxlength: 900, 'aria-label': 'Your plan', placeholder: 'I think Hilltop School should… because the evidence shows…' });
        ta.value = F.answers.D || '';
        const starters = el('div', { class: 'starters' }, el('span', { class: 'fine' }, 'Sentence starters:'), ...Dd.starters.map((s) => el('button', { class: 'pill-btn', type: 'button', onclick: () => { ta.value = (ta.value ? ta.value.trimEnd() + ' ' : '') + s + ' '; ta.focus(); F.answers.D = ta.value; nav.refresh(); } }, s)));
        const nav = navRow(api, step, () => (F.answers.D || '').trim().length >= 15, 'Finish & see my results →');
        ta.addEventListener('input', () => { F.answers.D = ta.value; nav.refresh(); });
        const self = el('div', { class: 'callout green' }, el('b', null, 'Check your own answer (not marked):'), el('br'),
          ...['I named one clear action', 'I used evidence from the chart or map', 'I explained who could help and why it would work'].map((t2) => el('label', { style: { display: 'block' } }, el('input', { type: 'checkbox' }), ' ' + t2)));
        body.append(starters, ta, el('p', { class: 'fine' }, 'This answer is worth up to 6 marks and is marked by your teacher — not by the computer.'), self, nav);
        setTimeout(() => ta.focus(), 80);
      },
    });
  }

  /* ---------------- Results ---------------- */
  const resultsScene = {
    enter() {
      WW.ui.hud.show(true);
      WW.audio.playMusic('title');
      const s = WW.save.data;
      if (!s.finalDone) {
        s.finalDone = true;
        WW.save.commit();
        WW.ui.points(100, 'Final challenge complete');
      }
      WW.story.refresh();
      WW.audio.sfx('fanfare');
      WW.fx.clear();
      WW.fx.spawn('confetti', E.W / 2, E.H / 3, { screen: true });
      (async () => {
        await E.after(0.6);
        await S.line('fin.maple.end');
        F.showResults();
      })();
    },
    update(dt) {
      WW.fx.update(dt);
      this.ct = (this.ct || 0) + dt;
      if (this.ct > 3 && !WW.save.reducedMotion()) { this.ct = 0; WW.fx.spawn('confetti', 200 + Math.random() * 560, 120, { screen: true }); }
    },
    draw(ctx, t) {
      hall(ctx, t, true);
      WW.fx.drawScreen(ctx);
    },
  };
  E.register('results', resultsScene);

  F.score = function () {
    const ans = F.answers || { A: [], B: {}, C: {}, D: '' };
    return WW.logic.scoreAssessment(BANK(), Object.assign({}, ans, { teacher: F.teacher }));
  };

  F.showResults = function () {
    const res = F.score();
    const fb = WW.logic.feedbackFor(res);
    const s = WW.save.data;
    S.panel({
      kicker: 'SAVE HILLTOP SCHOOL · RESULTS',
      title: `🏆 Well done, ${WW.save.name()}!`,
      wide: true,
      closable: false,
      build(body, api) {
        const render = () => {
          const r = F.score();
          body.innerHTML = '';
          const box = (score, max, label, pending) => el('div', { class: 'res-box' + (pending ? ' pending' : '') }, el('b', null, pending ? `? / ${max}` : `${score} / ${max}`), el('span', null, label));
          body.append(
            el('div', { class: 'row' },
              el('div', null, el('div', { class: 'big-score' }, `${r.auto} / ${r.autoMax}`), el('div', { class: 'fine' }, 'auto-marked so far')),
              el('div', { class: 'spacer' }),
              el('div', { style: { textAlign: 'right' } }, el('div', { class: 'big-score', style: { color: r.total == null ? '#b07a00' : '#17503b' } }, r.total == null ? `+ ? / 6` : `${r.total} / 20`), el('div', { class: 'fine' }, r.total == null ? 'Part D waits for your teacher' : 'total including teacher marks'))),
            el('div', { class: 'results-grid' },
              box(r.A.score, r.A.max, 'A · Spot problems'),
              box(r.B.score, r.B.max, 'B · Sustainable actions'),
              box(r.C.score, r.C.max, 'C · Maps & data'),
              box(r.D.score, r.D.max, 'D · Plan (teacher)', r.D.pending)),
            el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'calc(var(--u) * 10)' } },
              el('div', { class: 'callout green' }, el('b', null, '🌟 Strengths'), el('ul', { class: 'fact-list' }, ...(fb.strengths.length ? fb.strengths : ['Completing an independent challenge — great persistence!']).map((x) => el('li', null, x)))),
              el('div', { class: 'callout yellow' }, el('b', null, '🎯 Next steps to practise'), el('ul', { class: 'fact-list' }, ...(fb.practise.length ? fb.practise : ['Try explaining your reasons out loud to a classmate.']).map((x) => el('li', null, x))))),
            el('p', { class: 'fine' }, 'This is a practice game score for one learning focus — not an official VCAA grade, and not a measure of real-world waste or carbon reduction.'),
            el('div', { class: 'row' },
              el('button', { class: 'btn', type: 'button', onclick: () => F.review() }, '🔎 Review answers'),
              el('button', { class: 'btn', type: 'button', onclick: () => F.teacherMark().then(render) }, '👩‍🏫 Teacher marking'),
              el('button', { class: 'btn', type: 'button', onclick: () => F.download() }, '⬇ Download report'),
              el('button', { class: 'btn', type: 'button', onclick: () => F.print() }, '🖨 Print'),
              el('span', { class: 'spacer' }),
              el('button', { class: 'btn primary', type: 'button', onclick: () => { api.done(); E.go('hub', { spawn: { x: 20 * 48, y: 8.6 * 48 }, dir: 'down' }); } }, '🌳 Explore my greener school →')),
          );
        };
        render();
      },
    });
  };

  F.review = function () {
    const bank = BANK();
    const a = F.answers;
    S.panel({
      kicker: 'REVIEW',
      title: '🔎 Your answers',
      wide: true,
      build(body, api) {
        const lines = [];
        const prob = bank.A.hotspots.filter((h) => h.problem);
        lines.push(`<h3>A · Spot the problems</h3><ul>${bank.A.hotspots.map((h) => `<li>${a.A.includes(h.id) ? '☑' : '☐'} <b>${U.esc(h.label)}</b> — ${h.problem ? '⚠️ problem' : '✔ fine'}: ${U.esc(h.explain)}</li>`).join('')}</ul>`);
        lines.push(`<h3>B · Sustainable actions</h3><ul>${bank.B.sort.map((s) => `<li>${a.B[s.id] === s.answer ? '✅' : '🔁'} ${U.esc(s.name)} → you chose <b>${U.esc((WW.data.stations[a.B[s.id]] || {}).name || '—')}</b> (answer: ${U.esc(WW.data.stations[s.answer].name)})</li>`).join('')}${bank.B.mcq.map((q) => `<li>${a.B[q.id] === q.a ? '✅' : '🔁'} ${U.esc(q.q)} <br>Answer: <b>${U.esc(q.options[q.a])}</b></li>`).join('')}</ul>`);
        lines.push(`<h3>C · Maps & data</h3><ul>${bank.C.mcq.map((q) => `<li>${a.C[q.id] === q.a ? '✅' : '🔁'} ${U.esc(q.q)} <br>Answer: <b>${U.esc(q.options[q.a])}</b></li>`).join('')}</ul>`);
        lines.push(`<h3>D · Your plan (teacher-reviewed)</h3><p class="callout">${U.esc(a.D || '')}</p>`);
        body.appendChild(el('div', { html: lines.join(''), style: { fontSize: 'calc(var(--u) * 14.5)' } }));
        body.appendChild(el('div', { class: 'row end' }, el('button', { class: 'btn primary', type: 'button', onclick: () => api.done() }, 'Close')));
        void prob;
      },
    });
  };

  F.teacherMark = function () {
    const bank = BANK();
    const cur = F.teacher || {};
    return S.panel({
      kicker: 'FOR THE TEACHER',
      title: '👩‍🏫 Mark Part D (0–6)',
      wide: true,
      build(body, api) {
        body.appendChild(el('p', null, 'Student response:'));
        body.appendChild(el('p', { class: 'callout' }, F.answers.D || '(no response)'));
        body.appendChild(el('p', { class: 'fine' }, 'Different valid plans can earn full marks. Please don’t mark only by keywords.'));
        const sels = {};
        for (const r of bank.D.rubric) {
          const sel = el('select', { class: 'inline', 'aria-label': r.name }, ...[0, 1, 2].map((v) => el('option', { value: v, selected: cur[r.id] == v }, String(v))));
          sels[r.id] = sel;
          body.appendChild(el('label', { class: 'set-row' }, el('span', null, r.name + ` (0–${r.max})`), sel));
        }
        body.appendChild(el('div', { class: 'row end', style: { marginTop: 'calc(var(--u) * 10)' } },
          el('button', { class: 'btn', type: 'button', onclick: () => { F.teacher = null; api.done(); } }, 'Clear marks'),
          el('button', { class: 'btn primary', type: 'button', onclick: () => { F.teacher = {}; for (const k in sels) F.teacher[k] = Number(sels[k].value); WW.audio.sfx('correct'); api.done(); } }, 'Save marks')));
      },
    });
  };

  F.reportText = function () {
    const bank = BANK();
    const r = F.score();
    const a = F.answers;
    const s = WW.save.data;
    const fb = WW.logic.feedbackFor(r);
    const L = [];
    L.push('WASTEWISE — THE ECO CREW ADVENTURE · STUDENT LEARNING REPORT');
    L.push('Generated on this device: ' + new Date().toLocaleString('en-AU'));
    L.push('Nickname: ' + WW.save.name());
    L.push('');
    L.push('FINAL CHALLENGE: SAVE HILLTOP SCHOOL (untimed, fictional school)');
    L.push(`Auto-marked: ${r.auto} / ${r.autoMax}   (A ${r.A.score}/${r.A.max} · B ${r.B.score}/${r.B.max} · C ${r.C.score}/${r.C.max})`);
    L.push(`Part D (teacher-reviewed): ${r.D.pending ? 'NOT YET MARKED' : r.D.score + ' / ' + r.D.max}`);
    L.push(`Total: ${r.total == null ? 'pending teacher review (out of 20)' : r.total + ' / 20'}`);
    L.push('');
    L.push('Strengths: ' + (fb.strengths.join('; ') || '—'));
    L.push('Practise next: ' + (fb.practise.join('; ') || '—'));
    L.push('');
    L.push('PART A — problems chosen: ' + a.A.map((id) => bank.A.hotspots.find((h) => h.id === id).label).join(', '));
    L.push('  Correct problems: ' + bank.A.hotspots.filter((h) => h.problem).map((h) => h.label).join(', '));
    L.push('PART B:');
    for (const q of bank.B.sort) L.push(`  ${q.name}: chose ${a.B[q.id] || '—'} (answer ${q.answer})`);
    for (const q of bank.B.mcq) L.push(`  ${q.q}\n    chose: ${q.options[a.B[q.id]] || '—'} | answer: ${q.options[q.a]}`);
    L.push('PART C:');
    for (const q of bank.C.mcq) L.push(`  ${q.q}\n    chose: ${q.options[a.C[q.id]] || '—'} | answer: ${q.options[q.a]}`);
    L.push('PART D — student plan:');
    L.push('  ' + (a.D || '(none)'));
    L.push('  Teacher rubric (0–2 each): specific realistic action / uses evidence or environmental reasons / clear who-how-why.');
    if (F.teacher) L.push(`  Marks: action ${F.teacher.feasible}, evidence ${F.teacher.evidence}, clarity ${F.teacher.clarity}`);
    L.push('');
    L.push('GAME JOURNEY (practice evidence, not part of the 20 marks)');
    L.push(`Chapters completed: ${s.done.filter(Boolean).length} / 3`);
    for (const k of ['ch1', 'ch2', 'ch3']) if (s.stats.checks[k]) L.push(`  ${k.toUpperCase()} quick check: ${s.stats.checks[k].score}/${s.stats.checks[k].max} right first try`);
    const m = s.stats.maze;
    if (m.completed) L.push(`  Waste maze: ${m.items} items sorted, ${m.firstTry} right first try, ${m.landfill || 0} to landfill (lunch choice: ${m.lunch})`);
    L.push('  Story decisions:');
    for (const c of s.stats.choices) L.push(`   - Ch${c.chapter}: ${c.label} [${c.quality}]`);
    L.push('');
    L.push('Curriculum focus (team mapping, please verify with VCAA): Victorian Curriculum F–10 v2.0, Levels 3–4 Geography — VC2HG4K09 (sustainable use of natural resources and waste management) and geographical inquiry skills.');
    L.push('NOTE: All schools, data and bin rules in the game are fictional. This is not an official VCAA grade and does not measure real-world waste or carbon reduction. Nothing was uploaded; this file was created on this device.');
    return L.join('\n');
  };
  F.download = function () {
    const blob = new Blob([F.reportText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wastewise-report-' + WW.save.name().replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    WW.ui.toast('⬇ Report downloaded to this device');
  };
  F.print = function () {
    const node = document.getElementById('print-report');
    node.innerHTML = `<pre style="white-space:pre-wrap;font:14px/1.45 Arial, sans-serif">${U.esc(F.reportText())}</pre>`;
    window.print();
  };
})();
