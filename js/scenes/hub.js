/* WasteWise — Sunny School hub (walkable school). */
(function () {
  'use strict';
  const WW = window.WW;
  const S = WW.script;
  const D = WW.draw;
  const TS = 48;
  const SD = () => WW.save.data;
  const W = () => WW.save.data.world;

  const butterflies = [];
  for (let i = 0; i < 7; i++) butterflies.push({ x: 2.5 * TS + Math.random() * 9 * TS, y: 10 * TS + Math.random() * 9 * TS, ph: Math.random() * 6, col: ['#ff8fab', '#ffd23f', '#b8a1ff', '#7fd1ff'][i % 4] });
  const birds = [{ x: 0, y: 120, sp: 60 }, { x: 600, y: 80, sp: 48 }];

  const scene = WW.makeWorldScene({
    mapDef: WW.maps.hub,
    bg: '#3f8a4f',
    setup(sc, params) {
      const ex = sc.map.extra;
      // background students
      for (const w of ex.wanderers) {
        const st = new WW.Wanderer({ x: w.path[0][0] * TS + 24, y: w.path[0][1] * TS + 30, seed: w.seed, route: w.path, pause: w.pause || 1 });
        sc.actors.push(st);
        sc.addInteract({ id: 'student' + w.seed, actor: st, label: 'Say hi', r: 50, run: async () => {
          st.path = null;
          st.face(sc.player.x, sc.player.y);
          st.setEmote('heart', 1.5);
          await S.say('narrator', '“' + WW.data.studentChat[w.seed % WW.data.studentChat.length] + '”', 'happy');
        } });
      }
      WW.ch1.setupHub(sc);
      WW.ch3 && WW.ch3.setupHub && WW.ch3.setupHub(sc);
      const doors = ex.doors;
      sc.addInteract({ id: 'door_canteen', x: doors.canteen.x, y: doors.canteen.y, label: () => (WW.save.isUnlocked(2) ? 'Enter the canteen' : 'Locked'), promptH: 110, run: async () => {
        if (!WW.save.isUnlocked(2)) { WW.audio.sfx('thud'); return S.line('amb.locked.canteen'); }
        WW.audio.sfx('door');
        WW.engine.go('canteen', {});
      } });
      sc.addInteract({ id: 'door_lab', x: doors.lab.x, y: doors.lab.y, label: () => (WW.save.isUnlocked(3) ? 'Enter the Eco Lab' : 'Locked'), promptH: 110, run: async () => {
        if (!WW.save.isUnlocked(3)) { WW.audio.sfx('thud'); return S.line('amb.locked.lab'); }
        WW.audio.sfx('door');
        WW.engine.go('lab', {});
      } });
      sc.addInteract({ id: 'door_hall', x: doors.hall.x, y: doors.hall.y, label: () => (WW.save.isUnlocked(4) ? 'Enter the Assembly Hall' : 'Locked'), promptH: 110, run: async () => {
        if (!WW.save.isUnlocked(4)) { WW.audio.sfx('thud'); return S.line('amb.locked.hall'); }
        WW.audio.sfx('door');
        WW.engine.go('final', {});
      } });
      sc.addInteract({ id: 'door_class', obj: 'classrooms', label: 'Knock', promptH: 110, run: () => S.line('amb.classrooms') });
      sc.addInteract({ id: 'bubbler', obj: 'bubbler', label: 'Drinking fountain', run: async () => { WW.audio.sfx('drip'); await S.line('amb.bubbler'); } });
      sc.addInteract({ id: 'notice', obj: 'notice', label: 'Read the noticeboard', run: async () => { await S.line('amb.notice'); WW.ui.notebook.open(); } });
      // staff waiting outside their buildings to invite the player
      placeHelpers(sc);
      WW.story.refresh();
      if (!SD().introDone) sc.runScript(intro);
      else if (params.arrive) sc.runScript(params.arrive);
      else if (SD().ch3.stage === 'consequence') sc.runScript((s2) => WW.ch3.consequence(s2)); // resume after a reload
    },
    refresh(sc) {
      placeHelpers(sc);
    },
    update(sc, dt) {
      // dripping tap sound when nearby
      if (!W().leakFixed) {
        const tap = sc.objPoint('tap');
        sc._drip = (sc._drip || 0) - dt;
        if (sc._drip <= 0 && Math.hypot(tap.x - sc.player.x, tap.y - sc.player.y) < 260) { WW.audio.sfx('drip'); sc._drip = 1.1; }
      }
      for (const b of birds) { b.x += b.sp * dt; if (b.x > 40 * TS + 100) b.x = -100; }
    },
    drawOver(sc, ctx, t) {
      // butterflies appear as the garden recovers
      const n = Math.round((W().gardenHealth / 100) * butterflies.length) - 1;
      for (let i = 0; i < n; i++) {
        const b = butterflies[i];
        const x = b.x + Math.sin(t * 0.7 + b.ph) * 60, y = b.y + Math.cos(t * 0.9 + b.ph * 2) * 30 - 30;
        const flap = Math.abs(Math.sin(t * 12 + b.ph));
        D.ell(ctx, x - 4 * flap, y, 5 * flap + 1, 4, b.col, '#5a3a4a', 1);
        D.ell(ctx, x + 4 * flap, y, 5 * flap + 1, 4, b.col, '#5a3a4a', 1);
        D.line(ctx, x, y - 3, x, y + 3, '#3b2a22', 1.5);
      }
      // tiny birds
      for (const b of birds) {
        const fl = Math.sin(t * 9 + b.x) * 4;
        ctx.strokeStyle = 'rgba(40,60,60,.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x - 7, b.y - fl);
        ctx.quadraticCurveTo(b.x - 3, b.y - 4, b.x, b.y);
        ctx.quadraticCurveTo(b.x + 3, b.y - 4, b.x + 7, b.y - fl);
        ctx.stroke();
      }
      // tutorial star
      if (sc.tutorialStar) {
        const s = sc.tutorialStar;
        D.star(ctx, s.x, s.y - 30 + Math.sin(t * 4) * 5, 16, 5, '#ffd23f', '#9a6a00', 0.5, t);
        ctx.strokeStyle = `rgba(255,210,63,${0.5 + Math.sin(t * 5) * 0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, 28, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    drawScreen(sc, ctx, t) {
      // soft drifting cloud shadows for depth
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#123';
      for (let i = 0; i < 3; i++) {
        const x = ((t * 14 + i * 420) % 1500) - 300 - sc.cam.x * 0.15;
        D.ell(ctx, x, 120 + i * 160 - sc.cam.y * 0.1, 160, 50, '#102030');
      }
      ctx.restore();
    },
  });

  function placeHelpers(sc) {
    const s = SD();
    const ex = sc.map.extra;
    // Chef Sunny waits outside the canteen while Chapter 2 is active
    if (s.done[0] && !s.done[1]) {
      if (!sc.npcs.sunny) {
        const a = sc.addNPC('sunny', 'sunny', ex.doors.canteen.x - 70, ex.doors.canteen.y + 18, { dir: 'down', emotion: 'excited' });
        a.pose = 'wave';
        sc.addInteract({ id: 'sunnyOut', actor: a, label: 'Talk to Chef Sunny', run: async () => { await S.line('ch2.sunny.door'); } });
      }
    } else if (sc.npcs.sunny) { sc.removeNPC('sunny'); sc.removeInteract('sunnyOut'); }
    if (s.done[1] && !s.done[2] && (s.ch3.stage === 'enter' || s.ch3.stage === 'locked')) {
      if (!sc.npcs.sprout) {
        const a = sc.addNPC('sprout', 'sprout', ex.doors.lab.x + 70, ex.doors.lab.y + 18, { dir: 'down', emotion: 'happy' });
        a.pose = 'wave';
        sc.addInteract({ id: 'sproutOut', actor: a, label: 'Talk to Professor Sprout', run: async () => { await S.line('ch3.sprout.door'); } });
      }
    } else if (sc.npcs.sprout) { sc.removeNPC('sprout'); sc.removeInteract('sproutOut'); }
    // when everything is done, the whole cast celebrates in the courtyard
    if (s.finalDone) {
      if (!sc.npcs.sunny2) { const a = sc.addNPC('sunny2', 'sunny', 22.5 * TS, 13.6 * TS, { dir: 'down', emotion: 'laugh' }); a.pose = 'wave'; sc.addInteract({ id: 'sunny2', actor: a, label: 'Talk to Chef Sunny', run: () => S.say('sunny', 'The canteen bins have never been so tidy! Thank you, Eco Crew!', 'laugh') }); }
      if (!sc.npcs.sprout2) { const a = sc.addNPC('sprout2', 'sprout', 17.5 * TS, 14.2 * TS, { dir: 'down', emotion: 'excited' }); sc.addInteract({ id: 'sprout2', actor: a, label: 'Talk to Professor Sprout', run: () => S.say('sprout', 'Remember: ask a question, collect evidence, then act. Geography is everywhere!', 'excited') }); }
    }
  }

  /* ---------------- Intro + controls tutorial ---------------- */
  async function intro(sc) {
    const p = sc.player;
    const milo = sc.milo;
    milo.visible = false;
    milo.scripted = true;
    p.dir = 'up';
    WW.story.setObjective('');
    await S.wait(0.5);
    await S.line('intro.n.01');
    // Milo pops out of the bush
    const bx = 22 * TS + 24, by = 19 * TS + 40;
    WW.fx.spawn('leaf', bx, by - 30);
    WW.audio.sfx('pop');
    milo.x = bx; milo.y = by; milo.visible = true; milo.jump(320);
    WW.audio.sfx('squeak');
    milo.setEmote('!', 1.4);
    await S.wait(0.5);
    await S.walk(milo, p.x + 50, p.y - 30, { run: true });
    milo.face(p.x, p.y);
    p.face(milo.x, milo.y);
    milo.pose = 'wave';
    await S.lines(['intro.milo.01', 'intro.milo.02']);
    milo.pose = 'idle';
    await S.line('intro.milo.03');
    // walking tutorial
    sc.tutorialStar = { x: 20 * TS, y: 18.6 * TS };
    WW.story.setObjective('Walk to the sparkly star', { point: { x: 20 * TS, y: 18.6 * TS } });
    milo.scripted = false;
    sc.moveOnly = true; // let the player move (but not start other interactions) during the tutorial
    await S.waitUntil(() => Math.hypot(p.x - sc.tutorialStar.x, p.y - sc.tutorialStar.y) < 46);
    sc.moveOnly = false;
    p.path = null;
    sc.tutorialStar = null;
    WW.audio.sfx('correct');
    WW.fx.spawn('sparkle', p.x, p.y - 40);
    milo.jump(240);
    await S.line('intro.milo.04');
    milo.setEmote('!', 1.5);
    milo.face(MAPLE_POINT().x, MAPLE_POINT().y);
    await S.line('intro.milo.05');
    SD().introDone = true;
    WW.save.commit();
    WW.story.refresh();
  }
  function MAPLE_POINT() {
    const m = scene.npcs.maple;
    return m || { x: 15 * TS, y: 12 * TS };
  }

  WW.engine.register('hub', scene);
})();
