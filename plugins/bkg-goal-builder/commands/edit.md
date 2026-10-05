---
description: Edit the active BKG goal (sections, status, title, analysis tasks)
subtask: true
---
Edit the active BKG goal.

Edits: $ARGUMENTS

Recognized directives (apply via `bkg_goal_edit`, one call per edit):
- set section: `section <key> <text>` → args { section, content }
- set status: `status pending|ready|executing|completed` → args { status }
- rename: `title <new title>` → args { title }
- add analysis: `add-analysis type target question` → args { add_analysis: "type:target:question" }
- complete analysis: `complete-analysis <taskId> [result]` → args { complete_analysis, analysis_result }

If no directive is given, call `bkg_goal_status` first and ask what to change.
After editing, report version, progress %, and the applied operations.
