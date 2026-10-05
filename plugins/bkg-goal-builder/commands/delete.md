---
description: Permanently delete an archived BKG goal
subtask: true
---
Permanently delete an archived BKG goal. This cannot be undone.

Arguments: $ARGUMENTS

1. If no archive id was given, call `bkg_goal_list` with `type: archived` and ask the user to pick one.
2. Show the selected entry and require explicit user confirmation.
3. Only after confirmation call `bkg_goal_delete` with `archive_id` and `force: true`.
4. Never delete without explicit confirmation.
