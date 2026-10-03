# Chapter 2 — Waste Maze: implementable gameplay specification

## Purpose

Milo and Chef Sunny need help cleaning after lunch. The player **walks through a small school canteen maze**, collects 3–6 illustrated items, decides whether to *prevent/reuse* or *dispose*, and reaches appropriate collection stations under **Sunny School's explicitly stated fictional rules**. Navigation skill is not the same as waste-management understanding.

## Required flow

1. Enter Chapter 2 from the school hub; Chef Sunny gives a short narrated/text introduction.
2. Display a readable instruction card: arrows/WASD to move, onscreen arrows/tap for touch, collect an object then choose a correct destination; include the school collection rules.
3. Start in a simple maze with **at least two turns and one blocked path**. The player marker walks in real time and cannot cross walls.
4. Approach an item; show its name and visual. Collect with E/space or tap, with a usable touch alternative.
5. Carry one item at a time to a station. Offer an explicit *reuse/prevention* choice when appropriate.
6. When reaching a station, provide feedback: "That works because ..." or "Try again: ...", followed by a retry that does not punish or shame the student.
7. Update an educational accuracy counter independently of movement time; allow recovery.
8. On completion show a short consequence animation (school waste meter / canteen cleared) and explain the difference between preventing and sorting waste.
9. Return to the chapter-complete flow without losing progress.

## Example school rules (fictional; prominently labelled)

- Organics station: fruit and vegetable scraps (Sunny School has this compost collection).
- Recycling station: clean paper, empty aluminium cans.
- General waste station: mixed-material snack wrappers not accepted by this fictional school.
- Reuse/prevention: refillable drink bottle, reusable lunch container; use as an early decision or fourth station, not "recycle everything".
- Safety: never tell a child to handle sharp or unknown real waste.

## Sample small maze layout (design-only; convert to tile data)

`#` = wall, `.` = floor, `S` = player start, `F` = fruit scrap, `P` = clean paper, `W` = wrapper, `O` = organics, `R` = recycling, `G` = general waste.

```
###############
#S..#....F....#
#.#.#.#####.#.#
#.#...#...#.#.#
#P#####.#.#.#.#
#.......#...#.#
#.###########.#
#..W.....O.R.G#
###############
```

The above is a **conceptual map**; its accessibility/connectivity and suitability must be validated in-game before use. Make the actual implementation's stations accessible without deadlocks.

## Design acceptance criteria

- A child can start, walk and finish the maze using documented controls.
- At least one navigable corner and an obstacle prevent it from being ordinary bin-button sorting.
- Collision with walls works. Player never spawns inside a wall.
- Items and stations have a name, colour **and text/icon cue**; never rely on colour alone.
- Wrong decisions do not silently score as correct; retry and explanation are offered.
- Players can finish without a countdown; no speed-based marks.
- A real example of *waste prevention* is present.
- Progress from Chapter 2 unlocks Chapter 3 and persists after refresh.
- Keyboard and touch controls work; sound-off does not remove essential instruction.
- All sorting choices are accurate for **this stated school scenario** and any local dependencies are explained.

## Implementation guidance

Prefer adding a small canvas / DOM grid module to existing `game.js` rather than migrating the whole game engine during the hackathon. If a Phaser migration becomes justified, document why and test all existing navigation, voice, progress and assessment functions after migration. Track maze state independently from `state.sorted` if old sorting remains as fallback.
