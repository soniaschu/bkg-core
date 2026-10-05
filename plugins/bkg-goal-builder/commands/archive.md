---
description: Archive the active BKG goal
subtask: true
---
Archive the active BKG goal.

1. Call the `bkg_goal_status` tool first and confirm with the user which goal will be archived.
2. Call `bkg_goal_archive`. Pass `force: true` only if the user explicitly asked to skip validation in: $ARGUMENTS
3. Confirm archiving and mention how to restore (`/bkg-goal-activate`).
