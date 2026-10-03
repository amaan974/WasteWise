/* WasteWise — cutscene/script helpers used by chapter scripts (async/await style). */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const el = U.el;
  const S = (WW.script = {});

  S.scene = () => WW.engine.scene;
  S.actorFor = (who) => {
    const sc = S.scene();
    if (!sc) return null;
    if (who === 'milo') return sc.milo;
    if (who === 'kid') return sc.player;
    return sc.npcs ? sc.npcs[who] : null;
  };
  /** Speak a line from WW.data.lines by id. */
  S.line = async function (id, extra = {}) {
    const l = WW.data.lines[id];
    if (!l) { console.warn('Missing line', id); return; }
    const [who, emotion, text] = l;
    const actor = S.actorFor(who);
    const sc = S.scene();
    if (actor && sc && sc.player && actor !== sc.player) {
      if (!actor.moving) actor.face(sc.player.x, sc.player.y);
      if (!sc.player.moving) sc.player.face(actor.x, actor.y);
    }
    if (actor && who === 'milo' && /excited|laugh/.test(emotion) && Math.random() < 0.6) { actor.jump(200); WW.audio.sfx('squeak'); }
    await WW.ui.dialogue.say(who, text, Object.assign({ emotion, actor, id }, extra));
  };
  S.lines = async function (ids) {
    for (const id of ids) await S.line(id);
  };
  S.say = (who, text, emotion = 'happy') => WW.ui.dialogue.say(who, text, { emotion, actor: S.actorFor(who) });
  /** Ask using a line id as the question. choices: [{id,text,icon}] */
  S.askLine = function (id, choices) {
    const [who, emotion, text] = WW.data.lines[id];
    const actor = S.actorFor(who);
    return WW.ui.dialogue.ask(who, text, choices, { emotion, actor, id });
  };
  S.ask = (who, text, choices, emotion = 'thinking') => WW.ui.dialogue.ask(who, text, choices, { emotion, actor: S.actorFor(who) });
  S.wait = (sec) => WW.engine.after(sec);
  S.waitUntil = async function (fn, step = 0.05) {
    while (!fn()) await WW.engine.after(step);
  };
  S.walk = (actor, x, y, opts) => actor.walkTo(S.scene().map, x, y, opts);
  S.emote = (actor, icon, dur) => actor && actor.setEmote(icon, dur);
  S.panel = (opts) => WW.ui.panel.open(opts);
  S.toast = (t, k) => WW.ui.toast(t, k);
  S.points = function (n, why, at) {
    WW.ui.points(n, why);
    if (at) WW.fx.spawn('text', at.x, at.y, { text: '+' + n + ' 🌿' });
  };
  S.cam = function (x, y) {
    const sc = S.scene();
    if (sc) sc.camFocus = x == null ? null : { x, y };
  };
  S.lockPlayer = function (on) {
    const sc = S.scene();
    if (sc && sc.player) { sc.player.path = null; sc.player.moving = false; }
  };

  /* ---------------- Shared panels ---------------- */
  function miloCanvas(size = 140, emotion = 'excited', pose = 'celebrate') {
    const c = el('canvas', { width: size * 2, height: size * 2, 'aria-hidden': 'true' });
    const ctx = c.getContext('2d');
    let alive = true;
    const draw = () => {
      if (!alive || !c.isConnected) { if (c._started) return; }
      c._started = true;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.scale(2, 2);
      const t = performance.now() / 1000;
      WW.chars.draw(ctx, 'milo', { x: size / 2, y: size * 0.92 - Math.abs(Math.sin(t * 3)) * 6, dir: 'down', t, pose, emotion, scale: size / 62 });
      if (c.isConnected || !c._seen) { c._seen = c.isConnected || c._seen; requestAnimationFrame(draw); }
    };
    requestAnimationFrame(draw);
    return c;
  }
  S.miloCanvas = miloCanvas;

  /** "What you learned" card. */
  S.learnCard = function (learn, kicker) {
    return S.panel({
      kicker: kicker || 'LEARNING CHECKPOINT',
      title: '💡 ' + learn.title,
      closable: false,
      build(body, api) {
        const list = el('ul', { class: 'fact-list' });
        for (const f of learn.facts) list.appendChild(el('li', { html: U.esc(f).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }));
        body.append(el('div', { class: 'learn-card' }, miloCanvas(140, 'happy', 'point'), list));
        body.append(el('div', { class: 'row end' }, el('button', { class: 'btn primary', type: 'button', autofocus: true, onclick: () => api.done(true) }, 'Got it! →')));
      },
    });
  };

  /** Three practice questions (not part of the final 20 marks). Returns first-try score. */
  S.chapterCheck = function (n) {
    const qs = WW.data.checks[n];
    let i = 0, score = 0, tries = 0;
    return S.panel({
      kicker: `CHAPTER ${n} · QUICK CHECK (PRACTICE)`,
      title: '✏️ Check your understanding',
      closable: false,
      build(body, api) {
        const render = () => {
          body.innerHTML = '';
          const q = qs[i];
          tries = 0;
          const prog = el('div', { class: 'assess-progress' }, ...qs.map((_, k) => el('span', { class: k < i ? 'done' : k === i ? 'now' : '' })));
          const grid = el('div', { class: 'answer-grid' });
          q.options.forEach((o, k) => {
            const b = el('button', { class: 'answer', type: 'button' }, el('span', { class: 'choice-num' }, String(k + 1)), el('span', null, o));
            b.addEventListener('click', () => {
              if (b.disabled) return;
              tries++;
              if (k === q.a) {
                if (tries === 1) score++;
                b.classList.add('right');
                WW.audio.sfx('correct');
                grid.querySelectorAll('button').forEach((x) => (x.disabled = true));
                api.feedback(`✅ ${U.esc(q.why)}`, 'good');
                const next = el('button', { class: 'btn primary', type: 'button', onclick: () => { i++; if (i < qs.length) render(); else finish(); } }, i < qs.length - 1 ? 'Next question →' : 'Finish →');
                body.appendChild(el('div', { class: 'row end', style: { marginTop: 'calc(var(--u) * 8)' } }, next));
                setTimeout(() => next.focus(), 30);
              } else {
                b.classList.add('wrong');
                b.disabled = true;
                WW.audio.sfx('wrong');
                api.feedback('🤔 Not quite — have another go! You can try again.', 'bad');
              }
            });
            grid.appendChild(b);
          });
          body.append(prog, el('p', null, el('b', null, `Question ${i + 1} of ${qs.length}: `), q.q), grid);
          api.onKey = (a) => { const k = { c1: 0, c2: 1, c3: 2 }[a]; if (k != null) grid.children[k] && grid.children[k].click(); };
          setTimeout(() => { if (WW.input.lastDevice === 'keyboard') grid.querySelector('button').focus(); }, 40);
        };
        const finish = () => {
          WW.save.data.stats.checks['ch' + n] = { score, max: qs.length };
          WW.save.commit();
          api.done(score);
        };
        render();
      },
    });
  };

  /** Chapter complete celebration. */
  S.chapterComplete = function (n, learn, nextText) {
    WW.audio.sfx('fanfare');
    WW.fx.spawn('confetti', WW.engine.W / 2, WW.engine.H / 2, { screen: true });
    const ch = WW.data.chapters[n - 1];
    return S.panel({
      kicker: `CHAPTER ${n} COMPLETE!`,
      title: `${ch.icon} ${ch.title}`,
      closable: false,
      build(body, api) {
        body.append(
          el('div', { class: 'learn-card' }, miloCanvas(150, 'excited', 'celebrate'),
            el('div', null,
              el('div', { class: 'badge-row' }, el('div', { class: 'badge' }, el('i', null, learn.badge.icon), 'Badge earned: ' + learn.badge.name)),
              el('p', { style: { marginTop: 'calc(var(--u) * 10)' } }, nextText || ''),
              el('p', { class: 'fine' }, 'Eco points are a game score — they are not a measurement of real-world carbon savings.'),
            )),
          el('div', { class: 'row end' }, el('button', { class: 'btn primary big', type: 'button', autofocus: true, onclick: () => api.done(true) }, 'Continue the adventure →')),
        );
      },
    });
  };

  /** Rewind-time visual effect (for "what if" branches). */
  S.flash = function (color = '#ffffff', dur = 0.5) {
    const n = el('div', { style: { position: 'absolute', inset: '0', background: color, opacity: '0.9', transition: `opacity ${dur}s`, pointerEvents: 'none', zIndex: 15 } });
    WW.ui.root.appendChild(n);
    requestAnimationFrame(() => (n.style.opacity = '0'));
    setTimeout(() => n.remove(), dur * 1000 + 100);
  };
  S.tint = function (on, color = 'rgba(80,60,40,.35)') {
    let n = document.getElementById('tint');
    if (!n) {
      n = el('div', { id: 'tint', style: { position: 'absolute', inset: '0', pointerEvents: 'none', transition: 'background .8s', zIndex: 1 } });
      WW.ui.root.prepend(n);
    }
    n.style.background = on ? color : 'transparent';
  };
})();
