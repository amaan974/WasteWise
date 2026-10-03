# WasteWise — engineering handoff and build priority

> **Status update (3 Oct 2026):** all P0 items are implemented in this folder (Milo, a real waste maze, consequences + explanations, full start→results flow, muted/keyboard/touch play) and verified by `tests/run-tests.js` and `tests/smoke.html`. Still to do: deploy + record the demo video (P0 #7), licensed recorded voices (P1), and classroom testing. See `docs/TEST_REPORT.md`.

**Do not start from zero.** The existing bundle has a single-page `index.html` loading `styles.css` and `game.js`, containing a navigable school, three chapter activities and an assessment. It is plain browser JS, not yet React/Phaser. The current guide character is **Pip**; final ideation calls for **Milo the Eco Mouse**. There is sorting UI, but not a true navigable waste *maze*. Speech currently uses browser speech synthesis rather than stored recordings. These are known design/implementation differences, not defects proven in a runtime test.

## P0 — finish for an honest demonstration

1. Preserve playable existing baseline: backup or commit first; record how to launch it.
2. Convert mascot references from Pip to **Milo**, preserving working dialogue and reading support; use original expressive art, never a Disney likeness.
3. Build one real **Waste Maze** inside Chapter 2; see `WASTE_MAZE_SPEC.md`.
4. Make wrong and correct sorting choices show an immediate environmental consequence **and a short explanation**; preserve waste *prevention* choices.
5. Verify start → world → Chapter 1 → Chapter 2/maze → Chapter 3 → final assessment → result works; repair blockers before expanding.
6. Verify muted play, readable captions, keyboard and touch alternatives.
7. Deploy a stable version and capture a real gameplay demo of 2 minutes or less.

## P1 — only when P0 passes

- Replace placeholders with original character/school art if already available.
- Use the original 4-character voice cast with licensed pre-rendered audio if supplied; always retain text/subtitles and fallback.
- Extend in-world triggers and visible state changes; do not replace them with extra quizzes.
- Improve the final geography assessment using verified learning goals.

## P2 — after the deadline only

- Large explorable map, new minigames, full branching cutscenes, complex analytics, accounts, leaderboard, student-identifying data.

## Deliverables per change

For each feature, Claude must return: what changed; files edited; how to play it; test commands actually run + output; what remains broken or untested. `python tools/check_inputs.py` validates content files only. It is **not** evidence that the game works.

## Go/no-go checkpoint

If adding the maze destabilises the existing three-chapter loop near submission time, use a smaller but fully functional maze with 3 waste items, no complex enemies, no timers, and restore the existing sorting mechanic as a fallback. Reliability and visible learning matter more than map size.
