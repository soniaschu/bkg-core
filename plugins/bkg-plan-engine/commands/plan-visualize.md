---
description: Generate BKG plan visualizations (DAG, Gantt, Kanban, Timeline)
subtask: true
---
Visualize a BKG plan.

Type and plan id: $ARGUMENTS (types: dag|gantt|kanban|timeline|all, default dag)

1. Parse requested type (and optional plan id) from the arguments.
2. Call `bkg_plan_visualize` with that `type`.
3. Render the node/edge data:
   - dag → mermaid `graph TD`
   - gantt → mermaid `gantt` chart
   - kanban → markdown table grouped by task status
   - timeline → ordered markdown list by phase order
