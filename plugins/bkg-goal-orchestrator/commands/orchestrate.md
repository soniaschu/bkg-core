---
description: Orchestrate BKG goal execution: team composition, planning, visualization, approval, execution
subtask: true
---
Orchestrate execution of the active BKG goal.

Flags: $ARGUMENTS (supported: --replan --reteam --reanalyze --dry-run --visualize-only --output=summary|full|json)

Workflow:
1. Call `bkg_goal_status` to confirm there is an active goal. If none exists, stop and suggest `/bkg-goal-make`.
2. Call `bkg_orchestrate` with the parsed flags. WITHOUT an explicit execution approval from the user always pass `dry_run: true`.
3. Present the composed agent team, the generated plan phases/tasks/dependencies, and visualization highlights.
4. Ask the user to approve. Only after explicit approval run `bkg_orchestrate` again without `dry_run` to execute.
