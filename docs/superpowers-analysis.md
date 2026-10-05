# Superpowers Complete Architecture Analysis

**Source**: https://github.com/obra/superpowers  
**Version Analyzed**: 6.2.0  
**Analysis Date**: 2026-08-06

---

## 1. Repository Structure Overview

```
superpowers/
├── skills/                        # 15 core skills (the methodology)
│   ├── brainstorming/             # Design exploration before implementation
│   ├── using-superpowers/         # Meta-skill: invoke skills before any action
│   ├── writing-plans/             # Create implementation plans from specs
│   ├── writing-skills/            # TDD for skill creation
│   ├── systematic-debugging/      # Hypothesis-driven debugging
│   ├── test-driven-development/   # Red-Green-Refactor enforcement
│   ├── subagent-driven-development/ # Parallel agent execution
│   ├── dispatching-parallel-agents/ # Independent task parallelization
│   ├── executing-plans/           # Plan execution with checkpoints
│   ├── finishing-a-development-branch/ # Branch completion workflow
│   ├── requesting-code-review/    # Pre-merge review requests
│   ├── receiving-code-review/     # Handling review feedback rigorously
│   ├── verification-before-completion/ # Evidence before assertions
│   └── using-git-worktrees/       # Isolated workspaces
├── docs/                          # Documentation & specs
│   ├── superpowers/specs/         # Design documents
│   ├── superpowers/plans/         # Implementation plans
│   └── plans/                     # Legacy plans
├── hooks/                         # Agent hooks (Claude Code, Cursor)
├── tests/                         # Skill testing infrastructure
├── .pi/                           # Pi extension
├── .opencode/                     # OpenCode plugin
├── package.json                   # Bun workspace config
└── CLAUDE.md                      # Agent instructions
```

---

## 2. Skills Deep Dive

### 2.1 Core Process Skills (Execution Flow)

#### `using-superpowers` - Meta Skill
**Purpose**: Enforces skill invocation before ANY action
- **Trigger**: Start of any conversation/task
- **Rule**: "If you think there is even a 1% chance a skill might apply, you ABSOLUTELY MUST invoke the skill"
- **Priority**: Process skills first (brainstorming, systematic-debugging), then implementation skills
- **Red Flags**: 13 rationalizations that indicate skipping skills

#### `brainstorming` - Design Exploration
**Purpose**: Transform ideas into designs before implementation
- **Hard Gate**: NO implementation before design approval
- **9-Step Checklist**: Context → Visual companion → Questions → Approaches → Design → Spec → Self-review → User review → writing-plans
- **Visual Companion**: Browser-based mockups/diagrams (just-in-time)
- **Output**: `docs/superpowers/specs/YYYY-MM-DD-topic-design.md`

#### `writing-plans` - Implementation Planning
**Purpose**: Create detailed plans from approved specs
- **Trigger**: After spec approval
- **Output**: Structured plan with phases, tasks, acceptance criteria
- **Invoked by**: brainstorming (terminal state)

#### `executing-plans` - Plan Execution
**Purpose**: Execute plans in separate session with checkpoints
- **Features**: Review checkpoints, separate session context

#### `subagent-driven-development` - Parallel Agents
**Purpose**: Execute implementation plans with independent tasks
- **Pattern**: Manager agent → spawn subagents → aggregate results

#### `dispatching-parallel-agents` - Task Parallelization
**Purpose**: Handle 2+ independent tasks without shared state
- **Trigger**: Independent tasks detected

---

### 2.2 Quality Enforcement Skills

#### `test-driven-development` - TDD Enforcement
**Purpose**: Test-first development
- **Iron Law**: "NO CODE WITHOUT A FAILING TEST FIRST"
- **Red Flags**: 8 rationalizations for skipping tests
- **Process**: RED (write failing test) → GREEN (minimal code) → REFACTOR

#### `verification-before-completion` - Evidence-Based Completion
**Purpose**: Require verification before claiming done
- **Rule**: "Evidence before assertions always"
- **Triggers**: Before commit, PR, or completion claims

#### `systematic-debugging` - Debugging Methodology
**Purpose**: Structured debugging before proposing fixes
- **Components**: 
  - Condition-based waiting (no sleep/polling)
  - Root cause tracing
  - Defense in depth
- **Test Pressure Scenarios**: Academic, time, sunk cost, authority, exhaustion

#### `requesting-code-review` / `receiving-code-review` - Review Discipline
**Purpose**: Rigorous code review process
- **Requesting**: Before merge, major features
- **Receiving**: Technical rigor, not performative agreement

---

### 2.3 Workflow Skills

#### `using-git-worktrees` - Isolation
**Purpose**: Isolated workspaces for feature work
- **Trigger**: Before feature work or plan execution

#### `finishing-a-development-branch` - Completion
**Purpose**: Decide integration strategy when done

#### `writing-skills` - Skill Creation (TDD for Skills)
**Purpose**: Create skills using RED-GREEN-REFACTOR
- **Baseline Testing**: Run pressure scenarios WITHOUT skill first
- **Rationalization Tables**: Document agent excuses
- **Micro-testing**: 5+ reps per wording variant

---

## 3. Skill Structure (Each Skill)

```
skill-name/
├── SKILL.md              # Main reference (required)
├── supporting-file.*     # Only if needed (scripts, heavy refs)
```

**SKILL.md Frontmatter**:
```yaml
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
---
```

**Critical**: Description = WHEN to use (triggers), NOT what it does

---

## 4. OpenCode Integration (Current)

### `.opencode/plugins/superpowers.js`
- Entry point for OpenCode plugin
- Registers skills from `./skills/` directory

### Hooks
- `hooks/hooks.json` - Claude Code hooks
- `hooks/hooks-cursor.json` - Cursor hooks

### Installation
- Via OpenCode plugin marketplace
- Skills auto-loaded from `~/.config/opencode/skills/`

---

## 5. Data Models & Concepts

### Skill Model (Implicit)
```typescript
interface Skill {
  name: string;                    // kebab-case
  description: string;             // Trigger conditions only
  triggers: string[];              // Symptoms, situations, contexts
  category: 'process' | 'technique' | 'pattern' | 'reference' | 'verification';
  dependencies: string[];          // Required sub-skills
  testScenarios: PressureScenario[];
}

interface PressureScenario {
  type: 'academic' | 'time' | 'sunk_cost' | 'authority' | 'exhaustion' | 'combined';
  description: string;
  expectedViolation: string;
  rationalizations: string[];
}
```

### Workflow Model
```
User Request
    │
    ▼
using-superpowers (META)
    │
    ▼
brainstorming (if creative)
    │
    ▼
writing-plans (from spec)
    │
    ▼
executing-plans / subagent-driven-development
    │
    ▼
test-driven-development (per task)
    │
    ▼
verification-before-completion
    │
    ▼
requesting-code-review
    │
    ▼
finishing-a-development-branch
```

---

## 6. Testing Infrastructure

### `skills/writing-skills/testing-skills-with-subagents.md`
- **Methodology**: Subagent-based pressure testing
- **Pressure Types**: Time, sunk cost, authority, exhaustion, combined
- **Baseline**: Test WITHOUT skill → document violations
- **Validation**: Test WITH skill → verify compliance
- **Micro-tests**: 5+ reps, manual review of each

### Test Scenarios (from systematic-debugging)
- `test-academic.md` - Knowledge verification
- `test-pressure-1/2/3.md` - Pressure scenarios

---

## 7. Components Assessment for BKG Migration

### KEEP & REFACTOR (Core Methodology)
| Skill | BKG Target | Reason |
|-------|------------|--------|
| `using-superpowers` | `bkg-skills/meta/using-bkg-skills` | Meta-enforcement |
| `brainstorming` | `bkg-skills/planning/brainstorming` | Design exploration |
| `writing-plans` | `bkg-skills/planning/writing-plans` | Plan creation |
| `writing-skills` | `bkg-skills/meta/writing-skills` | Skill creation TDD |
| `systematic-debugging` | `bkg-skills/debugging/systematic-debugging` | Debug methodology |
| `test-driven-development` | `bkg-skills/testing/test-driven-development` | TDD enforcement |
| `verification-before-completion` | `bkg-skills/quality/verification-before-completion` | Evidence-based |
| `subagent-driven-development` | `bkg-skills/execution/subagent-driven-development` | Parallel execution |
| `dispatching-parallel-agents` | `bkg-skills/execution/dispatching-parallel-agents` | Task parallelization |
| `executing-plans` | `bkg-skills/execution/executing-plans` | Plan execution |
| `requesting-code-review` | `bkg-skills/review/requesting-code-review` | Review requests |
| `receiving-code-review` | `bkg-skills/review/receiving-code-review` | Review handling |
| `using-git-worktrees` | `bkg-skills/workspace/using-git-worktrees` | Isolation |
| `finishing-a-development-branch` | `bkg-skills/workflow/finishing-branch` | Completion |

### ADAPT (Platform-Specific)
| Component | Adaptation |
|-----------|------------|
| `hooks/` | BKG-specific hooks for OpenCode |
| `.pi/` | Remove (Pi-specific) |
| `.opencode/` | Rewrite as BKG OpenCode plugin |
| Platform refs (codex-tools.md, etc.) | Unify into BKG platform docs |

---

## 8. New BKG Skill Categories

```
bkg-skills/
├── meta/
│   ├── using-bkg-skills          # Meta: invoke skills first
│   └── writing-skills            # TDD for skill creation
├── planning/
│   ├── brainstorming             # Design exploration
│   ├── writing-plans             # Plan creation
│   └── goal-decomposition        # NEW: Break goals into plans
├── analysis/
│   ├── repository-analysis       # NEW: Full repo inventory
│   ├── dependency-analysis       # NEW: Dependency mapping
│   └── architecture-analysis     # NEW: Architecture review
├── implementation/
│   ├── test-driven-development   # TDD enforcement
│   ├── subagent-driven-development # Parallel agents
│   └── dispatching-parallel-agents # Task parallelization
├── review/
│   ├── requesting-code-review    # Review requests
│   ├── receiving-code-review     # Review handling
│   └── systematic-debugging      # Debug methodology
├── testing/
│   ├── verification-before-completion # Evidence-based
│   └── test-skill-creation       # NEW: Skill testing
├── debugging/
│   └── systematic-debugging      # Debug methodology
├── deployment/
│   ├── executing-plans           # Plan execution
│   └── finishing-branch          # Branch completion
└── workspace/
    └── using-git-worktrees       # Isolation
```

---

## 9. Integration with BKG Plan Engine

### Skill → Plan Engine Mapping
| Skill | Plan Engine Feature |
|-------|---------------------|
| `brainstorming` | Design phase visualization |
| `writing-plans` | Plan structure generation |
| `subagent-driven-development` | Agent team composition |
| `dispatching-parallel-agents` | Task dependency graph |
| `systematic-debugging` | Error analysis view |
| `verification-before-completion` | Completion gates |
| `test-driven-development` | Test phase tracking |

### Dynamic Skill Assignment
```
Goal Analysis
    │
    ▼
Required Capabilities
    │
    ▼
Skill Registry Query (bkg-skills/*)
    │
    ▼
Agent Spec + Required Skills
    │
    ▼
OpenCode Team Spawn
```

---

## 10. Migration Complexity Assessment

| Component | Complexity | Effort | Risk |
|-----------|------------|--------|------|
| Skill extraction & restructure | Medium | 2-3 weeks | Low |
| Meta-skill adaptation | Low | 1 week | Low |
| New skill creation (analysis, goal-decomposition) | High | 3-4 weeks | Medium |
| OpenCode plugin rewrite | Medium | 2 weeks | Low |
| Testing infrastructure port | Medium | 1-2 weeks | Low |
| Documentation restructure | Low | 1 week | Low |

**Total Estimated Effort**: 10-13 weeks

---

## 11. Recommended Migration Order

1. **Phase 1**: Create `docs/superpowers-analysis.md` (this document)
2. **Phase 2**: Initialize BKG skills monorepo structure
3. **Phase 3**: Extract & adapt `using-superpowers` → `using-bkg-skills`
4. **Phase 4**: Extract & adapt core process skills (brainstorming, writing-plans)
5. **Phase 5**: Extract & adapt quality skills (TDD, verification, debugging)
6. **Phase 6**: Extract & adapt execution skills (subagent, parallel, executing)
7. **Phase 7**: Extract & adapt review/workflow skills
8. **Phase 8**: Create NEW BKG-specific skills (analysis, goal-decomposition)
9. **Phase 9**: Build skill registry & dynamic assignment system
10. **Phase 10**: OpenCode plugin for skill loading
11. **Phase 11**: Integration with goal-builder & goal-orchestrator
12. **Phase 12**: Testing & documentation

---

## 12. Rebranding Mapping

| Superpowers | BKG Skills |
|-------------|------------|
| `superpowers` | `bkg-skills` |
| `using-superpowers` | `using-bkg-skills` |
| `superpowers:brainstorming` | `bkg-skills:planning/brainstorming` |
| Skill namespace | `bkg-skills/*` |
| Plugin name | `bkg-agent-superpowers` |
| Installation | `~/.config/opencode/skills/bkg-skills/` |

---

## 13. Open Questions for BKG Integration

1. **Skill Discovery**: How do agents find BKG skills? (OpenCode native vs custom registry)
2. **Skill Versioning**: Semantic versioning for skills?
3. **Skill Dependencies**: Explicit dependency graph vs implicit?
4. **Pressure Testing**: Automate baseline testing in CI?
5. **Skill Composition**: Can skills be composed? (e.g., `brainstorming` + `writing-plans`)
6. **Custom Skills**: User-defined skills in project `.opencode/skills/`?

---

## 14. Conclusion

Superpowers provides a **complete software development methodology** with:
- ✅ 15 battle-tested skills covering full lifecycle
- ✅ TDD-based skill creation methodology
- ✅ Pressure-tested enforcement mechanisms
- ✅ Multi-platform support (Claude Code, OpenCode, Codex, etc.)
- ✅ Clear skill structure with trigger-based discovery

**Migration is highly viable** because:
- Skills are already modular and independent
- OpenCode integration exists
- Methodology aligns perfectly with BKG goals
- Testing infrastructure is robust

**Key work needed**:
- Reorganize into BKG skill categories
- Create BKG-specific analysis skills
- Build dynamic skill assignment for goal-orchestrator
- Rewrite OpenCode plugin for BKG
- Unify platform-specific references

**Recommended**: Proceed with phased extraction, maintaining skill integrity while adapting to BKG architecture.