# 🌿 WasteWise — The Eco Crew Adventure

An original, colourful, story-driven browser adventure for **Victorian Grade 4** students (Levels 3–4 Geography), built for **Climate Hack-tion 2026 (Build for 2035)**.

Players join the Eco Crew at the fictional **Sunny School** with **Milo the Eco Mouse**, walk around a cartoon school, talk to characters, investigate resource waste, make choices that visibly change the school, play mini-games (including a real **waste-sorting maze**), and finish with an untimed **20-mark assessment** and a teacher report.

> COP31 tracks: **Climate awareness & education** (primary) · **Waste & methane** (secondary).
> Curriculum focus (team mapping — please verify wording with VCAA): Victorian Curriculum F–10 v2.0 Geography, **VC2HG4K09** (sustainable use of natural resources and waste management) plus geographical inquiry skills.

---

## ▶ How to play

**Easiest:** open `index.html` in Chrome, Edge, Safari or Firefox (double-click it). No install, no internet, no account needed.

**Best (recommended for demos and the automated test):** run the tiny local server and open the address it prints:

```bash
python3 tools/serve.py
```

Then go to <http://localhost:8000>. (Any static web host works too, e.g. GitHub Pages — just upload this folder.)

### Controls

| Action | Keyboard | Mouse / tablet |
|---|---|---|
| Walk | Arrow keys or **WASD** | Tap/click where you want to go, or use the on-screen joystick |
| Run | Hold **Shift** | 🏃 button |
| Talk / use / pick up | **E**, Space or Enter | Tap the person/object, or the ✋ button |
| Next line of dialogue | E / Space / click the box | Tap the box |
| Choose an answer | Keys **1–4** or click | Tap |
| Notebook | **N** | 📓 button |
| Pause, sound & settings | **Esc** | ⏸ button |

The **yellow arrow** always points to the next goal, and the goal is written at the top-left.

---

## 🗺 What's in the game

| Part | What the player does | Learning |
|---|---|---|
| **Intro** | Meet Milo, learn to walk/talk (tutorial star) | Controls |
| **Chapter 1 · The Resource Mystery** (garden) | Inspect 4 clues (dripping tap, sprinkler on the path, light left on, bin of bottles) → **branching decision** about the leak (report / fix it yourself / ignore — "ignore" shows a *what-if* future where the garden wilts, then rewinds) → **sequencing puzzle** (water-wise routine) → **pipe puzzle** (route rainwater to the veggie beds, avoid cracked pipes) → rain refills the tank, garden blooms | Natural resources, using them sustainably, safety |
| **Chapter 2 · Canteen Chaos** | **Prevention choice** (nude-food picnic vs grab-and-go packs — this changes how much rubbish appears) → **Waste Maze**: walk a real maze, collect items one at a time, sort them at Compost / Recycling / Share & Reuse / Landfill under Sunny School's stated rules, with explanations, a landfill meter and a **methane** lesson → the canteen visibly becomes clean → choose how to keep it clean (changes the school) | Prevent → reuse → recycle/compost → landfill last; methane from food in landfill; rules vary by place |
| **Chapter 3 · Waste Detective** (Eco Lab) | Choose a testable inquiry question → read a compass **map** → walk to 3 real places in the school and **audit** bins → **build a bar chart** → interpret it → choose a plan **and the evidence that supports it** → an imagined (clearly labelled) improvement appears around the school | Geographical inquiry: question, collect, represent, conclude, act |
| **Final · Save Hilltop School** | Untimed, independent, new school: A spot problems in a picture (4) · B sustainable actions & sorting (5) · C chart + map questions (5) · D written plan (6, **teacher-reviewed**) | Apply learning to a new place |
| **Results** | Section scores, strengths, next steps, answer review, teacher marking (0–6 rubric), downloadable/printable report, free-play in the greener school | — |

Each chapter ends with a "What you learned" card, a 3-question practice check (not part of the 20 marks), a badge and Eco points (a game score, not a real-world measurement).

---

## ✅ Feature status (honest)

**Complete and tested** (see [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md)):
- Walkable cartoon school with collisions, camera, tap-to-walk pathfinding, running, keyboard/touch/joystick controls
- Milo the Eco Mouse (original design) + Principal Maple, Chef Sunny, Professor Sprout and wandering students — idle, walk/run in 4 directions, talk, wave, point, think, celebrate, carry, emotions
- Dialogue with animated portraits, typed subtitles, replay, choices; **voices** via browser speech (distinct per character) or "cartoon chatter", or text only
- Three connected chapters that unlock in order, saved on this device; demo/teacher jump
- Mini-games: clue inspection, sequencing, pipe puzzle, lunch decision, waste maze, map reading, bin audit tally, bar-chart builder, evidence-based plan
- Branching decisions with visible consequences (garden wilts/blooms, tank level, light off, canteen clean, Share Table / Nude Food banner / compost / paper tray, litter disappearing)
- Final 20-mark assessment (14 auto + 6 teacher), results, review, teacher marking, report download/print
- Original synthesised music (6 tunes) and sound effects; mute, volume, voices, text speed, reduced motion, bigger text
- 30 logic unit tests + a 48-check automated full playthrough

**Still needs work / not included:**
- **Professional voice recordings.** Voices use the browser's built-in speech (quality depends on the device). The code is ready for licensed recordings (see [`docs/VOICE_AND_ASSETS.md`](docs/VOICE_AND_ASSETS.md)); none are bundled.
- **Real classroom testing** with Grade 4 students and teachers (none done yet).
- **Curriculum wording check** against the official VCAA site (we map to VC2HG4K09 but have not verified the exact text).
- Hand-drawn sprite sheets (all art is drawn in code — consistent, but simpler than professional animation).
- Phones in portrait mode show a "turn sideways" message; the game is designed for laptops, Chromebooks and tablets.
- Not yet tested on a real iPad/Chromebook or in Firefox/Safari (tested in Chromium only).

---

## 👩‍🏫 For the hackathon demo

See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) for a 2-minute run-through. Shortcut: **Pause (Esc) → Teacher & demo options → Jump to a chapter**.

## 🧪 Tests

```bash
node tests/run-tests.js
```

That runs the logic unit tests (scoring, maze reachability, pipe puzzle solvability, content checks). For the full automated playthrough, start the server, then open <http://localhost:8000/tests/smoke.html> and press **Run playthrough** (it resets saved progress in that browser). For the input-file check, run:

```bash
python3 tools/check_inputs.py
```

## 📁 Project structure

```
index.html            the game page
css/style.css         all UI styles
js/core/              engine, input, audio (music/SFX/voices), save
js/art/               original procedural art: characters, world, items
js/world/             tile map + collision + A* pathfinding, actors, particles, world scene
js/data/              dialogue & content, maps, final assessment bank
js/logic/             pure, unit-tested logic (scoring, maze generator, pipe puzzle)
js/story/             chapter scripts (ch1, ch2, ch3, final) + story manager
js/scenes/            title/setup and the school hub
tests/                unit tests, automated playthrough, art preview
docs/                 teacher guide, curriculum matrix, test report, demo script, logs
tools/                local server, input checker
```

## 🔐 Privacy, safety and licensing

- No accounts, no tracking, no network calls needed (fonts load from Google Fonts if online, otherwise system fonts).
- Optional nickname only; progress is stored in this browser (`localStorage`). Final answers are kept in memory; the report is a local download.
- All characters, art, music and sound effects were **created for this project in code**. Milo is an original mouse (sandy fur, side oval ears, leaf explorer hat, teal backpack) — no Disney/Mickey likeness, voice or catchphrases.
- Schools, data and bin rules are **fictional** and labelled as such. Students are never asked to handle real waste.
- See [`CREDITS_AND_AI_DISCLOSURE.md`](CREDITS_AND_AI_DISCLOSURE.md).
