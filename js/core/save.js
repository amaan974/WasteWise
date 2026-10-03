/* WasteWise — on-device progress (localStorage). No accounts, no network.
   Stores: optional nickname, avatar look, chapter checkpoints, world state and settings.
   Final-assessment answers are NOT stored (kept in memory only; teacher report is a local download). */
(function () {
  'use strict';
  const WW = window.WW;
  const KEY = 'wastewise-save-v2';
  const SKEY = 'wastewise-settings-v2';

  function defaults() {
    return {
      version: 2,
      nickname: '',
      avatar: { skin: 1, hair: 0, hairColor: 0, shirt: 0 },
      introDone: false,
      done: [false, false, false],
      demoUnlocked: false,
      finalDone: false,
      ch1: { stage: 'meet', clues: [], leakChoice: null, choiceLog: [] },
      ch2: { stage: 'locked', lunch: null, choiceLog: [] },
      ch3: { stage: 'locked', sites: [], tallies: {}, plan: null, choiceLog: [] },
      world: {
        gardenHealth: 30, // 0..100, drives plant art
        tank: 22, // rain-tank % (fictional)
        leakFixed: false,
        sprinklerFixed: false,
        shedLightOn: true,
        bottlesCleared: false,
        canteenClean: false,
        litter: 7, // litter pieces in the courtyard/playground
        improvements: [], // e.g. 'shareTable','nudeFood','binSigns','refill','compost'
      },
      stats: {
        ecoPoints: 0,
        choices: [], // {chapter, id, label, quality:'best'|'ok'|'retry'}
        maze: { items: 0, firstTry: 0, attempts: 0, completed: false, lunch: null },
        checks: {}, // chapterCheck results {ch1:{score,max}}
        puzzles: {},
      },
    };
  }

  function defaultSettings() {
    return {
      music: 0.55,
      sfx: 0.8,
      voiceMode: 'speech',
      muted: false,
      textSpeed: 1,
      reducedMotion: null, // null = follow device
      showTouch: null, // null = auto
      bigText: false,
    };
  }

  function deepMerge(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    for (const k in extra) {
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && typeof extra[k] === 'object' && !Array.isArray(extra[k])) deepMerge(base[k], extra[k]);
      else base[k] = extra[k];
    }
    return base;
  }

  const S = (WW.save = {
    data: defaults(),
    settings: defaultSettings(),
    available: true,
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) this.data = deepMerge(defaults(), JSON.parse(raw));
        const sraw = localStorage.getItem(SKEY);
        if (sraw) this.settings = deepMerge(defaultSettings(), JSON.parse(sraw));
      } catch (e) {
        this.available = false;
      }
      return this.data;
    },
    commit() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.data));
      } catch (e) {
        this.available = false;
      }
    },
    commitSettings() {
      try {
        localStorage.setItem(SKEY, JSON.stringify(this.settings));
      } catch (e) {}
    },
    hasProgress() {
      return !!(this.data.introDone || this.data.done.some(Boolean));
    },
    newGame(nickname, avatar) {
      this.data = defaults();
      this.data.nickname = nickname || '';
      if (avatar) this.data.avatar = Object.assign(this.data.avatar, avatar);
      this.commit();
    },
    reset() {
      this.data = defaults();
      try {
        localStorage.removeItem(KEY);
      } catch (e) {}
    },
    name() {
      return (this.data.nickname || '').trim() || 'Eco Explorer';
    },
    addPoints(n) {
      this.data.stats.ecoPoints = Math.max(0, (this.data.stats.ecoPoints || 0) + n);
      this.commit();
    },
    logChoice(chapter, id, label, quality) {
      this.data.stats.choices.push({ chapter, id, label, quality });
      this.commit();
    },
    isUnlocked(ch) {
      // ch: 1..3 chapters, 4 = final challenge
      if (this.data.demoUnlocked) return true;
      if (ch === 1) return true;
      return !!this.data.done[ch - 2];
    },
    reducedMotion() {
      const s = this.settings.reducedMotion;
      return s == null ? WW.util.prefersReducedMotion() : !!s;
    },
    _defaults: defaults,
  });
  S.load();
})();
