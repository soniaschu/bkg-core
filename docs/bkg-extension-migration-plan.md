# BKG Extension Migration Plan

**Source Projects**: 
- Plannotator (https://github.com/backnotprop/plannotator)
- Superpowers (https://github.com/obra/superpowers)

**Target Architecture**: BKG Extension System
**Date**: 2026-08-06

---

## 1. Target Architecture

```
bkg-extensions/
├── bkg-plan-engine              # From Plannotator
│   ├── @bkg/plan-engine-core
│   ├── @bkg/plan-engine-shared
│   ├── @bkg/plan-engine-server
│   ├── @bkg/plan-engine-ui
│   ├── @bkg/plan-engine-editor
│   ├── @bkg/plan-engine-review-editor
│   ├── @bkg/plan-engine-plan-model
│   ├── @bkg/plan-engine-dependency-engine
│   ├── @bkg/plan-engine-task-engine
│   ├── @bkg/plan-engine-workflow-state
│   ├── @bkg/plan-engine-agent-runtime
│   ├── @bkg/plan-engine-skill-registry
│   ├── @bkg/plan-engine-event-bus
│   ├── @bkg/plan-engine-approval-gate
│   ├── apps/opencode            # OpenCode plugin (zenobi-us template)
│   └── apps/cli                 # bkg-plan-engine CLI
│
├── bkg-agent-superpowers        # From Superpowers
│   ├── bkg-skills/
│   │   ├── meta/
│   │   │   ├── using-bkg-skills
│   │   │   └── writing-skills
│   │   ├── planning/
│   │   │   ├── brainstorming
│   │   │   ├── writing-plans
│   │   │   └── goal-decomposition
│   │   ├── analysis/
│   │   │   ├── repository-analysis
│   │   │   ├── dependency-analysis
│   │   │   └── architecture-analysis
│   │   ├── implementation/
│   │   │   ├── test-driven-development
│   │   │   ├── subagent-driven-development
│   │   │   └── dispatching-parallel-agents
│   │   ├── review/
│   │   │   ├── requesting-code-review
│   │   │   ├── receiving-code-review
│   │   │   └── systematic-debugging
│   │   ├── testing/
│   │   │   ├── verification-before-completion
│   │   │   └── test-skill-creation
│   │   ├── debugging/
│   │   │   └── systematic-debugging
│   │   ├── deployment/
│   │   │   ├── executing-plans
│   │   │   └── finishing-branch
│   │   └── workspace/
│   │       └── using-git-worktrees
│   ├── apps/opencode            # OpenCode plugin (skill loader)
│   └── apps/cli                 # bkg-skills CLI
│
└── bkg-goal-orchestrator        # New - bridges both
    ├── @bkg/goal-builder        # Goal creation & management
    ├── @bkg/goal-orchestrator   # Team composition & execution
    ├── apps/opencode            # OpenCode plugin (commands)
    └── apps/cli                 # bkg-goal CLI
```

---

## 2. Migration Phases

### Phase 0: Foundation (Week 1) ✅ COMPLETED
- [x] Create analysis documents
  - [x] `docs/plannotator-analysis.md`
  - [x] `docs/superpowers-analysis.md`
- [x] Create migration plan (this document)
- [ ] Initialize BKG monorepo structure

### Phase 1: BKG Monorepo Setup (Week 1-2)
- [ ] Initialize monorepo with `zenobi-us/bun-module` template
- [ ] Configure workspaces: `packages/*`, `apps/*`
- [ ] Set up CI/CD (GitHub Actions + release-please)
- [ ] Configure Biome, TypeScript, testing
- [ ] Create shared tooling configs

### Phase 2: Plannotator Core Extraction (Week 2-6)
| Week | Package | Target | Notes |
|------|---------|--------|-------|
| 2 | `packages/core` | `@bkg/plan-engine-core` | Types, goal-setup, agents |
| 2-3 | `packages/shared` | `@bkg/plan-engine-shared` | Config, VCS, PR, diff |
| 3-4 | `packages/server` | `@bkg/plan-engine-server` | Annotate, review, sessions, AI |
| 4 | `packages/ui` | `@bkg/plan-engine-ui` | React components, themes, vim |
| 4-5 | `packages/editor` | `@bkg/plan-engine-editor` | Editable documents |
| 5 | `packages/review-editor` | `@bkg/plan-engine-review-editor` | Diff viewer, dock layout |
| 5-6 | NEW | `@bkg/plan-engine-plan-model` | Goal, Phase, Task, Dependency, Agent, Skill |
| 5-6 | NEW | `@bkg/plan-engine-dependency-engine` | DAG, critical path, topological sort |
| 5-6 | NEW | `@bkg/plan-engine-task-engine` | Task lifecycle, assignment, progress |
| 5-6 | NEW | `@bkg/plan-engine-workflow-state` | Execution state machine |
| 5-6 | NEW | `@bkg/plan-engine-agent-runtime` | OpenCode team API integration |
| 5-6 | NEW | `@bkg/plan-engine-skill-registry` | Dynamic skill discovery |
| 5-6 | NEW | `@bkg/plan-engine-event-bus` | Event sourcing |
| 5-6 | NEW | `@bkg/plan-engine-approval-gate` | User approval workflow |

### Phase 3: Superpowers Skills Migration (Week 4-8)
| Week | Skill Group | Target | Notes |
|------|-------------|--------|-------|
| 4 | Meta | `using-bkg-skills`, `writing-skills` | Core enforcement |
| 4-5 | Planning | `brainstorming`, `writing-plans`, `goal-decomposition` | Design & planning |
| 5-6 | Quality | `test-driven-development`, `verification-before-completion`, `systematic-debugging` | TDD, evidence, debug |
| 6-7 | Execution | `subagent-driven-development`, `dispatching-parallel-agents`, `executing-plans` | Parallel agents |
| 7 | Review/Workflow | `requesting-code-review`, `receiving-code-review`, `finishing-branch` | Review & completion |
| 7 | Workspace | `using-git-worktrees` | Isolation |
| 7-8 | NEW Analysis | `repository-analysis`, `dependency-analysis`, `architecture-analysis` | BKG-specific |
| 8 | Skill Registry | Dynamic assignment system | For goal-orchestrator |

### Phase 4: Goal Orchestrator Development (Week 6-10)
| Week | Component | Notes |
|------|-----------|-------|
| 6-7 | `@bkg/goal-builder` | Goal CRUD, analysis engine, templates, validation |
| 7-8 | `@bkg/goal-orchestrator` | Team composition, skill matching, plan generation |
| 8-9 | OpenCode Plugin | Commands: `/goal`, `/orchestrate` |
| 9-10 | Integration | Connect to plan-engine & skills |

### Phase 5: OpenCode Plugins (Week 8-12)
| Plugin | Template | Commands |
|--------|----------|----------|
| `bkg-plan-engine` | zenobi-us/opencode-plugin-template | `/plan`, `/plan-review` |
| `bkg-agent-superpowers` | zenobi-us/opencode-plugin-template | Skill auto-loading |
| `bkg-goal-orchestrator` | zenobi-us/opencode-plugin-template | `/goal`, `/orchestrate` |

### Phase 6: Integration & Testing (Week 10-14)
- [ ] End-to-end integration tests
- [ ] Real project testing
- [ ] Performance benchmarks
- [ ] Documentation completion
- [ ] Release preparation

---

## 3. Rebranding Checklist

### Plannotator → BKG Plan Engine
| Old | New |
|-----|-----|
| `@plannotator/*` | `@bkg/plan-engine-*` |
| `plannotator` binary | `bkg-plan-engine` |
| `~/.plannotator` | `~/.bkg/plan-engine` |
| `PLANNOTATOR_*` env | `BKG_PLAN_ENGINE_*` |
| "Plannotator" UI | "BKG Plan Engine" |
| plannotator.ai | bkg.dev/plan-engine |

### Superpowers → BKG Agent Superpowers
| Old | New |
|-----|-----|
| `superpowers` | `bkg-skills` |
| `using-superpowers` | `using-bkg-skills` |
| Skill namespace | `bkg-skills/*` |
| Plugin | `bkg-agent-superpowers` |
| Install path | `~/.config/opencode/skills/bkg-skills/` |

---

## 4. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo Tool | Bun Workspaces | Native to both source projects |
| Build | `bun build` | Fast, native TypeScript |
| Testing | `bun test` + happy-dom | Consistent with sources |
| Linting | Biome | Fast, used in Plannotator |
| Release | release-please + conventional commits | Automated, used in Plannotator |
| OpenCode Plugin | zenobi-us/opencode-plugin-template | Official template |
| Skill Format | SKILL.md + metadata.yaml + capabilities.yaml | Structured, discoverable |
| Plan Storage | File-based (`.goals/`) | Local-first, git-friendly |
| Real-time | Server-Sent Events | Simple, no WebSocket complexity |

---

## 5. Integration Points

### Goal Builder → Plan Engine
```
Goal Analysis → Required Capabilities → Plan Model → Visualization
```

### Goal Orchestrator → Skill Registry
```
Goal Analysis → Capabilities → Skill Matching → Agent Specs → Team Spawn
```

### Plan Engine → OpenCode Teams
```
Plan Tasks → Agent Specs → team_create → team_spawn → team_tasks_add
```

### Skills → Agent Runtime
```
Agent Prompt → Required Skills → Skill Loader → OpenCode Agent
```

---

## 6. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API breaking changes in OpenCode | Medium | High | Pin OpenCode SDK version, abstraction layer |
| Skill discovery complexity | Medium | Medium | Build registry with clear contracts |
| Performance of large plans | Low | Medium | Virtualized rendering, pagination |
| Migration scope creep | High | High | Strict phase gates, YAGNI |
| Test coverage gaps | Medium | Medium | Port tests with each package |

---

## 7. Success Criteria

### Phase 1-2 (Core)
- [ ] All Plannotator core packages extracted and building
- [ ] New BKG packages created and tested
- [ ] Monorepo CI/CD passing

### Phase 3 (Skills)
- [ ] All 15 Superpowers skills migrated to `bkg-skills/`
- [ ] 3 new BKG-specific analysis skills created
- [ ] Skill registry functional
- [ ] Pressure tests passing

### Phase 4 (Goal Orchestrator)
- [ ] `/goal make` creates valid goals with analysis
- [ ] `/orchestrate` composes teams, generates plans
- [ ] Plan visualization in BKG Plan Engine
- [ ] Approval gate functional

### Phase 5 (Plugins)
- [ ] All 3 OpenCode plugins installable
- [ ] Commands registered and working
- [ ] Skills auto-loaded

### Phase 6 (Integration)
- [ ] Full workflow: `/goal make` → `/orchestrate` → execution
- [ ] Live progress in Plan Engine
- [ ] Documentation complete
- [ ] Release ready

---

## 8. Resource Requirements

| Role | Weeks | Notes |
|------|-------|-------|
| Lead Architect | 14 | Overall coordination |
| TypeScript Engineer | 14 | Core packages, plugins |
| React/UI Engineer | 8 | Plan Engine UI, visualizations |
| DevOps/Release | 4 | CI/CD, publishing |
| Technical Writer | 4 | Documentation |

---

## 9. Next Immediate Actions

1. **Initialize BKG monorepo** in `/opt/stacks/bkg-oc-plugin/`
2. **Create package.json** with workspaces config
3. **Set up first package**: `@bkg/plan-engine-core` (from Plannotator `packages/core`)
4. **Set up first skill**: `using-bkg-skills` (from Superpowers `using-superpowers`)
5. **Configure CI/CD** pipeline

---

## 10. File Structure Target

```
/opt/stacks/bkg-oc-plugin/
├── package.json                    # Monorepo root
├── tsconfig.json                   # Base TS config
├── mise.toml                       # Task runner
├── biome.json                      # Linter config
├── .github/workflows/              # CI/CD
├── docs/
│   ├── plannotator-analysis.md
│   ├── superpowers-analysis.md
│   └── bkg-extension-migration-plan.md
├── packages/
│   ├── plan-engine-core/
│   ├── plan-engine-shared/
│   ├── plan-engine-server/
│   ├── plan-engine-ui/
│   ├── plan-engine-editor/
│   ├── plan-engine-review-editor/
│   ├── plan-engine-plan-model/
│   ├── plan-engine-dependency-engine/
│   ├── plan-engine-task-engine/
│   ├── plan-engine-workflow-state/
│   ├── plan-engine-agent-runtime/
│   ├── plan-engine-skill-registry/
│   ├── plan-engine-event-bus/
│   ├── plan-engine-approval-gate/
│   ├── goal-builder/
│   └── goal-orchestrator/
├── apps/
│   ├── plan-engine-opencode/
│   ├── plan-engine-cli/
│   ├── superpowers-opencode/
│   ├── superpowers-cli/
│   ├── goal-orchestrator-opencode/
│   └── goal-orchestrator-cli/
└── bkg-skills/                     # Skill definitions (not packages)
    ├── meta/
    ├── planning/
    ├── analysis/
    ├── implementation/
    ├── review/
    ├── testing/
    ├── debugging/
    ├── deployment/
    └── workspace/
```