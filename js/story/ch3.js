/* WasteWise — Chapter 3: Waste Detective (geographical inquiry).
   Choose an inquiry question → read a compass map → walk to 3 real places in the school and audit bins
   (classify items) → build a bar chart of totals → interpret it → choose an action AND the evidence that
   justifies it → an imagined (clearly labelled) improvement appears around the school. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const el = U.el;
  const S = WW.script;
  const DR = WW.draw;
  const TS = 48;
  const C3 = (WW.ch3 = {});
  const D = () => WW.save.data;
  const W = () => WW.save.data.world;
  const SITE_OBJ = { canteen: 'cbin3', classrooms: 'rbin1', playground: 'pbin' };

  /* ---------------- hub hooks: audit sites ---------------- */
  C3.setupHub = function (sc) {
    for (const site of Object.keys(SITE_OBJ)) {
      sc.addInteract({ id: 'site_' + site, obj: SITE_OBJ[site], r: 64, promptH: 96,
        label: () => {
          const s = D();
          if (s.ch3.stage === 'audit' && s.ch3.sites.indexOf(site) === -1) return '🔎 Audit these bins';
          return WW.data.auditSites[site].name;
        },
        run: async () => {
          const s = D();
          if (s.ch3.stage === 'audit' && s.ch3.sites.indexOf(site) === -1) return C3.audit(sc, site);
          if (s.ch3.sites.indexOf(site) !== -1) return S.say('milo', `We already audited the ${WW.data.auditSites[site].name.toLowerCase()}. It’s all in the notebook!`, 'happy');
          if (site === 'canteen' && W().improvements.indexOf('binSigns') !== -1) return S.say('milo', 'Look — picture signs above the bins! Now everyone knows where things go.', 'excited');
          return S.line('ch3.site.locked');
        } });
    }
    if (W().improvements.indexOf('shareTable') !== -1) sc.addInteract({ id: 'sharetable', obj: 'sharetable', label: 'Share Table', run: () => S.say('milo', 'The Share Table! Unopened snacks and whole fruit go here so someone else can enjoy them.', 'happy') });
  };

  /* ---------------- Eco Lab scene ---------------- */
  const lab = WW.makeWorldScene({
    mapDef: WW.maps.lab,
    bg: '#2e4a5a',
    camTopPad: 60,
    setup(sc) {
      const ex = sc.map.extra;
      const sprout = sc.addNPC('sprout', 'sprout', ex.sprout.x, ex.sprout.y, { dir: 'down', emotion: 'happy' });
      sprout.pose = 'clipboard';
      sprout.hold = 'paper';
      sc.addInteract({ id: 'sprout', actor: sprout, r: 80, label: 'Talk to Professor Sprout', run: () => C3.talkSprout(sc) });
      sc.addInteract({ id: 'mapdesk', obj: 'mapdesk', r: 70, label: () => (D().ch3.stage === 'map' ? '🗺 Read the school map' : 'Map table'), run: () => C3.useMapDesk(sc) });
      sc.addInteract({ id: 'chartdesk', obj: 'chartdesk', r: 70, label: () => (D().ch3.stage === 'chart' ? '📊 Build the bar chart' : 'Chart desk'), run: () => C3.useChartDesk(sc) });
      sc.addInteract({ id: 'screen', x: 10 * TS, y: 2.6 * TS, r: 70, promptH: 40, label: 'Look at the data screen', run: () => S.say('sprout', D().ch3.chartValues ? 'There’s your bar chart, up on the big screen! Packaging is the tallest bar in our sample.' : 'The data screen will show our results once we build a chart.', 'happy') });
      sc.exits.push({ x0: ex.exit.c0 * TS, x1: (ex.exit.c1 + 1) * TS, y0: ex.exit.r * TS + 6, y1: 9999, run: async () => {
        WW.audio.sfx('door');
        const doors = WW.maps.hub.build().extra.doors;
        WW.engine.go('hub', { spawn: { x: doors.lab.x, y: doors.lab.y + 34 }, dir: 'down' });
      } });
      WW.story.refresh();
      if (D().ch3.stage === 'locked') { D().ch3.stage = 'enter'; WW.save.commit(); } // demo / teacher unlock
      const st = D().ch3.stage;
      if (st === 'enter') sc.runScript(() => C3.intro(sc));
      else if (st === 'plan') sc.runScript(() => C3.plan(sc));
    },
  });
  WW.engine.register('lab', lab);

  C3.talkSprout = async function (sc) {
    const st = D().ch3.stage;
    if (st === 'enter') return C3.intro(sc);
    if (st === 'map') return S.say('sprout', 'The map table is on the left. North is always at the top of our map!', 'happy');
    if (st === 'audit') return S.say('sprout', `Visit all three audit sites around the school. You’ve done ${D().ch3.sites.length} of 3. Check your notebook if you forget where they are.`, 'happy');
    if (st === 'chart') return S.say('sprout', 'Bring your data to the chart desk on the right and build our bar chart!', 'excited');
    if (st === 'plan') return C3.plan(sc);
    return S.say('sprout', 'Ask a question, collect evidence, show it, explain it, act on it. That’s geography!', 'excited');
  };

  C3.intro = async function (sc) {
    await S.wait(0.3);
    await S.lines(['ch3.sprout.01', 'ch3.sprout.02', 'ch3.sprout.03']);
    let ok = false;
    while (!ok) {
      const pick = await S.askLine('ch3.sprout.q', WW.data.inquiryQs.map((q) => ({ id: q.id, icon: q.icon, text: q.text })));
      if (!pick) return;
      ok = WW.data.inquiryQs.find((q) => q.id === pick).ok;
      if (!ok) { WW.audio.sfx('wrong'); await S.line('ch3.sprout.qbad'); }
    }
    WW.audio.sfx('correct');
    WW.save.logChoice(3, 'question', 'Chose a testable inquiry question', 'best');
    await S.line('ch3.sprout.qgood');
    D().ch3.stage = 'map';
    WW.save.commit();
    WW.story.refresh();
  };

  /* ---------------- Map reading ---------------- */
  const MAP_SPOTS = [
    { id: 'A', c: 30.5, r: 17.2, label: 'A' },
    { id: 'B', c: 35.8, r: 6.4, label: 'B' },
    { id: 'C', c: 18.5, r: 24.4, label: 'C' },
    { id: 'D', c: 6, r: 12.5, label: 'D' },
    { id: 'E', c: 20, r: 4.2, label: 'E' },
  ];
  /** Draw a simplified top-down school map (shared with the final assessment style). */
  C3.drawSchoolMap = function (ctx, w, h) {
    const map = new WW.TileMap(WW.maps.hub);
    const k = w / map.W;
    ctx.save();
    ctx.scale(k, k);
    const col = { '.': '#a8dc8c', h: '#5aa96a', f: '#a8dc8c', g: '#f0dcae', '=': '#f0dcae', ':': '#f4e6c6', d: '#c9a072', s: '#f7e09b', p: '#8fd8c8', '~': '#6cc7e8' };
    for (let r = 0; r < map.rows; r++) for (let c = 0; c < map.cols; c++) {
      ctx.fillStyle = col[map.ground[r][c]] || '#a8dc8c';
      ctx.fillRect(c * TS, r * TS, TS + 1, TS + 1);
    }
    const label = (o, text, fill) => {
      DR.rr(ctx, o.x + 4, o.y + 4, o.pw - 8, o.ph - 8, 16, fill, '#2d5a45', 8);
      DR.text(ctx, text, o.x + o.pw / 2, o.y + o.ph / 2, 52, '#23443a');
    };
    for (const o of map.objects) {
      if (o.type === 'building') label(o, o.label.split(' ').slice(-1)[0], o.roof);
      if (o.type === 'tree' || o.type === 'bigtree') DR.circle(ctx, o.x + o.pw / 2, o.y + o.ph / 2, o.type === 'bigtree' ? 70 : 34, '#4bab5f', '#2e7a45', 6);
      if (o.type === 'bed') DR.rr(ctx, o.x, o.y, o.pw, o.ph, 8, '#7a5136');
      if (o.type === 'bin') DR.rr(ctx, o.x + 8, o.y + 8, o.pw - 16, o.ph - 16, 6, WW.worldArt.BIN[o.kind].lid, '#26303a', 4);
    }
    DR.text(ctx, 'GARDEN', 6.5 * TS, 15 * TS, 56, '#2f6a3a');
    DR.text(ctx, 'COURTYARD', 20 * TS, 15.6 * TS, 50, '#7a6a3a');
    DR.text(ctx, 'PLAYGROUND', 20 * TS, 26.6 * TS, 50, '#2f6a7a');
    ctx.restore();
    // compass (top-left corner, small)
    const cx = 30, cy = 32;
    DR.circle(ctx, cx, cy, 22, 'rgba(255,253,242,.95)', '#2d5a45', 2.5);
    DR.poly(ctx, [cx, cy - 17, cx - 5, cy, cx + 5, cy], '#e5484d', '#2d5a45', 1.2);
    DR.poly(ctx, [cx, cy + 17, cx - 5, cy, cx + 5, cy], '#ffffff', '#2d5a45', 1.2);
    DR.text(ctx, 'N', cx + 12, cy - 13, 11, '#e5484d');
  };

  C3.useMapDesk = async function (sc) {
    const s = D();
    if (s.ch3.stage !== 'map') {
      if (s.ch3.stage === 'enter') return S.say('milo', 'Let’s talk to Professor Sprout first!', 'thinking');
      return C3.mapPanel(true);
    }
    await S.line('ch3.sprout.map');
    const ok = await C3.mapPanel(false);
    if (!ok) return;
    s.ch3.stage = 'audit';
    WW.save.commit();
    S.points(20, 'Map reader');
    await S.line('ch3.milo.sites');
    WW.story.refresh();
  };

  C3.mapPanel = function (viewOnly) {
    const clues = WW.data.mapClues;
    let i = 0;
    let firstTries = 0, tries = 0;
    return S.panel({
      kicker: 'MAP SKILLS · SUNNY SCHOOL FROM ABOVE',
      title: viewOnly ? '🗺 Sunny School map' : '🗺 Find the three audit sites',
      wide: true,
      closeLabel: 'Close the map',
      build(body, api) {
        const cw = 560, ch = 392;
        const cv = el('canvas', { width: cw * 2, height: ch * 2, 'aria-label': 'Map of Sunny School with north at the top. Garden in the west, hall in the north, classrooms north-east, canteen east, Eco Lab south-east, playground south.' });
        const ctx = cv.getContext('2d');
        ctx.scale(2, 2);
        C3.drawSchoolMap(ctx, cw, ch);
        const box = el('div', { class: 'mapbox' }, cv);
        const spots = {};
        for (const sp of MAP_SPOTS) {
          const b = el('button', { class: 'map-spot', type: 'button', style: { left: (sp.c / 40) * 100 + '%', top: (sp.r / 28) * 100 + '%' }, 'aria-label': 'Map marker ' + sp.label }, sp.label);
          b.addEventListener('click', () => pick(sp.id, b));
          spots[sp.id] = b;
          if (viewOnly) b.disabled = true;
          box.appendChild(b);
        }
        const clueBox = el('div', { class: 'callout yellow', 'aria-live': 'polite' });
        const side = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'calc(var(--u) * 8)' } },
          el('p', { style: { margin: 0 } }, viewOnly ? 'Our three audit sites are marked A, B and C.' : 'Read each clue, then tap the matching letter on the map.'),
          clueBox,
          el('p', { class: 'fine' }, 'Tip: North is at the TOP, south at the bottom, east to the RIGHT, west to the LEFT.'));
        body.appendChild(el('div', { style: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'calc(var(--u) * 14)', alignItems: 'start' } }, box, side));
        const show = () => {
          if (viewOnly) { clueBox.innerHTML = clues.map((c) => `<div>📍 <b>${c.answer}</b>: ${U.esc(c.text)}</div>`).join(''); return; }
          clueBox.innerHTML = `<b>Clue ${i + 1} of 3</b><br>${U.esc(clues[i].text)}`;
          tries = 0;
        };
        const pick = (id, b) => {
          if (viewOnly) return;
          tries++;
          if (id === clues[i].answer) {
            if (tries === 1) firstTries++;
            WW.audio.sfx('correct');
            b.classList.add('done');
            b.textContent = '✓ ' + id;
            b.disabled = true;
            api.feedback(`✅ Yes! Site ${i + 1} is at <b>${id}</b>.`, 'good');
            i++;
            if (i >= clues.length) {
              clueBox.innerHTML = '🎉 All three sites found! Now let’s go and count the rubbish.';
              WW.save.data.stats.puzzles.map = { firstTries, of: 3 };
              const go = el('button', { class: 'btn primary', type: 'button', onclick: () => api.done(true) }, 'Mark them on my notebook →');
              side.appendChild(go);
              setTimeout(() => go.focus(), 30);
            } else show();
          } else {
            WW.audio.sfx('wrong');
            b.classList.remove('wrong');
            void b.offsetWidth;
            b.classList.add('wrong');
            const want = clues[i].text.match(/NORTH-EAST|NORTH|SOUTH|EAST|WEST/);
            api.feedback(`🤔 Not that one. Look for the place that is <b>${want ? want[0].toLowerCase() : ''}</b> — use the compass in the corner.`, 'bad');
          }
        };
        show();
      },
    });
  };

  /* ---------------- Audit tally (at each site in the hub) ---------------- */
  C3.audit = async function (sc, site) {
    const s = D();
    const res = await C3.auditPanel(site);
    if (!res) return;
    if (s.ch3.sites.indexOf(site) === -1) s.ch3.sites.push(site);
    WW.save.commit();
    S.points(15, 'Audit recorded', { x: sc.player.x, y: sc.player.y - 90 });
    if (s.ch3.sites.length >= 3) {
      s.ch3.stage = 'chart';
      WW.save.commit();
      await S.line('ch3.milo.allSites');
    } else await S.line('ch3.milo.siteDone');
    WW.story.refresh();
  };

  C3.auditPanel = function (site) {
    const data = WW.data.auditSites[site];
    const cats = WW.data.categories;
    const items = data.items.map((id, i) => ({ id, i, cat: WW.data.itemCategory[id], done: false }));
    const counts = { food: 0, packaging: 0, paper: 0, other: 0 };
    let selected = null;
    const rnd = U.rng(site.length * 97 + 3);
    return S.panel({
      kicker: 'AUDIT · ' + data.name.toUpperCase() + ' (FICTIONAL SAMPLE)',
      title: '🧤 Sort and count the rubbish',
      wide: true,
      closeLabel: 'Stop the audit',
      build(body, api) {
        body.appendChild(el('p', { style: { margin: 0 } }, 'Gloves on! Tap an item, then tap the type of waste it is. (In real life, only adults handle bins — this is a pretend sample.)'));
        const tarp = el('div', { class: 'tarp', role: 'group', 'aria-label': 'Rubbish spread on a tarp' });
        const btns = [];
        items.forEach((it, k) => {
          const x = 4 + (k % 4) * 24 + rnd() * 8, y = 8 + Math.floor(k / 4) * 46 + rnd() * 10;
          const b = el('button', { class: 'tarp-item', type: 'button', style: { left: x + '%', top: y + '%', transform: `rotate(${(rnd() - 0.5) * 30}deg)` }, 'aria-label': WW.data.itemNames[it.id], title: WW.data.itemNames[it.id], html: WW.items.img(it.id, 52, WW.data.itemNames[it.id]) + `<span class="tarp-label">${U.esc(WW.data.itemNames[it.id])}</span>` });
          b.addEventListener('click', () => {
            selected = it;
            btns.forEach((x) => x.classList.toggle('sel', x === b));
            WW.audio.sfx('pop');
            api.feedback(`Selected: <b>${U.esc(WW.data.itemNames[it.id])}</b>. Which type of waste is it?`, 'good');
          });
          btns.push(b);
          tarp.appendChild(b);
        });
        const baskets = el('div', { class: 'baskets' });
        const bnodes = {};
        cats.forEach((c, k) => {
          const b = el('button', { class: 'basket', type: 'button', style: { borderColor: c.color } }, el('span', { style: { fontSize: 'calc(var(--u) * 22)' } }, c.icon), el('span', null, `${k + 1}. ${c.name}`), el('b', null, '0'));
          b.addEventListener('click', () => drop(c.id));
          bnodes[c.id] = b;
          baskets.appendChild(b);
        });
        body.append(tarp, baskets);
        const why = { food: 'It’s left-over food.', packaging: 'It wrapped or held food or drink.', paper: 'It’s made of paper or cardboard.', other: 'It isn’t food, packaging or paper.' };
        const drop = (cat) => {
          if (!selected) { api.feedback('👆 First tap an item on the tarp.', 'bad'); return; }
          const it = selected;
          if (it.cat === cat) {
            it.done = true;
            counts[cat]++;
            bnodes[cat].querySelector('b').textContent = counts[cat];
            bnodes[cat].classList.remove('flash');
            void bnodes[cat].offsetWidth;
            bnodes[cat].classList.add('flash');
            const b = btns[it.i];
            b.style.opacity = '0';
            b.style.transform += ' scale(.3)';
            b.disabled = true;
            WW.audio.sfx('pickup');
            selected = null;
            api.feedback(`✅ ${U.esc(WW.data.itemNames[it.id])} → <b>${cats.find((c) => c.id === cat).name}</b>. ${why[cat]}`, 'good');
            if (items.every((x) => x.done)) finish();
          } else {
            WW.audio.sfx('wrong');
            api.feedback(`🤔 Hmm, is the ${U.esc(WW.data.itemNames[it.id].toLowerCase())} really ${cats.find((c) => c.id === cat).name.toLowerCase()}? Think about what it’s made of and what it was used for.`, 'bad');
          }
        };
        api.onKey = (a) => { const k = { c1: 'food', c2: 'packaging', c3: 'paper', c4: 'other' }[a]; if (k) drop(k); };
        const finish = () => {
          WW.audio.sfx('correct');
          const summary = cats.map((c) => `${c.icon} ${c.name}: <b>${counts[c.id]}</b>`).join(' · ');
          api.feedback(`🎉 Audit complete! ${summary}`, 'sticky');
          const b = el('button', { class: 'btn primary', type: 'button', onclick: () => api.done(counts) }, '📓 Record in notebook');
          body.appendChild(el('div', { class: 'row end', style: { marginTop: 'calc(var(--u) * 8)' } }, b));
          setTimeout(() => b.focus(), 30);
        };
      },
    });
  };

  /* ---------------- Chart builder ---------------- */
  C3.useChartDesk = async function (sc) {
    const s = D();
    if (s.ch3.stage !== 'chart') {
      if (s.ch3.chartValues) return S.say('sprout', 'Our finished chart is on the big screen. Packaging is the tallest bar!', 'happy');
      return S.say('milo', s.ch3.stage === 'audit' ? 'We need our audit data first — let’s visit the three sites around the school.' : 'We’ll use this desk soon!', 'thinking');
    }
    await S.line('ch3.sprout.chart');
    const ok = await C3.chartPanel();
    if (!ok) return;
    s.ch3.stage = 'plan';
    WW.save.commit();
    S.points(30, 'Chart champion');
    WW.story.refresh();
    await C3.plan(sc);
  };

  C3.chartPanel = function () {
    const cats = WW.data.categories;
    const t = WW.logic.auditTotals(WW.data.auditSites, WW.data.itemCategory, cats.map((c) => c.id));
    const vals = { food: 0, packaging: 0, paper: 0, other: 0 };
    const MAX = 10;
    return S.panel({
      kicker: 'REPRESENT THE DATA',
      title: '📊 Build a bar chart of our totals',
      wide: true,
      closeLabel: 'Leave the chart',
      build(body, api) {
        // data table (from the notebook)
        const rows = Object.keys(WW.data.auditSites).map((k) => `<tr><td>${U.esc(WW.data.auditSites[k].name)}</td>${cats.map((c) => `<td>${t.bySite[k][c.id]}</td>`).join('')}</tr>`).join('');
        const table = el('div', { html: `<table class="data-table"><thead><tr><th>Site</th>${cats.map((c) => `<th>${c.icon} ${c.name}</th>`).join('')}</tr></thead><tbody>${rows}<tr class="total"><td><b>TOTAL</b></td>${cats.map(() => '<td>?</td>').join('')}</tr></tbody></table>` });
        const chart = el('div', { class: 'chart' });
        const yax = el('div', { class: 'chart-y' }, ...Array.from({ length: MAX + 1 }, (_, i) => el('span', null, i % 2 === 0 ? String(i) : '')));
        const bars = el('div', { class: 'chart-bars' });
        const cols = {};
        for (const c of cats) {
          const valEl = el('div', { class: 'chart-val' }, '0');
          const bar = el('div', { class: 'chart-bar', style: { height: '0%', background: c.color } });
          const col = el('div', { class: 'chart-col' }, valEl, bar);
          cols[c.id] = { col, bar, valEl };
          bars.appendChild(col);
        }
        chart.append(yax, bars);
        const labels = el('div', { class: 'chart-labels' });
        for (const c of cats) {
          const minus = el('button', { type: 'button', 'aria-label': 'Lower ' + c.name + ' bar', onclick: () => set(c.id, vals[c.id] - 1) }, '−');
          const plus = el('button', { type: 'button', 'aria-label': 'Raise ' + c.name + ' bar', onclick: () => set(c.id, vals[c.id] + 1) }, '+');
          labels.appendChild(el('div', null, `${c.icon} ${c.name}`, el('div', { class: 'chart-ctrl' }, minus, plus)));
        }
        const set = (id, v) => {
          vals[id] = U.clamp(v, 0, MAX);
          cols[id].bar.style.height = (vals[id] / MAX) * 100 + '%';
          cols[id].valEl.textContent = vals[id];
          cols[id].col.classList.remove('ok');
          WW.audio.sfx('rotate');
        };
        const check = el('button', { class: 'btn primary', type: 'button', onclick: () => {
          const wrong = cats.filter((c) => vals[c.id] !== t.totals[c.id]);
          cats.forEach((c) => cols[c.id].col.classList.toggle('ok', vals[c.id] === t.totals[c.id]));
          if (!wrong.length) {
            WW.audio.sfx('correct');
            check.remove();
            D().ch3.chartValues = Object.assign({}, vals);
            WW.save.commit();
            api.feedback('✅ Perfect chart! Each bar shows the TOTAL from all three sites.', 'good');
            ask();
          } else {
            WW.audio.sfx('wrong');
            const c = wrong[0];
            api.feedback(`🤔 ${wrong.length} bar${wrong.length > 1 ? 's are' : ' is'} not right yet (green ones are correct). Try <b>${c.name}</b>: add up the ${c.name.toLowerCase()} numbers from all three sites.`, 'bad');
          }
        } }, '✔ Check my chart');
        const qArea = el('div');
        body.appendChild(el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'calc(var(--u) * 14)' } },
          el('div', null, el('p', { style: { margin: '0 0 calc(var(--u) * 6)' } }, 'Use the numbers from your audits (fictional sample data).'), table, qArea),
          el('div', null, chart, labels, el('div', { class: 'row end', style: { marginTop: 'calc(var(--u) * 8)' } }, check))));
        const questions = [
          { q: 'Which type of waste is the BIGGEST overall?', options: cats.map((c) => c.name), a: 1 },
          { q: 'Which site had the MOST paper?', options: Object.keys(WW.data.auditSites).map((k) => WW.data.auditSites[k].name), a: 1 },
        ];
        let qi = 0;
        const ask = () => {
          qArea.innerHTML = '';
          const q = questions[qi];
          const grid = el('div', { class: 'answer-grid cols2' });
          q.options.forEach((o, k) => {
            const b = el('button', { class: 'answer', type: 'button' }, o);
            b.addEventListener('click', () => {
              if (k === q.a) {
                if (b.dataset.done) return;
                grid.querySelectorAll('button').forEach((x) => { x.disabled = true; x.dataset.done = '1'; });
                b.classList.add('right');
                WW.audio.sfx('correct');
                qi++;
                if (qi < questions.length) WW.engine.after(0.5, true).then(ask);
                else {
                  api.feedback('✅ Great reading! Packaging is the biggest type of waste, and most paper came from the classrooms.', 'sticky');
                  const go = el('button', { class: 'btn primary', type: 'button', onclick: () => api.done(true) }, 'Show Professor Sprout →');
                  qArea.appendChild(el('div', { class: 'row end', style: { marginTop: 'calc(var(--u) * 8)' } }, go));
                  setTimeout(() => go.focus(), 30);
                }
              } else {
                b.classList.add('wrong');
                b.disabled = true;
                WW.audio.sfx('wrong');
                api.feedback(qi === 0 ? '🤔 Look for the TALLEST bar.' : '🤔 Look at the Paper column in the table.', 'bad');
              }
            });
            grid.appendChild(b);
          });
          qArea.append(el('p', { style: { margin: 'calc(var(--u) * 10) 0 calc(var(--u) * 4)' } }, el('b', null, q.q)), grid);
        };
      },
    });
  };

  /* ---------------- Plan + justification + consequence ---------------- */
  C3.plan = async function (sc) {
    const s = D();
    await S.line('ch3.sprout.plan');
    let plan = null;
    while (!plan) {
      const pick = await S.ask('sprout', 'Which change fits our evidence best?', WW.data.plans.map((p) => ({ id: p.id, icon: p.icon, text: p.text })), 'thinking');
      if (!pick) return;
      const p = WW.data.plans.find((x) => x.id === pick);
      if (!p.fits) {
        WW.audio.sfx('wrong');
        WW.save.logChoice(3, 'plan', 'Suggested rainbow bins (no evidence)', 'retry');
        await S.line('ch3.sprout.badplan');
        continue;
      }
      // justify with evidence
      let reasoned = false;
      while (!reasoned) {
        const r = await S.ask('sprout', `“${p.text}” — good! Now, WHICH EVIDENCE supports this plan?`, U.shuffle(p.reasons, U.rng(7)).map((x) => ({ id: x.id, text: x.text })), 'thinking');
        if (!r) return;
        const rr = p.reasons.find((x) => x.id === r);
        if (rr.ok) reasoned = true;
        else {
          WW.audio.sfx('wrong');
          await S.say('sprout', 'Hmm, check the chart and the table again. Which fact really points to this plan?', 'thinking');
        }
      }
      plan = p;
    }
    WW.audio.sfx('correct');
    s.ch3.plan = plan.id;
    WW.save.logChoice(3, 'plan', plan.text + ' (justified with evidence)', 'best');
    if (W().improvements.indexOf(plan.id) === -1) W().improvements.push(plan.id);
    s.ch3.stage = 'consequence';
    WW.save.commit();
    S.points(30, 'Evidence-based plan');
    await S.line('ch3.n.later');
    const doors = WW.maps.hub.build().extra.doors;
    WW.engine.go('hub', { spawn: { x: doors.lab.x, y: doors.lab.y + 40 }, dir: 'down', arrive: (hub) => C3.consequence(hub) });
  };

  C3.consequence = async function (hub) {
    const s = D();
    const w = W();
    const sprout = hub.addNPC('sproutC', 'sprout', hub.player.x + 60, hub.player.y - 10, { dir: 'down', emotion: 'excited' });
    sprout.who = 'sprout';
    hub.npcs.sprout = sprout;
    await S.wait(0.5);
    // litter disappears piece by piece
    const before = w.litter;
    for (let i = before - 1; i >= 1; i--) {
      const o = hub.map.get('litter' + i);
      if (o) { WW.fx.spawn('sparkle', o.x + 24, o.y + 20); WW.audio.sfx('pop'); }
      w.litter = i;
      hub.refreshObjects();
      await S.wait(0.18);
    }
    WW.save.commit();
    // show the improvement
    const focus = { nudeFood: { x: 31 * TS, y: 12 * TS }, compost: { x: 36.5 * TS, y: 15.5 * TS }, paperReuse: { x: 34 * TS, y: 6 * TS } }[s.ch3.plan];
    hub.refreshObjects();
    if (focus) {
      S.cam(focus.x, focus.y);
      await S.wait(0.6);
      WW.fx.spawn('confetti', WW.engine.W / 2, WW.engine.H / 2, { screen: true });
      WW.audio.sfx('unlock');
      await S.wait(1.2);
      S.cam(null);
    }
    WW.ui.toast('🔮 Imagined result: an example of how evidence can guide a school change', 'info', 4200);
    await S.line('ch3.sprout.after');
    await S.learnCard(WW.data.ch3Learn, 'CHAPTER 3 · WHY IT MATTERS');
    await S.chapterCheck(3);
    s.done[2] = true;
    s.ch3.stage = 'done';
    WW.save.commit();
    S.points(50, 'Chapter 3 complete');
    await S.chapterComplete(3, WW.data.ch3Learn, 'You used real geography skills: questions, maps, data and evidence. The Assembly Hall is now open for the final challenge!');
    WW.audio.sfx('unlock');
    WW.ui.toast('🔓 Assembly Hall unlocked!', 'points', 3500);
    await S.line('ch3.sprout.final');
    hub.removeNPC('sproutC');
    delete hub.npcs.sprout;
    WW.story.onWorldChanged();
  };
})();
