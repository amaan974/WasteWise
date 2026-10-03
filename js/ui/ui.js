/* WasteWise — DOM user interface layered over the canvas:
   HUD, dialogue (portrait + typed subtitles + voice), choices, modal panels, toasts,
   pause/settings menu and the Eco Notebook. Every spoken line is always shown as text. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;
  const el = U.el;

  const UI = (WW.ui = {
    root: null,
    blocking: 0,
  });

  UI.init = function () {
    UI.root = document.getElementById('ui');
    UI.touch = document.getElementById('touch');
    UI.hud.build();
    UI.dialogue.build();
    UI.panelLayer = el('div', { class: 'panel-layer', 'aria-live': 'polite' });
    UI.toastLayer = el('div', { class: 'toast-layer', role: 'status', 'aria-live': 'polite' });
    UI.screenLayer = el('div', { class: 'screen-layer' });
    UI.menuLayer = el('div', { class: 'menu-layer' });
    UI.root.append(UI.screenLayer, UI.panelLayer, UI.toastLayer, UI.menuLayer);
    WW.input.buildTouchControls(UI.touch);
    UI.applyTextSize();
  };

  UI.applyTextSize = function () {
    document.body.classList.toggle('big-text', !!WW.save.settings.bigText);
    document.body.classList.toggle('reduced-motion', WW.save.reducedMotion());
  };

  UI.isBlocking = () => UI.dialogue.open || UI.panel.stack.length > 0 || UI.menu.isOpen || !!UI.screenLayer.firstChild;
  UI.isPausedOverlay = () => UI.menu.isOpen;
  UI.isSpeaking = (who) => UI.dialogue.open && UI.dialogue.who === who && (UI.dialogue.typing || (WW.audio.speaking && UI.dialogue.voiceStarted));
  UI.clearScene = function () {
    UI.dialogue.close(true);
    UI.panel.closeAll();
    UI.clearScreen();
  };
  UI.showTouch = function (on) {
    const pref = WW.save.settings.showTouch;
    const want = on && (pref == null ? U.isTouchDevice() : pref);
    UI.touch.classList.toggle('visible', !!want);
  };

  UI.update = function (dt) {
    UI.dialogue.update(dt);
    if (UI.menu.isOpen && WW.input.pressed('pause')) { WW.input.consume('pause'); UI.menu.close(); }
    const top = UI.panel.stack[UI.panel.stack.length - 1];
    if (top && top.onKey) {
      for (const a of ['up', 'down', 'left', 'right', 'action', 'c1', 'c2', 'c3', 'c4']) if (WW.input.pressed(a)) { top.onKey(a); WW.input.consume(a); }
    }
    if (top && top.tick) top.tick(dt);
  };

  /* ------------------------------ HUD ------------------------------ */
  UI.hud = {
    build() {
      this.node = el('div', { class: 'hud hidden' });
      this.chip = el('div', { class: 'hud-chapter' });
      this.obj = el('div', { class: 'hud-objective', 'aria-live': 'polite' });
      const left = el('div', { class: 'hud-left' }, this.chip, this.obj);
      this.points = el('div', { class: 'hud-points', title: 'Eco points (game score, not real-world impact)' });
      this.btnNote = el('button', { class: 'hud-btn', type: 'button', 'aria-label': 'Open Eco Notebook (N)', title: 'Eco Notebook (N)', onclick: () => UI.notebook.open() }, '📓');
      this.btnSound = el('button', { class: 'hud-btn', type: 'button', 'aria-label': 'Mute or unmute sound', title: 'Sound on/off', onclick: () => UI.toggleMute() });
      this.btnPause = el('button', { class: 'hud-btn', type: 'button', 'aria-label': 'Pause menu (Esc)', title: 'Pause / settings (Esc)', onclick: () => UI.menu.open() }, '⏸');
      const right = el('div', { class: 'hud-right' }, this.points, this.btnNote, this.btnSound, this.btnPause);
      this.node.append(left, right);
      UI.root.appendChild(this.node);
      this.refresh();
    },
    show(on) {
      this.node.classList.toggle('hidden', !on);
      this.refresh();
    },
    refresh() {
      const st = WW.story;
      const chap = st && st.chapterLabel ? st.chapterLabel() : '';
      this.chip.textContent = chap;
      this.chip.style.display = chap ? '' : 'none';
      const o = st && st.objective ? st.objective.text : '';
      this.obj.innerHTML = o ? `<span class="obj-star">★</span> ${U.esc(o)}` : '';
      this.obj.style.display = o ? '' : 'none';
      this.points.innerHTML = `🌿 <b>${WW.save.data.stats.ecoPoints}</b>`;
      this.btnSound.textContent = WW.save.settings.muted ? '🔇' : '🔊';
    },
  };

  UI.toggleMute = function () {
    const s = WW.save.settings;
    s.muted = !s.muted;
    WW.save.commitSettings();
    WW.audio.applySettings(s);
    if (s.muted) WW.audio.stopSpeech();
    UI.hud.refresh();
    UI.toast(s.muted ? '🔇 Sound off — subtitles stay on' : '🔊 Sound on');
  };

  /* ---------------------------- DIALOGUE ---------------------------- */
  function parseMarkup(text) {
    // **bold** segments
    const out = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ t: text.slice(last, m.index), b: false });
      out.push({ t: m[1], b: true });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ t: text.slice(last), b: false });
    return out;
  }
  function renderUpTo(segs, n) {
    let html = '', left = n;
    for (const s of segs) {
      if (left <= 0) break;
      const part = s.t.slice(0, left);
      left -= part.length;
      html += s.b ? `<strong>${U.esc(part)}</strong>` : U.esc(part);
    }
    return html;
  }

  UI.dialogue = {
    open: false,
    typing: false,
    who: null,
    build() {
      this.node = el('div', { class: 'dialogue hidden', role: 'dialog', 'aria-label': 'Character dialogue' });
      this.portrait = el('canvas', { class: 'portrait', width: 240, height: 240, 'aria-hidden': 'true' });
      this.name = el('div', { class: 'd-name' });
      this.text = el('div', { class: 'd-text', 'aria-live': 'polite' });
      this.choices = el('div', { class: 'd-choices' });
      this.nextBtn = el('button', { class: 'd-next', type: 'button', 'aria-label': 'Next line (E / Space)', onclick: (e) => { e.stopPropagation(); this.advance(); } }, '▶');
      this.replayBtn = el('button', { class: 'd-replay', type: 'button', 'aria-label': 'Replay voice', title: 'Hear it again', onclick: (e) => { e.stopPropagation(); this.replay(); } }, '🔁');
      const body = el('div', { class: 'd-body' }, this.name, this.text, this.choices);
      const ctrls = el('div', { class: 'd-ctrls' }, this.replayBtn, this.nextBtn);
      this.node.append(el('div', { class: 'd-portrait-wrap' }, this.portrait), body, ctrls);
      this.node.addEventListener('click', () => { if (!this.choiceMode) this.advance(); });
      UI.root.appendChild(this.node);
      this.pctx = this.portrait.getContext('2d');
    },
    say(who, text, opts = {}) {
      return new Promise((resolve) => {
        this._hideT = 0;
        const info = WW.chars.INFO[who] || WW.chars.INFO.narrator;
        this.open = true;
        this.who = who;
        this.emotion = opts.emotion || 'happy';
        this.lineId = opts.id || null;
        const full = U.fill(text, { name: WW.save.name() });
        this.segs = parseMarkup(full);
        this.plain = this.segs.map((s) => s.t).join('');
        this.shown = 0;
        this.typing = true;
        this.resolve = resolve;
        this.choiceMode = false;
        this.choices.innerHTML = '';
        this.node.classList.remove('hidden', 'with-choices');
        this.node.classList.toggle('narrator', who === 'narrator');
        this.node.style.setProperty('--who', info.color);
        this.name.textContent = who === 'kid' ? WW.save.name() : info.name;
        this.text.innerHTML = '';
        this.nextBtn.style.visibility = 'hidden';
        this.voiceStarted = who !== 'narrator' && who !== 'kid' ? WW.audio.speak(who, this.plain, this.lineId) : false;
        this.replayBtn.style.display = WW.audio.settings.voiceMode === 'speech' && !WW.save.settings.muted && who !== 'narrator' && who !== 'kid' ? '' : 'none';
        if (opts.actor) opts.actor.emotion = this.emotion;
        this.actor = opts.actor || null;
        this.cps = 46 * (WW.save.settings.textSpeed || 1);
        if (WW.save.reducedMotion() && WW.save.settings.textSpeed >= 2) this.shown = this.plain.length;
        this._acc = 0;
      });
    },
    ask(who, text, choices, opts = {}) {
      return new Promise((resolve) => {
        this.say(who, text, opts);
        this.choiceMode = true;
        this.pendingChoices = choices;
        this.choiceResolve = resolve;
        this.resolve = null;
      });
    },
    showChoices() {
      const list = this.pendingChoices || [];
      this.choices.innerHTML = '';
      this.node.classList.add('with-choices');
      list.forEach((c, i) => {
        const b = el('button', { class: 'choice-btn', type: 'button', dataset: { id: c.id } },
          el('span', { class: 'choice-num' }, String(i + 1)),
          c.icon ? el('span', { class: 'choice-icon', 'aria-hidden': 'true' }, c.icon) : null,
          el('span', { class: 'choice-text' }, U.fill(c.text, { name: WW.save.name() })));
        b.addEventListener('click', (e) => { e.stopPropagation(); this.pick(c); });
        b.addEventListener('mouseenter', () => WW.audio.sfx('hover'));
        this.choices.appendChild(b);
      });
      this.nextBtn.style.visibility = 'hidden';
      const first = this.choices.querySelector('button');
      if (first && WW.input.lastDevice === 'keyboard') setTimeout(() => first.focus(), 30);
    },
    pick(c) {
      if (!this.choiceResolve) return;
      WW.audio.sfx('click');
      WW.audio.stopSpeech();
      const r = this.choiceResolve;
      this.choiceResolve = null;
      this.choiceMode = false;
      this.choices.innerHTML = '';
      this.node.classList.remove('with-choices');
      this.scheduleHide();
      r(c.id);
    },
    advance() {
      if (!this.open) return;
      if (this.typing) {
        this.shown = this.plain.length;
        return;
      }
      if (this.choiceMode) return;
      WW.audio.sfx('click');
      if (WW.audio.settings.voiceMode === 'speech') WW.audio.stopSpeech();
      const r = this.resolve;
      this.resolve = null;
      this.scheduleHide();
      r && r();
    },
    replay() {
      if (!this.open) return;
      this.voiceStarted = WW.audio.speak(this.who, this.plain, this.lineId);
    },
    scheduleHide() {
      // closed by update() after a short grace period, so back-to-back lines don't flicker
      this._hideT = 0.14;
    },
    close(force) {
      this._hideT = 0;
      if (force) {
        WW.audio.stopSpeech();
        if (this.resolve) { const r = this.resolve; this.resolve = null; r(); }
        if (this.choiceResolve) { const r = this.choiceResolve; this.choiceResolve = null; r(null); }
      }
      this.open = false;
      this.typing = false;
      this.node.classList.add('hidden');
    },
    update(dt) {
      if (!this.open) return;
      if (this._hideT > 0) {
        this._hideT -= dt;
        if (this._hideT <= 0 && !this.resolve && !this.choiceResolve) { this.close(); return; }
      }
      if (this.typing) {
        this._acc += dt * this.cps;
        const before = this.shown;
        this.shown = Math.min(this.plain.length, this.shown + Math.floor(this._acc));
        this._acc -= Math.floor(this._acc);
        if (this.shown !== before) {
          this.text.innerHTML = renderUpTo(this.segs, this.shown);
          const ch = this.plain[this.shown - 1];
          if (this.shown % 2 === 0 && ch && /[a-z0-9]/i.test(ch)) WW.audio.chatter(this.who);
        }
        if (this.shown >= this.plain.length) {
          this.typing = false;
          this.text.innerHTML = renderUpTo(this.segs, this.shown);
          if (this.choiceMode) this.showChoices();
          else this.nextBtn.style.visibility = 'visible';
        }
      }
      if (WW.input.pressed('action')) {
        WW.input.consume('action');
        if (this.choiceMode && !this.typing) {
          // keyboard users: action key activates the focused choice (handled natively) or first choice
        } else this.advance();
      }
      if (this.choiceMode && !this.typing) {
        for (let i = 1; i <= 4; i++) if (WW.input.pressed('c' + i)) {
          WW.input.consume('c' + i);
          const c = this.pendingChoices[i - 1];
          if (c) this.pick(c);
        }
      }
      // animated portrait
      if (this.who && this.who !== 'narrator') {
        const talking = this.typing || (WW.audio.speaking && this.voiceStarted);
        WW.chars.portrait(this.pctx, this.who, 240, 240, { t: WW.engine.time, talking, emotion: this.emotion, scale: undefined });
      } else this.pctx.clearRect(0, 0, 240, 240);
    },
  };

  /* ------------------------------ PANELS ------------------------------ */
  UI.panel = {
    stack: [],
    open(opts) {
      return new Promise((resolve) => {
        const p = { opts, resolve, onKey: null, tick: null };
        const node = el('div', { class: 'panel-backdrop' + (opts.dim === false ? ' clear' : '') });
        const card = el('div', { class: 'panel ' + (opts.className || '') + (opts.wide ? ' wide' : '') + (opts.full ? ' full' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title || 'Activity' });
        const head = el('div', { class: 'panel-head' });
        if (opts.kicker) head.appendChild(el('div', { class: 'panel-kicker' }, opts.kicker));
        if (opts.title) head.appendChild(el('h2', { class: 'panel-title' }, opts.title));
        if (opts.closable !== false) {
          head.appendChild(el('button', { class: 'panel-close', type: 'button', 'aria-label': opts.closeLabel || 'Close', title: opts.closeLabel || 'Close', onclick: () => api.close() }, opts.closeText || '✕'));
        }
        const body = el('div', { class: 'panel-body' });
        const fb = el('div', { class: 'panel-feedback', role: 'status', 'aria-live': 'polite' });
        card.append(head, body, fb);
        node.appendChild(card);
        UI.panelLayer.appendChild(node);
        p.node = node;
        const api = {
          body, card, head, node,
          done(result) {
            UI.panel._remove(p);
            resolve(result);
          },
          close() {
            WW.audio.sfx('click');
            UI.panel._remove(p);
            resolve(null);
          },
          feedback(html, kind = 'good') {
            fb.className = 'panel-feedback show ' + kind;
            fb.innerHTML = html;
            clearTimeout(fb._t);
            if (kind !== 'sticky') fb._t = setTimeout(() => fb.classList.remove('show'), kind === 'bad' ? 6500 : 5000);
          },
          clearFeedback() { fb.className = 'panel-feedback'; },
          set onKey(fn) { p.onKey = fn; },
          set tick(fn) { p.tick = fn; },
        };
        p.api = api;
        this.stack.push(p);
        WW.audio.sfx('page');
        opts.build && opts.build(body, api);
        requestAnimationFrame(() => node.classList.add('in'));
        setTimeout(() => {
          const f = card.querySelector('[autofocus]') || (WW.input.lastDevice === 'keyboard' ? card.querySelector('.panel-body button:not([disabled]), .panel-body input, .panel-body textarea') : null);
          f && f.focus();
        }, 60);
      });
    },
    _remove(p) {
      this.stack = this.stack.filter((x) => x !== p);
      p.node.classList.remove('in');
      p.node.classList.add('out');
      setTimeout(() => p.node.remove(), 220);
    },
    closeAll() {
      for (const p of this.stack.slice()) { this._remove(p); p.resolve(null); }
      this.stack = [];
    },
  };

  /* ------------------------------ TOASTS ------------------------------ */
  UI.toast = function (html, kind = 'info', ms = 2800) {
    const t = el('div', { class: 'toast ' + kind, html });
    UI.toastLayer.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, ms);
  };
  UI.points = function (n, why) {
    WW.save.addPoints(n);
    UI.hud.refresh();
    WW.audio.sfx('coin');
    UI.toast(`🌿 <b>+${n}</b> Eco points${why ? ' · ' + U.esc(why) : ''}`, 'points', 2200);
  };

  /* --------------------------- FULL SCREENS --------------------------- */
  UI.showScreen = function (node) {
    UI.screenLayer.innerHTML = '';
    UI.screenLayer.appendChild(node);
    requestAnimationFrame(() => node.classList.add('in'));
  };
  UI.clearScreen = function () {
    UI.screenLayer.innerHTML = '';
  };

  /* ------------------------------ MENU ------------------------------ */
  UI.menu = {
    isOpen: false,
    open(tab = 'main') {
      if (this.isOpen) return;
      this.isOpen = true;
      WW.audio.sfx('page');
      WW.audio.stopSpeech();
      this.render(tab);
    },
    close() {
      this.isOpen = false;
      UI.menuLayer.innerHTML = '';
      WW.input.clear();
    },
    render(tab) {
      UI.menuLayer.innerHTML = '';
      const card = el('div', { class: 'menu-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Pause menu' });
      const wrap = el('div', { class: 'menu-backdrop' }, card);
      UI.menuLayer.appendChild(wrap);
      if (tab === 'main') {
        card.append(
          el('h2', { class: 'menu-title' }, '⏸ Paused'),
          el('div', { class: 'menu-buttons' },
            el('button', { class: 'btn primary', type: 'button', autofocus: true, onclick: () => this.close() }, '▶ Keep playing'),
            el('button', { class: 'btn', type: 'button', onclick: () => this.render('help') }, '❓ How to play'),
            el('button', { class: 'btn', type: 'button', onclick: () => this.render('settings') }, '⚙ Sound & settings'),
            el('button', { class: 'btn', type: 'button', onclick: () => { this.close(); UI.notebook.open(); } }, '📓 Eco Notebook'),
            el('button', { class: 'btn', type: 'button', onclick: () => this.render('teacher') }, '👩‍🏫 Teacher & demo options'),
            el('button', { class: 'btn ghost', type: 'button', onclick: () => { this.close(); WW.story.toTitle(); } }, '⌂ Back to title screen'),
          ),
        );
      } else if (tab === 'help') {
        card.append(el('h2', { class: 'menu-title' }, '❓ How to play'), UI.helpContent(), el('div', { class: 'menu-buttons row' }, el('button', { class: 'btn primary', type: 'button', autofocus: true, onclick: () => this.render('main') }, '← Back')));
      } else if (tab === 'settings') {
        card.append(el('h2', { class: 'menu-title' }, '⚙ Sound & settings'), UI.settingsForm(), el('div', { class: 'menu-buttons row' }, el('button', { class: 'btn primary', type: 'button', onclick: () => this.render('main') }, '← Back')));
      } else if (tab === 'teacher') {
        const s = WW.save.data;
        card.append(
          el('h2', { class: 'menu-title' }, '👩‍🏫 Teacher & demo options'),
          el('p', { class: 'menu-note' }, 'Progress is saved only on this device (no accounts, nothing uploaded).'),
          el('div', { class: 'menu-buttons' },
            el('button', { class: 'btn', type: 'button', onclick: () => { s.demoUnlocked = !s.demoUnlocked; WW.save.commit(); UI.toast(s.demoUnlocked ? '🔓 All chapters unlocked for demonstration' : '🔒 Normal chapter order restored'); WW.story.onWorldChanged(); this.render('teacher'); } }, s.demoUnlocked ? '🔒 Use normal chapter order' : '🔓 Unlock all chapters (demo mode)'),
            el('button', { class: 'btn', type: 'button', onclick: () => { this.close(); WW.story.openChapterSelect(); } }, '🗺 Jump to a chapter'),
            el('button', { class: 'btn danger', type: 'button', onclick: () => { if (confirm('Erase all progress on this device and start again?')) { WW.save.reset(); this.close(); WW.story.toTitle(); UI.toast('Progress reset.'); } } }, '🗑 Reset all progress'),
            el('button', { class: 'btn primary', type: 'button', onclick: () => this.render('main') }, '← Back'),
          ),
        );
      }
      setTimeout(() => { const f = card.querySelector('[autofocus]') || card.querySelector('button'); f && f.focus(); }, 30);
    },
  };

  UI.helpContent = function () {
    return el('div', { class: 'help-grid' },
      el('div', { class: 'help-item' }, el('b', null, '🚶 Move'), el('span', null, 'Arrow keys or WASD. Hold Shift to run. On a tablet, use the joystick or tap where you want to go.')),
      el('div', { class: 'help-item' }, el('b', null, '✋ Talk / use'), el('span', null, 'Walk close to someone or something and press E, Space or Enter — or tap it.')),
      el('div', { class: 'help-item' }, el('b', null, '💬 Dialogue'), el('span', null, 'Press E / Space or click the box for the next line. Pick answers with the buttons or keys 1–4.')),
      el('div', { class: 'help-item' }, el('b', null, '★ Objectives'), el('span', null, 'The yellow arrow shows where to go next. Your goal is written at the top left.')),
      el('div', { class: 'help-item' }, el('b', null, '📓 Notebook'), el('span', null, 'Press N or the notebook button to see clues and what you have learned.')),
      el('div', { class: 'help-item' }, el('b', null, '⏸ Pause'), el('span', null, 'Esc or the pause button. Change sound, voices and text speed there.')),
    );
  };

  UI.settingsForm = function () {
    const s = WW.save.settings;
    const save = () => { WW.save.commitSettings(); WW.audio.applySettings({ music: s.music, sfx: s.sfx, voiceMode: s.voiceMode, muted: s.muted }); UI.hud.refresh(); UI.applyTextSize(); };
    const range = (label, key) => el('label', { class: 'set-row' }, el('span', null, label), el('input', { type: 'range', min: 0, max: 1, step: 0.05, value: s[key], oninput: (e) => { s[key] = parseFloat(e.target.value); save(); }, onchange: () => WW.audio.sfx('click') }));
    const voiceSel = el('select', { onchange: (e) => { s.voiceMode = e.target.value; save(); if (s.voiceMode === 'speech') WW.audio.speak('milo', 'Hi! This is my voice!'); } },
      el('option', { value: 'speech', selected: s.voiceMode === 'speech' }, 'Read aloud (browser voices)'),
      el('option', { value: 'chatter', selected: s.voiceMode === 'chatter' }, 'Cartoon chatter sounds'),
      el('option', { value: 'off', selected: s.voiceMode === 'off' }, 'No voices (text only)'));
    const speedSel = el('select', { onchange: (e) => { s.textSpeed = parseFloat(e.target.value); save(); } },
      ...[[0.6, 'Slow'], [1, 'Normal'], [1.6, 'Fast'], [3, 'Instant-ish']].map(([v, l]) => el('option', { value: v, selected: s.textSpeed == v }, l)));
    const chk = (label, get, set) => el('label', { class: 'set-row check' }, el('input', { type: 'checkbox', checked: get(), onchange: (e) => { set(e.target.checked); save(); } }), el('span', null, label));
    return el('div', { class: 'settings' },
      range('🎵 Music volume', 'music'),
      range('🔔 Sound effects', 'sfx'),
      el('label', { class: 'set-row' }, el('span', null, '🗣 Character voices'), voiceSel),
      el('label', { class: 'set-row' }, el('span', null, '⌨ Text speed'), speedSel),
      chk('🔇 Mute all sound', () => s.muted, (v) => (s.muted = v)),
      chk('🐢 Reduce motion & flashing', () => WW.save.reducedMotion(), (v) => (s.reducedMotion = v)),
      chk('🔠 Bigger text', () => !!s.bigText, (v) => (s.bigText = v)),
      chk('🕹 Show touch controls', () => (s.showTouch == null ? U.isTouchDevice() : s.showTouch), (v) => { s.showTouch = v; UI.showTouch(WW.engine.scene && WW.engine.scene.player); }),
      el('p', { class: 'menu-note' }, WW.audio.speechAvailable() ? 'Voices use your browser’s built-in speech. Subtitles are always shown.' : 'Your browser has no built-in voices — try “Cartoon chatter”. Subtitles are always shown.'),
    );
  };

  /* ---------------------------- NOTEBOOK ---------------------------- */
  UI.notebook = {
    open() {
      if (UI.panel.stack.length || UI.dialogue.open) return;
      const st = WW.story;
      UI.panel.open({
        title: '📓 My Eco Notebook',
        kicker: WW.save.name().toUpperCase() + '’S FIELD NOTES',
        className: 'notebook',
        wide: true,
        build(body) {
          body.appendChild(st.notebookContent());
        },
      });
    },
  };
})();
