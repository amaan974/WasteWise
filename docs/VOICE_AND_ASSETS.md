# Voices, audio and art — how they work and how to upgrade them

## Current voices (working now)
Every line is stored with an ID in `js/data/content.js` (`DATA.lines`), e.g. `'ch1.maple.02': ['maple', 'worried', 'Our rain tank is almost empty…']`. The player chooses the voice mode on the setup screen or in Esc → Sound & settings:

| Mode | What it does |
|---|---|
| **Read aloud** (default) | The browser's built-in speech synthesis. Each character gets a different voice where available, plus their own pitch and speed: **Milo** high and quick (energetic, child-friendly), **Maple** warm and clear (prefers an Australian voice such as "Karen"), **Sunny** brisk and upbeat, **Sprout** slower and gentle. Music quietens while someone speaks. |
| **Cartoon chatter** | Short synthesised syllable blips with a different pitch and timbre per character (works offline on any device). |
| **Text only** | No voices. |

Subtitles are always shown, mute stops sound immediately, the 🔁 button replays a line, and audio never blocks progress or affects marks.

## Upgrading to licensed recorded voices (e.g. ElevenLabs)
1. Get rights to use the voices (original voices only — **no imitation of Mickey Mouse or any real person**).
2. Generate one MP3 per line ID **outside the game** (never put an API key in browser code).
3. Put the files in `assets/voices/` and list them in `js/data/content.js`:
   ```js
   DATA.voiceClips = { 'intro.milo.01': 'intro.milo.01.mp3', 'ch1.maple.02': 'ch1.maple.02.mp3' };
   ```
4. That's all — `WW.audio.speak()` plays the clip when one exists and falls back to browser speech otherwise.
5. Add each file to `assets/ASSET_MANIFEST.csv` and the credits.

## Music and sound effects
Six original tunes (title, school, garden, canteen maze, lab, assessment) are written as note patterns in `js/core/audio.js` and played by a small Web Audio synthesiser. There are 23 synthesised sound effects (pickup, correct, gentle "wrong", door, drip, rain, methane bubble, fanfare, Milo's squeak…). No audio files are used.

## Art
All characters and the world are drawn in code (`js/art/*.js`) — consistent, scalable and original. Animation states: idle (breathing, blinking), walk/run in 4 directions, talk (mouth synced to typing or speech), wave, point, think, celebrate, carry, emotions (happy, excited, worried, sad, surprised, thinking, proud). To preview everything, open `tests/art-preview.html` (`?big=milo&freeze=1` or `?portraits=1`).
