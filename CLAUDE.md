# WasteWise — persistent Claude Code instructions (game folder)

## What this folder is
The **current** WasteWise game, rebuilt from scratch on 3 Oct 2026 in plain HTML/CSS/JS (no build step). The original prototype in `../WasteWise_Claude_Code_Bundle/` is reference only — do not edit it.

## Read first
1. `README.md` — features, controls, status, structure.
2. `MASTER_PROMPT.md`, `FINAL_IDEATION.md` — product requirements (FINAL_IDEATION wins on conflicts; official PDFs in `references/` win over both).
3. `docs/IMPLEMENTATION_LOG.md`, `docs/TEST_REPORT.md` — what was built and tested, and known gaps.

## Architecture (load order = `index.html` script order)
`js/core` (util, input, audio, save, engine) → `js/art` (draw, characters, items, world) → `js/logic` (maze, scoring — pure, Node-testable) → `js/data` (content lines, assessment bank, maps) → `js/world` (tilemap/collision/A*, entities, fx, worldscene factory) → `js/ui` (HUD, dialogue, panels, menus) → `js/story` (script helpers, story manager, ch1, ch2 [canteen + maze scenes], ch3 [lab scene], final [final + results scenes]) → `js/scenes` (title/setup, hub) → `js/main.js`.
- Global namespace `window.WW`. Scenes register with `WW.engine.register(name, scene)`; walkable scenes come from `WW.makeWorldScene(cfg)`.
- Story scripts are async: `await S.line('id')`, `await S.askLine(id, choices)`, `await S.panel({...})`.
- All dialogue lives in `WW.data.lines` with IDs (the voice clip hook is `WW.data.voiceClips`).
- Saved state: `WW.save.data` (chapter stages, world state that drives visuals, stats); settings are saved separately.

## Rules
- Keep it playable offline from `index.html`; no ES modules, no fetch, no secrets.
- Original art and audio only; no Disney/Mickey likeness, voice or catchphrases.
- Fictional school data and rules must stay labelled; never auto-award the 6 teacher marks.
- After every change: `node --check` on changed files, `node tests/run-tests.js`, then run `tests/smoke.html` (served by `python3 tools/serve.py`) and expect all checks to pass with no JS errors. Report honestly what was and wasn't tested.
