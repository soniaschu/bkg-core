---
description: Create a new BKG goal from a natural language description
subtask: true
---
Create a new BKG goal from the user's description.

Description: $ARGUMENTS

Steps:
1. Call the `bkg_goal_make` tool with `description` set to the full text above.
2. Inspect the returned goal structure and project analysis.
3. Report: detected template, goal id/title, section list, and any auto-generated analysis tasks that need follow-up.
