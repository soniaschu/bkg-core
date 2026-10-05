---
description: Validate the active BKG goal against its rules
subtask: true
---
Validate the currently active BKG goal.

1. Call the `bkg_goal_check` tool (pass `verbose: true`).
2. Report every validation error and warning clearly.
3. If there are errors and the user passed "fix" in: $ARGUMENTS, call the tool again with `fix: true`.
