/* WasteWise — boot. */
(function () {
  'use strict';
  const WW = window.WW;

  function boot() {
    WW.ui.init();
    WW.audio.applySettings({
      music: WW.save.settings.music,
      sfx: WW.save.settings.sfx,
      voiceMode: WW.save.settings.voiceMode,
      muted: WW.save.settings.muted,
    });
    WW.engine.init();
    const unlock = () => WW.audio.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });

    // Developer / QA helpers: index.html?debug=1&scene=hub&chapter=2
    const q = new URLSearchParams(location.search);
    if (q.get('debug')) {
      const dbg = (window.WWDEBUG = {
        jump: (n) => WW.story.jumpTo(n),
        go: (s, p) => WW.engine.go(s, p || {}),
        state: () => WW.save.data,
        scene: () => WW.engine.scene,
        /** Advance the game by `sec` seconds of fixed 60fps steps (works even when the tab is throttled).
            Yields to the microtask queue each step so async story scripts keep running. */
        async run(sec = 1) { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) { WW.engine.step(1 / 60); for (let k = 0; k < 12; k++) await null; } },
        async press(action = 'action') { WW.input.press(action); await dbg.run(0.1); },
        /** Finish the current dialogue line and move on. */
        async next() { for (let i = 0; i < 3 && WW.ui.dialogue.open && !WW.ui.dialogue.choiceMode; i++) { WW.ui.dialogue.advance(); await dbg.run(0.05); } await dbg.run(0.3); },
        /** Skip through dialogue until a choice, panel or idle (max n lines). */
        async skip(n = 30) { for (let i = 0; i < n; i++) { await dbg.run(0.4); if (WW.ui.panel.stack.length) return 'panel'; if (WW.ui.dialogue.open && WW.ui.dialogue.choiceMode) { WW.ui.dialogue.advance(); await dbg.run(0.1); return 'choice'; } if (WW.ui.dialogue.open) await dbg.next(); else if (!(WW.engine.scene && WW.engine.scene.busy)) return 'idle'; } return 'max'; },
        /** Click a visible dialogue choice by index (0-based). */
        async choose(i) { await dbg.run(0.2); if (WW.ui.dialogue.typing) { WW.ui.dialogue.advance(); await dbg.run(0.1); } const b = document.querySelectorAll('.d-choices .choice-btn')[i]; if (b) b.click(); await dbg.run(0.3); return !!b; },
        async hold(action, sec) { WW.input.held.add(action); await dbg.run(sec); WW.input.held.delete(action); await dbg.run(0.05); },
        player() { const p = WW.engine.scene.player; return p && { x: Math.round(p.x), y: Math.round(p.y), c: Math.floor(p.x / 48), r: Math.floor(p.y / 48) }; },
        async teleport(x, y) { const p = WW.engine.scene.player; p.x = x; p.y = y; p.path = null; p.trail = []; if (WW.engine.scene.milo) { WW.engine.scene.milo.x = x - 30; WW.engine.scene.milo.y = y; } await dbg.run(0.2); },
        /** Teleport next to an interactable by id and trigger it. */
        async use(id) { const sc = WW.engine.scene; const it = sc.interacts.find((x) => x.id === id); if (!it) return 'no interact ' + id; const pt = sc.itPoint(it); await dbg.teleport(pt.x, pt.y + 6); const near = sc.near && sc.near.id; WW.input.press('action'); await dbg.run(0.3); return near; },
        talk() { return { open: WW.ui.dialogue.open, who: WW.ui.dialogue.who, text: WW.ui.dialogue.plain, choices: [...document.querySelectorAll('.d-choices .choice-btn')].map((b) => b.textContent), panel: WW.ui.panel.stack.length, objective: WW.story.objective && WW.story.objective.text, busy: WW.engine.scene && WW.engine.scene.busy }; },
      });
      document.body.dataset.debug = '1';
    }
    const start = q.get('scene');
    if (start && WW.engine.scenes[start]) {
      if (q.get('chapter')) {
        WW.save.data.introDone = true;
        WW.story.jumpTo(Number(q.get('chapter')));
      }
      WW.engine.go(start, {}, { instant: true });
    } else {
      WW.engine.go('title', {}, { instant: true });
    }
    // re-render canvas text once web fonts arrive
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => WW.engine.resize());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
