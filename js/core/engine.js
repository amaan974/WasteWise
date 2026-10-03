/* WasteWise — engine: canvas scaling, main loop, scenes, timers, tweens and transitions.
   All drawing uses a fixed logical resolution of 960x540 that is scaled to fit the window. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;

  const E = (WW.engine = {
    W: 960,
    H: 540,
    canvas: null,
    ctx: null,
    stage: null,
    scale: 1,
    pixelRatio: 1,
    time: 0,
    frame: 0,
    scenes: {},
    scene: null,
    sceneName: '',
    paused: false,
    timers: [],
    tweens: [],
    transition: null,
    shake: 0,
    fps: 60,
    onResize: [],
  });

  E.init = function () {
    E.stage = document.getElementById('stage');
    E.canvas = document.getElementById('game');
    E.ctx = E.canvas.getContext('2d');
    window.addEventListener('resize', E.resize);
    window.addEventListener('orientationchange', () => setTimeout(E.resize, 150));
    E.resize();
    // pointer taps on the canvas -> scene
    E.canvas.addEventListener('pointerdown', (e) => {
      WW.audio.unlock();
      const p = E.toLogical(e.clientX, e.clientY);
      WW.input.lastDevice = e.pointerType === 'touch' ? 'touch' : 'mouse';
      if (E.transition) return;
      if (E.scene && E.scene.onPointerDown) E.scene.onPointerDown(p.x, p.y, e);
    });
    E.canvas.addEventListener('pointermove', (e) => {
      if (E.scene && E.scene.onPointerMove) {
        const p = E.toLogical(e.clientX, e.clientY);
        E.scene.onPointerMove(p.x, p.y, e);
      }
    });
    let last = performance.now();
    const loop = (now) => {
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.1) dt = 0.1; // tab switch / hitch guard
      E.fps = E.fps * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
      E.step(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  E.resize = function () {
    const vw = window.innerWidth, vh = window.innerHeight;
    const aspect = 16 / 9;
    let w = vw, h = vw / aspect;
    if (h > vh) { h = vh; w = vh * aspect; }
    w = Math.floor(w); h = Math.floor(h);
    E.stage.style.width = w + 'px';
    E.stage.style.height = h + 'px';
    E.scale = w / E.W;
    document.documentElement.style.setProperty('--u', E.scale + 'px');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // keep backing store under ~8 megapixels for older tablets / Chromebooks
    let pr = E.scale * dpr;
    const maxPr = Math.sqrt(8e6 / (E.W * E.H));
    pr = Math.min(pr, maxPr);
    E.pixelRatio = pr;
    E.canvas.width = Math.round(E.W * pr);
    E.canvas.height = Math.round(E.H * pr);
    E.canvas.style.width = w + 'px';
    E.canvas.style.height = h + 'px';
    E.onResize.forEach((fn) => fn());
  };

  E.toLogical = function (cx, cy) {
    const r = E.canvas.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * E.W, y: ((cy - r.top) / r.height) * E.H };
  };

  E.register = function (name, scene) {
    E.scenes[name] = scene;
    scene.name = name;
  };

  /** Switch scene, with an iris or fade transition. Resolves when the new scene is visible. */
  E.go = function (name, params = {}, opts = {}) {
    return new Promise((resolve) => {
      const type = WW.save.reducedMotion() ? 'fade' : opts.type || 'iris';
      const dur = opts.dur || (type === 'fade' ? 0.35 : 0.5);
      if (!E.scene || opts.instant) {
        E._switch(name, params);
        resolve();
        return;
      }
      WW.audio.sfx('whoosh');
      E.transition = { phase: 'out', t: 0, dur, type, cx: opts.cx ?? E.W / 2, cy: opts.cy ?? E.H / 2, name, params, resolve };
      WW.input.clear();
    });
  };

  E._switch = function (name, params) {
    if (E.scene && E.scene.exit) E.scene.exit();
    WW.ui && WW.ui.clearScene();
    E.scene = E.scenes[name];
    E.sceneName = name;
    E.timers = E.timers.filter((t) => t.global);
    E.tweens = [];
    WW.input.clear();
    if (!E.scene) throw new Error('Unknown scene ' + name);
    E.scene.enter && E.scene.enter(params || {});
    document.body.dataset.scene = name;
  };

  /** Promise that resolves after `sec` seconds of (unpaused) game time. */
  E.after = function (sec, global = false) {
    return new Promise((resolve) => E.timers.push({ t: sec, resolve, global }));
  };

  /** Tween numeric properties of obj. */
  E.tween = function (obj, props, dur, ease = U.ease.inOut) {
    return new Promise((resolve) => {
      const from = {};
      for (const k in props) from[k] = obj[k];
      E.tweens.push({ obj, from, to: props, t: 0, dur: Math.max(0.001, dur), ease, resolve });
    });
  };

  E.addShake = function (amount) {
    if (WW.save.reducedMotion()) return;
    E.shake = Math.max(E.shake, amount);
  };

  E.step = function (dt) {
    E.frame++;
    const ctx = E.ctx;
    const paused = E.paused || (WW.ui && WW.ui.isPausedOverlay());
    if (!paused) {
      E.time += dt;
      // timers
      if (E.timers.length) {
        const keep = [];
        for (const t of E.timers) {
          t.t -= dt;
          if (t.t <= 0) t.resolve();
          else keep.push(t);
        }
        E.timers = keep;
      }
      // tweens
      if (E.tweens.length) {
        const keep = [];
        for (const tw of E.tweens) {
          tw.t += dt;
          const k = Math.min(1, tw.t / tw.dur);
          const e = tw.ease(k);
          for (const p in tw.to) tw.obj[p] = U.lerp(tw.from[p], tw.to[p], e);
          if (k >= 1) tw.resolve();
          else keep.push(tw);
        }
        E.tweens = keep;
      }
    }
    // UI first (dialogue consumes the action key)
    WW.ui && WW.ui.update(dt);
    if (E.transition) E._updateTransition(dt);
    if (E.scene && !paused && !E.transition && E.scene.update) E.scene.update(dt);
    else if (E.scene && E.scene.updateAlways) E.scene.updateAlways(dt);

    // draw
    ctx.setTransform(E.pixelRatio, 0, 0, E.pixelRatio, 0, 0);
    ctx.save();
    if (E.shake > 0.1) {
      ctx.translate((Math.random() - 0.5) * E.shake, (Math.random() - 0.5) * E.shake);
      E.shake *= 0.86;
    }
    if (E.scene && E.scene.draw) E.scene.draw(ctx, E.time);
    ctx.restore();
    if (E.transition) E._drawTransition(ctx);
    WW.input.endFrame();
  };

  E._updateTransition = function (dt) {
    const tr = E.transition;
    tr.t += dt;
    if (tr.phase === 'out' && tr.t >= tr.dur) {
      E._switch(tr.name, tr.params);
      tr.phase = 'in';
      tr.t = 0;
      // iris reopens on the player if the scene exposes a focus point
      const f = E.scene && E.scene.focusPoint && E.scene.focusPoint();
      if (f) { tr.cx = f.x; tr.cy = f.y; } else { tr.cx = E.W / 2; tr.cy = E.H / 2; }
    } else if (tr.phase === 'in' && tr.t >= tr.dur) {
      E.transition = null;
      tr.resolve();
    }
  };

  E._drawTransition = function (ctx) {
    const tr = E.transition;
    const k = U.clamp(tr.t / tr.dur, 0, 1);
    const cover = tr.phase === 'out' ? U.ease.inCubic(k) : 1 - U.ease.outCubic(k);
    ctx.save();
    if (tr.type === 'fade') {
      ctx.fillStyle = `rgba(22,52,43,${cover})`;
      ctx.fillRect(0, 0, E.W, E.H);
    } else {
      const maxR = Math.hypot(E.W, E.H);
      const r = Math.max(0, (1 - cover) * maxR);
      ctx.fillStyle = '#163a2f';
      ctx.beginPath();
      ctx.rect(0, 0, E.W, E.H);
      ctx.arc(tr.cx, tr.cy, r, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      // decorative leaf ring at the iris edge
      if (r > 4 && r < maxR * 0.95) {
        ctx.strokeStyle = '#7ed957';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(tr.cx, tr.cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  };
})();
