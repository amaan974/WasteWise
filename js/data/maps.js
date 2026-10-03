/* WasteWise — map layouts for Sunny School (fictional).
   Ground chars: '.' grass, '=' path, ':' courtyard paving, 'd' garden mulch, 's' sand, 'p' soft-fall,
   '~' pond, 'h' hedge, 'f' fence, 'g' gate, 't' canteen tiles, 'w' wood floor, '#' wall, 'k' crate wall, 'c' concrete. */
(function () {
  'use strict';
  const WW = window.WW;
  const M = (WW.maps = {});

  const grid = (cols, rows, ch) => Array.from({ length: rows }, () => Array(cols).fill(ch));
  const R = (g, c0, r0, c1, r1, ch) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) g[r][c] = ch; };
  const ring = (g, c0, r0, c1, r1, ch) => {
    for (let c = c0; c <= c1; c++) { g[r0][c] = ch; g[r1][c] = ch; }
    for (let r = r0; r <= r1; r++) { g[r][c0] = ch; g[r][c1] = ch; }
  };
  const S = () => WW.save.data;
  const W = () => WW.save.data.world;
  const has = (imp) => W().improvements.indexOf(imp) !== -1;

  /* ====================== SUNNY SCHOOL HUB ====================== */
  M.hub = {
    id: 'hub',
    music: 'hub',
    build() {
      const g = grid(40, 28, '.');
      ring(g, 0, 0, 39, 27, 'h');
      R(g, 14, 8, 25, 17, ':'); // courtyard
      R(g, 13, 7, 36, 7, '='); // path in front of hall + classrooms
      R(g, 19, 18, 20, 27, '='); // main path from front gate
      R(g, 12, 12, 13, 13, '='); // to garden gate
      R(g, 26, 8, 27, 26, '='); // east corridor
      R(g, 26, 15, 36, 16, '='); // canteen approach
      R(g, 21, 24, 36, 25, '='); // lab approach
      R(g, 31, 6, 33, 6, '='); // classrooms door
      // garden
      ring(g, 1, 8, 12, 21, 'f');
      g[12][12] = 'g';
      g[13][12] = 'g';
      R(g, 2, 12, 11, 13, 'd');
      R(g, 6, 9, 7, 20, 'd');
      R(g, 9, 17, 11, 20, '~');
      // playground
      R(g, 14, 20, 17, 23, 's');
      R(g, 21, 20, 25, 23, 'p');

      const o = [];
      const isU = (n) => WW.save.isUnlocked(n);
      const target = (id) => WW.story && WW.story.targetId === id;
      o.push({ id: 'hall', type: 'building', c: 15, r: 1, w: 10, h: 6, roof: '#ef8a62', wall: '#fff4d6', label: 'ASSEMBLY HALL', icon: '🏆', doorCol: 19, doorOffset: 24, solar: 4, door: '#ef8a62', locked: () => !isU(4), glow: () => target('hall'), ip: { x: 20, y: 7.6 } });
      o.push({ id: 'classrooms', type: 'building', c: 27, r: 1, w: 11, h: 5, roof: '#b49ce0', wall: '#fff8e6', label: 'CLASSROOMS', icon: '📚', doorCol: 32, door: '#b49ce0', solar: 3, ip: { x: 32.5, y: 6.6 } });
      o.push({ id: 'canteen', type: 'building', c: 28, r: 9, w: 10, h: 6, roof: '#ffcb52', wall: '#fff4c5', label: 'SUNNY CANTEEN', icon: '🥪', doorCol: 32, doorOffset: 24, door: '#ff9f6b', locked: () => !isU(2), glow: () => target('canteen'), ip: { x: 33, y: 15.6 },
        extra(ctx, ob, ws, t) { if (has('nudeFood')) WW.worldArt.paint.banner(ctx, { x: ob.x + 8, y: ob.y + ob.ph - 150, pw: 136, text: 'NUDE FOOD DAY!', color: '#2fa36b' }, ws, t); } });
      o.push({ id: 'lab', type: 'building', c: 28, r: 18, w: 9, h: 6, roof: '#7fc8e8', wall: '#f4fbff', label: 'ECO LAB', icon: '🔬', doorCol: 32, door: '#7fc8e8', solar: 3, locked: () => !isU(3), glow: () => target('lab'), ip: { x: 32.5, y: 24.6 } });
      // garden
      o.push({ id: 'shed', type: 'shed', c: 2, r: 9, w: 3, h: 2, ip: { x: 4.2, y: 11.5 } });
      o.push({ id: 'tank', type: 'tank', c: 9, r: 9, w: 2, h: 2, ip: { x: 9.6, y: 11.5 } });
      o.push({ id: 'tap', type: 'tap', c: 8, r: 10, ip: { x: 8.5, y: 11.6 } });
      o.push({ id: 'puddle', type: 'puddle', c: 8, r: 11, layer: 'floor', solid: false });
      o.push({ id: 'gardenBin', type: 'bin', kind: 'landfill', c: 11, r: 10, overflow: (ws) => !ws.bottlesCleared, ip: { x: 11.4, y: 11.6 } });
      o.push({ id: 'bedA', type: 'bed', c: 2, r: 14, w: 3, h: 2, dripLine: true, ip: { x: 3.5, y: 13.6 } });
      o.push({ id: 'bedB', type: 'bed', c: 8, r: 14, w: 3, h: 2, dripLine: true, ip: { x: 9.5, y: 13.6 } });
      o.push({ id: 'bedC', type: 'bed', c: 2, r: 17, w: 3, h: 2, dripLine: true, ip: { x: 3.5, y: 16.6 } });
      o.push({ id: 'sprinkler', type: 'sprinkler', c: 5, r: 16, sprayDir: 1, ip: { x: 6.3, y: 16.7 } });
      o.push({ id: 'compost', type: 'compost', c: 2, r: 19, w: 2, h: 2, ip: { x: 4.4, y: 20.4 } });
      o.push({ id: 'fruitTree', type: 'tree', c: 11, r: 15, fruit: true, scale: 0.85 });
      o.push({ id: 'gflowers1', type: 'flowers', c: 4, r: 10, solid: false, n: 5 });
      o.push({ id: 'gflowers2', type: 'flowers', c: 8, r: 19, solid: false, n: 5 });
      o.push({ id: 'gflowers3', type: 'flowers', c: 10, r: 16, solid: false, n: 4, color: '#ffd23f' });
      // courtyard
      o.push({ id: 'bigtree', type: 'bigtree', c: 19, r: 12, w: 2, h: 1 });
      o.push({ id: 'bench1', type: 'bench', c: 15, r: 10, w: 2 });
      o.push({ id: 'bench2', type: 'bench', c: 23, r: 10, w: 2 });
      o.push({ id: 'bubbler', type: 'bubbler', c: 15, r: 16, ip: { x: 15.5, y: 17.4 } });
      o.push({ id: 'refill', type: 'refill', c: 16, r: 16, show: () => has('refill') });
      o.push({ id: 'notice', type: 'noticeboard', c: 24, r: 16, ip: { x: 24.5, y: 17.5 } });
      // audit sites (Chapter 3)
      o.push({ id: 'cbin1', type: 'bin', kind: 'landfill', c: 29, r: 17, sign: () => has('binSigns') });
      o.push({ id: 'cbin2', type: 'bin', kind: 'recycle', c: 30, r: 17 });
      o.push({ id: 'cbin3', type: 'bin', kind: 'compost', c: 31, r: 17, ip: { x: 30.5, y: 16.6 } });
      o.push({ id: 'sharetable', type: 'sharetable', c: 34, r: 17, w: 2, show: () => has('shareTable') });
      o.push({ id: 'canteenCompost', type: 'compost', c: 36, r: 15, w: 2, h: 2, show: () => has('compost') });
      o.push({ id: 'papertray', type: 'papertray', c: 34, r: 6, show: () => has('paperReuse') });
      o.push({ id: 'rbin1', type: 'bin', kind: 'recycle', c: 35, r: 6, ip: { x: 35.5, y: 7.6 } });
      o.push({ id: 'rbin2', type: 'bin', kind: 'landfill', c: 36, r: 6 });
      o.push({ id: 'pbin', type: 'bin', kind: 'landfill', c: 18, r: 24, ip: { x: 18.5, y: 25.6 } });
      // playground
      o.push({ id: 'slide', type: 'slide', c: 21, r: 20, w: 2, h: 2 });
      o.push({ id: 'swings', type: 'swings', c: 24, r: 21, w: 2, h: 1 });
      o.push({ id: 'sandtoys', type: 'sandtoys', c: 15, r: 21, solid: false, layer: 'floor' });
      // trees, bushes, lamps
      for (const [c, r, sc] of [[2, 2, 1], [6, 4, 0.9], [10, 2, 1], [13, 5, 0.8], [38, 9, 0.9], [38, 13, 1], [38, 20, 0.9], [38, 25, 1], [2, 24, 1], [6, 26, 0.85], [10, 23, 1], [13, 26, 0.9], [37, 3, 0.8], [24, 26, 0.75], [30, 26, 0.8]]) o.push({ id: `tree${c}_${r}`, type: 'tree', c, r, scale: sc, dark: (c + r) % 3 === 0 });
      for (const [c, r, f] of [[4, 6, '#ff8fab'], [8, 6, null], [11, 25, '#ffd23f'], [4, 22, '#b8a1ff'], [35, 26, '#ff8fab'], [22, 19, null], [13, 19, '#ffd23f']]) o.push({ id: `bush${c}_${r}`, type: 'bush', c, r, flowers: f });
      for (const [c, r] of [[14, 18], [25, 18], [18, 7], [25, 7]]) o.push({ id: `lamp${c}_${r}`, type: 'lamp', c, r });
      o.push({ id: 'cflowers1', type: 'flowers', c: 3, r: 4, w: 2, solid: false, n: 7 });
      o.push({ id: 'cflowers2', type: 'flowers', c: 32, r: 26, w: 2, solid: false, n: 6 });
      // litter that disappears as the school improves
      const litter = [[17, 14, 'wrapper'], [22, 13, 'chips'], [15, 22, 'wrapper'], [24, 22, 'bottle'], [21, 9, 'chips'], [18, 26, 'wrapper'], [23, 26, 'can']];
      litter.forEach(([c, r, item], i) => o.push({ id: `litter${i}`, type: 'litter', c, r, item, rot: (i - 3) * 0.4, layer: 'floor', solid: false, show: () => i < W().litter }));
      return {
        ground: g,
        objects: o,
        extra: {
          spawn: { x: 20 * 48, y: 26 * 48 + 20 },
          doors: {
            hall: { x: 20 * 48, y: 7 * 48 + 30 },
            canteen: { x: 33 * 48, y: 15 * 48 + 30 },
            lab: { x: 32.5 * 48, y: 24 * 48 + 30 },
            garden: { x: 13 * 48, y: 13 * 48 + 6 },
          },
          wanderers: [
            { seed: 3, path: [[16, 9], [24, 9], [24, 14], [16, 14]] },
            { seed: 7, path: [[22, 22], [25, 23], [22, 23], [21, 21]], pause: 2 },
            { seed: 11, path: [[15, 20], [17, 22], [16, 23], [14, 21]], pause: 3 },
            { seed: 5, path: [[27, 9], [27, 25], [34, 25], [27, 25]], pause: 1 },
          ],
        },
      };
    },
  };

  /* ====================== CANTEEN INTERIOR ====================== */
  M.canteen = {
    id: 'canteen',
    music: 'hub',
    wallColor: '#ffe6b0',
    trimColor: '#c96b3c',
    build() {
      const g = grid(20, 12, 't');
      R(g, 0, 0, 19, 1, '#');
      R(g, 0, 0, 0, 11, '#');
      R(g, 19, 0, 19, 11, '#');
      R(g, 0, 11, 19, 11, '#');
      g[11][9] = 't';
      g[11][10] = 't';
      // back door (to the sorting maze) in the top wall
      g[1][17] = 't';
      const o = [];
      o.push({ id: 'window1', type: 'window', c: 1, r: 0, w: 2, h: 2, layer: 'ground' });
      o.push({ id: 'menu', type: 'poster', c: 4, r: 0, w: 3, h: 2, layer: 'ground', title: "TODAY'S MENU", lines: ['Veggie wraps', 'Fruit cups', 'Water refills'], color: '#fff7d6' });
      o.push({ id: 'window2', type: 'window', c: 8, r: 0, w: 2, h: 2, layer: 'ground' });
      o.push({ id: 'rules', type: 'poster', c: 11, r: 0, w: 3, h: 2, layer: 'ground', title: 'CANTEEN TIP', lines: ['Take what', "you'll eat!"], color: '#e3f9ea' });
      o.push({ id: 'backdoorSign', type: 'poster', c: 15, r: 0, w: 2, h: 2, layer: 'ground', title: 'STORE', lines: ['ROOM', '→'], color: '#ffe0d6' });
      o.push({ id: 'backdoor', type: 'poster', c: 17, r: 0, w: 1, h: 1, layer: 'ground', solid: true, color: '#c96b3c' });
      o.push({ id: 'counter', type: 'counter', c: 3, r: 3, w: 9, h: 1, ip: { x: 7.5, y: 4.7 } });
      o.push({ id: 'bigbin', type: 'bigbin', c: 15, r: 3, w: 2, h: 2, ip: { x: 16, y: 5.6 } });
      o.push({ id: 'table1', type: 'table', c: 2, r: 6, w: 4, h: 2, mess: ['banana', 'chips', 'can', 'paper'] });
      o.push({ id: 'table2', type: 'table', c: 8, r: 6, w: 4, h: 2, mess: ['apple', 'wrapper', 'muesli'] });
      o.push({ id: 'table3', type: 'table', c: 14, r: 7, w: 4, h: 2, mess: ['bottle', 'cling', 'chips', 'apple'] });
      o.push({ id: 'plants', type: 'plantshelf', c: 1, r: 9, w: 3, h: 1, solid: true });
      o.push({ id: 'mat', type: 'doormat', c: 9, r: 10, w: 2, h: 1, solid: false, layer: 'ground', text: 'EXIT ▼' });
      return {
        ground: g,
        objects: o,
        extra: { spawn: { x: 10 * 48, y: 10 * 48 + 30 }, exit: { c0: 9, c1: 10, r: 11 }, backdoor: { x: 17.5 * 48, y: 2 * 48 + 20 }, sunny: { x: 7.5 * 48, y: 2 * 48 + 40 } },
      };
    },
  };

  /* ====================== ECO LAB INTERIOR ====================== */
  M.lab = {
    id: 'lab',
    music: 'lab',
    wallColor: '#e3f4ff',
    trimColor: '#4a7fa8',
    build() {
      const g = grid(20, 12, 'w');
      R(g, 0, 0, 19, 1, '#');
      R(g, 0, 0, 0, 11, '#');
      R(g, 19, 0, 19, 11, '#');
      R(g, 0, 11, 19, 11, '#');
      g[11][9] = 'w';
      g[11][10] = 'w';
      const o = [];
      o.push({ id: 'shelf1', type: 'plantshelf', c: 1, r: 0, w: 4, h: 2, layer: 'ground' });
      o.push({ id: 'screen', type: 'screen', c: 7, r: 0, w: 6, h: 2, title: 'SUNNY SCHOOL WASTE DATA (FICTIONAL)', values: () => WW.story ? WW.story.labScreenValues() : [0, 0, 0, 0] });
      o.push({ id: 'poster1', type: 'poster', c: 14, r: 0, w: 3, h: 2, layer: 'ground', title: 'GEOGRAPHERS', lines: ['Ask · Collect', 'Show · Explain', 'Act!'], color: '#f1e8ff' });
      o.push({ id: 'shelf2', type: 'plantshelf', c: 17, r: 0, w: 2, h: 2, layer: 'ground' });
      o.push({ id: 'mapdesk', type: 'desk', c: 2, r: 5, w: 4, h: 2, color: '#bfe6c8', ip: { x: 4, y: 7.6 }, top(ctx, x, y, w, h, t) {
        WW.draw.rr(ctx, x + 10, y + 6, w - 20, h - 30, 4, '#f7fbef', '#5a7a4a', 2);
        WW.draw.rr(ctx, x + 22, y + 12, 26, 18, 3, '#ffcb52');
        WW.draw.rr(ctx, x + 60, y + 14, 40, 16, 3, '#b49ce0');
        WW.draw.rr(ctx, x + 26, y + 34, 30, 10, 3, '#7fc8e8');
        WW.draw.text(ctx, 'N', x + w - 30, y + 14, 11, '#245241');
        WW.draw.line(ctx, x + w - 30, y + 20, x + w - 30, y + 34, '#245241', 2);
      } });
      o.push({ id: 'chartdesk', type: 'desk', c: 14, r: 5, w: 4, h: 2, color: '#c9b5df', ip: { x: 16, y: 7.6 }, top(ctx, x, y, w, h, t) {
        WW.draw.rr(ctx, x + 12, y + 6, w - 24, h - 30, 4, '#ffffff', '#5a4a7a', 2);
        const vals = [3, 5, 2, 4];
        vals.forEach((v, i) => WW.draw.rr(ctx, x + 26 + i * 30, y + 44 - v * 6, 18, v * 6, 2, ['#e5484d', '#9b6bff', '#3d8bfd', '#9aa5b0'][i]));
      } });
      o.push({ id: 'microscope', type: 'desk', c: 8, r: 8, w: 4, h: 1, color: '#ffe0a6', solid: true, top(ctx, x, y, w, h, t) {
        WW.draw.rr(ctx, x + 30, y - 18, 10, 24, 3, '#56636b');
        WW.draw.circle(ctx, x + 35, y - 20, 7, '#9aa5b0', '#2f3a40', 2);
        WW.items.draw(ctx, 'jar', x + w - 40, y - 2, 0.6);
        WW.items.draw(ctx, 'paper', x + 80, y + 4, 0.5);
      } });
      o.push({ id: 'mat', type: 'doormat', c: 9, r: 10, w: 2, h: 1, solid: false, layer: 'ground', text: 'EXIT ▼' });
      return { ground: g, objects: o, extra: { spawn: { x: 10 * 48, y: 10 * 48 + 30 }, exit: { c0: 9, c1: 10, r: 11 }, sprout: { x: 10 * 48, y: 4 * 48 + 10 } } };
    },
  };

  /* ====================== SORTING MAZE (canteen storeroom) ====================== */
  M.maze = {
    id: 'maze',
    music: 'maze',
    build(params) {
      const mz = WW.logic.makeMaze(2035, 12, 8, 0.14);
      const g = mz.grid.map((row) => row.slice());
      const o = [];
      for (const s of mz.stations) o.push({ id: 'station_' + s.kind, type: 'bin', kind: s.kind, c: s.c, r: s.r, scale: 1.15, sign: true, station: s.kind });
      o.push({ id: 'rulesign', type: 'rulesign', c: mz.sign.c, r: mz.sign.r });
      return { ground: g, objects: o, extra: { maze: mz, spawn: { x: mz.start.c * 48 + 24, y: mz.start.r * 48 + 34 } } };
    },
  };
})();
