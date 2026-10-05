---
description: BKG plan management (create, list, show, delete)
subtask: true
---
Manage BKG plans.

Subcommand and arguments: $ARGUMENTS

Supported subcommands:
- `create <goal>`: call `bkg_plan_create` with the goal text
- `list`: call `bkg_plan_list`
- `show [id]`: call `bkg_plan_show` with optional plan id
- `delete <id>`: call `bkg_plan_delete` (confirm with the user first)

If no subcommand is given, default to `list` and show the active plan via `bkg_plan_show`.
