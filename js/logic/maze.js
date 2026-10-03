/* WasteWise — deterministic waste-maze generator (pure logic, unit-tested in Node).
   Builds a perfect maze with a seeded random generator, adds a few loops so children
   are never forced down long single routes, and carves a central "sorting room"
   where the four collection stations live. */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const WW = (root.WW = root.WW || {});
  const L = (WW.logic = WW.logic || {});

  function rng(seed) {
    let a = seed >>> 0 || 1;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * @returns {{cols,rows,grid:string[][],room:{c0,r0,c1,r1},stations:{kind,c,r}[],sign:{c,r},start:{c,r},itemSpots:{c,r,d}[]}}
   */
  L.makeMaze = function (seed = 2035, cw = 12, chh = 8, loopFraction = 0.12) {
    const rnd = rng(seed);
    const cols = cw * 2 + 1, rows = chh * 2 + 1;
    const grid = Array.from({ length: rows }, () => Array(cols).fill('k'));
    const seen = Array.from({ length: chh }, () => Array(cw).fill(false));
    // iterative recursive-backtracker
    const stack = [[0, 0]];
    seen[0][0] = true;
    grid[1][1] = 'c';
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const opts = dirs.filter(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        return nx >= 0 && ny >= 0 && nx < cw && ny < chh && !seen[ny][nx];
      });
      if (!opts.length) { stack.pop(); continue; }
      const [dx, dy] = opts[Math.floor(rnd() * opts.length)];
      const nx = cx + dx, ny = cy + dy;
      grid[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = 'c';
      grid[ny * 2 + 1][nx * 2 + 1] = 'c';
      seen[ny][nx] = true;
      stack.push([nx, ny]);
    }
    // add loops: knock out some internal walls between two floor cells
    const candidates = [];
    for (let r = 1; r < rows - 1; r++) for (let c = 1; c < cols - 1; c++) {
      if (grid[r][c] !== 'k') continue;
      const h = grid[r][c - 1] === 'c' && grid[r][c + 1] === 'c' && grid[r - 1][c] === 'k' && grid[r + 1][c] === 'k';
      const v = grid[r - 1][c] === 'c' && grid[r + 1][c] === 'c' && grid[r][c - 1] === 'k' && grid[r][c + 1] === 'k';
      if (h || v) candidates.push([c, r]);
    }
    const nLoops = Math.floor(candidates.length * loopFraction);
    for (let i = 0; i < nLoops && candidates.length; i++) {
      const k = Math.floor(rnd() * candidates.length);
      const [c, r] = candidates.splice(k, 1)[0];
      grid[r][c] = 'c';
    }
    // central sorting room (7x5 tiles)
    const midC = Math.floor(cols / 2), midR = Math.floor(rows / 2);
    const room = { c0: midC - 3, r0: midR - 2, c1: midC + 3, r1: midR + 2 };
    for (let r = room.r0; r <= room.r1; r++) for (let c = room.c0; c <= room.c1; c++) grid[r][c] = 'c';
    // guaranteed doorways on each side
    grid[room.r0 - 1][midC] = 'c';
    grid[room.r1 + 1][midC] = 'c';
    grid[midR][room.c0 - 1] = 'c';
    grid[midR][room.c1 + 1] = 'c';
    const stations = [
      { kind: 'compost', c: room.c0 + 1, r: room.r0 + 1 },
      { kind: 'recycle', c: room.c1 - 1, r: room.r0 + 1 },
      { kind: 'landfill', c: room.c0 + 1, r: room.r1 - 1 },
      { kind: 'reuse', c: room.c1 - 1, r: room.r1 - 1 },
    ];
    const sign = { c: midC, r: midR };
    const start = { c: midC, r: room.r1 };
    // distances from start (BFS, stations and sign are solid)
    const solid = (c, r) => grid[r][c] === 'k' || stations.some((s) => s.c === c && s.r === r) || (sign.c === c && sign.r === r);
    const dist = L.bfs(cols, rows, solid, start.c, start.r);
    // item spots = dead ends + far corridor tiles, outside the room, spread out
    const spots = [];
    for (let r = 1; r < rows - 1; r++) for (let c = 1; c < cols - 1; c++) {
      if (grid[r][c] !== 'c') continue;
      if (c >= room.c0 - 1 && c <= room.c1 + 1 && r >= room.r0 - 1 && r <= room.r1 + 1) continue;
      if (dist[r][c] < 0) continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => grid[r + dy][c + dx] === 'c').length;
      const isCell = c % 2 === 1 && r % 2 === 1;
      if (isCell) spots.push({ c, r, d: dist[r][c], dead: n === 1 });
    }
    // pick spread-out spots: prefer dead ends, keep a minimum spacing
    spots.sort((a, b) => (b.dead - a.dead) || (b.d - a.d));
    const itemSpots = [];
    for (const s of spots) {
      if (itemSpots.every((p) => Math.abs(p.c - s.c) + Math.abs(p.r - s.r) >= 5)) itemSpots.push(s);
      if (itemSpots.length >= 14) break;
    }
    return { cols, rows, grid, room, stations, sign, start, itemSpots, dist };
  };

  /** BFS over a tile grid; returns 2D distance array (-1 = unreachable). */
  L.bfs = function (cols, rows, solid, sc, sr) {
    const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));
    const q = [[sc, sr]];
    dist[sr][sc] = 0;
    for (let i = 0; i < q.length; i++) {
      const [c, r] = q[i];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dx, nr = r + dy;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        if (dist[nr][nc] !== -1 || solid(nc, nr)) continue;
        dist[nr][nc] = dist[r][c] + 1;
        q.push([nc, nr]);
      }
    }
    return dist;
  };
})();
