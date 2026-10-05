---
description: Start a visible three-specialist BKG debate with votes and consensus.
subtask: true
---
Start a visible BKG problem/feature/planning debate.

Topic: $ARGUMENTS

Rules:
- Three independent positions (builder, reviewer, product/architect), each with evidence and rationale.
- Record every vote via the `bkg_vote` tool (topic, agent, vote, reason).
- Consensus requires at least 2 of 3 matching approvals; otherwise mark arbiter-required and summarize dissent.
- Persist transcript under `docs/debat/` and reference it in `.brain` decisions.
- Web research allowed via `bkg_research`; record sources.
