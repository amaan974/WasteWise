/* WasteWise — story manager: objectives, chapter state, notebook and navigation. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const el = U.el;
  const TS = 48;

  const ST = (WW.story = {
    objective: null,
    targetId: null,
  });
  const D = () => WW.save.data;

  ST.chapterLabel = function () {
    const s = D();
    const scene = WW.engine.sceneName;
    if (scene === 'final') return '🏆 Final Challenge · Save Hilltop School';
    if (!s.introDone) return 'Welcome to Sunny School';
    if (!s.done[0]) return '💧 Chapter 1 · The Resource Mystery';
    if (!s.done[1]) return '🥪 Chapter 2 · Canteen Chaos';
    if (!s.done[2]) return '🔎 Chapter 3 · Waste Detective';
    if (!s.finalDone) return '🏆 Final Challenge unlocked';
    return '🌟 Eco Crew Hero · Free play';
  };

  /** Compute the current objective from saved state + current scene. */
  ST.computeObjective = function () {
    const s = D();
    const sc = WW.engine.sceneName;
    let text = '', target = null;
    ST.targetId = null;
    if (!s.introDone) { ST.objective = ST.objective || null; return ST.objective; }
    const ch1 = s.ch1, ch2 = s.ch2, ch3 = s.ch3;
    if (!s.done[0]) {
      if (ch1.stage === 'meet') { text = 'Talk to Principal Maple at the garden gate'; target = { actor: 'maple' }; }
      else if (ch1.stage === 'clues') {
        const left = WW.data.clueOrder.filter((k) => ch1.clues.indexOf(k) === -1);
        text = `Find clues in the garden (${ch1.clues.length}/4)`;
        const map = { tap: 'tap', sprinkler: 'sprinkler', light: 'shed', bottles: 'gardenBin' };
        target = left.length ? { obj: map[left[0]] } : null;
      } else if (ch1.stage === 'report') { text = 'Report your clues to Principal Maple'; target = { actor: 'maple' }; }
      else if (ch1.stage === 'fixWater') { text = 'Fix the watering system at the sprinkler'; target = { obj: 'sprinkler' }; }
    } else if (!s.done[1]) {
      if (ch2.stage === 'enter' || ch2.stage === 'locked') { text = sc === 'canteen' ? 'Talk to Chef Sunny' : 'Visit Chef Sunny in the canteen'; target = sc === 'canteen' ? { actor: 'sunny' } : { door: 'canteen' }; ST.targetId = 'canteen'; }
      else if (ch2.stage === 'maze') {
        if (sc === 'maze') { text = WW.ch2 && WW.ch2.mazeObjective ? WW.ch2.mazeObjective() : 'Sort the lunch rubbish'; target = WW.ch2 && WW.ch2.mazeTarget ? WW.ch2.mazeTarget() : null; }
        else if (sc === 'canteen') { text = 'Go through the back door to the sorting maze'; target = { point: WW.maps && { x: 17.5 * TS, y: 2 * TS + 20 } }; }
        else { text = 'Go back to the canteen to sort the rubbish'; target = { door: 'canteen' }; ST.targetId = 'canteen'; }
      } else if (ch2.stage === 'keep') { text = sc === 'canteen' ? 'Talk to Chef Sunny' : 'Return to Chef Sunny in the canteen'; target = sc === 'canteen' ? { actor: 'sunny' } : { door: 'canteen' }; ST.targetId = 'canteen'; }
    } else if (!s.done[2]) {
      if (ch3.stage === 'enter' || ch3.stage === 'locked') { text = sc === 'lab' ? 'Talk to Professor Sprout' : 'Visit Professor Sprout in the Eco Lab'; target = sc === 'lab' ? { actor: 'sprout' } : { door: 'lab' }; ST.targetId = 'lab'; }
      else if (ch3.stage === 'map') { text = sc === 'lab' ? 'Read the school map at the map table' : 'Go back to the Eco Lab'; target = sc === 'lab' ? { obj: 'mapdesk' } : { door: 'lab' }; ST.targetId = 'lab'; }
      else if (ch3.stage === 'audit') {
        const left = ['canteen', 'classrooms', 'playground'].filter((k) => ch3.sites.indexOf(k) === -1);
        text = `Audit the bins around the school (${ch3.sites.length}/3)`;
        const siteObj = { canteen: 'cbin3', classrooms: 'rbin1', playground: 'pbin' };
        target = sc === 'hub' && left.length ? { obj: siteObj[left[0]] } : sc === 'lab' ? { point: { x: 10 * TS, y: 11 * TS } } : null;
      } else if (ch3.stage === 'chart') { text = sc === 'lab' ? 'Build the bar chart at the chart desk' : 'Take your data back to the Eco Lab'; target = sc === 'lab' ? { obj: 'chartdesk' } : { door: 'lab' }; ST.targetId = 'lab'; }
      else if (ch3.stage === 'plan') { text = sc === 'lab' ? 'Choose a plan with Professor Sprout' : 'Return to Professor Sprout'; target = sc === 'lab' ? { actor: 'sprout' } : { door: 'lab' }; ST.targetId = 'lab'; }
    } else if (!s.finalDone) {
      text = 'Enter the Assembly Hall for the final challenge';
      target = { door: 'hall' };
      ST.targetId = 'hall';
    } else {
      text = 'Explore your greener Sunny School!';
    }
    ST.objective = { text, target };
    return ST.objective;
  };

  ST.setObjective = function (text, target) {
    ST.objective = { text, target };
    WW.ui.hud.refresh();
  };
  ST.refresh = function () {
    ST.computeObjective();
    WW.ui.hud.refresh();
  };

  /** Resolve objective target to a world point for markers. */
  ST.objectivePoint = function (scene) {
    const o = ST.objective;
    if (!o || !o.target || !scene || !scene.map) return null;
    const t = o.target;
    if (t.actor) {
      const a = scene.npcs && scene.npcs[t.actor];
      return a ? { x: a.x, y: a.y, h: a.who === 'milo' ? 72 : 112 } : null;
    }
    if (t.obj) {
      const p = scene.objPoint(t.obj);
      const o2 = scene.map.get(t.obj);
      return p && o2 ? { x: o2.x + o2.pw / 2, y: o2.y + o2.ph, h: o2.ph + 40 } : null;
    }
    if (t.door) {
      if (scene.map.id !== 'hub') return null;
      const d = scene.map.extra.doors[t.door];
      return d ? { x: d.x, y: d.y - 20, h: 120 } : null;
    }
    if (t.point) return { x: t.point.x, y: t.point.y, h: 60 };
    if (t.x != null) return { x: t.x, y: t.y, h: t.h || 60 };
    return null;
  };

  ST.onWorldChanged = function () {
    const sc = WW.engine.scene;
    if (sc && sc.refreshObjects) sc.refreshObjects();
    if (sc && sc.cfg && sc.cfg.refresh) sc.cfg.refresh(sc);
    ST.refresh();
  };

  /** Lab screen values = chart the player has built (for the big wall screen). */
  ST.labScreenValues = function () {
    const t = D().ch3.chartValues;
    return t ? [t.food, t.packaging, t.paper, t.other] : [1, 1, 1, 1];
  };

  ST.toTitle = function () {
    WW.audio.stopSpeech();
    WW.engine.go('title', {}, { type: 'fade' });
  };

  /** Continue: go to the right scene for the saved state. */
  ST.continueGame = function () {
    const s = D();
    if (!s.introDone) return WW.engine.go('hub', {});
    WW.engine.go('hub', {});
  };

  ST.openChapterSelect = function () {
    const s = D();
    WW.ui.panel.open({
      kicker: 'TEACHER / DEMO',
      title: '🗺 Jump to a chapter',
      wide: true,
      build(body, api) {
        body.append(el('p', null, 'Jumping ahead marks earlier chapters as complete on this device so the story stays consistent. Use “Reset all progress” to start fresh.'));
        const grid = el('div', { class: 'chapter-cards' });
        WW.data.chapters.forEach((ch, i) => {
          const b = el('button', { class: 'chapter-card', type: 'button', onclick: () => { api.done(i + 1); } },
            el('span', { class: 'ico' }, ch.icon), el('b', null, `${i < 3 ? 'Chapter ' + (i + 1) : 'Final'}: ${ch.title}`), el('span', null, ch.learn),
            el('span', { class: 'tag' + (i < 3 && s.done[i] ? '' : ' warn') }, i < 3 ? (s.done[i] ? '✓ Complete' : 'Not complete') : s.finalDone ? '✓ Complete' : 'Not complete'));
          grid.appendChild(b);
        });
        body.appendChild(grid);
      },
    }).then((n) => { if (n) ST.jumpTo(n); });
  };

  /** Set state so that chapter n is the active one (demo / teacher shortcut). */
  ST.jumpTo = function (n) {
    const s = D();
    s.introDone = true;
    const w = s.world;
    if (n >= 2) {
      s.done[0] = true; s.ch1.stage = 'done'; w.leakFixed = true; w.sprinklerFixed = true; w.shedLightOn = false; w.gardenHealth = 100; w.tank = 85;
      if (s.ch1.clues.length < 4) s.ch1.clues = WW.data.clueOrder.slice();
    } else {
      s.done = [false, false, false]; s.ch1 = WW.save._defaults().ch1; s.ch2 = WW.save._defaults().ch2; s.ch3 = WW.save._defaults().ch3;
      Object.assign(w, WW.save._defaults().world);
    }
    if (n >= 3) { s.done[1] = true; s.ch2.stage = 'done'; w.canteenClean = true; w.bottlesCleared = true; w.litter = Math.min(w.litter, 4); if (!s.ch2.lunch) s.ch2.lunch = 'nude'; }
    else if (n === 2) { s.done[1] = false; s.ch2 = WW.save._defaults().ch2; s.ch2.stage = 'enter'; w.canteenClean = false; }
    if (n >= 4) { s.done[2] = true; s.ch3.stage = 'done'; s.ch3.sites = ['canteen', 'classrooms', 'playground']; w.litter = Math.min(w.litter, 1); }
    else if (n === 3) { s.done[2] = false; s.ch3 = WW.save._defaults().ch3; s.ch3.stage = 'enter'; }
    s.finalDone = false;
    WW.save.commit();
    const spawn = n === 1 ? null : n === 2 ? 'canteen' : n === 3 ? 'lab' : 'hall';
    const doors = WW.maps.hub.build().extra.doors;
    WW.engine.go('hub', spawn ? { spawn: { x: doors[spawn].x, y: doors[spawn].y + 30 }, dir: 'up' } : {});
  };

  /* ---------------- Notebook content ---------------- */
  ST.notebookContent = function () {
    const s = D();
    const wrap = el('div');
    const col = (title, items) => el('div', { class: 'nb-col' }, el('h3', null, title), items.length ? el('ul', null, ...items.map((t) => el('li', { html: t }))) : el('p', { class: 'fine' }, 'Nothing yet — keep exploring!'));
    const c1 = s.ch1.clues.map((k) => '🔍 ' + U.esc(WW.data.clues[k].note));
    if (s.done[0]) c1.push('✅ Tap reported & fixed; rainwater now reaches the roots.');
    const c2 = [];
    if (s.ch2.lunch) c2.push(s.ch2.lunch === 'nude' ? '🥕 Chose a nude-food picnic (less packaging).' : '📦 Chose grab-and-go packs — lots of extra packaging to sort.');
    const m = s.stats.maze;
    if (m.completed) c2.push(`♻️ Sorted ${m.items} items · ${m.firstTry} right first time.`);
    if (s.ch2.stage !== 'locked') c2.push('🌱 Compost · ♻️ Recycling · 🔁 Share & Reuse · 🗑 Landfill (last choice).');
    const c3 = [];
    if (s.ch3.sites.length) {
      const t = WW.logic.auditTotals(Object.fromEntries(s.ch3.sites.map((k) => [k, WW.data.auditSites[k]])), WW.data.itemCategory, WW.data.categories.map((c) => c.id));
      for (const k of s.ch3.sites) {
        const b = t.bySite[k];
        c3.push(`📋 <b>${U.esc(WW.data.auditSites[k].name)}</b>: food ${b.food}, packaging ${b.packaging}, paper ${b.paper}, other ${b.other}`);
      }
      if (s.ch3.sites.length === 3) c3.push(`📊 <b>Totals</b>: food ${t.totals.food}, packaging ${t.totals.packaging}, paper ${t.totals.paper}, other ${t.totals.other} (fictional sample)`);
    }
    if (s.ch3.plan) c3.push('✅ Plan chosen: ' + U.esc((WW.data.plans.find((p) => p.id === s.ch3.plan) || {}).text || ''));
    wrap.appendChild(el('div', { class: 'notebook-grid' }, col('💧 Garden clues', c1), col('🥪 Canteen', c2), col('🔎 Detective data', c3)));
    const badges = [WW.data.ch1Learn.badge, WW.data.ch2Learn.badge, WW.data.ch3Learn.badge, { icon: '🏆', name: 'Eco Crew Hero' }];
    wrap.appendChild(el('div', { class: 'badge-row' }, ...badges.map((b, i) => el('div', { class: 'badge' + ((i < 3 ? s.done[i] : s.finalDone) ? '' : ' locked') }, el('i', null, b.icon), b.name))));
    const w = s.world;
    wrap.appendChild(el('p', { class: 'fine', style: { marginTop: 'calc(var(--u) * 8)' } }, `School health (game state): garden ${Math.round(w.gardenHealth)}% · rain tank ${Math.round(w.tank)}% · litter pieces ${w.litter}. All Sunny School data is fictional.`));
    return wrap;
  };
})();
