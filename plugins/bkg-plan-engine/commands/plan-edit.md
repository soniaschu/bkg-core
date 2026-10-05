---
description: Edit BKG plan structure (tasks, phases, dependencies, agents)
subtask: true
---
Edit a BKG plan's structure.

Edits: $ARGUMENTS

Recognized directives (apply each with `bkg_plan_edit`, colon notation):
- add-phase "title:description"
- add-task "phaseId:title:description"
- remove-task <taskId>
- add-dependency "fromTaskId:toTaskId[:type]"
- remove-dependency <dependencyId>
- assign-agent "taskId:agentId"
- set-status "taskId:pending|in_progress|done|blocked"

If no directive is given, call `bkg_plan_status` first and ask what to change.
After editing, confirm the resulting structure summary.
