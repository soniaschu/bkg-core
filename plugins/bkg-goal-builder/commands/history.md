---
description: Show BKG goal version history with diffs
subtask: true
---
Show the version history of the active BKG goal.

Arguments: $ARGUMENTS

1. Call `bkg_goal_history`. If a version number is given, pass it via `version`; if the user asked for diffs, set `diff: true`.
2. Present each version with timestamp and change summary; render requested diffs as unified diff blocks.
