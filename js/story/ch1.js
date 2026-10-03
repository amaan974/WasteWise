/* WasteWise — Chapter 1: The Resource Mystery (school garden).
   Explore → inspect 4 clues → report → branching decision (with a visible "what if") →
   sequencing puzzle + pipe puzzle → rain refills the tank, garden blooms → learn → check. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const el = U.el;
  const S = WW.script;
  const TS = 48;
  const C1 = (WW.ch1 = {});
  const D = () => WW.save.data;
  const W = () => WW.save.data.world;

  const MAPLE_GATE = { x: 15.2 * TS, y: 12.7 * TS };
  const MAPLE_HALL = { x: 17.4 * TS, y: 8.6 * TS };

  C1.setupHub = function (scene) {
    const s = D();
    const atGate = !s.done[0];
    const pos = atGate ? MAPLE_GATE : MAPLE_HALL;
    const maple = scene.addNPC('maple', 'maple', pos.x, pos.y, { dir: atGate ? 'left' : 'down', emotion: atGate ? 'worried' : 'happy' });
    scene.addInteract({ id: 'maple', actor: maple, label: 'Talk to Principal Maple', run: () => C1.talkMaple(scene) });
    // clue objects
    const clueObj = { tap: 'tap', sprinkler: 'sprinkler', light: 'shed', bottles: 'gardenBin' };
    for (const key of WW.data.clueOrder) {
      scene.addInteract({ id: 'clue_' + key, obj: clueObj[key], label: () => (D().ch1.clues.indexOf(key) === -1 ? 'Inspect' : 'Look again'), run: () => C1.inspect(scene, key) });
    }
    scene.addInteract({ id: 'tank', obj: 'tank', label: 'Check the rain tank', run: () => S.line('ch1.clue.tank') });
    scene.addInteract({ id: 'compost', obj: 'compost', label: 'Look', run: () => S.line('ch1.compost') });
    for (const b of ['bedA', 'bedC']) scene.addInteract({ id: b, obj: b, label: 'Look at the veggies', run: () => S.line(W().gardenHealth > 60 ? 'ch1.bed.good' : 'ch1.bed.dry') });
  };

  C1.talkMaple = async function (scene) {
    const s = D();
    const st = s.ch1.stage;
    if (!s.done[0]) {
      if (st === 'meet') return C1.meet(scene);
      if (st === 'clues') {
        await S.say('maple', `Keep looking, detective! You have found ${s.ch1.clues.length} of 4 clues. Try the tap, the sprinkler, the shed and the bins.`, 'happy');
        return;
      }
      if (st === 'report') return C1.report(scene);
      if (st === 'fixWater') { await S.say('maple', 'The sprinkler control box is next to the veggie beds. Good luck!', 'happy'); return; }
    }
    if (!s.done[1]) await S.say('maple', 'Chef Sunny is waiting in the canteen, east of the courtyard. Off you go!', 'happy');
    else if (!s.done[2]) await S.say('maple', 'Professor Sprout is in the Eco Lab, in the south-east corner. You are doing wonderfully!', 'happy');
    else if (!s.finalDone) await S.say('maple', 'The Assembly Hall is open. Come in when you are ready for the final challenge!', 'excited');
    else await S.say('maple', 'Thank you, Eco Crew hero! Look how green and tidy our school is now.', 'proud');
  };

  C1.meet = async function (scene) {
    await S.lines(['ch1.maple.01', 'ch1.maple.02', 'ch1.maple.03']);
    const c = await S.ask('kid', 'What will you say?', [
      { id: 'go', icon: '👍', text: 'We’re on it, Principal Maple!' },
      { id: 'what', icon: '❓', text: 'What’s a natural resource?' },
    ]);
    if (c === 'what') await S.lines(['ch1.maple.nr1', 'ch1.milo.nr2']);
    await S.lines(['ch1.maple.04', 'ch1.milo.01']);
    D().ch1.stage = 'clues';
    WW.save.commit();
    WW.story.refresh();
    WW.ui.toast('📓 Eco Notebook unlocked — press N to open it');
  };

  /* ---------------- clue inspection ---------------- */
  function clueArt(kind) {
    const c = el('canvas', { width: 400, height: 320, 'aria-hidden': 'true' });
    const ctx = c.getContext('2d');
    const P = WW.worldArt.paint;
    const draw = () => {
      if (!c.isConnected && c._drawn) return;
      c._drawn = true;
      const t = performance.now() / 1000;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.fillStyle = '#9ad37a';
      ctx.fillRect(0, 0, 200, 160);
      ctx.fillStyle = '#c4915e';
      ctx.fillRect(0, 118, 200, 42);
      const ws = Object.assign({}, W());
      ctx.save();
      if (kind === 'tap') {
        ws.leakFixed = false;
        ctx.translate(46, 22);
        ctx.scale(1.9, 1.9);
        P.puddle(ctx, { x: 0, y: 48 }, ws, t);
        P.tap(ctx, { x: 0, y: 12 }, ws, t);
      } else if (kind === 'sprinkler') {
        ws.sprinklerFixed = false;
        ctx.fillStyle = '#d8d8d0';
        ctx.fillRect(110, 0, 90, 160);
        ctx.translate(14, -12);
        ctx.scale(1.7, 1.7);
        P.sprinkler(ctx, { x: 0, y: 40, sprayDir: 1 }, ws, t);
        ctx.restore();
        ctx.save();
        WW.draw.circle(ctx, 178, 22, 14, '#ffd23f', '#e9a400', 2);
      } else if (kind === 'light') {
        ws.shedLightOn = true;
        ctx.translate(18, -6);
        ctx.scale(1.15, 1.15);
        P.shed(ctx, { x: 0, y: 30, pw: 144, ph: 96 }, ws, t);
        ctx.restore();
        ctx.save();
        WW.draw.circle(ctx, 182, 20, 13, '#ffd23f', '#e9a400', 2);
      } else if (kind === 'bottles') {
        ctx.translate(58, -40);
        ctx.scale(2, 2);
        P.bin(ctx, { x: 0, y: 40, kind: 'landfill', overflow: true }, ws, t);
      }
      ctx.restore();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return c;
  }

  C1.inspect = async function (scene, key) {
    const s = D();
    const clue = WW.data.clues[key];
    if (s.ch1.stage === 'meet') {
      await S.say('milo', 'Ooh, interesting! But first, let’s say hello to Principal Maple — she’s waiting by the gate.', 'thinking');
      return;
    }
    if (key === 'tap' && W().leakFixed) { await S.say('milo', 'The tap is fixed — not a single drip! The caretaker did a great job.', 'happy'); return; }
    if (key === 'sprinkler' && s.ch1.stage === 'fixWater') return C1.fixWater(scene);
    if (key === 'sprinkler' && W().sprinklerFixed) { await S.say('milo', 'No more spraying the path. The drip lines water the roots instead!', 'happy'); return; }
    if (s.ch1.clues.indexOf(key) !== -1) {
      if (key === 'light' && W().shedLightOn) { /* allow switching off below */ } else { await S.line('ch1.clue.done'); return; }
    }
    WW.audio.sfx('page');
    const first = s.ch1.clues.indexOf(key) === -1;
    const result = await S.panel({
      kicker: 'CLUE ' + (WW.data.clueOrder.indexOf(key) + 1) + ' OF 4 · INVESTIGATE',
      title: '🔍 ' + clue.title,
      closeLabel: 'Leave this clue for now',
      build(body, api) {
        const grid = el('div', { class: 'answer-grid' });
        let tries = 0;
        clue.options.forEach((o, i) => {
          const b = el('button', { class: 'answer', type: 'button' }, el('span', { class: 'big' }, o.icon), el('span', null, o.text));
          b.addEventListener('click', () => {
            tries++;
            if (o.ok) {
              b.classList.add('right');
              grid.querySelectorAll('button').forEach((x) => (x.disabled = true));
              WW.audio.sfx('correct');
              api.feedback('✅ ' + U.esc(o.why), 'sticky');
              const row = el('div', { class: 'row end', style: { marginTop: 'calc(var(--u) * 10)' } });
              if (key === 'light') {
                const sw = el('button', { class: 'btn primary', type: 'button', onclick: () => { WW.audio.sfx('switch'); W().shedLightOn = false; WW.save.commit(); api.done({ ok: true, tries }); } }, '💡 Switch the light off');
                row.appendChild(sw);
                setTimeout(() => sw.focus(), 30);
              } else {
                const nb = el('button', { class: 'btn primary', type: 'button', onclick: () => api.done({ ok: true, tries }) }, '📓 Add to notebook');
                row.appendChild(nb);
                setTimeout(() => nb.focus(), 30);
              }
              body.appendChild(row);
            } else {
              b.classList.add('wrong');
              b.disabled = true;
              WW.audio.sfx('wrong');
              api.feedback('🤔 ' + U.esc(o.why), 'bad');
            }
          });
          grid.appendChild(b);
        });
        api.onKey = (a) => { const k = { c1: 0, c2: 1, c3: 2 }[a]; if (k != null && grid.children[k]) grid.children[k].click(); };
        body.appendChild(el('div', { class: 'inspect' }, el('div', { class: 'inspect-art' }, clueArt(clue.art)), el('div', null, el('p', null, clue.prompt), grid)));
      },
    });
    if (!result) return;
    if (first) {
      s.ch1.clues.push(key);
      s.ch1.choiceLog.push({ clue: key, firstTry: result.tries === 1 });
      WW.save.commit();
      S.points(10, 'Clue found', scene.player ? { x: scene.player.x, y: scene.player.y - 90 } : null);
      WW.fx.spawn('sparkle', scene.player.x, scene.player.y - 60);
    }
    WW.story.refresh();
    if (key === 'light') await S.line('ch1.clue.light.off');
    if (key === 'bottles' && first) await S.say('milo', 'Let’s ask Chef Sunny about all these bottles later. Refillable bottles could stop this pile growing!', 'thinking');
    if (s.ch1.stage === 'clues' && s.ch1.clues.length >= 4) {
      s.ch1.stage = 'report';
      WW.save.commit();
      scene.milo && scene.milo.setEmote('idea', 2);
      await S.line('ch1.milo.allclues');
      WW.story.refresh();
    }
  };

  /* ---------------- report + branching decision ---------------- */
  C1.report = async function (scene) {
    const s = D();
    await S.lines(['ch1.maple.05', 'ch1.milo.summary']);
    let decided = false;
    while (!decided) {
      const pick = await S.askLine('ch1.maple.06', WW.data.leakChoices.map((c) => ({ id: c.id, icon: c.icon, text: c.text })));
      if (pick === 'diy') {
        WW.save.logChoice(1, 'leak', 'Tried to fix the tap with tools', 'retry');
        scene.milo && scene.milo.jump(240);
        WW.audio.sfx('squeak');
        await S.lines(['ch1.milo.unsafe', 'ch1.maple.unsafe']);
      } else if (pick === 'ignore') {
        WW.save.logChoice(1, 'leak', 'Chose to ignore the leak (saw the consequence)', 'retry');
        await C1.ignoreConsequence(scene);
      } else if (pick === 'report') {
        WW.save.logChoice(1, 'leak', 'Reported the leak to the caretaker', 'best');
        decided = true;
      } else return; // dialogue closed unexpectedly
    }
    await S.line('ch1.maple.good');
    await S.line('ch1.n.caretaker');
    // visible fix
    const tap = scene.objPoint('tap');
    S.cam(tap.x, tap.y - 40);
    await S.wait(0.6);
    WW.audio.sfx('switch');
    await S.wait(0.3);
    W().leakFixed = true;
    W().puddle = 0;
    WW.save.commit();
    WW.fx.spawn('sparkle', tap.x + 10, tap.y - 90);
    WW.audio.sfx('correct');
    S.points(20, 'Safe, smart choice', { x: tap.x, y: tap.y - 110 });
    await S.wait(1);
    S.cam(null);
    await S.lines(['ch1.maple.07', 'ch1.milo.02']);
    s.ch1.stage = 'fixWater';
    WW.save.commit();
    WW.story.refresh();
  };

  C1.ignoreConsequence = async function (scene) {
    const w = W();
    const snap = { gardenHealth: w.gardenHealth, tank: w.tank, puddle: w.puddle || 0 };
    await S.line('ch1.n.later');
    const bed = scene.map.get('bedB');
    S.cam(bed.x + 40, bed.y);
    S.tint(true, 'rgba(150,110,50,.32)');
    WW.audio.sfx('drip');
    const milo = scene.milo;
    if (milo) { milo.emotion = 'sad'; milo.setEmote('drop', 3); }
    const maple = scene.npcs.maple;
    if (maple) maple.emotion = 'sad';
    await WW.engine.tween(w, { gardenHealth: 6, tank: 3, puddle: 1.6 }, 2.4, U.ease.inOut);
    await S.lines(['ch1.maple.ignore', 'ch1.milo.ignore', 'ch1.milo.rewind']);
    WW.audio.sfx('whoosh');
    S.flash('#ffffff', 0.6);
    S.tint(false);
    await WW.engine.tween(w, snap, 0.8, U.ease.outCubic);
    if (maple) maple.emotion = 'worried';
    if (milo) milo.emotion = 'happy';
    S.cam(null);
    WW.save.commit();
    await S.wait(0.4);
  };

  /* ---------------- fixing the watering system ---------------- */
  C1.fixWater = async function (scene) {
    const s = D();
    s.stats.puzzles = s.stats.puzzles || {};
    if (!s.stats.puzzles.sequence) {
      await S.line('ch1.milo.seqintro');
      const ok = await C1.sequencePanel();
      if (!ok) return;
      s.stats.puzzles.sequence = true;
      WW.save.commit();
      S.points(20, 'Water-wise routine');
    }
    await S.line('ch1.milo.pipeintro');
    const solved = await C1.pipePanel();
    if (!solved) return;
    s.stats.puzzles.pipes = true;
    S.points(30, 'Rain-to-roots plumbing');
    await C1.rainConsequence(scene);
  };

  C1.rainConsequence = async function (scene) {
    const s = D();
    const w = W();
    const spr = scene.objPoint('sprinkler');
    w.sprinklerFixed = true;
    WW.save.commit();
    WW.audio.sfx('switch');
    S.cam(spr.x + 60, spr.y - 120);
    await S.wait(0.8);
    await S.line('ch1.n.rain');
    S.tint(true, 'rgba(40,70,120,.35)');
    for (let i = 0; i < 6; i++) {
      WW.fx.spawn('rain', spr.x + 40, spr.y - 280, { w: 700 });
      if (i % 2 === 0) WW.audio.sfx('rain');
      if (i === 2) WW.engine.tween(w, { tank: 85 }, 2.4, U.ease.inOut);
      await S.wait(0.45);
    }
    S.tint(false);
    await S.wait(0.6);
    WW.audio.sfx('grow');
    for (const b of ['bedA', 'bedB', 'bedC']) { const o = scene.map.get(b); WW.fx.spawn('grow', o.x + o.pw / 2, o.y + 20); WW.fx.spawn('sparkle', o.x + o.pw / 2, o.y + 10); }
    await WW.engine.tween(w, { gardenHealth: 100 }, 1.8, U.ease.outCubic);
    WW.save.commit();
    const maple = scene.npcs.maple;
    if (maple) { maple.emotion = 'excited'; maple.pose = 'celebrate'; }
    if (scene.milo) { scene.milo.pose = 'celebrate'; scene.milo.jump(280); }
    WW.audio.sfx('squeak');
    S.cam(null);
    await S.wait(0.4);
    await S.lines(['ch1.maple.08', 'ch1.milo.03']);
    if (maple) maple.pose = 'idle';
    if (scene.milo) scene.milo.pose = 'idle';
    await S.learnCard(WW.data.ch1Learn, 'CHAPTER 1 · WHY IT MATTERS');
    await S.chapterCheck(1);
    s.done[0] = true;
    s.ch1.stage = 'done';
    s.ch2.stage = 'enter';
    WW.save.commit();
    S.points(50, 'Chapter 1 complete');
    await S.chapterComplete(1, WW.data.ch1Learn, 'The garden is thriving and the rain tank is filling up. The canteen is now unlocked!');
    WW.audio.sfx('unlock');
    WW.ui.toast('🔓 Sunny Canteen unlocked!', 'points', 3500);
    await S.line('ch1.maple.09');
    // Maple walks off towards the hall
    if (maple) {
      maple.emotion = 'happy';
      S.walk(maple, MAPLE_HALL.x, MAPLE_HALL.y).then(() => (maple.dir = 'down'));
    }
    WW.story.onWorldChanged();
  };

  /* ---------------- Mini-game: sequencing ---------------- */
  C1.sequencePanel = function () {
    const data = WW.data.sequence;
    const correct = data.steps.map((x) => x.id);
    let order = data.start.slice();
    let picked = null;
    return S.panel({
      kicker: 'PUZZLE 1 OF 2 · ORDER THE STEPS',
      title: '🌅 ' + data.title,
      closeLabel: 'Leave the puzzle',
      build(body, api) {
        const list = el('div', { class: 'seq-list', role: 'list' });
        const render = (marks) => {
          list.innerHTML = '';
          order.forEach((id, i) => {
            const st = data.steps.find((x) => x.id === id);
            const up = el('button', { type: 'button', 'aria-label': 'Move up', disabled: i === 0, onclick: (e) => { e.stopPropagation(); move(i, -1); } }, '▲');
            const down = el('button', { type: 'button', 'aria-label': 'Move down', disabled: i === order.length - 1, onclick: (e) => { e.stopPropagation(); move(i, 1); } }, '▼');
            const card = el('div', { class: 'seq-card' + (picked === i ? ' picked' : '') + (marks ? (marks[i] ? ' ok' : ' no') : ''), role: 'listitem', tabindex: 0, 'aria-label': `Step ${i + 1}: ${st.text}` },
              el('span', { class: 'seq-num' }, String(i + 1)), el('span', { class: 'seq-icon' }, st.icon), el('span', null, st.text), el('span', { class: 'seq-moves' }, up, down));
            card.addEventListener('click', () => {
              if (picked === null) { picked = i; WW.audio.sfx('pop'); render(); }
              else { const a = picked; picked = null; if (a !== i) { [order[a], order[i]] = [order[i], order[a]]; WW.audio.sfx('rotate'); } render(); }
            });
            list.appendChild(card);
          });
        };
        const move = (i, d) => {
          const j = i + d;
          if (j < 0 || j >= order.length) return;
          [order[i], order[j]] = [order[j], order[i]];
          picked = null;
          WW.audio.sfx('rotate');
          render();
          const btn = list.children[j] && list.children[j].querySelectorAll('.seq-moves button')[d < 0 ? 0 : 1];
          btn && !btn.disabled && btn.focus();
        };
        const check = el('button', { class: 'btn primary', type: 'button', onclick: () => {
          const marks = WW.logic.checkSequence(order, correct);
          render(marks);
          if (marks.every(Boolean)) {
            WW.audio.sfx('correct');
            api.feedback('✅ ' + U.esc(data.why), 'sticky');
            check.remove();
            const next = el('button', { class: 'btn primary', type: 'button', onclick: () => api.done(true) }, 'Next: fix the pipes →');
            footer.appendChild(next);
            setTimeout(() => next.focus(), 30);
          } else {
            WW.audio.sfx('wrong');
            api.feedback(`🤔 ${marks.filter(Boolean).length} of 4 steps are in the right place (green). What should you do <b>first</b> before watering?`, 'bad');
          }
        } }, '✔ Check my order');
        const footer = el('div', { class: 'row end', style: { marginTop: 'calc(var(--u) * 10)' } }, el('span', { class: 'fine spacer' }, 'Tip: tap two cards to swap them, or use the ▲▼ buttons.'), check);
        body.append(el('p', null, 'Put the steps in a sensible, water-wise order.'), list, footer);
        render();
      },
    });
  };

  /* ---------------- Mini-game: pipe puzzle ---------------- */
  function pipeSVG(mask, cracked) {
    const segs = [];
    const ends = { 1: [50, 0], 2: [100, 50], 4: [50, 100], 8: [0, 50] };
    for (const b of [1, 2, 4, 8]) if (mask & b) segs.push(ends[b]);
    const lines = (cls, w) => segs.map(([x, y]) => `<line class="${cls}" x1="50" y1="50" x2="${x}" y2="${y}" stroke-width="${w}" stroke-linecap="${cls === 'pipe-o' ? 'butt' : 'round'}"/>`).join('');
    let crack = '';
    if (cracked) crack = '<polyline points="38,34 50,46 42,54 58,66" fill="none" stroke="#5a2a10" stroke-width="5" stroke-linejoin="round"/><circle cx="64" cy="30" r="5" fill="#e5484d"/><circle cx="30" cy="68" r="4" fill="#e5484d"/>';
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${lines('pipe-o', 30)}${lines('pipe', 22)}${lines('pipe-hi', 7)}<circle class="pipe" cx="50" cy="50" r="15"/>${crack}</svg>`;
  }

  C1.pipePanel = function () {
    const pz = WW.logic.scramblePipes(WW.logic.pipePuzzle(), 7);
    pz.cells.forEach((c) => { c.base = c.mask; c.rot = 0; });
    if (window.WWDEBUG) window.WWDEBUG.pz = pz;
    let cursor = 0;
    let solved = false;
    return S.panel({
      kicker: 'PUZZLE 2 OF 2 · RAIN TO ROOTS',
      title: '🚰 Connect the rain tank to every veggie bed',
      wide: true,
      closeLabel: 'Leave the puzzle',
      build(body, api) {
        const grid = el('div', { class: 'pipe-grid', style: { gridTemplateColumns: `calc(var(--u) * 46) repeat(${pz.cols}, auto) calc(var(--u) * 52)` }, role: 'grid', 'aria-label': 'Pipe puzzle' });
        const btns = [];
        const beds = {};
        for (let r = 0; r < pz.rows; r++) {
          // left column: tank on row 0
          grid.appendChild(el('div', { style: { display: 'grid', placeItems: 'center', fontSize: 'calc(var(--u) * 30)' }, title: r === 0 ? 'Rain tank' : '' }, r === 0 ? '🛢️' : ''));
          for (let c = 0; c < pz.cols; c++) {
            const cell = pz.cells[r * pz.cols + c];
            const b = el('button', { class: 'pipe-cell' + (cell.fixed ? ' fixed' : ''), type: 'button', 'aria-label': cell.cracked ? `Cracked pipe at row ${r + 1}, column ${c + 1} (cannot turn)` : `Pipe at row ${r + 1}, column ${c + 1}. Press to turn.`, html: pipeSVG(cell.base, cell.cracked) });
            b.addEventListener('click', () => rotate(r * pz.cols + c));
            b.addEventListener('focus', () => { cursor = r * pz.cols + c; });
            btns.push(b);
            grid.appendChild(b);
          }
          const bed = el('div', { class: 'bed-end', style: { display: 'grid', placeItems: 'center', fontSize: 'calc(var(--u) * 28)', filter: 'grayscale(1)', transition: 'filter .4s, transform .4s' }, title: pz.targets.includes(r) ? 'Veggie bed' : '' }, pz.targets.includes(r) ? '🥕' : '');
          if (pz.targets.includes(r)) beds[r] = bed;
          grid.appendChild(bed);
        }
        const status = el('div', { class: 'callout', 'aria-live': 'polite' });
        const hintBtn = el('button', { class: 'btn small', type: 'button', onclick: () => hint() }, '💡 Hint');
        const side = el('div', { class: 'pipe-side' },
          el('p', { style: { margin: 0 } }, 'Tap a pipe to turn it. Make water flow from the 🛢️ rain tank to all three 🥕 veggie beds.'),
          el('div', { class: 'legend' }, el('i', { style: { background: '#3aa0e0' } }, ''), 'Water is flowing'),
          el('div', { class: 'legend' }, el('i', { style: { background: '#b07a4c', color: '#e5484d' } }, '✖'), 'Cracked pipe — don’t send water there!'),
          el('div', { class: 'legend' }, el('i', { style: { background: '#fff3cd' } }, '⚠'), 'No open pipe ends — every drop must reach a bed'),
          status,
          el('div', { class: 'row' }, hintBtn),
          el('p', { class: 'fine' }, 'Keyboard: arrow keys to move, Space or Enter to turn.'));
        body.appendChild(el('div', { class: 'pipe-wrap' }, grid, side));
        const style = el('style', null, `.pipe-cell .pipe{stroke:#9aa5b0;fill:#9aa5b0}.pipe-cell .pipe-o{stroke:#56636b}.pipe-cell .pipe-hi{stroke:#c8d0d6}.pipe-cell.wet .pipe{stroke:#3aa0e0;fill:#3aa0e0}.pipe-cell.wet .pipe-hi{stroke:#9fe0ff}.pipe-cell.fixed .pipe{stroke:#a07a5a;fill:#a07a5a}.pipe-cell.wet.fixed{background:#ffb3a8}.pipe-cell.hint{animation:pop .6s ease-in-out 3;outline:calc(var(--u)*4) solid #ffd23f}.pipe-cell.wet .pipe,.pipe-cell.wet .pipe-hi{transition:stroke .2s}`);
        body.appendChild(style);

        const update = () => {
          const f = WW.logic.pipeFlow(pz);
          btns.forEach((b, i) => {
            const cell = pz.cells[i];
            const d = f.depth.get(cell);
            b.style.setProperty('transition-delay', d != null ? d * 0.05 + 's' : '0s');
            b.classList.toggle('wet', d != null);
          });
          for (const r in beds) {
            const on = f.watered.includes(Number(r));
            beds[r].style.filter = on ? 'none' : 'grayscale(1)';
            beds[r].style.transform = on ? 'scale(1.25)' : 'none';
          }
          let msg = `🥕 Beds watered: <b>${f.watered.length} / ${pz.targets.length}</b>`;
          if (f.crackedHit) msg += '<br>💥 Water is reaching a cracked pipe — route around it!';
          else if (f.leaks.length && f.depth.size > 1) msg += '<br>⚠️ Water is spilling from an open pipe end.';
          status.innerHTML = msg;
          if (f.win && !solved) {
            solved = true;
            WW.audio.sfx('correct');
            WW.audio.sfx('grow');
            btns.forEach((b) => (b.disabled = true));
            hintBtn.disabled = true;
            api.feedback('✅ Brilliant! Rainwater now flows straight to the plant roots — no water sprayed onto the path, and no leaks.', 'sticky');
            const done = el('button', { class: 'btn primary big', type: 'button', onclick: () => api.done(true) }, '🌧 Turn on the drip lines →');
            side.appendChild(done);
            setTimeout(() => done.focus(), 30);
          }
        };
        const rotate = (i) => {
          const cell = pz.cells[i];
          if (cell.fixed || solved) { if (cell.fixed) WW.audio.sfx('thud'); return; }
          cell.rot++;
          cell.mask = WW.logic.rotMask(cell.base, cell.rot);
          btns[i].querySelector('svg').style.transform = `rotate(${cell.rot * 90}deg)`;
          btns[i].classList.remove('hint');
          WW.audio.sfx('rotate');
          update();
        };
        const hint = () => {
          const h = WW.logic.pipeHint(pz);
          if (!h) return;
          const i = pz.cells.indexOf(h);
          btns[i].classList.add('hint');
          btns[i].focus();
          WW.audio.sfx('sparkle');
          api.feedback('💡 Try turning the flashing pipe until it joins up with its neighbours.', 'good');
        };
        api.onKey = (a) => {
          const r = Math.floor(cursor / pz.cols), c = cursor % pz.cols;
          if (a === 'left' && c > 0) cursor--;
          else if (a === 'right' && c < pz.cols - 1) cursor++;
          else if (a === 'up' && r > 0) cursor -= pz.cols;
          else if (a === 'down' && r < pz.rows - 1) cursor += pz.cols;
          else if (a === 'action') rotate(cursor);
          btns[cursor].focus();
        };
        update();
      },
    });
  };
})();
