# Implementation log (four-layer approach)

## Layer A — Prompt engineering (task breakdown)
The master brief was split into small, testable deliverables, built in priority order:
1. Engine core (scaling, loop, scenes, transitions, input, save) → 2. original art and audio → 3. walkable hub + Milo + dialogue → 4. **Chapter 1 as a complete vertical slice** → 5. Chapter 2 + waste maze → 6. Chapter 3 → 7. final assessment + results/report → 8. tests, polish, docs.
Each had an acceptance check (e.g. "maze: walls block movement, every tile reachable, wrong drops never score").

## Layer B — Context engineering
Read in order: `CLAUDE.md`, `MASTER_PROMPT.md`, `FINAL_IDEATION.md`, the prototype code, the supplementary `docs/` and `content/`, and both official PDFs (rendered page by page because they are scanned). Key decisions taken from that context:
- The Participant Guide says *"you must start building from scratch when the clock starts"*, so a new codebase was written in `WasteWise_Game/`; the old prototype is kept untouched for reference.
- Plain HTML/CSS/JS was kept (no framework or build step) so it runs offline by opening `index.html` (time-safe and school-friendly).
- `content/*.json` drafts were adapted: the final bank moved correct answers out of always-first position; dialogue moved into `js/data/content.js` with line IDs for future licensed voice clips.
- Conflict noted: the old prototype's mascot was "Pip" and its final assessment had 14+6 marks spread differently; FINAL_IDEATION (Milo; 4/5/5/6) was followed.

## Layer C — Harness engineering
- `node tests/run-tests.js` — pure logic tests (scoring, maze generator, pipe puzzle, content integrity).
- `tests/smoke.html` — automated full playthrough using `index.html?debug=1` helpers (`WWDEBUG.run/until/use/choose/hold`), which step the engine at a fixed 60 fps so it runs even when the tab is throttled.
- `tests/art-preview.html` — character/portrait sheet for visual checks.
- `tools/serve.py` — no-cache local server; `tools/check_inputs.py` — file/content integrity.
- `node --check` on every JS file after each change; screenshots reviewed in the browser pane.

## Layer D — Loop engineering (what happened)
| Milestone | Checks run | Issues found → fixed |
|---|---|---|
| Characters | Art preview screenshots | Side-view hair covered the face → redrew it |
| Title/setup/hub | Browser load, console | Narrator text one word per line (CSS) → fixed; cached CSS → added no-cache server |
| Chapter 1 | Scripted playthrough with real key presses and clicks | Debug helpers needed async micro-task yielding; fading panels could catch clicks → `pointer-events:none` |
| Chapter 2 | Maze walk with held keys, collisions, all drops | Off-screen arrow drawn over Chef Sunny → fixed visibility test |
| Chapter 3 | Map/audit/chart/plan run | Double-click skipped a chart question → lock buttons; compass covered a building → moved |
| Final | Parts A–D, scoring, teacher marks | Hotspot labels hid the picture → offset + smaller picture |
| Whole game | Automated smoke test (49 checks) + console error capture | Portrait scale bug (Milo tiny) → fixed; resume Ch 3 cutscene after reload; demo-unlock stage fix |

Commits in this folder's git history record each milestone.
