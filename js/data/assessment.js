/* WasteWise — Final challenge: "Save Hilltop School" (a NEW fictional school, so students
   apply ideas rather than recall answers). 20 marks: 14 automatically marked (deterministic
   answer keys) + 6 teacher-reviewed (never auto-awarded). Untimed. */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const WW = (root.WW = root.WW || {});
  const DATA = (WW.data = WW.data || {});

  DATA.assessment = {
    school: 'Hilltop School',
    rulesText: 'Hilltop School’s rules (fictional): food scraps → Compost · clean paper, cardboard, empty cans & bottles → Recycling · still-useful things → Share & Reuse · soft plastic bags & wrappers → Landfill.',
    A: {
      id: 'A', title: 'Spot the problems', max: 4, pick: 4,
      intro: 'Look carefully at Hilltop School. Choose the FOUR places where resources or waste are NOT being managed well.',
      hotspots: [
        { id: 'tap', label: 'Garden tap', x: 14, y: 70, problem: true, explain: 'The tap is running with nobody using it — water is being wasted.' },
        { id: 'room', label: 'Empty classroom', x: 40, y: 28, problem: true, explain: 'Lights and a fan are on in an empty room — electricity is being wasted.' },
        { id: 'canteenbin', label: 'Canteen bin', x: 64, y: 64, problem: true, explain: 'Lots of food scraps are in the landfill bin, where they make methane.' },
        { id: 'printer', label: 'Printer', x: 84, y: 30, problem: true, explain: 'Piles of paper printed on one side are being thrown away instead of reused.' },
        { id: 'bubbler', label: 'Drink station', x: 30, y: 82, problem: false, explain: 'A student refilling a reusable bottle — great choice!' },
        { id: 'compost', label: 'Compost bin', x: 52, y: 84, problem: false, explain: 'Fruit scraps in the compost bin — correct!' },
        { id: 'bikes', label: 'Bike rack', x: 88, y: 76, problem: false, explain: 'Riding or walking to school uses no petrol — not a problem.' },
      ],
    },
    B: {
      id: 'B', title: 'Choose sustainable actions', max: 5,
      sortIntro: 'Use Hilltop School’s rules. Where should each item go?',
      sort: [
        { id: 'b1', item: 'orange', name: 'Orange peel', answer: 'compost' },
        { id: 'b2', item: 'cardboard', name: 'Clean, flattened cardboard box', answer: 'recycle' },
        { id: 'b3', item: 'breadbag', name: 'Soft plastic bread bag', answer: 'landfill' },
      ],
      mcq: [
        { id: 'b4', q: 'Hilltop’s canteen gives every student a NEW plastic cup each day. Which change would PREVENT the most waste?', options: ['Put the cups in a bigger bin', 'Students use their own reusable cups or bottles', 'Give out two cups so they don’t crack'], a: 1 },
        { id: 'b5', q: 'A classroom tap is broken and won’t turn off. What should a Grade 4 student do?', options: ['Try to fix it with tools', 'Wait until next week', 'Tell a teacher or the office straight away'], a: 2 },
      ],
    },
    C: {
      id: 'C', title: 'Use geographical evidence', max: 5,
      intro: 'Hilltop School’s Eco Crew sorted a sample of 100 rubbish items (fictional data). Use the chart and the map.',
      chart: [
        { id: 'food', name: 'Food', value: 40, color: '#e5484d' },
        { id: 'packaging', name: 'Packaging', value: 30, color: '#9b6bff' },
        { id: 'paper', name: 'Paper', value: 20, color: '#3d8bfd' },
        { id: 'other', name: 'Other', value: 10, color: '#9aa5b0' },
      ],
      map: { library: 'north', garden: 'east', canteen: 'west', bikes: 'south', centre: 'Playground' },
      mcq: [
        { id: 'c1', q: 'Which type of waste was the LARGEST in the sample?', options: ['Paper', 'Food', 'Packaging'], a: 1 },
        { id: 'c2', q: 'How many MORE food items than paper items were there?', options: ['20', '10', '60'], a: 0 },
        { id: 'c3', q: 'How many items were food AND packaging together?', options: ['40', '50', '70'], a: 2 },
        { id: 'c4', q: 'Look at the map. Which direction is the garden from the playground?', options: ['North', 'East', 'West'], a: 1 },
        { id: 'c5', q: 'Food was the largest type of waste. Which plan best matches this evidence?', options: ['Start a compost bin and check lunch portion sizes', 'Buy more paper recycling trays', 'Paint the bins a new colour'], a: 0 },
      ],
    },
    D: {
      id: 'D', title: 'Explain your plan', max: 6,
      prompt: 'Suggest ONE realistic change Hilltop School could try to reduce waste or save resources. Use at least one piece of evidence from the chart or map. Explain who could help and why your plan would work.',
      starters: ['I think Hilltop School should…', 'The evidence shows…', 'This would help because…', 'People who could help are…'],
      rubric: [
        { id: 'feasible', name: 'A specific, realistic action', max: 2 },
        { id: 'evidence', name: 'Uses evidence or environmental reasons', max: 2 },
        { id: 'clarity', name: 'Clear explanation of who/how/why', max: 2 },
      ],
    },
  };
})();
