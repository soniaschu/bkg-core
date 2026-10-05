---
description: Activate a BKG goal from archive or history
subtask: true
---
Activate a BKG goal from archive or history.

Target: $ARGUMENTS

1. If no target was given, call `bkg_goal_list` with `type: archived` and ask the user to pick one.
2. Call `bkg_goal_activate` with `source` set to the chosen archive entry id.
3. Report which goal is now active.
