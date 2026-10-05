---
description: Alias of /bkg-orchestrate under the /goal namespace
subtask: true
---
Orchestrate execution of the active BKG goal (same pipeline as /bkg-orchestrate).

Flags: $ARGUMENTS (supported: --replan --reteam --reanalyze --dry-run --visualize-only --output=summary|full|json)

Workflow:
1. Confirm an active goal exists via `bkg_goal_status`.
2. Run `bkg_goal_orchestrate` with parsed flags; use `dry_run: true` unless the user explicitly approved execution.
3. Present team, plan, and visualization results, then ask for approval before executing.
