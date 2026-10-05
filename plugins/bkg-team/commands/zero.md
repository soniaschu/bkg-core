---
description: Initialize and audit a project (repo, git, docs, build/test, Brain, security)
subtask: true
---
Initialize and audit the current project (BKG Zero).

Scope: $ARGUMENTS

Workflow:
1. Call `bkg_supervisor` to inventory agents/tools/skills/rules in this project.
2. Call `bkg_git` with action `status` for the git state.
3. Use the `bkg-zero` skill checklist: docs inventory, build/test detection, `.brain/*` via `bkg_brain` (read project/tasks/blockers), security boundaries.
4. Report an audit table: present ✓ / missing ✗ per area, each finding backed by real output.
5. Propose concrete follow-up tasks for every gap. Never invent project facts.
