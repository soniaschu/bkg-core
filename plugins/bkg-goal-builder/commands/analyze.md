---
description: Trigger re-analysis for BKG goal sections
subtask: true
---
Re-run project analysis for BKG goal sections marked as requiring analysis.

Section filter: $ARGUMENTS

1. Call `bkg_goal_analyze`, passing the section name if one was given.
2. Report which sections were analyzed and what changed in the goal document.
