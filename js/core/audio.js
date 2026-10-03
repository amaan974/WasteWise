/* WasteWise — audio manager.
   - Background music: original tunes composed for this game and synthesised live with the Web Audio API (no audio files).
   - Sound effects: synthesised (no third-party samples).
   - Character voices: (1) optional licensed pre-recorded clips listed in WW.data.voiceClips,
     (2) browser speech synthesis with a distinct pitch/rate profile per character, or
     (3) "cartoon chatter" syllable blips. Subtitles are always shown; audio never gates progress. */
(function () {
  'use strict';
  const WW = window.WW;
  const U = WW.util;

  /* ---------- Note helpers ---------- */
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteFreq(name) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) return 0;
    let s = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = 12 * (parseInt(m[3], 10) + 1) + s;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function chordNotes(name, octave) {
    const m = /^([A-G])([#b]?)(m|7|maj7|sus)?$/.exec(name);
    if (!m) return [];
    const root = m[1] + m[2];
    const q = m[3] || '';
    const iv = q === 'm' ? [0, 3, 7] : q === '7' ? [0, 4, 7, 10] : q === 'maj7' ? [0, 4, 7, 11] : q === 'sus' ? [0, 5, 7] : [0, 4, 7];
    const base = noteFreq(root + octave);
    return iv.map((i) => base * Math.pow(2, i / 12));
  }
  /** Parse "E5 . G5 - ." into [{step, freq, len}] */
  function parseLine(str) {
    const toks = str.replace(/\|/g, ' ').trim().split(/\s+/);
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t === '.' || t === '-') continue;
      let len = 1;
      while (toks[i + len] === '-') len++;
      out.push({ step: i, freq: noteFreq(t), len });
    }
    return { events: out, length: toks.length };
  }

  /* ---------- Original songs (composed for WasteWise) ---------- */
  const SONGS = {
    title: {
      bpm: 100, lead: 'marimba', vol: 1,
      chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C'],
      melody: 'A5 . C6 . F6 . C6 . | G5 . E5 . C5 . E5 . | F5 . A5 . D6 . A5 . | Bb5 - - . A5 . G5 . | A5 . C6 . F6 . A6 . | G6 . E6 . C6 . G5 . | F5 . D6 . Bb5 . F5 . | G5 - - . E5 . C5 .',
      drums: 'k . h . s . h . ', arp: true, pad: true,
    },
    hub: {
      bpm: 112, lead: 'marimba', vol: 0.9,
      chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G'],
      melody: 'E5 . G5 . C6 . G5 E5 | A5 . G5 . E5 . C5 . | F5 . A5 . C6 . A5 F5 | G5 - - . D5 . B4 . | E5 . G5 . C6 . E6 . | D6 . C6 . A5 . E5 . | F5 . E5 . D5 . F5 . | G5 . F5 . D5 . B4 .',
      drums: 'k . h . s . h h', arp: false, pad: true,
    },
    garden: {
      bpm: 90, lead: 'bell', vol: 0.85,
      chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am', 'D'],
      melody: 'B5 . . . D6 . . . | G5 . . . B5 . A5 . | G5 . E5 . . . G5 . | F#5 . . . A5 . . . | B5 . D6 . E6 . D6 . | B5 . . . G5 . . . | A5 . C6 . B5 . A5 . | F#5 . . . D5 . . .',
      drums: 'k . . . . . h . ', arp: true, pad: true,
    },
    maze: {
      bpm: 124, lead: 'pluck', vol: 0.85,
      chords: ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'Em', 'A'],
      melody: 'F#5 A5 D6 A5 F#5 . A5 . | F#5 . D5 . B4 . D5 . | G5 B5 D6 B5 G5 . B5 . | A5 . C#6 . E6 . C#6 . | D6 . A5 . F#5 . A5 B5 | D6 . B5 . F#5 . D5 . | E5 G5 B5 G5 E5 . G5 . | A5 . G5 . F#5 . E5 .',
      drums: 'k h s h k h s h', arp: false, pad: false,
    },
    lab: {
      bpm: 96, lead: 'bell', vol: 0.85,
      chords: ['F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'C'],
      melody: 'A5 . C6 . E6 . C6 . | B5 . D6 . G5 . . . | G5 . B5 . E5 . . . | A5 . C6 . E6 . D6 . | F5 . A5 . D6 . C6 . | B5 . . . D6 . B5 . | C6 . G5 . E5 . G5 . | C6 - - - . . . .',
      drums: 'k . . h . . h . ', arp: true, pad: true,
    },
    assess: {
      bpm: 76, lead: 'marimba', vol: 0.6,
      chords: ['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G'],
      melody: 'E5 . . . G5 . . . | C5 . . . E5 . . . | A5 . . . F5 . . . | D5 . . . G5 . . . | E5 . . . G5 . C6 . | B5 . . . G5 . . . | A5 . . . C6 . . . | B5 . . . D6 . . .',
      drums: '', arp: false, pad: true,
    },
  };
  for (const k in SONGS) SONGS[k].parsed = parseLine(SONGS[k].melody);

  const A = (WW.audio = {
    ctx: null,
    ready: false,
    settings: { music: 0.55, sfx: 0.8, voiceMode: 'speech', muted: false, voiceVolume: 0.9 },
    current: null,
    songName: null,
    _timer: null,
    _noise: null,
    voices: [],
    voiceMap: {},
    speaking: false,
  });

  A.applySettings = function (s) {
    Object.assign(A.settings, s || {});
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    A.master.gain.setTargetAtTime(A.settings.muted ? 0 : 1, t, 0.03);
    A.musicBus.gain.setTargetAtTime(A.settings.music * 0.5, t, 0.1);
    A.sfxBus.gain.setTargetAtTime(A.settings.sfx * 0.7, t, 0.03);
    if (A.settings.muted || A.settings.voiceMode !== 'speech') A.stopSpeech();
  };

  A.unlock = function () {
    if (A.ctx) {
      if (A.ctx.state === 'suspended' && !document.hidden) A.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      A.ctx = new AC();
    } catch (e) {
      return;
    }
    const ctx = A.ctx;
    A.master = ctx.createGain();
    A.comp = ctx.createDynamicsCompressor();
    A.comp.threshold.value = -14;
    A.comp.ratio.value = 4;
    A.master.connect(A.comp).connect(ctx.destination);
    A.musicBus = ctx.createGain();
    A.duck = ctx.createGain();
    A.musicBus.connect(A.duck).connect(A.master);
    A.sfxBus = ctx.createGain();
    A.sfxBus.connect(A.master);
    A.voiceBus = ctx.createGain();
    A.voiceBus.gain.value = 0.9;
    A.voiceBus.connect(A.master);
    // white-noise buffer for percussion and effects
    const len = ctx.sampleRate * 1.5;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    A._noise = buf;
    A.ready = true;
    A.applySettings();
    if (A._pendingSong) {
      const s = A._pendingSong;
      A._pendingSong = null;
      A.playMusic(s);
    }
    document.addEventListener('visibilitychange', () => {
      if (!A.ctx) return;
      if (document.hidden) A.ctx.suspend().catch(() => {});
      else A.ctx.resume().catch(() => {});
    });
  };

  /* ---------- Low level synth voices ---------- */
  function env(g, t, a, peak, decay, sustainLevel = 0.0001) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustainLevel), t + a + decay);
  }
  function osc(type, freq, t, dur, peak, dest, opts = {}) {
    const ctx = A.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (opts.glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.glide), t + (opts.glideTime || dur));
    if (opts.detune) o.detune.value = opts.detune;
    env(g, t, opts.attack || 0.005, peak, dur);
    o.connect(g);
    let out = g;
    if (opts.filter) {
      const f = ctx.createBiquadFilter();
      f.type = opts.filter.type || 'lowpass';
      f.frequency.value = opts.filter.freq || 1200;
      f.Q.value = opts.filter.q || 0.7;
      g.connect(f);
      out = f;
    }
    out.connect(dest);
    o.start(t);
    o.stop(t + (opts.attack || 0.005) + dur + 0.05);
    return o;
  }
  function noise(t, dur, peak, dest, filter) {
    const ctx = A.ctx;
    const src = ctx.createBufferSource();
    src.buffer = A._noise;
    const g = ctx.createGain();
    env(g, t, 0.002, peak, dur);
    const f = ctx.createBiquadFilter();
    f.type = filter.type || 'bandpass';
    f.frequency.setValueAtTime(filter.freq || 1000, t);
    if (filter.to) f.frequency.exponentialRampToValueAtTime(filter.to, t + dur);
    f.Q.value = filter.q || 1;
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  const INSTR = {
    marimba(f, t, len, v, dest) {
      osc('sine', f, t, 0.35 + len * 0.05, 0.2 * v, dest);
      osc('sine', f * 4, t, 0.05, 0.06 * v, dest);
    },
    bell(f, t, len, v, dest) {
      osc('sine', f, t, 0.8 + len * 0.1, 0.13 * v, dest);
      osc('sine', f * 2.76, t, 0.25, 0.04 * v, dest);
    },
    pluck(f, t, len, v, dest) {
      osc('triangle', f, t, 0.18 + len * 0.06, 0.17 * v, dest);
      osc('square', f, t, 0.05, 0.025 * v, dest, { filter: { freq: 2400 } });
    },
  };

  /* ---------- Music sequencer ---------- */
  A.playMusic = function (name) {
    if (A.songName === name && A.current) return;
    if (!A.ready) {
      A._pendingSong = name;
      return;
    }
    A.stopMusic(0.8);
    const song = SONGS[name];
    if (!song) return;
    A.songName = name;
    const g = A.ctx.createGain();
    g.gain.setValueAtTime(0.0001, A.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(song.vol, A.ctx.currentTime + 1.2);
    g.connect(A.musicBus);
    const state = { song, gain: g, step: 0, next: A.ctx.currentTime + 0.12 };
    A.current = state;
    const stepDur = 60 / song.bpm / 2; // eighth notes
    const totalSteps = song.parsed.length;
    const byStep = {};
    song.parsed.events.forEach((e) => (byStep[e.step] = e));
    const drumTok = song.drums ? song.drums.trim().split(/\s+/) : [];
    const tick = () => {
      if (A.current !== state) return;
      const ctx = A.ctx;
      while (state.next < ctx.currentTime + 0.15) {
        const s = state.step % totalSteps;
        const t = state.next;
        const bar = Math.floor(s / 8);
        const inBar = s % 8;
        const chord = song.chords[bar % song.chords.length];
        // lead
        const ev = byStep[s];
        if (ev) INSTR[song.lead](ev.freq, t, ev.len, 1, g);
        // bass on beats 1 and 3 (+ pickup)
        if (inBar === 0 || inBar === 4) {
          const root = chordNotes(chord, 2)[0];
          osc('triangle', root, t, stepDur * 1.8, 0.2, g, { filter: { freq: 600 } });
        } else if (inBar === 6 && song.bpm > 100) {
          const root = chordNotes(chord, 3)[0];
          osc('triangle', root, t, stepDur * 0.8, 0.12, g, { filter: { freq: 700 } });
        }
        // arpeggio
        if (song.arp) {
          const notes = chordNotes(chord, 4);
          const order = [0, 1, 2, 1, 0, 1, 2, 1];
          osc('triangle', notes[order[inBar]] * 2, t, stepDur * 0.9, 0.045, g, { filter: { freq: 2500 } });
        }
        // pad at bar start
        if (song.pad && inBar === 0) {
          chordNotes(chord, 3).forEach((f) => {
            osc('sawtooth', f, t, stepDur * 7.5, 0.018, g, { attack: 0.25, filter: { freq: 900 }, detune: 6 });
            osc('sawtooth', f, t, stepDur * 7.5, 0.018, g, { attack: 0.25, filter: { freq: 900 }, detune: -6 });
          });
        }
        // drums
        const d = drumTok[inBar % (drumTok.length || 1)];
        if (d === 'k') osc('sine', 140, t, 0.16, 0.38, g, { glide: 45, glideTime: 0.12 });
        if (d === 's') noise(t, 0.12, 0.13, g, { type: 'bandpass', freq: 1900, q: 0.8 });
        if (d === 'h' || d === 's' || d === 'k') noise(t, 0.035, d === 'h' ? 0.05 : 0.025, g, { type: 'highpass', freq: 7000 });
        state.step++;
        state.next += stepDur;
      }
    };
    tick();
    state.timer = setInterval(tick, 30);
  };

  A.stopMusic = function (fade = 0.6) {
    const cur = A.current;
    if (!cur) return;
    clearInterval(cur.timer);
    try {
      const t = A.ctx.currentTime;
      cur.gain.gain.cancelScheduledValues(t);
      cur.gain.gain.setValueAtTime(cur.gain.gain.value || 0.5, t);
      cur.gain.gain.exponentialRampToValueAtTime(0.0001, t + fade);
      setTimeout(() => cur.gain.disconnect(), fade * 1000 + 200);
    } catch (e) {}
    A.current = null;
    A.songName = null;
  };

  /* ---------- Sound effects ---------- */
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
  A.sfx = function (name, opt = {}) {
    if (!A.ready || A.settings.muted) return;
    const ctx = A.ctx, t = ctx.currentTime + 0.005, d = A.sfxBus;
    switch (name) {
      case 'click': osc('sine', 700, t, 0.06, 0.25, d, { glide: 1000, glideTime: 0.05 }); break;
      case 'hover': osc('sine', 1300, t, 0.03, 0.05, d); break;
      case 'step': noise(t, 0.035, 0.06, d, { type: 'lowpass', freq: opt.alt ? 900 : 650 }); break;
      case 'pickup':
        osc('triangle', 420, t, 0.14, 0.3, d, { glide: 980, glideTime: 0.12 });
        osc('sine', 1568, t + 0.09, 0.12, 0.08, d);
        break;
      case 'drop': osc('sine', 220, t, 0.14, 0.35, d, { glide: 80 }); break;
      case 'correct':
        [1046.5, 1318.5, 1568].forEach((f, i) => INSTR.marimba(f, t + i * 0.075, 2, 1.2, d));
        break;
      case 'wrong':
        osc('triangle', 392, t, 0.13, 0.22, d);
        osc('triangle', 311, t + 0.14, 0.2, 0.22, d);
        break;
      case 'door':
        noise(t, 0.25, 0.12, d, { type: 'bandpass', freq: 500, to: 1500 });
        osc('sine', 110, t + 0.12, 0.12, 0.3, d, { glide: 70 });
        break;
      case 'unlock':
        [784, 988, 1175, 1568].forEach((f, i) => INSTR.bell(f, t + i * 0.09, 2, 1.3, d));
        break;
      case 'sparkle':
        for (let i = 0; i < 5; i++) osc('sine', PENTA[3 + ((Math.random() * 5) | 0)], t + i * 0.05, 0.18, 0.05, d);
        break;
      case 'drip': osc('sine', 1500, t, 0.09, 0.18, d, { glide: 600, glideTime: 0.08 }); break;
      case 'spray': noise(t, 0.5, 0.08, d, { type: 'highpass', freq: 3000 }); break;
      case 'switch':
        osc('square', 1800, t, 0.012, 0.12, d);
        osc('square', 1200, t + 0.05, 0.012, 0.1, d);
        break;
      case 'rotate':
        osc('square', 900, t, 0.015, 0.1, d, { filter: { freq: 3000 } });
        noise(t, 0.08, 0.05, d, { type: 'bandpass', freq: 2500 });
        break;
      case 'whoosh': noise(t, 0.35, 0.12, d, { type: 'bandpass', freq: 300, to: 3200, q: 1.4 }); break;
      case 'pop': osc('sine', 320, t, 0.07, 0.3, d, { glide: 980, glideTime: 0.06 }); break;
      case 'coin':
        osc('sine', 987.8, t, 0.07, 0.15, d);
        osc('sine', 1318.5, t + 0.07, 0.25, 0.15, d);
        break;
      case 'page': noise(t, 0.16, 0.1, d, { type: 'bandpass', freq: 3500, to: 1800, q: 0.6 }); break;
      case 'squeak':
        osc('sine', 1500, t, 0.07, 0.12, d, { glide: 2400, glideTime: 0.05 });
        osc('sine', 2200, t + 0.08, 0.09, 0.1, d, { glide: 1700, glideTime: 0.08 });
        break;
      case 'bubble': osc('sine', 160, t, 0.25, 0.25, d, { glide: 70 }); break;
      case 'thud': osc('sine', 120, t, 0.12, 0.35, d, { glide: 50 }); break;
      case 'grow':
        [523, 659, 784, 1047, 1319].forEach((f, i) => osc('sine', f, t + i * 0.06, 0.25, 0.08, d));
        break;
      case 'fanfare': {
        const seq = [[523.25, 0], [659.25, 0.12], [783.99, 0.24], [1046.5, 0.36], [783.99, 0.6], [1046.5, 0.72]];
        seq.forEach(([f, dt]) => INSTR.marimba(f, t + dt, 3, 1.4, d));
        osc('triangle', 261.6, t + 0.36, 0.7, 0.2, d);
        break;
      }
      case 'rain': noise(t, 2.2, 0.06, d, { type: 'highpass', freq: 2500 }); break;
      case 'gentle':
        INSTR.bell(659.25, t, 2, 0.7, d);
        INSTR.bell(523.25, t + 0.12, 2, 0.7, d);
        break;
      default: osc('sine', 600, t, 0.06, 0.15, d);
    }
  };

  /* ---------- Character voices ---------- */
  const PROFILES = {
    milo: { pitch: 1.75, rate: 1.1, prefer: ['Samantha', 'Karen', 'Microsoft Natasha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Tessa'], chatter: { base: 900, wave: 'triangle', spread: 0.35 } },
    maple: { pitch: 1.0, rate: 0.95, prefer: ['Karen', 'Microsoft Natasha', 'Catherine', 'Google UK English Female', 'Microsoft Sonia', 'Moira', 'Serena'], chatter: { base: 420, wave: 'sine', spread: 0.15 } },
    sunny: { pitch: 1.15, rate: 1.1, prefer: ['Lee', 'Microsoft William', 'Daniel', 'Google UK English Male', 'Microsoft Ryan', 'Rishi', 'Fred', 'Alex'], chatter: { base: 300, wave: 'square', spread: 0.25 } },
    sprout: { pitch: 0.92, rate: 0.9, prefer: ['Moira', 'Rishi', 'Tessa', 'Microsoft Connor', 'Google UK English Male', 'Daniel', 'Fiona'], chatter: { base: 560, wave: 'sine', spread: 0.3, wobble: true } },
    kid: { pitch: 1.35, rate: 1.05, prefer: ['Samantha', 'Google US English'], chatter: { base: 700, wave: 'triangle', spread: 0.2 } },
  };
  A.profiles = PROFILES;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const all = window.speechSynthesis.getVoices() || [];
    A.voices = all.filter((v) => /^en/i.test(v.lang));
    A.voiceMap = {};
    const used = new Set();
    for (const who of ['maple', 'sunny', 'sprout', 'milo', 'kid']) {
      const p = PROFILES[who];
      let pick = null;
      for (const pref of p.prefer) {
        pick = A.voices.find((v) => v.name.indexOf(pref) !== -1 && !used.has(v.name));
        if (pick) break;
      }
      if (!pick) pick = A.voices.find((v) => /en[-_]AU/i.test(v.lang) && !used.has(v.name));
      if (!pick) pick = A.voices.find((v) => !used.has(v.name) && v.localService);
      if (!pick) pick = A.voices[0] || null;
      if (pick) used.add(pick.name);
      A.voiceMap[who] = pick;
    }
  }
  if ('speechSynthesis' in window) {
    loadVoices();
    try {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } catch (e) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }
  A.speechAvailable = () => 'speechSynthesis' in window && A.voices.length > 0;

  A.duckMusic = function (on) {
    if (!A.ready) return;
    A.duck.gain.setTargetAtTime(on ? 0.45 : 1, A.ctx.currentTime, 0.15);
  };

  A.stopSpeech = function () {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch (e) {}
    if (A._clip) {
      try { A._clip.pause(); } catch (e) {}
      A._clip = null;
    }
    A.speaking = false;
    A.duckMusic(false);
  };

  /** Speak a subtitle line. Returns true if audible narration started. */
  A.speak = function (who, text, lineId) {
    A.stopSpeech();
    if (A.settings.muted || A.settings.voiceMode === 'off') return false;
    const clips = (WW.data && WW.data.voiceClips) || {};
    if (lineId && clips[lineId]) {
      try {
        const audio = new Audio('assets/voices/' + clips[lineId]);
        audio.volume = A.settings.voiceVolume;
        A._clip = audio;
        A.speaking = true;
        A.duckMusic(true);
        audio.onended = audio.onerror = () => {
          if (A._clip === audio) { A.speaking = false; A.duckMusic(false); }
        };
        audio.play().catch(() => { A.speaking = false; });
        return true;
      } catch (e) {}
    }
    if (A.settings.voiceMode !== 'speech' || !('speechSynthesis' in window)) return false;
    try {
      const p = PROFILES[who] || PROFILES.milo;
      const u = new SpeechSynthesisUtterance(U.stripEmoji(text).replace(/…/g, '...'));
      const v = A.voiceMap[who];
      if (v) u.voice = v;
      u.lang = (v && v.lang) || 'en-AU';
      u.pitch = p.pitch;
      u.rate = p.rate;
      u.volume = A.settings.voiceVolume;
      u.onend = u.onerror = () => {
        if (A._utter === u) { A.speaking = false; A.duckMusic(false); }
      };
      A._utter = u;
      A.speaking = true;
      A.duckMusic(true);
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      A.speaking = false;
      return false;
    }
  };

  /** Cartoon chatter blip for one syllable. */
  A.chatter = function (who) {
    if (!A.ready || A.settings.muted || A.settings.voiceMode !== 'chatter') return;
    const p = (PROFILES[who] || PROFILES.milo).chatter;
    const t = A.ctx.currentTime + 0.002;
    const f = p.base * (1 + (Math.random() - 0.5) * p.spread);
    osc(p.wave, f, t, 0.055, p.wave === 'square' ? 0.05 : 0.11, A.voiceBus, {
      glide: p.wobble ? f * 0.8 : f * 1.08,
      glideTime: 0.05,
      filter: { freq: 2600 },
    });
  };

  A.jingle = function (name) {
    A.sfx(name === 'complete' ? 'fanfare' : name);
  };
})();
