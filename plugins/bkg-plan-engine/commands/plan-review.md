---
description: Open a BKG plan in the visual review interface
subtask: true
---
Open a BKG plan in the visual review interface.

Plan id (optional): $ARGUMENTS

1. Resolve the target plan: use the given id or fall back to `bkg_plan_show` for the active plan.
2. Call `bkg_plan_visualize` with `type: all` to generate visualization data.
3. Present the DAG structure as a mermaid graph (phases → tasks with dependencies) plus per-task status.
4. Ask the user for review feedback; apply accepted changes with `bkg_plan_edit`.
