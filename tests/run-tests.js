#!/usr/bin/env node
/* WasteWise — logic & content unit tests (no browser needed).
   Run:  node tests/run-tests.js */
'use strict';
globalThis.window = globalThis;
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
const load = (f) => require(path.join(root, f));
load('js/core/util.js');
load('js/data/content.js');
load('js/data/assessment.js');
load('js/logic/maze.js');
load('js/logic/scoring.js');
const WW = globalThis.WW;
const L = WW.logic;
const DATA = WW.data;

let pass = 0, fail = 0;
function test(name, fn) {
  try {
    fn();
    pass++;
    console.log('  ✓ ' + name);
  } catch (e) {
    fail++;
    console.log('  ✗ ' + name + '\n      ' + e.message);
  }
}
function eq(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((msg || 'not equal') + `: got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`);
}
function ok(v, msg) { if (!v) throw new Error(msg || 'expected truthy'); }

console.log('\nFinal assessment scoring');
const bank = DATA.assessment;
test('section maxima add to 20 (14 auto + 6 teacher)', () => {
  eq(bank.A.max + bank.B.max + bank.C.max, 14);
  eq(bank.D.max, 6);
  eq(bank.D.rubric.reduce((s, r) => s + r.max, 0), 6);
  eq(bank.B.sort.length + bank.B.mcq.length, bank.B.max);
  eq(bank.C.mcq.length, bank.C.max);
  eq(bank.A.hotspots.filter((h) => h.problem).length, bank.A.pick);
});
test('all-correct answers score 14/14 auto, teacher pending', () => {
  const ans = {
    A: bank.A.hotspots.filter((h) => h.problem).map((h) => h.id),
    B: Object.fromEntries([...bank.B.sort.map((s) => [s.id, s.answer]), ...bank.B.mcq.map((q) => [q.id, q.a])]),
    C: Object.fromEntries(bank.C.mcq.map((q) => [q.id, q.a])),
  };
  const r = L.scoreAssessment(bank, ans);
  eq(r.auto, 14);
  eq(r.D.pending, true);
  eq(r.total, null, 'total must stay null until teacher marks');
});
test('teacher marks are added and clamped', () => {
  const r = L.scoreAssessment(bank, { A: [], B: {}, C: {}, teacher: { feasible: 2, evidence: 5, clarity: 1 } });
  eq(r.D.score, 5); // 2 + clamp(5->2) + 1
  eq(r.total, 5);
});
test('empty answers score 0 and never crash', () => {
  const r = L.scoreAssessment(bank, {});
  eq(r.auto, 0);
});
test('selecting extra hotspots cannot exceed pick limit', () => {
  const r = L.scoreAssessment(bank, { A: bank.A.hotspots.map((h) => h.id) });
  ok(r.A.score <= bank.A.pick);
});
test('wrong answers are not counted', () => {
  const r = L.scoreAssessment(bank, { B: { b1: 'landfill', b2: 'compost', b3: 'recycle', b4: 0, b5: 0 }, C: { c1: 0, c2: 1, c3: 0, c4: 0, c5: 2 } });
  eq(r.B.score, 0);
  eq(r.C.score, 0);
});
test('assessment correct answers are not always in the same position', () => {
  const positions = new Set([...bank.B.mcq, ...bank.C.mcq].map((q) => q.a));
  ok(positions.size >= 3, 'answer positions should vary');
});
test('chart questions match chart data', () => {
  const v = Object.fromEntries(bank.C.chart.map((d) => [d.id, d.value]));
  eq(bank.C.mcq[0].options[bank.C.mcq[0].a], 'Food');
  eq(Number(bank.C.mcq[1].options[bank.C.mcq[1].a]), v.food - v.paper);
  eq(Number(bank.C.mcq[2].options[bank.C.mcq[2].a]), v.food + v.packaging);
  eq(bank.C.mcq[3].options[bank.C.mcq[3].a].toLowerCase(), bank.C.map.garden);
});

console.log('\nWaste maze');
const mz = L.makeMaze(2035, 12, 8, 0.14);
test('maze is deterministic for a seed', () => {
  const again = L.makeMaze(2035, 12, 8, 0.14);
  eq(again.grid.map((r) => r.join('')), mz.grid.map((r) => r.join('')));
});
test('player never spawns inside a wall', () => {
  eq(mz.grid[mz.start.r][mz.start.c], 'c');
});
test('every floor tile is reachable from the start (no trapped areas)', () => {
  const solid = (c, r) => mz.grid[r][c] === 'k' || mz.stations.some((s) => s.c === c && s.r === r) || (mz.sign.c === c && mz.sign.r === r);
  const d = L.bfs(mz.cols, mz.rows, solid, mz.start.c, mz.start.r);
  for (let r = 0; r < mz.rows; r++) for (let c = 0; c < mz.cols; c++) if (!solid(c, r)) ok(d[r][c] >= 0, `tile ${c},${r} unreachable`);
});
test('all four stations can be reached from a neighbouring floor tile', () => {
  const solid = (c, r) => mz.grid[r][c] === 'k' || mz.stations.some((s) => s.c === c && s.r === r) || (mz.sign.c === c && mz.sign.r === r);
  const d = L.bfs(mz.cols, mz.rows, solid, mz.start.c, mz.start.r);
  for (const s of mz.stations) ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => d[s.r + dy] && d[s.r + dy][s.c + dx] >= 0), s.kind + ' unreachable');
});
test('enough spread-out item spots for the largest lunch (11 items)', () => {
  const n = DATA.mazeBase.length + Math.max(...Object.values(DATA.mazeByLunch).map((a) => a.length));
  ok(mz.itemSpots.length >= n, `${mz.itemSpots.length} spots for ${n} items`);
});
test('maze needs real navigation (items are several turns away)', () => {
  const far = mz.itemSpots.filter((s) => s.d >= 10).length;
  ok(far >= 6, 'at least 6 items should be 10+ steps away');
});
test('every maze item has a valid station and explanation', () => {
  for (const id of Object.keys(DATA.mazeItems)) {
    const it = DATA.mazeItems[id];
    ok(['compost', 'recycle', 'reuse', 'landfill'].includes(it.bin), id);
    ok(it.why && it.why.length > 20, id + ' explanation');
    ok(WW.data.itemNames[id] || it.name, id + ' name');
  }
});
test('drop checking is correct and never silently scores wrong drops', () => {
  eq(L.checkDrop(DATA.mazeItems, 'banana', 'compost').correct, true);
  eq(L.checkDrop(DATA.mazeItems, 'banana', 'landfill').correct, false);
  eq(L.checkDrop(DATA.mazeItems, 'refill', 'recycle').correct, false);
  eq(L.checkDrop(DATA.mazeItems, 'nope', 'recycle').correct, false);
});
test('a prevention/reuse example exists in every maze version', () => {
  for (const lunch of Object.keys(DATA.mazeByLunch)) {
    const list = L.mazeItemList(DATA.mazeBase, DATA.mazeByLunch, lunch);
    ok(list.some((id) => DATA.mazeItems[id].bin === 'reuse'), lunch);
  }
});
test('wrong-station hints exist for every station pair', () => {
  for (const a of ['compost', 'recycle', 'landfill', 'reuse']) for (const b of ['compost', 'recycle', 'landfill', 'reuse']) if (a !== b) ok(DATA.wrongHints[a][b], a + '->' + b);
});

console.log('\nPipe puzzle (Chapter 1)');
test('the intended solution waters all three beds with no leaks', () => {
  const pz = L.pipePuzzle();
  const f = L.pipeFlow(pz);
  eq(f.watered.sort(), [0, 2, 3]);
  eq(f.leaks.length, 0, 'leaks');
  eq(f.crackedHit, false);
  eq(f.win, true);
});
test('scrambled start is not already solved', () => {
  const pz = L.scramblePipes(L.pipePuzzle(), 7);
  eq(L.pipeFlow(pz).win, false);
});
test('scrambled puzzle is solvable by rotating pieces only', () => {
  const pz = L.scramblePipes(L.pipePuzzle(), 7);
  for (const c of pz.cells) if (!c.fixed) {
    let k = 0;
    while (c.mask !== c.solMask && k < 4) { c.mask = L.rotMask(c.mask, 1); k++; }
    ok(c.mask === c.solMask, 'piece cannot reach solution');
  }
  eq(L.pipeFlow(pz).win, true);
});
test('hint points at a wrongly rotated path piece', () => {
  const pz = L.scramblePipes(L.pipePuzzle(), 7);
  const h = L.pipeHint(pz);
  ok(h && h.path && h.mask !== h.solMask);
});
test('rotation is a 4-cycle', () => {
  for (let m = 0; m < 16; m++) eq(L.rotMask(m, 4), m);
  eq(L.rotMask(1, 1), 2);
  eq(L.rotMask(8, 1), 1);
});

console.log('\nChapter content');
test('sequencing puzzle starts out of order and has 4 steps', () => {
  const s = DATA.sequence;
  eq(s.steps.length, 4);
  ok(L.checkSequence(s.start, s.steps.map((x) => x.id)).some((v) => !v));
});
test('audit totals match the chart questions (packaging largest)', () => {
  const t = L.auditTotals(DATA.auditSites, DATA.itemCategory, DATA.categories.map((c) => c.id));
  eq(t.totals, { food: 6, packaging: 9, paper: 7, other: 2 });
  const maxCat = Object.entries(t.totals).sort((a, b) => b[1] - a[1])[0][0];
  eq(maxCat, 'packaging');
  const check = DATA.checks[3][1];
  eq(check.options[check.a], 'Packaging');
  // most paper at classrooms, most food at canteen, most packaging at playground
  eq(Object.entries(t.bySite).sort((a, b) => b[1].paper - a[1].paper)[0][0], 'classrooms');
  eq(Object.entries(t.bySite).sort((a, b) => b[1].food - a[1].food)[0][0], 'canteen');
  eq(Object.entries(t.bySite).sort((a, b) => b[1].packaging - a[1].packaging)[0][0], 'playground');
});
test('every audit item has a category and a drawing name', () => {
  for (const s of Object.values(DATA.auditSites)) for (const it of s.items) { ok(DATA.itemCategory[it], it); ok(DATA.itemNames[it], it); }
});
test('chapter checks have valid answer keys', () => {
  for (const ch of [1, 2, 3]) for (const q of DATA.checks[ch]) ok(q.a >= 0 && q.a < q.options.length);
});
test('every dialogue line has a known speaker and text', () => {
  const who = ['milo', 'maple', 'sunny', 'sprout', 'narrator', 'kid'];
  for (const [id, l] of Object.entries(DATA.lines)) { ok(who.includes(l[0]), id + ' speaker'); ok(l[2] && l[2].length > 3, id + ' text'); }
});
test('no Disney / Mickey references in dialogue', () => {
  const all = JSON.stringify(DATA.lines).toLowerCase();
  ok(!/mickey|disney|oh boy|hot dog/.test(all));
});
test('every line referenced by story scripts exists', () => {
  const src = fs.readdirSync(path.join(root, 'js/story')).map((f) => fs.readFileSync(path.join(root, 'js/story', f), 'utf8')).join('\n');
  const ids = [...src.matchAll(/line\(\s*'([^']+)'/g)].map((m) => m[1]).concat([...src.matchAll(/lines\(\s*\[([^\]]+)\]/g)].flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])));
  const missing = ids.filter((id) => !DATA.lines[id]);
  eq(missing, [], 'missing line ids');
});

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
