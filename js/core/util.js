/* WasteWise — shared helpers. Pure functions only (safe to load in Node tests). */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const WW = (root.WW = root.WW || {});
  const U = (WW.util = {});

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  U.approach = (v, target, step) => (v < target ? Math.min(v + step, target) : Math.max(v - step, target));
  U.sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);

  U.ease = {
    linear: (t) => t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inCubic: (t) => t * t * t,
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    outElastic: (t) => {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    },
  };

  /** Deterministic 0..1 hash for tile decoration. */
  U.hash = (x, y, s = 0) => {
    let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967295;
  };

  /** Small seeded PRNG (mulberry32). */
  U.rng = (seed) => {
    let a = seed >>> 0 || 1;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  U.shuffle = (arr, rnd = Math.random) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  U.esc = (s = '') =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  /** Replace {name} style tokens. */
  U.fill = (text, vars) => String(text).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));

  /** Tiny DOM builder: el('div', {class:'x', onclick:fn}, 'text', childEl) */
  U.el = (tag, props, ...children) => {
    const node = document.createElement(tag);
    if (props) {
      for (const k in props) {
        const v = props[k];
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.assign(node.dataset, v);
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    return node;
  };

  U.stripEmoji = (s) =>
    String(s)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}]/gu, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

  U.dirFromVec = (dx, dy, fallback = 'down') => {
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return fallback;
    return Math.abs(dx) > Math.abs(dy) * 1.05 ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  };

  U.prefersReducedMotion = () => {
    try {
      return root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  };

  U.isTouchDevice = () => {
    try {
      return 'ontouchstart' in root || (root.navigator && root.navigator.maxTouchPoints > 0);
    } catch (e) {
      return false;
    }
  };
})();
