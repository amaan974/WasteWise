/* WasteWise — automated end-to-end playthrough (runs in tests/smoke.html).
   Uses real DOM clicks / key presses plus the ?debug=1 helpers (WWDEBUG) to step the game
   deterministically, and asserts that each part of the experience works. */
(function () {
  'use strict';
  const frame = document.getElementById('game');
  const stepsEl = document.getElementById('steps');
  const summary = document.getElementById('summary');
  let pass = 0, fail = 0;

  function log(ok, text) {
    const li = document.createElement('li');
    li.className = ok === null ? 'info' : ok ? 'ok' : 'bad';
    li.textContent = (ok === null ? 'ℹ ' : ok ? '✓ ' : '✗ ') + text;
    stepsEl.appendChild(li);
    li.scrollIntoView({ block: 'nearest' });
    if (ok === true) pass++;
    if (ok === false) fail++;
  }
  function check(cond, text) { log(!!cond, text); return !!cond; }

  function load(url) {
    return new Promise((res) => {
      frame.onload = () => setTimeout(res, 300);
      frame.src = url;
    });
  }

  async function run() {
    stepsEl.innerHTML = '';
    pass = fail = 0;
    summary.textContent = 'Running…';
    const t0 = performance.now();
    try { localStorage.removeItem('wastewise-save-v2'); } catch (e) {}
    await load('../index.html?debug=1&scene=hub');
    const W = frame.contentWindow;
    const WW = W.WW, d = W.WWDEBUG;
    const doc = frame.contentDocument;
    const top = () => [...doc.querySelectorAll('.panel-backdrop:not(.out) .panel')].pop();
    const btn = (re) => top() && [...top().querySelectorAll('button')].find((b) => re.test(b.textContent));
    W.WW.audio.settings.voiceMode = 'off';

    /* ---------- intro ---------- */
    const obj = () => (WW.story.objective && WW.story.objective.text) || '';
    await d.run(1.2);
    check(WW.engine.sceneName === 'hub', 'Hub scene loads from a fresh save');
    check(await d.until(() => /sparkly star/.test(obj()) && !WW.ui.dialogue.open), 'Intro tutorial asks the player to walk');
    const y0 = d.player().y;
    await d.hold('up', 2.6);
    check(d.player().y < y0 - 300, 'Keyboard movement works (held ↑)');
    check(await d.until(() => WW.save.data.introDone && !WW.engine.scene.busy), 'Intro complete');
    check(/Maple/.test(obj()), 'Objective: talk to Principal Maple');

    /* ---------- Chapter 1 ---------- */
    check(!WW.save.isUnlocked(2), 'Canteen (Chapter 2) is locked before Chapter 1');
    await d.use('maple');
    check(await d.until(d.hasChoices), 'Maple conversation offers a choice');
    await d.choose(1);
    check(await d.until(() => WW.save.data.ch1.stage === 'clues' && !WW.engine.scene.busy), 'Investigation starts (find 4 clues)');
    const answerClue = async () => {
      const p = top();
      const right = [...p.querySelectorAll('.answer')].find((b) => /^\S+\s*(Water$|Electricity \(energy\)|The water lands|New bottles)/.test(b.textContent.trim()) || b.textContent.trim().endsWith('Water'));
      const wrong = [...p.querySelectorAll('.answer')].find((b) => b !== right);
      wrong.click(); await d.run(0.1);
      const fbWrong = p.querySelector('.panel-feedback').textContent;
      right.click(); await d.run(0.1);
      [...p.querySelectorAll('.btn.primary')].pop().click();
      await d.run(0.4);
      return fbWrong;
    };
    for (const id of ['clue_tap', 'clue_sprinkler', 'clue_light', 'clue_bottles']) {
      await d.use(id);
      await d.until(() => !!top());
      const fb = await answerClue();
      check(fb.length > 10, `Clue ${id.slice(5)}: wrong answer gives a gentle hint`);
      await d.until(() => !WW.engine.scene.busy);
    }
    check(WW.save.data.ch1.clues.length === 4 && !WW.save.data.world.shedLightOn, 'All 4 clues recorded; shed light switched off (visible change)');
    await d.use('maple');
    await d.until(d.hasChoices);
    await d.choose(2); // ignore → consequence
    check(await d.until(() => WW.save.data.world.gardenHealth < 15, 15), '“Leave it” shows a consequence: the garden wilts');
    check(await d.until(() => d.hasChoices() && Math.round(WW.save.data.world.gardenHealth) === 30), 'Time rewinds and the choice is offered again');
    await d.choose(1); // unsafe DIY
    check(await d.until(() => /dangerous/.test(WW.ui.dialogue.plain || '')), 'Unsafe “fix it ourselves” choice is redirected for safety');
    await d.until(d.hasChoices);
    await d.choose(0);
    check(await d.until(() => WW.save.data.ch1.stage === 'fixWater' && !WW.engine.scene.busy), 'Reporting to an adult fixes the leak');
    check(WW.save.data.world.leakFixed, 'Leak visibly fixed');
    await d.use('clue_sprinkler');
    await d.until(() => !!top());
    // sequencing: swap 0<->2 and 1<->3
    let cards = () => [...top().querySelectorAll('.seq-card')];
    cards()[0].click(); await d.run(0.05); cards()[2].click(); await d.run(0.05);
    cards()[1].click(); await d.run(0.05); cards()[3].click(); await d.run(0.05);
    btn(/Check/).click(); await d.run(0.2);
    check(!!btn(/fix the pipes/), 'Sequencing puzzle solved');
    btn(/fix the pipes/).click(); await d.run(0.4);
    await d.until(() => !!top() && top().querySelector('.pipe-cell'));
    const pz = d.pz;
    const cells = [...top().querySelectorAll('.pipe-cell')];
    for (let i = 0; i < pz.cells.length; i++) { const c = pz.cells[i]; if (c.fixed) continue; let k = 0; while (c.mask !== c.solMask && k++ < 4) { cells[i].click(); await d.run(0.01); } }
    await d.run(0.3);
    check(!!btn(/drip lines/), 'Pipe puzzle solved by clicking pieces (3/3 beds watered)');
    btn(/drip lines/).click(); await d.run(0.4);
    await d.until(() => !!btn(/Got it/), 40);
    check(WW.save.data.world.tank > 80 && WW.save.data.world.gardenHealth > 95, 'Rain refills the tank and the garden blooms');
    btn(/Got it/).click(); await d.run(0.4);
    for (let i = 0; i < 3; i++) { const p = top(); p.querySelectorAll('.answer')[WW.data.checks[1][i].a].click(); await d.run(0.1); [...p.querySelectorAll('.btn.primary')].pop().click(); await d.run(0.3); }
    check(btn(/Continue the adventure/), 'Chapter 1 complete screen');
    btn(/Continue the adventure/).click();
    await d.until(() => !WW.engine.scene.busy);
    check(WW.save.data.done[0] && WW.save.isUnlocked(2), 'Chapter 2 unlocks after Chapter 1');

    /* ---------- Chapter 2 ---------- */
    await d.use('door_canteen'); await d.run(1.6);
    check(WW.engine.sceneName === 'canteen', 'Enter the canteen');
    check(await d.until(() => !!top() && top().querySelector('.lunch-card')), 'Lunch decision appears');
    top().querySelectorAll('.lunch-card')[0].click(); await d.run(0.4);
    check(await d.until(() => WW.save.data.ch2.stage === 'maze' && !WW.engine.scene.busy), 'Nude-food lunch chosen; maze unlocked');
    await d.use('backdoor'); await d.run(1.6);
    check(WW.engine.sceneName === 'maze', 'Enter the waste maze');
    await d.until(() => !WW.engine.scene.busy);
    let sc = WW.engine.scene;
    const p0 = d.player();
    await d.hold('down', 2.5);
    check(!sc.map.boxBlocked(sc.player.x, sc.player.y, 11, 8), 'Walls block movement (player never inside a wall)');
    void p0;
    const bins = { compost: 'st_compost', recycle: 'st_recycle', reuse: 'st_reuse', landfill: 'st_landfill' };
    let wrongTried = false, guard = 0;
    while (guard++ < 20) {
      const it = sc.interacts.find((i) => i.id.startsWith('item_') && i.enabled());
      if (!it) break;
      await d.use(it.id); await d.run(0.2);
      const c = sc.player.carry;
      if (!c) { check(false, 'Picked up an item'); break; }
      if (!wrongTried && WW.data.mazeItems[c].bin === 'compost') {
        wrongTried = true;
        await d.use('st_landfill'); await d.run(0.4);
        check(/methane/i.test(WW.ui.dialogue.plain) && sc.player.carry === c, 'Food → landfill is rejected with the methane explanation (item kept)');
        await d.until(() => !WW.engine.scene.busy);
      }
      await d.use(bins[WW.data.mazeItems[c].bin]);
      await d.until(() => !WW.engine.scene.busy || !!top());
      if (WW.engine.sceneName !== 'maze' || top()) break;
    }
    const m = WW.save.data.stats.maze;
    check(m.completed && m.items === 9, `Maze completed: ${m.items} items, ${m.firstTry} right first try, ${m.landfill} to landfill`);
    btn(/Back to Chef Sunny/).click(); await d.run(1.8);
    check(WW.engine.sceneName === 'canteen' && WW.save.data.world.canteenClean, 'Back in a clean canteen (visible consequence)');
    await d.until(d.hasChoices);
    await d.choose(2);
    await d.until(() => !!btn(/Got it/));
    btn(/Got it/).click(); await d.run(0.4);
    for (let i = 0; i < 3; i++) { const p = top(); p.querySelectorAll('.answer')[WW.data.checks[2][i].a].click(); await d.run(0.1); [...p.querySelectorAll('.btn.primary')].pop().click(); await d.run(0.3); }
    btn(/Continue the adventure/).click();
    await d.until(() => !WW.engine.scene.busy);
    check(WW.save.data.done[1] && WW.save.data.world.improvements.includes('nudeFood'), 'Chapter 2 complete; chosen improvement saved');
    await d.use('door_canteen'); await d.run(1.6);
    await d.teleport(10 * 48, 10.6 * 48); await d.hold('down', 0.6); await d.run(1.6);
    check(WW.engine.sceneName === 'hub', 'Walk out of the canteen back to school');

    /* ---------- Chapter 3 ---------- */
    sc = WW.engine.scene;
    await d.teleport(28 * 48, 13.5 * 48); await d.run(0.3);
    await d.hold('down', 0.4);
    await d.use('door_lab'); await d.run(1.6);
    check(WW.engine.sceneName === 'lab', 'Enter the Eco Lab');
    await d.until(d.hasChoices);
    await d.choose(1);
    await d.until(d.hasChoices);
    await d.choose(0);
    check(await d.until(() => WW.save.data.ch3.stage === 'map' && !WW.engine.scene.busy), 'Testable inquiry question chosen (fun question rejected)');
    await d.use('mapdesk');
    await d.until(() => !!top() && top().querySelector('.map-spot'));
    for (const L of ['A', 'B', 'C']) { [...top().querySelectorAll('.map-spot')].find((b) => b.textContent.trim().endsWith(L)).click(); await d.run(0.3); }
    btn(/notebook/).click(); await d.run(0.4);
    check(await d.until(() => WW.save.data.ch3.stage === 'audit' && !WW.engine.scene.busy), 'Map reading complete (compass directions)');
    await d.teleport(10 * 48, 10.9 * 48); await d.hold('down', 0.6); await d.run(1.6);
    check(WW.engine.sceneName === 'hub', 'Walk out of the lab back to school');
    const catIdx = { food: 0, packaging: 1, paper: 2, other: 3 };
    for (const site of ['site_canteen', 'site_classrooms', 'site_playground']) {
      await d.use(site);
      await d.until(() => !!top() && top().querySelector('.tarp-item'));
      const p = top();
      for (const b of [...p.querySelectorAll('.tarp-item')]) {
        const name = b.getAttribute('aria-label');
        const id = Object.keys(WW.data.itemNames).find((k) => WW.data.itemNames[k] === name);
        b.click(); await d.run(0.03);
        p.querySelectorAll('.basket')[catIdx[WW.data.itemCategory[id]]].click(); await d.run(0.03);
      }
      [...p.querySelectorAll('.btn')].find((b) => /Record/.test(b.textContent)).click(); await d.run(0.5);
      await d.until(() => !WW.engine.scene.busy);
    }
    check(WW.save.data.ch3.stage === 'chart', 'All 3 audit sites recorded');
    await d.use('door_lab'); await d.run(1.6);
    await d.use('chartdesk');
    await d.until(() => !!top() && top().querySelector('.chart-labels'));
    const labels = [...top().querySelectorAll('.chart-labels > div')];
    [6, 9, 7, 2].forEach((v, i) => { for (let k = 0; k < v; k++) labels[i].querySelectorAll('button')[1].click(); });
    await d.run(0.2);
    btn(/Check my chart/).click(); await d.run(0.3);
    check(/Perfect chart/.test(top().querySelector('.panel-feedback').textContent), 'Bar chart built correctly from the audit data');
    top().querySelectorAll('.answer')[1].click(); await d.run(0.8);
    top().querySelectorAll('.answer')[1].click(); await d.run(0.4);
    btn(/Sprout/).click(); await d.run(0.5);
    await d.until(d.hasChoices);
    await d.choose(3); // rainbow bins → rejected
    check(await d.until(() => /Rainbow bins/.test(WW.ui.dialogue.plain || '')), 'Plan without evidence (rainbow bins) is rejected');
    await d.until(d.hasChoices);
    await d.choose(0);
    await d.until(() => d.hasChoices() && /EVIDENCE/.test(WW.ui.dialogue.plain));
    const reasons = [...doc.querySelectorAll('.d-choices .choice-btn')];
    const ri = reasons.findIndex((b) => /Packaging was the biggest/.test(b.textContent));
    await d.choose(ri);
    await d.until(() => !!btn(/Got it/), 40);
    check(WW.engine.sceneName === 'hub' && WW.save.data.world.litter <= 1, 'Evidence-based plan → imagined result: litter cleared');
    btn(/Got it/).click(); await d.run(0.4);
    for (let i = 0; i < 3; i++) { const p = top(); p.querySelectorAll('.answer')[WW.data.checks[3][i].a].click(); await d.run(0.1); [...p.querySelectorAll('.btn.primary')].pop().click(); await d.run(0.3); }
    btn(/Continue the adventure/).click();
    await d.until(() => !WW.engine.scene.busy);
    check(WW.save.data.done.every(Boolean) && WW.save.isUnlocked(4), 'Chapter 3 complete; Assembly Hall unlocked');

    /* ---------- Final assessment ---------- */
    await d.use('door_hall'); await d.run(1.6);
    check(WW.engine.sceneName === 'final', 'Final challenge starts');
    await d.until(() => !!top() && top().querySelector('.hotspot'));
    const bank = WW.data.assessment;
    for (const h of bank.A.hotspots.filter((x) => x.problem)) [...top().querySelectorAll('.hotspot')].find((b) => b.textContent === h.label).click();
    await d.run(0.1); btn(/Next part/).click(); await d.run(0.5);
    const rows = [...top().querySelectorAll('.sort-row')];
    bank.B.sort.forEach((s, i) => [...rows[i].querySelectorAll('.sort-opt')].find((b) => b.textContent.includes(WW.data.stations[s.answer].name)).click());
    let grids = [...top().querySelectorAll('.answer-grid')];
    bank.B.mcq.forEach((q, i) => grids[i].querySelectorAll('.answer')[q.a].click());
    await d.run(0.1); btn(/Next part/).click(); await d.run(0.5);
    grids = [...top().querySelectorAll('.answer-grid')];
    bank.C.mcq.forEach((q, i) => grids[i].querySelectorAll('.answer')[q.a].click());
    await d.run(0.1); btn(/Next part/).click(); await d.run(0.5);
    const ta = top().querySelector('textarea');
    ta.value = 'I think Hilltop should start a compost bin because the chart shows food is the biggest type of waste.';
    ta.dispatchEvent(new W.Event('input'));
    await d.run(0.1); btn(/Finish/).click(); await d.run(2);
    check(WW.engine.sceneName === 'results', 'Results screen reached');
    const r = WW.final.score();
    check(r.auto === 14 && r.D.pending && r.total === null, 'Perfect answers → 14/14 auto-marked, written plan pending teacher review');
    await d.until(() => !!btn(/Teacher marking/));
    btn(/Teacher marking/).click(); await d.run(0.4);
    top().querySelectorAll('select').forEach((s) => (s.value = '2'));
    btn(/Save marks/).click(); await d.run(0.5);
    check(WW.final.score().total === 20, 'Teacher marks are added: 20/20');
    check(/Total: 20 \/ 20/.test(WW.final.reportText()), 'Teacher report text generated');
    check(WW.save.data.finalDone, 'Game marked complete on this device');
    log(null, `Finished in ${((performance.now() - t0) / 1000).toFixed(1)} s`);
    summary.textContent = `${pass} passed, ${fail} failed`;
    summary.className = fail ? 'bad' : 'ok';
  }

  document.getElementById('run').addEventListener('click', () => run().catch((e) => { log(false, 'Crashed: ' + e.message); summary.textContent = `${pass} passed, ${fail + 1} failed (crash)`; console.error(e); }));
  if (/autorun/.test(location.search)) document.getElementById('run').click();
})();
