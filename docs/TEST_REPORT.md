# Test report — what was actually run (3 Oct 2026)

Environment: macOS, Node v24.13.0, Python 3.14; browser testing in the Claude Code desktop app's built-in Chromium browser pane (served by `tools/serve.py`). **No testing yet on a real iPad, Chromebook, Safari or Firefox, and no testing with students.**

## 1. Logic unit tests — `node tests/run-tests.js` → **30 passed, 0 failed**
- Final assessment: section marks add up to 20 (14 auto + 6 teacher); all-correct gives 14 with teacher marks pending (total stays empty); teacher marks are added and clamped; empty answers give 0 without crashing; extra hotspots can't exceed 4; wrong answers aren't counted; correct-answer positions vary; chart questions match the chart data.
- Waste maze: deterministic for its seed; the player never spawns in a wall; every floor tile can be reached; all 4 stations are reachable; enough spread-out item spots for 11 items; at least 6 items are 10+ steps away (real navigation); every item has a station and an explanation; wrong drops never score; a reuse/prevention item exists in both lunch versions; wrong-station hints exist for every pair.
- Pipe puzzle: the intended solution waters 3/3 beds with no leaks; the scrambled start isn't solved; it's solvable by rotation only; the hint points to a wrong piece.
- Content: the sequencing puzzle starts out of order; audit totals match the chart (packaging biggest; most paper at classrooms; most food at canteen; most packaging at playground); answer keys are valid; every dialogue line has a speaker and text; no Disney/Mickey phrases; every line used by the story scripts exists.

## 2. Automated full playthrough — `tests/smoke.html` → **49 passed, 0 failed**
It plays a fresh save with simulated key presses and real DOM clicks: intro and walking tutorial (held ↑ key) → Chapter 1 (4 clues each with a wrong answer first, "ignore" what-if consequence and rewind, unsafe DIY redirect, report, sequencing, pipe puzzle solved by clicking pieces, rain/bloom, learn card, check, unlock) → Chapter 2 (lunch choice, maze walls block movement, food → landfill rejected with the methane explanation, all items sorted, clean canteen, improvement chosen) → walk out → Chapter 3 (off-topic question rejected, map reading, walk out, 3 audits, chart built, rainbow-bins plan rejected, evidence-based plan, litter cleared, Hall unlocked) → final (Parts A–D) → results (14/14 auto + pending), teacher marks → 20/20, report text, completion flag, **no JavaScript errors**.

## 3. Manual / visual checks done in the browser pane (screenshots reviewed)
| Check | Result |
|---|---|
| Title, setup (nickname, avatar, voice choice) | ✅ works; fixed hard-to-read subtitle text |
| Hub art, HUD, objective arrow, Milo following, students | ✅ |
| Dialogue box, choices, narrator layout | ✅ after fixing the narrator column bug |
| Dialogue portraits | ✅ after fixing a scale bug (Milo was tiny) |
| Clue panels, sequencing, pipe puzzle, learn card, chapter check | ✅ |
| Canteen, lunch cards, maze art, stations, maze status panel | ✅ fixed off-screen arrow drawn over Chef Sunny |
| Map (compass moved so it doesn't cover a building), audit tarp (added item names), chart | ✅ |
| Hall, Part A picture (hotspot labels moved below the objects), results | ✅ |
| Real collisions: walking into maze walls with held keys | ✅ stops at walls |
| Tap-to-walk on the canvas; tapping a person to talk | ✅ |
| Touch joystick (simulated pointer events) | ✅ moves at walking speed, stops on release |
| Pause freezes game time; settings; mute updates HUD; notebook | ✅ |
| Layout at 1024×700 and 812×375 (phone landscape) with touch controls | ✅ |
| Audio: AudioContext runs; all 23 SFX + 6 music tracks start without errors; 41 English voices detected; distinct voice per character | ✅ runs — **not listened to by a human yet** |

## 4. Not tested / limitations
- Sound quality and voice pleasantness — please listen on your demo device.
- Opening `index.html` directly (file://) in a real browser — static check shows no fetch/modules are used, so it should work, but please try it.
- Safari/Firefox/iPad/Chromebook performance and touch feel.
- Screen-reader experience (ARIA labels exist but haven't been checked with VoiceOver/NVDA).
- Usability with Grade 4 students; curriculum wording verification with VCAA.

## 5. Bugs found and fixed during testing
1. Narrator dialogue: text wrapped one word per line (CSS grid column) — fixed.
2. Dialogue portrait scale overwritten by `undefined` — fixed.
3. Double-clicking the right chart answer skipped the next question — fixed (buttons lock after a correct answer).
4. A fading panel could intercept clicks — fixed (`pointer-events: none` while fading).
5. Off-screen objective arrow drawn on top of an on-screen character — fixed.
6. Reloading during the Chapter 3 "four weeks later" cutscene left no objective — the scene now resumes.
7. Demo "unlock all" could start the canteen/lab in a locked state — fixed.
8. Smaller polish: compass placement, audit labels, hotspot placement, banner overlapping a sign, grammar.
