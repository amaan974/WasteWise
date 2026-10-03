#!/usr/bin/env python3
"""Check project file integrity (files present, JSON drafts parse, assessment marks add up).
DOES NOT test the actual game: run `node tests/run-tests.js` and tests/smoke.html for that."""
import csv
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
required = [
    "CLAUDE.md", "MASTER_PROMPT.md", "FINAL_IDEATION.md", "README.md",
    "index.html", "css/style.css", "js/main.js", "js/data/content.js", "js/data/assessment.js",
    "tests/run-tests.js", "tests/smoke.html",
    "docs/BUILD_PRIORITY.md", "docs/WASTE_MAZE_SPEC.md",
    "docs/CURRICULUM_ALIGNMENT_MATRIX.md", "docs/VOICE_AND_ASSETS.md",
    "docs/QA_AND_TEST_PLAN.md", "docs/HACKATHON_SUBMISSION.md",
    "content/CHARACTER_DIALOGUE.json", "content/FINAL_ASSESSMENT.json",
    "assets/ASSET_MANIFEST.csv",
]
errors = []
for rel in required:
    if not (root / rel).is_file():
        errors.append(f"Missing: {rel}")

for rel in ["content/CHARACTER_DIALOGUE.json", "content/FINAL_ASSESSMENT.json"]:
    p = root / rel
    if p.is_file():
        try:
            with p.open(encoding="utf-8") as f:
                json.load(f)
        except (ValueError, UnicodeError) as e:
            errors.append(f"Cannot parse JSON {rel}: {e}")

p = root / "content/FINAL_ASSESSMENT.json"
if p.is_file():
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        points = 0
        for section in data["sections"]:
            if "questions" in section:
                this = sum(q["marks"] for q in section["questions"])
                if this != section["max_marks"]:
                    errors.append(f"Incorrect marks for {section['id']}: {this}")
                for q in section["questions"]:
                    if not 0 <= q["correct_option"] < len(q["options"]):
                        errors.append(f"Invalid correct_option in {q['id']}")
            else:
                this = sum(r["marks"] for r in section.get("rubric", []))
                if this != section["max_marks"]:
                    errors.append(f"Incorrect teacher rubric marks for {section['id']}: {this}")
            points += section["max_marks"]
        if points != data["total_marks"]:
            errors.append(f"Total marks {points} != {data['total_marks']}")
        else:
            print(f"Assessment sections add to {points} marks.")
    except (KeyError, TypeError, ValueError) as e:
        errors.append(f"Invalid assessment structure: {e}")

p = root / "assets/ASSET_MANIFEST.csv"
if p.is_file():
    with p.open(encoding="utf-8", newline="") as f:
        entries = list(csv.DictReader(f))
    if not entries:
        errors.append("Asset manifest has no rows")
    print(f"Asset manifest has {len(entries)} planned assets (not supplied).")

if errors:
    print("CHECKS FAILED:")
    print("\n".join(" - " + e for e in errors))
    if all(x.startswith("Missing: ") and x.partition(": ")[2] in ["CLAUDE.md","MASTER_PROMPT.md","FINAL_IDEATION.md","index.html","css/style.css","js/main.js"] for x in errors):
        print("TIP: This is the add-on folder alone. Copy docs/, content/, assets/, tools/ into the EXISTING bundle project root, then rerun.")
    sys.exit(1)
print("Supplementary file and assessment integrity: PASS. Gameplay not tested.")
