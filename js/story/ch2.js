/* WasteWise — Chapter 2: Canteen Chaos + the Waste Maze.
   Prevention choice (lunch) → it changes how much rubbish appears → walk a real maze, collect one item at a
   time and sort it under Sunny School's stated (fictional) rules → feedback + methane lesson → canteen transforms. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const el = U.el;
  const S = WW.script;
  const DR = WW.draw;
  const TS = 48;
  const C2 = (WW.ch2 = {});
  const D = () => WW.save.data;
  const W = () => WW.save.data.world;

  /* ======================= CANTEEN INTERIOR ======================= */
  const canteen = WW.makeWorldScene({
    mapDef: WW.maps.canteen,
    bg: '#5b3a2a',
    camTopPad: 60,
    setup(sc, params) {
      const ex = sc.map.extra;
      const sunny = sc.addNPC('sunny', 'sunny', ex.sunny.x, ex.sunny.y, { dir: 'down', emotion: D().ch2.stage === 'enter' ? 'surprised' : 'happy' });
      sc.addInteract({ id: 'sunny', actor: sunny, r: 120, label: 'Talk to Chef Sunny', run: () => C2.talkSunny(sc) });
      sc.addInteract({ id: 'bigbin', obj: 'bigbin', label: 'Look at the bin', run: () => S.line(W().canteenClean ? 'ch2.sunny.05' : 'ch2.bigbin') });
      sc.addInteract({ id: 'backdoor', x: ex.backdoor.x, y: ex.backdoor.y, r: 60, label: () => (D().ch2.stage === 'maze' ? 'Enter the sorting maze' : 'Storeroom'), promptH: 90, run: async () => {
        if (D().ch2.stage !== 'maze') { await S.say('milo', 'That’s Chef Sunny’s storeroom. Let’s talk to Chef Sunny first!', 'thinking'); return; }
        WW.audio.sfx('door');
        WW.engine.go('maze', {});
      } });
      sc.exits.push({ x0: ex.exit.c0 * TS, x1: (ex.exit.c1 + 1) * TS, y0: ex.exit.r * TS + 6, y1: 9999, run: async () => {
        WW.audio.sfx('door');
        const doors = WW.maps.hub.build().extra.doors;
        WW.engine.go('hub', { spawn: { x: doors.canteen.x, y: doors.canteen.y + 34 }, dir: 'down' });
      } });
      WW.story.refresh();
      if (D().ch2.stage === 'locked') { D().ch2.stage = 'enter'; WW.save.commit(); } // demo / teacher unlock
      const st = D().ch2.stage;
      if (st === 'enter') sc.runScript(() => C2.intro(sc));
      else if (st === 'keep') sc.runScript(() => C2.keepClean(sc));
    },
  });
  WW.engine.register('canteen', canteen);

  C2.talkSunny = async function (sc) {
    const st = D().ch2.stage;
    if (st === 'enter') return C2.intro(sc);
    if (st === 'maze') {
      await S.line('ch2.sunny.rules');
      await S.say('sunny', 'The storeroom door is at the back, top-right. Good luck in the maze!', 'excited');
      return;
    }
    if (st === 'keep') return C2.keepClean(sc);
    await S.say('sunny', 'My canteen has never looked better! Remember: the best rubbish is the rubbish we never make.', 'laugh');
  };

  C2.intro = async function (sc) {
    const s = D();
    await S.wait(0.3);
    await S.lines(['ch2.sunny.01', 'ch2.milo.01', 'ch2.sunny.02', 'ch2.sunny.03']);
    const lunch = await C2.lunchPanel();
    if (!lunch) { await S.say('sunny', 'Take your time! Talk to me when you’re ready to choose.', 'happy'); return; }
    s.ch2.lunch = lunch;
    s.stats.maze.lunch = lunch;
    const L = WW.data.lunches.find((x) => x.id === lunch);
    WW.save.logChoice(2, 'lunch', L.title, L.quality);
    WW.save.commit();
    await S.line(lunch === 'nude' ? 'ch2.sunny.lunchA' : 'ch2.sunny.lunchB');
    if (lunch === 'nude') S.points(25, 'Prevented waste');
    await S.line('ch2.n.lunch');
    await S.lines(['ch2.sunny.04', 'ch2.sunny.rules', 'ch2.milo.rules']);
    s.ch2.stage = 'maze';
    WW.save.commit();
    WW.story.refresh();
  };

  C2.lunchPanel = function () {
    return S.panel({
      kicker: 'PREVENT WASTE · YOUR CHOICE',
      title: '🧺 How should Chef Sunny serve the picnic lunch?',
      closeLabel: 'Decide later',
      build(body, api) {
        const grid = el('div', { class: 'lunch-grid', style: { gridTemplateColumns: 'repeat(2, 1fr)' } });
        for (const l of WW.data.lunches) {
          const card = el('button', { class: 'lunch-card', type: 'button', onclick: () => { WW.audio.sfx('click'); api.done(l.id); } },
            el('div', { class: 'icons', html: l.icons.map((i) => WW.items.img(i, 52, WW.data.itemNames[i] || i)).join('') }),
            el('h3', null, l.title),
            el('div', null, l.text),
            el('span', { class: 'tag' + (l.quality === 'best' ? '' : ' warn') }, 'Rubbish forecast: ' + l.forecast));
          grid.appendChild(card);
        }
        body.append(el('p', null, 'Think before you choose: whatever rubbish this lunch makes, you will have to sort it in the maze!'), grid);
      },
    });
  };

  C2.keepClean = async function (sc) {
    const s = D();
    const sunny = sc.npcs.sunny;
    if (sunny) { sunny.emotion = 'excited'; sunny.pose = 'celebrate'; }
    WW.fx.spawn('sparkle', sc.player.x, sc.player.y - 60);
    await S.line('ch2.sunny.05');
    if (sunny) sunny.pose = 'idle';
    const pick = await S.askLine('ch2.sunny.06', WW.data.keepClean.map((c) => ({ id: c.id, icon: c.icon, text: c.text })));
    if (!pick) return;
    if (W().improvements.indexOf(pick) === -1) W().improvements.push(pick);
    WW.save.logChoice(2, 'keepClean', WW.data.keepClean.find((c) => c.id === pick).text, 'best');
    WW.save.commit();
    await S.line('ch2.sunny.07');
    await S.learnCard(WW.data.ch2Learn, 'CHAPTER 2 · WHY IT MATTERS');
    await S.chapterCheck(2);
    s.done[1] = true;
    s.ch2.stage = 'done';
    s.ch3.stage = 'enter';
    W().bottlesCleared = true;
    W().litter = Math.min(W().litter, 4);
    WW.save.commit();
    S.points(50, 'Chapter 2 complete');
    await S.chapterComplete(2, WW.data.ch2Learn, 'The canteen is clean and your idea is now part of Sunny School. The Eco Lab is unlocked!');
    WW.audio.sfx('unlock');
    WW.ui.toast('🔓 Eco Lab unlocked!', 'points', 3500);
    WW.story.refresh();
  };

  /* ======================= THE WASTE MAZE ======================= */
  let M = null; // maze run state

  const maze = WW.makeWorldScene({
    mapDef: WW.maps.maze,
    bg: '#8a5a32',
    setup(sc) {
      const mz = sc.map.extra.maze;
      const lunch = D().ch2.lunch || 'nude';
      const ids = WW.logic.mazeItemList(WW.data.mazeBase, WW.data.mazeByLunch, lunch);
      M = { items: [], sorted: 0, firstTry: 0, attempts: 0, total: ids.length, landfill: 0, wrongOnce: {}, hintPath: null, hintT: 0, done: false };
      ids.forEach((id, i) => {
        const sp = mz.itemSpots[i % mz.itemSpots.length];
        M.items.push({ id, c: sp.c, r: sp.r, x: sp.c * TS + TS / 2, y: sp.r * TS + TS / 2 + 12, state: 'floor', seed: i });
      });
      M.items.forEach((it) => {
        sc.addInteract({ id: 'item_' + it.seed, x: it.x, y: it.y, r: 46, promptH: 60,
          enabled: () => it.state === 'floor',
          label: () => (sc.player.carry ? 'Hands full!' : 'Pick up ' + WW.data.mazeItems[it.id].name),
          run: () => C2.pickUp(sc, it) });
      });
      for (const st of mz.stations) {
        const o = sc.map.get('station_' + st.kind);
        sc.addInteract({ id: 'st_' + st.kind, obj: o.id, r: 62, promptH: 96,
          x: o.x + TS / 2, y: o.y + TS + 14,
          label: () => (sc.player.carry ? 'Put in ' + WW.data.stations[st.kind].name : WW.data.stations[st.kind].name + ' station'),
          run: () => C2.drop(sc, st.kind) });
      }
      // stations can be used from any side
      for (const st of mz.stations) {
        const o = sc.map.get('station_' + st.kind);
        o.ip = null;
        const it = sc.interacts.find((x) => x.id === 'st_' + st.kind);
        delete it.obj;
        it.x = o.x + TS / 2;
        it.y = o.y + TS / 2 + 10;
        it.r = 74;
      }
      sc.addInteract({ id: 'rulesign', x: mz.sign.c * TS + TS / 2, y: mz.sign.r * TS + TS / 2 + 10, r: 70, promptH: 100, label: 'Read the rules sign', run: () => C2.rulesPanel() });
      C2.buildHud(sc);
      WW.story.refresh();
      sc.runScript(async () => {
        await S.wait(0.4);
        await S.lines(['ch2.milo.maze1', 'ch2.milo.maze2']);
      });
    },
    exit(sc) {
      if (C2.hudNode) { C2.hudNode.remove(); C2.hudNode = null; }
      if (sc.player) sc.player.carry = null;
    },
    update(sc, dt) {
      if (M && M.hintT > 0) { M.hintT -= dt; if (M.hintT <= 0) M.hintPath = null; }
      sc.player.pose = sc.player.carry ? 'carry' : 'idle';
    },
    drawFloor(sc, ctx, t) {
      if (!M) return;
      // hint trail
      if (M.hintPath && M.hintPath.length) {
        ctx.save();
        ctx.setLineDash([8, 10]);
        ctx.lineDashOffset = -t * 30;
        ctx.strokeStyle = 'rgba(255,210,63,.9)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(sc.player.x, sc.player.y);
        for (const p of M.hintPath) ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      }
      // sorting-room floor marking
      const mz = sc.map.extra.maze;
      DR.rr(ctx, mz.room.c0 * TS + 6, mz.room.r0 * TS + 6, (mz.room.c1 - mz.room.c0 + 1) * TS - 12, (mz.room.r1 - mz.room.r0 + 1) * TS - 12, 18, 'rgba(126,217,87,.18)', 'rgba(47,163,107,.5)', 3);
    },
    extraSorted(sc) {
      if (!M) return [];
      return M.items.filter((it) => it.state === 'floor').map((it) => ({
        y: it.y,
        draw(ctx, t) {
          const bob = Math.sin(t * 3 + it.seed) * 3;
          DR.shadow(ctx, it.x, it.y + 4, 14, 5, 0.25);
          WW.items.draw(ctx, it.id, it.x, it.y - 16 + bob, 0.85);
          if ((t + it.seed) % 2.2 < 0.25) DR.star(ctx, it.x + 14, it.y - 30 + bob, 5, 4, '#fff7a8', null, 0.35);
        },
      }));
    },
  });
  WW.engine.register('maze', maze);

  C2.mazeObjective = function () {
    if (!M) return 'Sort the lunch rubbish';
    const sc = WW.engine.scene;
    if (sc && sc.player && sc.player.carry) return `Take the ${WW.data.mazeItems[sc.player.carry].name.toLowerCase()} to the right station (${M.sorted}/${M.total})`;
    return `Find and sort the lunch rubbish (${M.sorted}/${M.total})`;
  };
  C2.mazeTarget = function () {
    const sc = WW.engine.scene;
    if (!M || !sc || !sc.player) return null;
    if (sc.player.carry) return { point: { x: sc.map.extra.maze.sign.c * TS + TS / 2, y: sc.map.extra.maze.sign.r * TS + TS } };
    return null; // finding items is the player's job (use the hint if stuck)
  };

  C2.buildHud = function (sc) {
    if (C2.hudNode) C2.hudNode.remove();
    const holding = el('div', { class: 'maze-hold' });
    const count = el('div', { class: 'maze-count' });
    const meter = el('div', { class: 'meter red' }, el('i'));
    const meterLabel = el('div', { class: 'fine' });
    const hint = el('button', { class: 'btn small', type: 'button', onclick: () => C2.hint(sc) }, '💡 Hint');
    const rules = el('button', { class: 'btn small', type: 'button', onclick: () => C2.rulesPanel() }, '📋 Rules');
    const leave = el('button', { class: 'btn small ghost', type: 'button', onclick: () => C2.leave(sc) }, '🚪 Leave');
    const close = el('button', { class: 'maze-hud-close', type: 'button', 'aria-label': 'Hide maze status panel', title: 'Hide this panel' }, '×');
    const panel = el('div', { id: 'mazeStatus', class: 'maze-hud', role: 'region', 'aria-label': 'Maze status' },
      el('div', { class: 'maze-hud-head' }, el('span', null, 'Maze status'), close),
      holding, count, el('div', { class: 'maze-meter' }, meterLabel, meter), el('div', { class: 'row' }, hint, rules, leave));
    const reopen = el('button', { class: 'maze-reopen', type: 'button', 'aria-label': 'Show maze status panel', 'aria-controls': 'mazeStatus', title: 'Show maze status (hint, rules, leave)' }, '▣');
    // Collapsible so the panel never has to cover the maze; the choice is remembered. A hidden panel is not a
    // camera obstacle, so the player can walk the whole top-right area with the maze fully visible.
    const setCollapsed = (on) => {
      panel.classList.toggle('collapsed', on);
      panel.toggleAttribute('data-hud-obstacle', !on);
      panel.setAttribute('aria-hidden', String(on));
      panel.inert = on;
      reopen.hidden = !on;
      reopen.toggleAttribute('data-hud-obstacle', on);
      reopen.setAttribute('aria-expanded', String(!on));
      WW.save.settings.mazeHudCollapsed = on;
      WW.save.commitSettings();
    };
    close.addEventListener('click', () => { WW.audio.sfx('click'); setCollapsed(true); close.blur(); });
    reopen.addEventListener('click', () => { WW.audio.sfx('click'); setCollapsed(false); reopen.blur(); });
    const node = el('div', { class: 'maze-hud-layer' }, panel, reopen);
    WW.ui.root.appendChild(node);
    C2.hudNode = node;
    setCollapsed(!!WW.save.settings.mazeHudCollapsed);
    C2.refreshHud = () => {
      const c = sc.player.carry;
      holding.innerHTML = c ? `${WW.items.img(c, 40)}<div><b>Holding</b><br>${U.esc(WW.data.mazeItems[c].name)}</div>` : '<div class="fine">Hands empty — find some rubbish!</div>';
      count.innerHTML = `♻️ Sorted <b>${M.sorted} / ${M.total}</b> · ✅ first try: <b>${M.firstTry}</b>`;
      const left = M.items.filter((i) => i.state !== 'sorted').length;
      const toLandfill = M.landfill + left;
      meter.firstChild.style.width = Math.round((toLandfill / M.total) * 100) + '%';
      meterLabel.textContent = `Heading to landfill: ${toLandfill} of ${M.total} items`;
      WW.story.refresh();
    };
    C2.refreshHud();
  };

  C2.pickUp = async function (sc, it) {
    const p = sc.player;
    if (p.carry) {
      WW.audio.sfx('thud');
      WW.ui.toast(`🙌 Your hands are full! Sort the ${U.esc(WW.data.mazeItems[p.carry].name.toLowerCase())} first.`);
      return;
    }
    it.state = 'carried';
    p.carry = it.id;
    M.current = it;
    WW.audio.sfx('pickup');
    WW.fx.spawn('sparkle', it.x, it.y - 20);
    p.jump(160);
    M.hintPath = null;
    C2.refreshHud();
    WW.ui.toast(`${WW.items.img(it.id, 28)} Picked up: <b>${U.esc(WW.data.mazeItems[it.id].name)}</b> — where does it go?`, 'info', 2600);
  };

  C2.drop = async function (sc, kind) {
    const p = sc.player;
    if (!p.carry) {
      const st = WW.data.stations[kind];
      await S.say('milo', `${st.icon} **${st.name}**: ${st.rule}.`, 'happy');
      return;
    }
    const itemId = p.carry;
    const info = WW.data.mazeItems[itemId];
    const res = WW.logic.checkDrop(WW.data.mazeItems, itemId, kind);
    const o = sc.map.get('station_' + kind);
    M.attempts++;
    if (res.correct) {
      p.carry = null;
      M.current.state = 'sorted';
      M.sorted++;
      if (!M.wrongOnce[itemId + M.current.seed]) M.firstTry++;
      if (kind === 'landfill') M.landfill++;
      o.bounce = WW.engine.time;
      WW.audio.sfx('drop');
      WW.audio.sfx('correct');
      WW.fx.spawn('sparkle', o.x + TS / 2, o.y);
      if (kind === 'compost') WW.fx.spawn('leaf', o.x + TS / 2, o.y);
      C2.refreshHud();
      S.points(kind === 'reuse' ? 15 : 10, null, { x: o.x + TS / 2, y: o.y - 40 });
      const lead = kind === 'landfill' ? 'That’s right for this school — ' : 'That works because… ';
      await S.say('milo', lead + info.why, 'excited');
      if (M.sorted >= M.total) await C2.finishMaze(sc);
    } else {
      M.wrongOnce[itemId + M.current.seed] = true;
      WW.audio.sfx('wrong');
      o.bounce = WW.engine.time;
      p.jump(120);
      const hint = WW.data.wrongHints[res.expected][kind];
      if (hint === 'METHANE') {
        WW.fx.spawn('bubble', o.x + TS / 2, o.y - 10, { n: 8 });
        WW.audio.sfx('bubble');
        await S.say('milo', 'Wait! Not landfill! ' + WW.data.methaneLesson, 'worried');
        await S.say('milo', 'Try the station where food scraps can turn back into soil.', 'happy');
      } else {
        await S.say('milo', 'Not quite! ' + hint + ' You can try again.', 'thinking');
      }
      C2.refreshHud();
    }
  };

  C2.hint = function (sc) {
    if (!M || sc.busy) return;
    const p = sc.player;
    if (p.carry) {
      const bin = WW.data.mazeItems[p.carry].bin;
      const tips = { compost: 'It’s a food scrap. Which station turns food back into soil?', recycle: 'It’s clean paper, cardboard, metal or a hard plastic bottle.', reuse: 'It’s still useful just as it is!', landfill: 'It’s soft, scrunchy packaging that this school can’t recycle.' };
      sc.runScript(() => S.say('milo', '💡 Hint: ' + tips[bin], 'thinking'));
      return;
    }
    let best = null, bd = 1e9;
    for (const it of M.items) {
      if (it.state !== 'floor') continue;
      const path = sc.map.findPath(p.x, p.y, it.x, it.y);
      const len = path ? path.reduce((s, q, i) => s + (i ? Math.hypot(q.x - path[i - 1].x, q.y - path[i - 1].y) : Math.hypot(q.x - p.x, q.y - p.y)), 0) : 1e9;
      if (len < bd) { bd = len; best = path; }
    }
    if (best) {
      M.hintPath = best;
      M.hintT = 6;
      WW.audio.sfx('sparkle');
      WW.ui.toast('✨ Follow the golden trail to the nearest rubbish!');
    }
  };

  C2.leave = function (sc) {
    if (sc.busy) return;
    WW.ui.panel.open({
      title: 'Leave the maze?',
      build(body, api) {
        body.append(el('p', null, 'You can come back any time, but the maze will start again from the beginning.'),
          el('div', { class: 'row end' }, el('button', { class: 'btn', type: 'button', onclick: () => api.done(false) }, 'Keep sorting'), el('button', { class: 'btn primary', type: 'button', onclick: () => api.done(true) }, 'Leave')));
      },
    }).then((yes) => {
      if (yes) WW.engine.go('canteen', { spawn: { x: 17.5 * TS, y: 2 * TS + 40 }, dir: 'down' });
    });
  };

  C2.rulesPanel = function () {
    return S.panel({
      kicker: 'SUNNY SCHOOL COLLECTION RULES (FICTIONAL)',
      title: '📋 Where does it go?',
      wide: true,
      build(body, api) {
        const grid = el('div', { class: 'answer-grid cols2' });
        for (const k of ['compost', 'recycle', 'reuse', 'landfill']) {
          const st = WW.data.stations[k];
          grid.appendChild(el('div', { class: 'answer', style: { cursor: 'default', borderColor: WW.worldArt.BIN[k].lid, borderWidth: 'calc(var(--u) * 4)' } }, el('span', { class: 'big' }, st.icon), el('span', null, el('b', null, st.name + ' '), el('span', { class: 'fine' }, '(' + st.lid + ')'), el('br'), st.rule)));
        }
        body.append(el('p', null, 'Order of choices: first ', el('b', null, 'avoid'), ' waste, then ', el('b', null, 'reuse'), ', then ', el('b', null, 'recycle or compost'), ' — ', el('b', null, 'landfill is the last choice'), '.'), grid,
          el('p', { class: 'fine', style: { marginTop: 'calc(var(--u) * 8)' } }, 'These colours match many Victorian council bins (red, yellow, green lids), but rules are different in different places — always check your own school’s signs.'),
          el('div', { class: 'row end' }, el('button', { class: 'btn primary', type: 'button', autofocus: true, onclick: () => api.done() }, 'Back to sorting')));
      },
    });
  };

  C2.finishMaze = async function (sc) {
    const s = D();
    M.done = true;
    WW.audio.sfx('fanfare');
    WW.fx.spawn('confetti', WW.engine.W / 2, WW.engine.H / 3, { screen: true });
    if (sc.milo) { sc.milo.pose = 'celebrate'; sc.milo.jump(300); }
    sc.player.jump(220);
    await S.line('ch2.milo.done');
    if (sc.milo) sc.milo.pose = 'idle';
    s.stats.maze = { items: M.total, firstTry: M.firstTry, attempts: M.attempts, completed: true, lunch: s.ch2.lunch, landfill: M.landfill };
    W().canteenClean = true;
    s.ch2.stage = 'keep';
    WW.save.commit();
    await S.panel({
      kicker: 'WASTE MAZE COMPLETE',
      title: '🏁 Sorting results',
      closable: false,
      build(body, api) {
        const pct = Math.round((M.landfill / M.total) * 100);
        const lunchTxt = s.ch2.lunch === 'nude'
          ? 'Your nude-food picnic meant there was less packaging to deal with in the first place.'
          : 'The grab-and-go packs created extra wrappers and pouches — most of them could only go to landfill. Choosing less packaging prevents that!';
        body.append(
          el('div', { class: 'results-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            el('div', { class: 'res-box' }, el('b', null, `${M.total}`), el('span', null, 'items sorted')),
            el('div', { class: 'res-box' }, el('b', null, `${M.firstTry}/${M.total}`), el('span', null, 'right on the first try')),
            el('div', { class: 'res-box' + (pct > 25 ? ' pending' : '') }, el('b', null, `${M.landfill}`), el('span', null, `went to landfill (${pct}%)`))),
          el('p', null, lunchTxt),
          el('p', { class: 'callout green' }, '🌍 Composting food scraps instead of burying them in landfill helps reduce methane, a gas that warms the planet.'),
          el('p', { class: 'fine' }, 'Your sorting accuracy is about understanding the rules — not how fast you moved. The school, items and rules are fictional examples.'),
          el('div', { class: 'row end' }, el('button', { class: 'btn primary', type: 'button', autofocus: true, onclick: () => api.done() }, 'Back to Chef Sunny →')));
      },
    });
    S.points(40, 'Maze complete');
    WW.engine.go('canteen', { spawn: { x: 17.5 * TS, y: 2 * TS + 40 }, dir: 'down' });
  };
})();
