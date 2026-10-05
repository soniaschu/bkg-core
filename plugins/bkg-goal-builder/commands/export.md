---
description: Export the active BKG goal as Markdown, JSON, or YAML
subtask: true
---
Export the active BKG goal.

Format and optional path: $ARGUMENTS

1. Parse the requested format (markdown|json|yaml, default markdown) and optional output path from the arguments.
2. Call `bkg_goal_export` with `format` and, if given, `output`.
3. If no output path was given, print the exported document in a code block.
