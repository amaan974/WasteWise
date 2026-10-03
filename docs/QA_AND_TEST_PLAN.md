# QA plan — what must be checked in a real browser

This checklist describes tests to RUN. It is **not a report that any tests already passed**.

## Environment

Open the app from a local HTTP server or known-good hosted URL. Example: in the project root, `python -m http.server 8000` and open `http://localhost:8000`. If using a build system, follow that project's README instead.

## Smoke-test scenarios

- [ ] Home loads with no console error; "New Adventure" works.
- [ ] Optional nickname can be skipped; no student ID needed.
- [ ] Keyboard controls move in the school; tap/touch alternate controls work.
- [ ] Character cannot leave playable area; a wall in the maze blocks movement.
- [ ] Chapter 2 remains locked until Chapter 1 is completed.
- [ ] Chapter 1 tasks can be completed and provide explanatory feedback.
- [ ] Chapter 2 Waste Maze is truly navigable; collect at least one item and sort it.
- [ ] Incorrect bin yields an explanation and a recovery path.
- [ ] Waste prevention/reuse choice is present, not just selecting a bin.
- [ ] Chapter 3 evidence points and chart tasks work; fictional nature is clear.
- [ ] Final assessment is untimed; deterministic subtotal is correct.
- [ ] Teacher-marked justification is flagged pending review, not automatically awarded full marks.
- [ ] A new game and a resume operation behave as described.
- [ ] Reload preserves appropriate non-identifying chapter progress.
- [ ] Muting and missing voice clips do not block the game; subtitles remain visible.
- [ ] Keyboard focus remains visible, controls have readable text, reduced-motion is considered.
- [ ] Desktop and tablet layouts do not obscure critical buttons or instructions.
- [ ] The final deployment is accessible on another device or private browser window.

## Sample test evidence table

| Test | Actual result | Evidence | Owner/date |
| --- | --- | --- | --- |
| End-to-end gameplay | Not run | Link or screenshot needed | — |
| Maze keyboard + touch | Not run | Recording needed | — |
| Assessment marking | Not run | Expected/actual values needed | — |
| Voice muted / missing | Not run | Screenshot or browser log needed | — |

## Fast automated checks

- `python tools/check_inputs.py` — validates the supplementary JSON, CSV and folder layout only.
- `node --check game.js` — tests JavaScript **syntax**, not gameplay, if Node is installed.
- Playwright or manual live browser checks — essential to verify actual controls and flow.

If an automated test cannot run because a browser tool is unavailable, report the limitation explicitly and perform a manual browser walkthrough.
