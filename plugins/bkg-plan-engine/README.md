# BKG Plan Engine OpenCode Plugin

This plugin provides integration between the BKG Plan Engine and OpenCode.

## Features

- Plan creation and management (`/bkg-plan create`, `/bkg-plan list`, etc.)
- Plan review and visualization (`/bkg-plan-review`, `/bkg-plan-visualize`)
- Plan editing (`/bkg-plan-edit`)
- Plan status monitoring (`/bkg-plan-status`)
- Plan mode integration (automatically opens when a plan is ready for review)

## Commands

- `/bkg-plan` - Plan management subcommands
- `/bkg-plan-review` - Open plan in visual review interface
- `/bkg-plan-visualize` - Generate plan visualizations (DAG, Gantt, Kanban, Timeline)
- `/bkg-plan-edit` - Edit plan structure
- `/bkg-plan-status` - Show plan status and progress

## Integration

This plugin works with the BKG Goal Builder and Goal Orchestrator plugins to provide a complete goal-driven development workflow.