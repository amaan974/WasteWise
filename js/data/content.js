/* WasteWise — story & learning content (data). All school data and rules are FICTIONAL
   and belong to "Sunny School". Line IDs let licensed voice recordings be attached later
   (see WW.data.voiceClips and docs/VOICE_AND_ASSETS.md). Format: id: [speaker, emotion, text] */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const WW = (root.WW = root.WW || {});
  const DATA = (WW.data = WW.data || {});

  // Optional pre-recorded, licensed voice clips: { lineId: 'file.mp3' } in assets/voices/.
  // Empty on purpose — no recordings are bundled. The game falls back to browser speech or chatter.
  DATA.voiceClips = DATA.voiceClips || {};

  DATA.lines = {
    /* ---------------- Intro ---------------- */
    'intro.n.01': ['narrator', 'happy', 'Monday morning at Sunny School. The sun is shining… but something is not quite right.'],
    'intro.milo.01': ['milo', 'excited', 'Squeak! Hi there! You must be {name} — the newest member of the Eco Crew!'],
    'intro.milo.02': ['milo', 'happy', "I'm **Milo the Eco Mouse**. I help look after Sunny School's planet-friendly projects. Well… I try my best!"],
    'intro.milo.03': ['milo', 'happy', "Let's warm up those legs. Walk with the **arrow keys** or **WASD** — or tap where you want to go. Can you reach the sparkly star?"],
    'intro.milo.04': ['milo', 'excited', 'Whisker-tastic walking! Hold **Shift** to run. When you are next to someone, press **E** (or tap ✋) to talk.'],
    'intro.milo.05': ['milo', 'worried', 'Uh-oh… look over there! Principal Maple is near the garden gate, and she looks worried. Let’s go and help!'],

    /* ---------------- Chapter 1: The Resource Mystery ---------------- */
    'ch1.maple.01': ['maple', 'worried', 'Oh, thank goodness — the Eco Crew! Good morning, {name}. Good morning, Milo.'],
    'ch1.maple.02': ['maple', 'worried', 'Our **rain tank** is almost empty, the veggie beds are drooping, and I can’t work out why.'],
    'ch1.maple.03': ['maple', 'thinking', 'I think something in our garden is wasting **natural resources**. Could you investigate for me?'],
    'ch1.maple.nr1': ['maple', 'happy', 'Great question! **Natural resources** are things from nature that people use — like **water**, soil, sunlight, plants and the materials that things are made from.'],
    'ch1.milo.nr2': ['milo', 'thinking', 'Some, like sunshine, keep coming back every day. Others, like water in a dry summer, can run low. So we use them carefully!'],
    'ch1.maple.04': ['maple', 'happy', 'Look for clues all around the garden. Use your eyes — and your ears!'],
    'ch1.milo.01': ['milo', 'excited', 'Detective time! I’ll write every clue in our **Eco Notebook**. Press **N** to read it whenever you like.'],
    'ch1.milo.allclues': ['milo', 'thinking', 'Let’s see… water dripping, water spraying the path, a light left on, and a bin full of bottles. Let’s report back to Principal Maple!'],
    'ch1.maple.05': ['maple', 'happy', 'You’re back! What did you discover, detective?'],
    'ch1.milo.summary': ['milo', 'excited', 'Four clues! The tap drips, the sprinkler waters the path, the shed light was on, and the bin is full of plastic bottles.'],
    'ch1.maple.06': ['maple', 'worried', 'Goodness me. That dripping tap worries me most. What should we do about it?'],
    'ch1.milo.unsafe': ['milo', 'surprised', 'Whoa, whoa! Tools and water pipes can be dangerous. Fixing taps is a job for trained grown-ups!'],
    'ch1.maple.unsafe': ['maple', 'happy', 'Milo is right. Brave idea — but let’s choose a safer plan.'],
    'ch1.n.later': ['narrator', 'sad', 'What if we left it? … ONE WEEK LATER …'],
    'ch1.maple.ignore': ['maple', 'sad', 'Oh no. The drip never stopped. Our tank is nearly empty and the plants are wilting.'],
    'ch1.milo.ignore': ['milo', 'sad', 'A tiny drip, every second, all day and all night… it adds up to a whole lot of wasted water.'],
    'ch1.milo.rewind': ['milo', 'excited', 'Good news — that was only a “what if”. Let’s rewind time and choose again!'],
    'ch1.maple.good': ['maple', 'proud', 'Excellent thinking! Telling a grown-up keeps everyone safe, and the tap gets fixed properly.'],
    'ch1.n.caretaker': ['narrator', 'happy', 'Principal Maple radios the school caretaker. A few minutes later… clink, clank — fixed!'],
    'ch1.maple.07': ['maple', 'happy', 'Now, that sprinkler. Could the Eco Crew design a smarter way to water our garden?'],
    'ch1.milo.02': ['milo', 'excited', 'Leaf it to me! Well… leaf it to US! Let’s check the sprinkler control box.'],
    'ch1.milo.seqintro': ['milo', 'thinking', 'First, let’s plan a water-wise routine. Put the steps in a sensible order.'],
    'ch1.milo.pipeintro': ['milo', 'excited', 'Now the fun part! Turn the pipes so rainwater flows from the tank to every veggie bed — and avoid the cracked pipes!'],
    'ch1.n.rain': ['narrator', 'happy', 'That night, a big rain shower rolls over Sunny School…'],
    'ch1.maple.08': ['maple', 'excited', 'Look at our garden! Rain from the roof now fills the tank, and the drip lines send water straight to the roots.'],
    'ch1.milo.03': ['milo', 'laugh', 'And not one drop wasted on the path. Squeak-tacular!'],
    'ch1.maple.09': ['maple', 'happy', 'Thank you, {name}. Chef Sunny has been asking for help in the canteen — would you visit next?'],

    // clue reactions
    'ch1.clue.tank': ['milo', 'thinking', 'The rain tank gauge says it’s nearly empty. Rain from the roof should keep this full. Where is the water going?'],
    'ch1.clue.light.off': ['milo', 'happy', 'Click! Light off. We use daylight when the sun is shining — that saves electricity.'],
    'ch1.clue.done': ['milo', 'happy', 'We already checked that clue. It’s in the notebook!'],
    'ch1.compost': ['milo', 'happy', 'Our compost bays turn fruit and veggie scraps into rich soil for the garden. Nature’s recycling!'],
    'ch1.bed.dry': ['milo', 'worried', 'The soil is dry and the leaves are drooping. These plants are thirsty!'],
    'ch1.bed.good': ['milo', 'excited', 'Look at these veggies — tomatoes, carrots and flowers. Happy plants!'],

    /* ---------------- Chapter 2: Canteen Chaos ---------------- */
    'ch2.sunny.door': ['sunny', 'excited', 'Yoo-hoo! Eco Crew! Come in, come in — the canteen needs you!'],
    'ch2.sunny.01': ['sunny', 'surprised', 'Oh crumbs! Visitors! Welcome to Sunny Canteen — and please, mind the smell.'],
    'ch2.milo.01': ['milo', 'worried', 'Pee-yew! What happened in here?'],
    'ch2.sunny.02': ['sunny', 'worried', 'Lunchtime happened! Every day the bins overflow — food scraps, wrappers, bottles — and it ALL goes to **landfill**.'],
    'ch2.sunny.03': ['sunny', 'happy', 'Today I’m making lunch for the Eco Crew picnic. Before I cook, help me choose how to serve it!'],
    'ch2.sunny.lunchA': ['sunny', 'excited', 'Nude food! Everything in reusable boxes, whole fruit and refill bottles. Hardly any rubbish to deal with!'],
    'ch2.sunny.lunchB': ['sunny', 'surprised', 'Grab-and-go packs it is… that’s a LOT of wrappers, pouches and bottles. Let’s see where it all ends up!'],
    'ch2.n.lunch': ['narrator', 'happy', 'Lunchtime! The Eco Crew picnic is a big hit… and then comes the clean-up.'],
    'ch2.sunny.04': ['sunny', 'happy', 'Our storeroom out the back is a maze of crates. The sorting stations are right in the middle.'],
    'ch2.sunny.rules': ['sunny', 'thinking', 'Sunny School rules: **Compost** for food scraps. **Recycling** for clean paper, cardboard, empty cans and bottles. **Share & Reuse** for things still good to use. **Landfill** is the last choice.'],
    'ch2.milo.rules': ['milo', 'happy', 'Every school and council can have different rules, so today we follow Sunny School’s signs.'],
    'ch2.milo.maze1': ['milo', 'excited', 'Find the lunch rubbish hidden in the maze. Pick something up with **E**, then bring it to the right station in the middle — one at a time!'],
    'ch2.milo.maze2': ['milo', 'happy', 'Read the rules sign in the middle any time. And there’s no timer — think first, then sort!'],
    'ch2.milo.done': ['milo', 'laugh', 'Every single item sorted! The canteen is going to sparkle!'],
    'ch2.sunny.05': ['sunny', 'excited', 'Look at my canteen! Clean tables, happy bins — and the compost will feed the garden you saved!'],
    'ch2.sunny.06': ['sunny', 'thinking', 'Now, how do we keep it this way every single day?'],
    'ch2.sunny.07': ['sunny', 'proud', 'Brilliant idea. I’ll set it up straight away! Professor Sprout is waiting at the Eco Lab for you two.'],
    'ch2.bigbin': ['sunny', 'worried', 'That poor bin! Most of it doesn’t even belong in landfill.'],

    /* ---------------- Chapter 3: Waste Detective ---------------- */
    'ch3.sprout.door': ['sprout', 'happy', 'Ah! The Eco Crew! The lab door is open — do come in.'],
    'ch3.sprout.01': ['sprout', 'excited', 'Hello, hello! Professor Sprout, at your service. I’ve heard great things about you, {name}.'],
    'ch3.sprout.02': ['sprout', 'thinking', 'Sunny School still makes heaps of rubbish. But WHERE does it come from, and WHAT kind is it?'],
    'ch3.sprout.03': ['sprout', 'happy', 'Geographers don’t guess. We **ask a question**, **collect evidence**, **show it**, then **decide what to do**.'],
    'ch3.sprout.q': ['sprout', 'thinking', 'So, which question should our investigation answer?'],
    'ch3.sprout.qgood': ['sprout', 'excited', 'Splendid! A question we can answer with evidence. To the map table!'],
    'ch3.sprout.qbad': ['sprout', 'thinking', 'Hmm, fun question — but it won’t help us reduce waste. Try another!'],
    'ch3.sprout.map': ['sprout', 'happy', 'This map shows Sunny School from above. **North** is at the top. Can you find our three audit sites?'],
    'ch3.milo.sites': ['milo', 'excited', 'Three bins to check! I’ll mark them on the school map. Let’s go count rubbish — with gloves on, of course!'],
    'ch3.milo.siteDone': ['milo', 'happy', 'Counted and recorded! On to the next site.'],
    'ch3.milo.allSites': ['milo', 'excited', 'All three sites done! Let’s take our data back to Professor Sprout.'],
    'ch3.sprout.chart': ['sprout', 'happy', 'Wonderful data! Now let’s **show** it. Build a bar chart of our totals at the chart desk.'],
    'ch3.sprout.plan': ['sprout', 'thinking', 'Now the big decision. Which change fits our evidence best?'],
    'ch3.sprout.badplan': ['sprout', 'thinking', 'Rainbow bins would look fun, but nothing in our evidence says colour is the problem. Look at the chart again!'],
    'ch3.n.later': ['narrator', 'happy', 'Four weeks later… (this is an imagined result to show how evidence can guide change)'],
    'ch3.sprout.after': ['sprout', 'excited', 'Look around the school! Your plan is in action. Our evidence led to a real change.'],
    'ch3.sprout.final': ['sprout', 'proud', 'You think like a true geographer, {name}. Principal Maple has opened the Assembly Hall for the final challenge!'],
    'ch3.site.locked': ['milo', 'thinking', 'We’ll audit these bins later, when Professor Sprout gives us the map.'],

    /* ---------------- Final challenge ---------------- */
    'fin.maple.01': ['maple', 'happy', 'Welcome to the Assembly Hall, {name}! You have helped Sunny School so much.'],
    'fin.maple.02': ['maple', 'thinking', 'Now, the Eco Crew at **Hilltop School** — a different school — needs your help. This is the **Save Hilltop School Challenge**.'],
    'fin.maple.03': ['maple', 'happy', 'Take your time. There is no timer, and nobody will give you the answers. Show what YOU know.'],
    'fin.milo.01': ['milo', 'happy', 'I believe in you! I’ll be as quiet as a mouse… a very, very quiet mouse.'],
    'fin.maple.end': ['maple', 'proud', 'Thank you for thinking so carefully about resources and waste. You are a true Eco Crew hero!'],

    /* ---------------- Ambient ---------------- */
    'amb.notice': ['milo', 'happy', 'The noticeboard shows our Eco Crew progress. Every badge is a step towards a greener school!'],
    'amb.bubbler': ['milo', 'happy', 'A drinking fountain! Refilling a bottle here means no new plastic bottle needed.'],
    'amb.classrooms': ['milo', 'thinking', 'Classes are busy right now. We’ll leave the classrooms in peace.'],
    'amb.locked.canteen': ['milo', 'thinking', 'The canteen is locked for now. Let’s help Principal Maple in the garden first.'],
    'amb.locked.lab': ['milo', 'thinking', 'The Eco Lab is locked. Professor Sprout is busy until we’ve helped Chef Sunny.'],
    'amb.locked.hall': ['milo', 'thinking', 'The hall is closed until the Eco Crew finishes all three missions.'],
  };

  DATA.studentChat = [
    'I love the veggie garden!',
    'Did you know paper can be recycled many times — but not forever!',
    'My lunchbox is reusable. No wrappers today!',
    'Race you to the slide!',
    'Milo is so cute!',
    'I always fill my bottle at the bubbler.',
  ];

  /* ---------------- Chapter 1 clues ---------------- */
  DATA.clues = {
    tap: {
      title: 'The dripping tap', art: 'tap', note: 'Tap drips even when no one is using it → wastes WATER.',
      prompt: 'Drip… drip… drip. The tap is dripping, even though nobody is using it. Which natural resource is being wasted?',
      options: [
        { id: 'water', icon: '💧', text: 'Water', ok: true, why: 'Yes! Fresh water is dripping away. A tiny drip, all day and night, adds up to LOTS of water.' },
        { id: 'power', icon: '⚡', text: 'Electricity', ok: false, why: 'Hmm — look closely at what is falling from the tap.' },
        { id: 'paper', icon: '📄', text: 'Paper', ok: false, why: 'There’s no paper here. What is dripping?' },
      ],
    },
    sprinkler: {
      title: 'The busy sprinkler', art: 'sprinkler', note: 'Sprinkler sprays the path in the hot midday sun → WATER goes to waste.',
      prompt: 'The sprinkler is spraying the concrete path in the hot midday sun. Why is this wasteful?',
      options: [
        { id: 'path', icon: '☀️', text: 'The water lands on the path, not the plants — and lots dries up in the heat', ok: true, why: 'Exactly! Water on the path doesn’t help plants, and hot sun makes water evaporate (dry up) quickly.' },
        { id: 'never', icon: '🌵', text: 'Plants never need water', ok: false, why: 'Plants DO need water! But where is this water actually going?' },
        { id: 'noise', icon: '🔊', text: 'Sprinklers are too noisy', ok: false, why: 'It might be a bit noisy — but think about where the water lands.' },
      ],
    },
    light: {
      title: 'The glowing shed', art: 'light', note: 'Shed light on in daytime with nobody inside → wastes ELECTRICITY (energy).',
      prompt: 'It’s a bright sunny day, but the shed light is on — and nobody is inside. What is being wasted?',
      options: [
        { id: 'power', icon: '⚡', text: 'Electricity (energy)', ok: true, why: 'Right! Some electricity is made by burning coal and gas, which adds greenhouse gases to the air. Switching off when we can saves energy.' },
        { id: 'water', icon: '💧', text: 'Water', ok: false, why: 'Not water this time — what makes a light bulb glow?' },
        { id: 'wood', icon: '🪵', text: 'Wood', ok: false, why: 'The shed is made of wood, but that isn’t being used up. What powers the light?' },
      ],
    },
    bottles: {
      title: 'The overflowing bin', art: 'bottles', note: 'Bin full of single-use plastic bottles → wastes MATERIALS. Refillable bottles could prevent it.',
      prompt: 'The garden bin is overflowing with single-use plastic drink bottles from garden club. What’s the problem?',
      options: [
        { id: 'materials', icon: '🧴', text: 'New bottles use up materials — refillable bottles could prevent this waste', ok: true, why: 'Yes! Plastic is made from materials like oil and gas. A refillable bottle can be used again and again, so less rubbish is made.' },
        { id: 'colour', icon: '🎨', text: 'The bin is the wrong colour', ok: false, why: 'The colour isn’t the big issue. Look at what fills the bin.' },
        { id: 'fine', icon: '👍', text: 'Nothing is wrong', ok: false, why: 'Hmm, an overflowing bin of bottles every week? Think about how to need fewer bottles.' },
      ],
    },
  };
  DATA.clueOrder = ['tap', 'sprinkler', 'light', 'bottles'];

  DATA.leakChoices = [
    { id: 'report', icon: '📻', text: 'Tell the caretaker so it gets fixed properly', quality: 'best' },
    { id: 'diy', icon: '🔧', text: 'Grab a wrench and fix it ourselves!', quality: 'retry' },
    { id: 'ignore', icon: '🤷', text: 'Leave it — it’s only a small drip', quality: 'retry' },
  ];

  DATA.sequence = {
    title: 'Water-wise watering routine',
    steps: [
      { id: 'check', icon: '👆', text: 'Check the soil — is it dry?' },
      { id: 'fill', icon: '🪣', text: 'Fill the watering can from the rain tank' },
      { id: 'water', icon: '🌅', text: 'Water the roots in the cool morning' },
      { id: 'tap', icon: '🚰', text: 'Turn the tank tap off tightly' },
    ],
    start: ['water', 'tap', 'check', 'fill'],
    why: 'Checking first means we only water when plants need it. Rainwater saves tap water. Morning watering means less water evaporates, and turning the tap off stops drips.',
  };

  DATA.ch1Learn = {
    title: 'What you learned',
    badge: { icon: '💧', name: 'Water Guardian' },
    facts: [
      '**Natural resources** come from nature — like water, soil, sunlight, plants and minerals.',
      'We can use them **sustainably**: report leaks to an adult, water at cool times, collect rainwater, switch off lights and choose refillable bottles.',
      'Small actions add up when a whole school does them together.',
    ],
  };

  /* ---------------- Chapter 2: lunch + maze ---------------- */
  DATA.lunches = [
    { id: 'nude', title: 'Nude Food Picnic', icons: ['lunchbox', 'refill', 'apple'], text: 'Reusable boxes, whole fruit, refill bottles', forecast: 'Very little rubbish', quality: 'best' },
    { id: 'packs', title: 'Grab-and-Go Packs', icons: ['chips', 'pouch', 'bottle', 'wrapper'], text: 'Everything wrapped, pouches and bottled drinks', forecast: 'Lots of packaging', quality: 'ok' },
  ];

  // Sunny School's FICTIONAL collection rules
  DATA.stations = {
    compost: { name: 'Compost', icon: '🌱', lid: 'green lid', rule: 'Fruit & vegetable scraps, food scraps' },
    recycle: { name: 'Recycling', icon: '♻️', lid: 'yellow lid', rule: 'Clean paper & cardboard, empty cans, empty plastic bottles' },
    reuse: { name: 'Share & Reuse', icon: '🔁', lid: 'blue table', rule: 'Things still good to use: reusable containers, unopened food' },
    landfill: { name: 'Landfill', icon: '🗑️', lid: 'red lid', rule: 'Last choice: soft plastic wrappers & pouches this school can’t recycle' },
  };

  DATA.mazeItems = {
    banana: { name: 'Banana peel', bin: 'compost', why: 'Food scraps go to compost here, where air helps them turn into healthy soil.' },
    apple: { name: 'Apple core', bin: 'compost', why: 'Apple cores are food scraps — perfect for compost.' },
    bread: { name: 'Sandwich crusts', bin: 'compost', why: 'Leftover bread is a food scrap, so it goes to compost at Sunny School.' },
    paper: { name: 'Clean worksheet', bin: 'recycle', why: 'Clean paper can be recycled into new paper.' },
    can: { name: 'Empty drink can', bin: 'recycle', why: 'Empty metal cans are recycled — metal can be melted and made into new things.' },
    bottle: { name: 'Empty plastic bottle', bin: 'recycle', why: 'Empty plastic drink bottles go in Sunny School’s recycling.' },
    chips: { name: 'Chip packet', bin: 'landfill', why: 'Soft, shiny chip packets can’t be recycled at Sunny School, so landfill is the last choice.' },
    wrapper: { name: 'Lolly wrapper', bin: 'landfill', why: 'Mixed-material wrappers can’t be recycled here — next time, choose less packaging!' },
    cling: { name: 'Used cling wrap', bin: 'landfill', why: 'Used soft plastic wrap goes to landfill at this school. A reusable box would avoid it!' },
    pouch: { name: 'Yoghurt pouch', bin: 'landfill', why: 'Pouches mix plastic and foil, so this school can’t recycle them. A small reusable tub prevents this waste.' },
    lunchbox: { name: 'Reusable lunchbox', bin: 'reuse', why: 'It’s not rubbish at all! Wash it and use it again tomorrow.' },
    refill: { name: 'Refillable bottle', bin: 'reuse', why: 'Still useful! Reusing beats recycling — refill it again and again.' },
    muesli: { name: 'Unopened muesli bar', bin: 'reuse', why: 'It’s still sealed and good to eat — the Share Table means someone can enjoy it!' },
  };
  DATA.mazeBase = ['banana', 'apple', 'paper', 'can', 'chips', 'muesli', 'bread'];
  DATA.mazeByLunch = { nude: ['lunchbox', 'refill'], packs: ['wrapper', 'cling', 'pouch', 'bottle'] };

  DATA.wrongHints = {
    compost: { landfill: 'METHANE', recycle: 'Food scraps aren’t recyclable like paper or cans. Where can food turn into soil?', reuse: 'It’s been eaten — it can’t be shared now. Where do food scraps go?' },
    recycle: { landfill: 'This can be made into something new! Which station turns materials into new things?', compost: 'It isn’t food, so it won’t rot into soil. Which station takes clean paper, cans and bottles?', reuse: 'It’s empty or used — which station turns materials into new things?' },
    landfill: { recycle: 'Sunny School’s recycling can’t take soft or shiny wrappers — they can jam the machines. Check the sign!', compost: 'Plastic doesn’t rot into soil. Which station is the last choice for wrappers?', reuse: 'A used wrapper can’t be used again. Which station is the last choice?' },
    reuse: { landfill: 'Wait — this is still useful! Throwing away good things wastes resources. Which station keeps it in use?', recycle: 'Recycling uses energy to remake things. This is still good to use as it is!', compost: 'It isn’t a food scrap. Is it still useful as it is?' },
  };
  DATA.methaneLesson = 'In landfill, food gets buried without air. As it rots it makes **methane** — a gas that traps a lot of heat and warms our planet. In compost, air helps food turn into healthy soil instead!';

  DATA.keepClean = [
    { id: 'binSigns', icon: '🪧', text: 'Picture signs above every bin' },
    { id: 'shareTable', icon: '🍎', text: 'A Share Table for unopened food' },
    { id: 'nudeFood', icon: '🥕', text: 'A weekly Nude Food Day' },
  ];

  DATA.ch2Learn = {
    title: 'What you learned',
    badge: { icon: '🍎', name: 'Canteen Champion' },
    facts: [
      'The best waste is the waste we **don’t make**: choose less packaging and reusable containers.',
      '**Reuse** before you recycle. Recycle and compost what you can. **Landfill** is the last choice.',
      'Food in landfill rots without air and makes **methane**, a gas that warms the planet. Composting helps stop that.',
      'Bin rules are different in different places — always check your school’s signs.',
    ],
  };

  /* ---------------- Chapter 3: inquiry ---------------- */
  DATA.inquiryQs = [
    { id: 'good', icon: '🔍', text: 'What kinds of waste does our school make, and where?', ok: true },
    { id: 'colour', icon: '🎨', text: 'What is everyone’s favourite colour?', ok: false },
    { id: 'roof', icon: '📏', text: 'How tall is the school roof?', ok: false },
  ];
  DATA.mapClues = [
    { site: 'canteen', text: 'Site 1: the bins EAST of the courtyard, next to the canteen.', answer: 'A' },
    { site: 'classrooms', text: 'Site 2: the recycling corner NORTH-EAST, outside the classrooms.', answer: 'B' },
    { site: 'playground', text: 'Site 3: the bin SOUTH of the courtyard, at the playground.', answer: 'C' },
  ];
  DATA.categories = [
    { id: 'food', name: 'Food', icon: '🍎', color: '#e5484d' },
    { id: 'packaging', name: 'Packaging', icon: '📦', color: '#9b6bff' },
    { id: 'paper', name: 'Paper', icon: '📄', color: '#3d8bfd' },
    { id: 'other', name: 'Other', icon: '❔', color: '#9aa5b0' },
  ];
  // FICTIONAL audit samples (8 items per site)
  DATA.auditSites = {
    canteen: { name: 'Canteen bins', items: ['apple', 'banana', 'bread', 'orange', 'chips', 'pouch', 'wrapper', 'paper'] },
    classrooms: { name: 'Classroom recycling corner', items: ['paper', 'paper', 'cardboard', 'paper', 'paper', 'wrapper', 'apple', 'tissue'] },
    playground: { name: 'Playground bin', items: ['chips', 'wrapper', 'cling', 'pouch', 'bottle', 'apple', 'paper', 'tissue'] },
  };
  DATA.itemCategory = { apple: 'food', banana: 'food', bread: 'food', orange: 'food', chips: 'packaging', pouch: 'packaging', wrapper: 'packaging', cling: 'packaging', bottle: 'packaging', paper: 'paper', cardboard: 'paper', tissue: 'other', can: 'packaging', muesli: 'food' };
  DATA.itemNames = { apple: 'Apple core', banana: 'Banana peel', bread: 'Sandwich crusts', orange: 'Orange peel', chips: 'Chip packet', pouch: 'Yoghurt pouch', wrapper: 'Lolly wrapper', cling: 'Cling wrap', bottle: 'Plastic bottle', paper: 'Scrap paper', cardboard: 'Cardboard', tissue: 'Used tissue', can: 'Drink can', muesli: 'Muesli bar', lunchbox: 'Lunchbox', refill: 'Refill bottle', breadbag: 'Bread bag', jar: 'Glass jar' };

  DATA.plans = [
    { id: 'nudeFood', icon: '🥕', text: 'Nude Food lunches to cut down packaging', fits: true,
      reasons: [
        { id: 'r1', text: 'Packaging was the biggest type of waste — especially at the playground', ok: true },
        { id: 'r2', text: 'Paper was the smallest type of waste', ok: false },
        { id: 'r3', text: 'Because it sounds fun', ok: false },
      ] },
    { id: 'compost', icon: '🌱', text: 'A compost bin at the canteen for food scraps', fits: true,
      reasons: [
        { id: 'r1', text: 'The canteen bins had the most food waste of all three sites', ok: true },
        { id: 'r2', text: 'The classrooms had lots of food', ok: false },
        { id: 'r3', text: 'Compost bins are green', ok: false },
      ] },
    { id: 'paperReuse', icon: '📄', text: 'A scrap-paper reuse tray in every classroom', fits: true,
      reasons: [
        { id: 'r1', text: 'Most of the classroom waste was paper', ok: true },
        { id: 'r2', text: 'The playground had the most paper', ok: false },
        { id: 'r3', text: 'Paper is heavy', ok: false },
      ] },
    { id: 'rainbow', icon: '🌈', text: 'Paint every bin in rainbow colours', fits: false, reasons: [] },
  ];
  DATA.ch3Learn = {
    title: 'What you learned',
    badge: { icon: '🔎', name: 'Evidence Expert' },
    facts: [
      'Geographers **ask a question**, **collect evidence**, **show it** (like a bar chart), **explain** what it means, then **act**.',
      'A **map** with a compass helps us find and describe places: north, south, east and west.',
      'Good plans match the evidence. Our sample was small and fictional — real schools should collect their own data.',
    ],
  };

  /* ---------------- Chapter checks (practice, not part of the 20 marks) ---------------- */
  DATA.checks = {
    1: [
      { q: 'Which of these is a natural resource?', options: ['Fresh water', 'A video game', 'A TV show'], a: 0, why: 'Water comes from nature — rain, rivers and underground.' },
      { q: 'What is the SAFEST thing to do about a leaking tap at school?', options: ['Fix it with tools yourself', 'Tell a teacher or the caretaker', 'Ignore it'], a: 1, why: 'Grown-ups can fix it safely and properly.' },
      { q: 'Why is it better to water plants in the cool morning?', options: ['Plants are asleep at midday', 'Sprinklers only work in the morning', 'Less water dries up (evaporates) in the heat'], a: 2, why: 'Hot sun makes water evaporate before plants can use it.' },
    ],
    2: [
      { q: 'What is the BEST first step to reduce lunch waste?', options: ['Get a bigger bin', 'Pack lunch with less packaging', 'Put everything in recycling'], a: 1, why: 'Preventing waste comes first!' },
      { q: 'At Sunny School, where does a banana peel go?', options: ['Compost', 'Recycling', 'Landfill'], a: 0, why: 'Food scraps go to compost at Sunny School.' },
      { q: 'Why is food in landfill a problem?', options: ['It turns into plastic', 'It rots without air and makes methane, a gas that warms the planet', 'It makes the bin colourful'], a: 1, why: 'Methane traps heat in the atmosphere.' },
    ],
    3: [
      { q: 'What do geographers do BEFORE choosing an action?', options: ['Guess', 'Collect and study evidence', 'Pick their favourite idea'], a: 1, why: 'Evidence helps us choose actions that really work.' },
      { q: 'In our audit, which type of waste was the biggest overall?', options: ['Food', 'Paper', 'Packaging'], a: 2, why: 'Packaging had the tallest bar in our chart.' },
      { q: 'On the school map, which direction is the playground from the courtyard?', options: ['South', 'North', 'West'], a: 0, why: 'South is towards the bottom of the map.' },
    ],
  };

  DATA.chapters = [
    { n: 1, title: 'The Resource Mystery', icon: '💧', place: 'School garden', who: 'maple', learn: 'Sustainable use of natural resources' },
    { n: 2, title: 'Canteen Chaos', icon: '🥪', place: 'Canteen & sorting maze', who: 'sunny', learn: 'Preventing, reusing and sorting waste' },
    { n: 3, title: 'Waste Detective', icon: '🔎', place: 'Eco Lab', who: 'sprout', learn: 'Maps, data and evidence-based action' },
    { n: 4, title: 'Save Hilltop School', icon: '🏆', place: 'Assembly Hall', who: 'maple', learn: 'Final 20-mark challenge' },
  ];
})();
