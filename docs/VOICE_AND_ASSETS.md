# Original characters, audio and animation handoff

## Cast and voices

- `milo`: original Eco Mouse mascot, animated and playful, youthful energy without copying any famous character's signature voice. No Disney or Mickey Mouse imitation.
- `maple`: Principal Maple, calm Australian adult voice, clear and warm.
- `sunny`: Chef Sunny, upbeat comical adult, comfortable pacing.
- `sprout`: Professor Sprout, curious, reassuring and slower for explanations.

Use **one voice ID per character** only if ElevenLabs generation is authorised and configured. Prefer pre-rendered clips generated outside the public client and stored in `assets/voices/`. Do not commit API credentials; do not attempt to manufacture audio that does not exist.

Every line must have:
- text subtitle (source of truth), speaker name, audio reference (optional), language (en-AU preferred), and a replay affordance;
- `talk/idle` animation state or simple mouth cycle while audio is playing;
- a fallback path when browser speech or clips are unavailable;
- a mute control that stops sound immediately.

Use `content/CHARACTER_DIALOGUE.json` as proposed sample line IDs and text; the app must explicitly load/parse it if desired. Filename suggestions in `assets/ASSET_MANIFEST.csv` are placeholders, not actual generated assets.

## Animation priority

**Must:** Player walk/idle; Milo idle/bounce; character interaction cue; item picked up; correct/wrong sorting feedback; one school state change.

**Nice to have:** Run, celebration, talking mouth loop, transition wipe, trees swaying.

**Not needed:** full facial rig, 3D, complex cutscenes, reactive soundtrack, live generated voices.

## Privacy and legal

No real names required. No student voice collection or microphone needed. Use original/licensed graphics, voices and sounds. Maintain the asset ledger with author/source/licence/generation date, and disclose all AI generation in the hackathon submission.
