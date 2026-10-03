/* WasteWise — unified input: keyboard, on-screen joystick/buttons and pointer taps.
   Scenes read actions with WW.input.down('left') and WW.input.pressed('action'). */
(function () {
  'use strict';
  const WW = window.WW;
  const KEYMAP = {
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
    Shift: 'run',
    e: 'action', E: 'action', ' ': 'action', Enter: 'action',
    Escape: 'pause', p: 'pause', P: 'pause',
    n: 'notebook', N: 'notebook',
    '1': 'c1', '2': 'c2', '3': 'c3', '4': 'c4',
  };

  const input = (WW.input = {
    held: new Set(),
    justPressed: new Set(),
    axis: { x: 0, y: 0 }, // analog from touch joystick
    touchRun: false,
    lastDevice: 'keyboard',
    tapHandler: null, // set by scenes: fn(worldX, worldY)

    down(action) {
      return this.held.has(action);
    },
    pressed(action) {
      return this.justPressed.has(action);
    },
    consume(action) {
      this.justPressed.delete(action);
    },
    press(action) {
      this.justPressed.add(action);
    },
    endFrame() {
      this.justPressed.clear();
    },
    clear() {
      this.held.clear();
      this.justPressed.clear();
      this.axis.x = this.axis.y = 0;
    },
    /** Movement vector from keys + joystick, normalised. */
    moveVector() {
      let x = (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0) + this.axis.x;
      let y = (this.down('down') ? 1 : 0) - (this.down('up') ? 1 : 0) + this.axis.y;
      const len = Math.hypot(x, y);
      if (len > 1) { x /= len; y /= len; }
      return { x, y, len: Math.min(1, len) };
    },
    running() {
      return this.down('run') || this.touchRun;
    },
  });

  function typingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  window.addEventListener('keydown', (e) => {
    WW.audio && WW.audio.unlock();
    if (typingTarget(document.activeElement)) return;
    const action = KEYMAP[e.key];
    if (!action) return;
    // Let focused buttons handle Space/Enter natively (prevents double activation).
    const focused = document.activeElement;
    const onButton = focused && focused !== document.body && (focused.tagName === 'BUTTON' || focused.getAttribute('role') === 'button');
    if (onButton && (e.key === ' ' || e.key === 'Enter')) return;
    input.lastDevice = 'keyboard';
    if (!e.repeat) input.justPressed.add(action);
    input.held.add(action);
    if (['up', 'down', 'left', 'right', 'action'].includes(action)) e.preventDefault();
  });

  window.addEventListener('keyup', (e) => {
    const action = KEYMAP[e.key];
    if (action) input.held.delete(action);
    // Shift released while another key pressed: browsers send uppercase letters, release both cases.
    if (e.key && e.key.length === 1) {
      const a2 = KEYMAP[e.key.toLowerCase()] || KEYMAP[e.key.toUpperCase()];
      if (a2) input.held.delete(a2);
    }
  });

  window.addEventListener('blur', () => input.clear());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) input.clear();
  });

  /* ---------- On-screen touch controls ---------- */
  input.buildTouchControls = function (container) {
    const U = WW.util;
    container.innerHTML = '';
    const stick = U.el('div', { class: 'joystick', 'aria-label': 'Movement joystick', 'data-hud-obstacle': '' });
    const knob = U.el('div', { class: 'joystick-knob' });
    stick.appendChild(knob);
    const actionBtn = U.el('button', { class: 'touch-btn touch-action', type: 'button', 'aria-label': 'Interact', 'data-hud-obstacle': '' }, '✋');
    const runBtn = U.el('button', { class: 'touch-btn touch-run', type: 'button', 'aria-label': 'Toggle running', 'aria-pressed': 'false', 'data-hud-obstacle': '' }, '🏃');
    container.append(stick, actionBtn, runBtn);

    let activeId = null;
    const radius = () => stick.getBoundingClientRect().width / 2;
    const update = (e) => {
      const r = stick.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const max = radius() * 0.6;
      const len = Math.hypot(dx, dy);
      if (len > max) { dx = (dx / len) * max; dy = (dy / len) * max; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const nx = dx / max, ny = dy / max;
      const dead = 0.18;
      input.axis.x = Math.abs(nx) < dead ? 0 : nx;
      input.axis.y = Math.abs(ny) < dead ? 0 : ny;
    };
    stick.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      WW.audio && WW.audio.unlock();
      activeId = e.pointerId;
      try { stick.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or already-released pointer */ }
      input.lastDevice = 'touch';
      update(e);
    });
    stick.addEventListener('pointermove', (e) => {
      if (e.pointerId === activeId) update(e);
    });
    const release = (e) => {
      if (e.pointerId !== activeId) return;
      activeId = null;
      knob.style.transform = '';
      input.axis.x = input.axis.y = 0;
    };
    stick.addEventListener('pointerup', release);
    stick.addEventListener('pointercancel', release);
    stick.addEventListener('lostpointercapture', release);

    actionBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      WW.audio && WW.audio.unlock();
      input.lastDevice = 'touch';
      input.press('action');
    });
    runBtn.addEventListener('click', () => {
      input.touchRun = !input.touchRun;
      runBtn.classList.toggle('on', input.touchRun);
      runBtn.setAttribute('aria-pressed', String(input.touchRun));
    });
  };
})();
