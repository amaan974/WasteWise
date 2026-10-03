# WasteWise — persistent Claude Code instructions

## Read first, in this order
1. `MASTER_PROMPT.md` — the consolidated product requirements, architecture, educational goals and execution protocol.
2. `FINAL_IDEATION.md` — newest decisions, which supersede older brainstorming.
3. `index.html`, `styles.css`, `game.js`, `README.md` — the actual working baseline. Do not assume it is a React/Phaser project yet.
4. `references/CLIMATE_HACKTION_SOURCE_NOTES.md` and both PDFs for official source requirements.
5. `TEACHER_GUIDE.md`, `VOICE_CAST.md`; consult `history/*.txt` only to understand previous alternative ideas.

## Priority of truth
Official source PDFs for event rules and curriculum references > most recent user-approved decisions in FINAL_IDEATION.md > MASTER_PROMPT.md > existing code for *actual* implemented behaviour > historical chat notes. If these conflict, explicitly report the conflict; do not silently claim they are equivalent.

## Team workflow
There is **one developer** running Claude Code. The other team members share the ChatGPT Climate Hacktion project for discussion; do not assume Claude Code has live access to ChatGPT project conversations. This folder is a portable snapshot of available project context. Keep future updates in these Markdown files or the repository.

## Rules for editing
- Inspect project contents and run a smoke check before rewriting or replacing the prototype.
- Keep working features unless a tested refactor is necessary.
- Build the smallest stable and demonstrable vertical slice before expanding the three chapters.
- Provide real game controls, meaningful choices, immediate feedback and assessment; no fake UI-only buttons.
- No Disney/Mickey Mouse artwork, voice clones, signature catchphrases or imitative character performance. Use the original Milo the Eco Mouse mascot and original cheerful narration.
- No real student names, unnecessary accounts or exposed API keys. Narration requires subtitles and mute/fallback controls.
- Cite curriculum and climate facts in documentation; don't invent code mappings, test results or measured climate impact.
- Keep existing HTML/CSS/JS baseline playable while improving; choose framework migration only if justified by time and testing.
- Never report tests as passed unless actually executed.
- For each change, run available checks and clearly explain what is implemented, what remains, and evidence of tests.

## First instruction to execute
Read `MASTER_PROMPT.md`, `FINAL_IDEATION.md` and the current codebase; produce a brief gap analysis and implement the single highest-value missing working feature. Continue in a test/fix loop.
