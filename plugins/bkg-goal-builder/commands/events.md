---
description: Show the structured event log for BKG goals
subtask: true
---
Show the BKG goal event log.

Filter expression: $ARGUMENTS

1. Call `bkg_goal_events`. Apply an optional event-name filter or "stats" request from the arguments.
2. Present events as a table (timestamp, event, goal, summary) or aggregate statistics.
