/* WasteWise — pure game/assessment logic (no DOM). Unit-tested with `node tests/run-tests.js`. */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const WW = (root.WW = root.WW || {});
  const L = (WW.logic = WW.logic || {});

  /* ------------------------- Final assessment ------------------------- */
  /**
   * answers = { A: [hotspotIds], B: {b1:'compost',...,b4:1,b5:2}, C: {c1:1,...}, D: 'text', teacher: {feasible,evidence,clarity}|null }
   */
  L.scoreAssessment = function (bank, answers) {
    const a = answers || {};
    // Section A: one mark per correctly identified problem (max = pick)
    const picks = Array.isArray(a.A) ? a.A.slice(0, bank.A.pick) : [];
    const problemIds = new Set(bank.A.hotspots.filter((h) => h.problem).map((h) => h.id));
    const scoreA = picks.filter((id) => problemIds.has(id)).length;
    // Section B: sorting + choices
    const b = a.B || {};
    let scoreB = 0;
    for (const s of bank.B.sort) if (b[s.id] === s.answer) scoreB++;
    for (const q of bank.B.mcq) if (b[q.id] === q.a) scoreB++;
    // Section C
    const c = a.C || {};
    let scoreC = 0;
    for (const q of bank.C.mcq) if (c[q.id] === q.a) scoreC++;
    const auto = scoreA + scoreB + scoreC;
    const autoMax = bank.A.max + bank.B.max + bank.C.max;
    // Section D: teacher-reviewed only
    let teacher = null;
    if (a.teacher && typeof a.teacher === 'object') {
      teacher = 0;
      for (const r of bank.D.rubric) {
        const v = Number(a.teacher[r.id]);
        if (!Number.isFinite(v)) { teacher = null; break; }
        teacher += Math.max(0, Math.min(r.max, Math.round(v)));
      }
    }
    return {
      A: { score: scoreA, max: bank.A.max },
      B: { score: scoreB, max: bank.B.max },
      C: { score: scoreC, max: bank.C.max },
      D: { score: teacher, max: bank.D.max, pending: teacher === null },
      auto,
      autoMax,
      total: teacher === null ? null : auto + teacher,
      totalMax: autoMax + bank.D.max,
    };
  };

  /** Strengths / practice suggestions from section results (teacher-friendly wording). */
  L.feedbackFor = function (res) {
    const strengths = [], practise = [];
    const pct = (s) => s.score / s.max;
    if (pct(res.A) >= 0.75) strengths.push('Spotting resource and waste problems in a new place');
    else practise.push('Noticing where water, energy or materials are wasted (look for things left running, on, or thrown away)');
    if (pct(res.B) >= 0.8) strengths.push('Choosing sustainable actions and following a school’s bin rules');
    else practise.push('Choosing prevention first, then reuse, recycle/compost, and landfill last — and reading local bin rules');
    if (pct(res.C) >= 0.8) strengths.push('Reading a bar chart and a compass map to find evidence');
    else practise.push('Reading bar charts (compare bar heights, add and subtract values) and using north/south/east/west on a map');
    return { strengths, practise };
  };

  /* ------------------------- Waste maze ------------------------- */
  L.checkDrop = function (items, itemId, station) {
    const it = items[itemId];
    if (!it) return { correct: false, unknown: true };
    return { correct: it.bin === station, expected: it.bin };
  };
  L.mazeItemList = function (base, byLunch, lunch) {
    return base.concat(byLunch[lunch] || []);
  };

  /* ------------------------- Pipe puzzle ------------------------- */
  // openings bitmask: N=1, E=2, S=4, W=8
  const N = 1, Ea = 2, S = 4, Wd = 8;
  L.PIPE = { N, E: Ea, S, W: Wd };
  L.rotMask = (m, k = 1) => {
    let r = m;
    for (let i = 0; i < ((k % 4) + 4) % 4; i++) r = ((r << 1) | (r >> 3)) & 15;
    return r;
  };
  const DIRS = [[N, 0, -1, S], [Ea, 1, 0, Wd], [S, 0, 1, N], [Wd, -1, 0, Ea]];

  /** The Chapter 1 "Rain to Roots" puzzle: 6x4 grid. */
  L.pipePuzzle = function () {
    // solution masks; 'x' = cracked fixed pipe; decoys are rotatable extra pieces
    const sol = [
      [Wd | Ea, Wd | Ea | S, Wd | Ea, Wd | Ea, Wd | Ea, Wd | Ea],
      [Ea | S, N | S, 'x', N | Ea, 'x', N | S],
      [N | S, N | Ea, Wd | Ea, Wd | Ea | S, Wd | Ea, Wd | Ea],
      [N | Ea, Wd | Ea | N, Wd | Ea, N | Ea, Wd | Ea, Wd | Ea],
    ];
    const pathCells = new Set(['0,0', '1,0', '2,0', '3,0', '4,0', '5,0', '1,1', '1,2', '2,2', '3,2', '4,2', '5,2', '3,3', '4,3', '5,3']);
    const cracked = { '2,1': N | S, '4,1': Ea | Wd };
    const cells = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const key = c + ',' + r;
      if (cracked[key]) cells.push({ c, r, mask: cracked[key], fixed: true, cracked: true, path: false });
      else cells.push({ c, r, mask: sol[r][c], fixed: false, cracked: false, path: pathCells.has(key) });
    }
    return { cols: 6, rows: 4, source: { c: 0, r: 0, side: Wd }, targets: [0, 2, 3], cells };
  };

  /** Rotate puzzle pieces into a deterministic scrambled start that is not already solved. */
  L.scramblePipes = function (pz, seed = 7) {
    let a = seed >>> 0 || 1;
    const rnd = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
    for (const cell of pz.cells) {
      cell.solMask = cell.mask;
      if (cell.fixed) continue;
      let k = 1 + Math.floor(rnd() * 3);
      cell.mask = L.rotMask(cell.mask, k);
    }
    // ensure at least a few path pieces are wrong and the start is not a win
    if (L.pipeFlow(pz).win) {
      const first = pz.cells.find((c) => c.path && !c.fixed);
      first.mask = L.rotMask(first.mask, 1);
    }
    return pz;
  };

  /** Water flow from the tank. Returns reached cells (with depth), watered targets, leaks and win. */
  L.pipeFlow = function (pz) {
    const at = (c, r) => (c >= 0 && r >= 0 && c < pz.cols && r < pz.rows ? pz.cells[r * pz.cols + c] : null);
    const depth = new Map();
    const start = at(pz.source.c, pz.source.r);
    const watered = new Set();
    const leaks = [];
    let crackedHit = false;
    if (!(start.mask & pz.source.side)) return { depth, watered: [], leaks: [{ c: start.c, r: start.r, side: 'source' }], crackedHit, win: false };
    const q = [start];
    depth.set(start, 0);
    while (q.length) {
      const cell = q.shift();
      if (cell.cracked) { crackedHit = true; continue; }
      for (const [bit, dx, dy, opp] of DIRS) {
        if (!(cell.mask & bit)) continue;
        const nc = cell.c + dx, nr = cell.r + dy;
        if (cell === start && bit === pz.source.side) continue;
        const nb = at(nc, nr);
        if (!nb) {
          if (bit === Ea && nc === pz.cols && pz.targets.includes(nr)) watered.add(nr);
          else leaks.push({ c: cell.c, r: cell.r, bit });
          continue;
        }
        if (!(nb.mask & opp)) { leaks.push({ c: cell.c, r: cell.r, bit }); continue; }
        if (!depth.has(nb)) { depth.set(nb, depth.get(cell) + 1); q.push(nb); }
      }
    }
    const win = watered.size === pz.targets.length && !crackedHit && leaks.length === 0;
    return { depth, watered: [...watered], leaks, crackedHit, win };
  };

  /** First wrongly-rotated path piece along the solution (for hints). */
  L.pipeHint = function (pz) {
    const order = pz.cells.filter((c) => c.path && !c.fixed && c.mask !== c.solMask);
    return order[0] || null;
  };

  /* ------------------------- Sequencing ------------------------- */
  L.checkSequence = function (order, correct) {
    return order.map((id, i) => id === correct[i]);
  };

  /* ------------------------- Audit ------------------------- */
  L.auditTotals = function (sites, categoryOf, cats) {
    const totals = {};
    for (const c of cats) totals[c] = 0;
    const bySite = {};
    for (const key in sites) {
      bySite[key] = {};
      for (const c of cats) bySite[key][c] = 0;
      for (const it of sites[key].items) {
        const cat = categoryOf[it];
        bySite[key][cat]++;
        totals[cat]++;
      }
    }
    return { totals, bySite };
  };
})();
