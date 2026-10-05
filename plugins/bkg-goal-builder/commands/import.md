---
description: Import a BKG goal from a file with validation
subtask: true
---
Import a BKG goal from a file.

File path: $ARGUMENTS

1. Require a file path; if missing, ask for one.
2. Call `bkg_goal_import` with `file` set to the path.
3. On validation failure show every error; import with `force: true` only if the user explicitly confirms.
