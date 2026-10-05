# Plannotator Complete Architecture Analysis

**Source**: https://github.com/backnotprop/plannotator  
**Version Analyzed**: 0.26.2  
**Analysis Date**: 2026-08-06

---

## 1. Repository Structure Overview

```
plannotator/
├── apps/                          # Agent-specific integrations (16 apps)
│   ├── hook/                      # Core plan review HTTP server (Claude Code, etc.)
│   ├── opencode-plugin/           # OpenCode plugin (V1 + V2)
│   ├── review/                    # Code review editor
│   ├── portal/                    # Sharing portal
│   ├── amp-plugin/, codex/, copilot/, droid-plugin/, gemini/, kiro-cli/, pi-extension/
│   ├── marketing/                 # plannotator.ai website
│   ├── paste-service/             # Encrypted paste service
│   ├── vscode-extension/          # VS Code extension
│   └── waitlist-service/          # Waitlist for Workspaces
├── packages/                      # Core libraries (8 packages)
│   ├── core/                      # Shared types, utilities, goal-setup, agents
│   ├── server/                    # Main server logic (annotate, review, git, PRs, AI)
│   ├── shared/                    # Shared types, config, gitbutler, PR handling
│   ├── ui/                        # React UI components, themes, hooks
│   ├── editor/                    # Plan editor (editable documents)
│   ├── review-editor/             # Code review editor (diff viewer)
│   ├── ai/                        # AI providers, prompts
│   └── editor/                    # Editor components
├── bin/                           # CLI entry point
├── scripts/                       # Build/install scripts
├── tests/                         # Integration tests
└── docs/                          # Documentation
```

---

## 2. Core Packages Deep Dive

### 2.1 packages/core
**Purpose**: Fundamental types, utilities, and agent orchestration primitives

**Key Exports**:
- `GoalSetup` - Goal initialization and validation
- `AgentJobs` - Agent job management
- `Annotatable` - Annotation interface
- `Project` - Project context
- `WorkspaceStatus` - Workspace state tracking
- `AgentTerminal` - Terminal integration
- `ConfigTypes` - Configuration schemas

**Files** (18 files, ~15KB total):
```
goal-setup.ts, agents.ts, annotatable.ts, project.ts, workspace-status-types.ts,
agent-jobs.ts, agent-terminal.ts, ai-context.ts, code-file.ts, compress.ts,
config-types.ts, crypto.ts, external-annotation.ts, extract-code-paths.ts,
favicon.ts, feedback-templates.ts, source-save.ts, storage-types.ts
```

**Reusability**: HIGH - Core data models directly applicable to BKG Plan Engine

---

### 2.2 packages/shared
**Purpose**: Cross-cutting utilities, VCS integration, PR handling, configuration

**Key Exports**:
- `Config` - Configuration management
- `GitbutlerCore` - GitButler integration
- `PRProvider` / `PRGitHub` / `PRGitLab` - PR review providers
- `ReviewCore` - Core review logic
- `DiffFingerprint` - Diff deduplication
- `VCS` - Git/JJ/P4 abstraction
- `WorkspaceStatus` - Workspace tracking

**Files** (50+ files, ~400KB):
Major modules: `config.ts`, `gitbutler-core.ts`, `pr-github.ts`, `pr-gitlab.ts`,
`review-core.ts`, `review-workspace.ts`, `diff-fingerprint.ts`, `vcs-core.ts`

**Reusability**: HIGH - VCS abstraction and PR handling essential for BKG

---

### 2.3 packages/server
**Purpose**: Main HTTP server - plan annotation, code review, agent communication

**Key Exports**:
- `Annotate` - Document/URL annotation server
- `Review` - Code review server (git diff, PR review)
- `MarkerReview` - Inline annotation engine
- `AgentJobs` - Agent job orchestration
- `Sessions` - Session management
- `Git` / `GitHub` / `GitLab` - VCS operations
- `AI` - AI provider integration

**Files** (40+ files, ~600KB):
Major: `annotate.ts` (40KB), `review.ts` (141KB), `marker-review.ts` (55KB),
`agent-jobs.ts` (32KB), `sessions.ts`, `claude-review.ts`, `integrations.ts`

**Reusability**: HIGH - Core server logic for BKG Plan Engine backend

---

### 2.4 packages/ui
**Purpose**: React UI component library, themes, markdown editor, vim navigation

**Key Exports**:
- `App` - Main editor application
- Theme system (`theme.css`, `themes/`)
- Vim navigation (`vimNavigation.ts`, `vimReticle.ts`, `vimHud.ts`)
- Annotation persistence (`annotationDraftPersistence.tsx`)
- Components (200+ React components)

**Files** (100+ files, ~500KB):
Major: `App.tsx` (227KB), `components/`, `hooks/`, `themes/`, `shortcuts/`

**Reusability**: HIGH - UI components directly reusable for BKG visualizations

---

### 2.5 packages/editor
**Purpose**: Editable plan documents with reconciliation

**Key Exports**:
- `App` - Editable document editor
- `DirectEdits` - Direct text manipulation
- `SourceDocumentReconciliation` - Sync edited content with source
- `EditableDocuments` - Document management

**Files** (20+ files, ~300KB):
Major: `App.tsx` (227KB), `editableDocuments.ts`, `directEdits.ts`

**Reusability**: MEDIUM - Plan editing relevant, needs adaptation for BKG model

---

### 2.6 packages/review-editor
**Purpose**: Code review diff viewer with dock-based layout

**Key Exports**:
- `App` - Review editor application
- `Edit` - Inline diff editing
- `WorkerPool` - Background processing
- `Dock` - Layout system (dockview-react)

**Files** (20+ files, ~200KB):
Major: `App.tsx` (197KB), `components/`, `dock/`, `edit/`

**Reusability**: MEDIUM - Diff viewing useful for code review in BKG

---

### 2.7 packages/ai
**Purpose**: AI provider abstraction, prompts, review agents

**Key Exports**:
- `AIProvider` - Provider abstraction
- `Prompts` - Prompt templates
- `ReviewAgentInstructions` - AI review agent prompts

**Reusability**: MEDIUM - AI integration useful for BKG agent assistance

---

## 3. App Integrations (Agent-Specific)

### 3.1 apps/hook - Core Plan Review Server
- **Purpose**: HTTP server that intercepts agent `ExitPlanMode` hooks
- **Flow**: Agent → Hook → Server reads plan → Browser opens → User annotates → Feedback to agent
- **Key Files**: `server/index.ts` (80KB), `cli.ts`, `session-log.ts`, `codex-session.ts`

### 3.2 apps/opencode-plugin - OpenCode Integration
- **Dual Support**: V1 (commands) + V2 (server adapter)
- **Commands**: 12+ slash commands (`/plannotator-review`, `/plannotator-annotate`, etc.)
- **Plan Mode**: Hook into `ExitPlanMode`
- **Agent Switching**: `/plannotator-agent-switch`
- **Key Files**: `index.ts` (V1), `server.ts` (V2), `commands.ts`, `cli-bridge.ts`

### 3.3 apps/review - Code Review Editor
- Git diff viewer, PR review, file tree navigation

### 3.4 apps/portal / paste-service / waitlist-service
- Sharing infrastructure (not needed for BKG internal)

---

## 4. Data Models (Critical for Migration)

### 4.1 Plan Model (from `packages/core/types.ts`, `packages/shared/types.ts`)

```typescript
interface Plan {
  id: string;
  title: string;
  content: string;
  markdown: string;
  phases: Phase[];
  tasks: Task[];
  dependencies: Dependency[];
  agents: Agent[];
  skills: Skill[];
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed';
  metadata: PlanMetadata;
  events: PlanEvent[];
}

interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
  tasks: string[]; // task IDs
}

interface Task {
  id: string;
  title: string;
  description: string;
  phaseId: string;
  agentId?: string;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  result?: TaskResult;
  skillRequirements: string[];
}

interface Dependency {
  from: string; // task ID
  to: string;   // task ID
  type: 'blocks' | 'relates' | 'duplicates';
}

interface Agent {
  id: string;
  name: string;
  type: 'build' | 'plan' | 'explore' | 'review';
  prompt: string;
  skills: string[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  worktree?: string;
}

interface Skill {
  name: string;
  description: string;
  triggers: string[];
  required: boolean;
  category: 'planning' | 'analysis' | 'implementation' | 'review' | 'testing' | 'debugging' | 'deployment';
}

interface PlanEvent {
  timestamp: string;
  type: 'created' | 'updated' | 'agent_started' | 'agent_completed' | 
        'task_completed' | 'task_failed' | 'phase_completed' | 'error' | 'approval';
  agentId?: string;
  taskId?: string;
  phaseId?: string;
  data: any;
}
```

---

## 5. Build System & Tooling

| Aspect | Technology |
|--------|------------|
| Runtime | Bun v1.0+ |
| Package Manager | Bun Workspaces (`apps/*`, `packages/*`) |
| Build | `bun build` with `--target bun` / `--target node` |
| TypeScript | Multiple tsconfigs per package |
| Testing | `bun test` with happy-dom |
| Linting | Biome (via `mise run lint`) |
| CI/CD | GitHub Actions + release-please |
| Release | Conventional commits → automated releases |

---

## 6. OpenCode Plugin Architecture (Current)

### Plugin Structure (`apps/opencode-plugin/`)
```json
{
  "name": "@plannotator/opencode",
  "main": "dist/index.js",           // V1: Commands
  "exports": { ".": "./dist/server.js" }  // V2: Server adapter
}
```

### V1 Commands (Loaded via `main`)
- 12+ slash commands registered in `commands/`
- Plan mode hook integration
- Agent switching command

### V2 Server Adapter (Loaded via `exports`)
- Runs as OpenCode plugin server
- Handles plan review lifecycle
- Communicates via `cli-bridge.ts`

### Key Integration Points
- `plan-mode.ts` - Plan review lifecycle
- `commands.ts` - Command implementations
- `cli-bridge.ts` - CLI communication
- `agent-switch.ts` - Agent switching

---

## 7. Components Assessment for BKG Migration

### KEEP & REFACTOR (High Value)
| Package | BKG Target | Reason |
|---------|------------|--------|
| `packages/core` | `@bkg/plan-engine-core` | Fundamental data models |
| `packages/shared` | `@bkg/plan-engine-shared` | VCS, config, PR handling |
| `packages/server` | `@bkg/plan-engine-server` | Backend API, annotation, review |
| `packages/ui` | `@bkg/plan-engine-ui` | Visualization components |
| `packages/editor` | `@bkg/plan-engine-editor` | Plan editing |
| `packages/review-editor` | `@bkg/plan-engine-review-editor` | Diff viewing |

### REMOVE (Agent-Specific)
| App | Reason |
|-----|--------|
| `apps/amp-plugin`, `codex`, `copilot`, `droid-plugin`, `gemini`, `kiro-cli`, `pi-extension` | Agent-specific, not needed for BKG |
| `apps/marketing` | Marketing site |
| `apps/portal`, `paste-service`, `waitlist-service` | Sharing infrastructure |
| `apps/vscode-extension` | Optional, separate if needed |

### REWRITE (Architecture Change)
| Component | New Approach |
|-----------|--------------|
| `apps/hook` | Refactor into `@bkg/plan-engine-server` core |
| `apps/opencode-plugin` | **Complete rewrite** using zenobi-us template |

---

## 8. Dependencies Analysis

### Production Dependencies
```json
{
  "@anthropic-ai/claude-agent-sdk": "^0.2.92",
  "@opencode-ai/sdk": "^1.3.0",
  "@pierre/diffs": "1.3.2",
  "diff": "^8.0.4",
  "dockview-react": "^5.2.0",
  "dompurify": "^3.3.3",
  "marked": "^17.0.6",
  "sonner": "^2.0.7"
}
```

### Key Dependency Notes
- `@opencode-ai/sdk` - Direct OpenCode integration (keep)
- `dockview-react` - Dock layout for review editor (keep)
- `marked`/`dompurify` - Markdown rendering (keep)
- `@pierre/diffs` - Diff algorithm (keep)

---

## 9. Migration Complexity Assessment

| Component | Complexity | Effort | Risk |
|-----------|------------|--------|------|
| Core packages extraction | Medium | 2-3 weeks | Low |
| Server refactor | High | 3-4 weeks | Medium |
| UI components adaptation | Medium | 2-3 weeks | Low |
| OpenCode plugin rewrite | High | 2-3 weeks | Medium |
| Data model alignment | Medium | 1-2 weeks | Low |
| Integration testing | High | 2-3 weeks | Medium |

**Total Estimated Effort**: 12-18 weeks for complete migration

---

## 10. Recommended Migration Order

1. **Phase 1**: Create `docs/bkg-plan-engine-analysis.md` (this document)
2. **Phase 2**: Initialize BKG monorepo with `zenobi-us/bun-module` template
3. **Phase 3**: Extract `packages/core` → `@bkg/plan-engine-core`
4. **Phase 4**: Extract `packages/shared` → `@bkg/plan-engine-shared`
5. **Phase 5**: Extract `packages/server` → `@bkg/plan-engine-server`
6. **Phase 6**: Extract `packages/ui` → `@bkg/plan-engine-ui`
7. **Phase 7**: Extract `packages/editor` → `@bkg/plan-engine-editor`
8. **Phase 8**: Extract `packages/review-editor` → `@bkg/plan-engine-review-editor`
9. **Phase 9**: Build BKG-specific packages (plan-model, dependency-engine, etc.)
10. **Phase 10**: Rewrite OpenCode plugin using zenobi-us template
11. **Phase 11**: Integration testing with goal-builder & goal-orchestrator
12. **Phase 12**: Documentation & release

---

## 11. BKG-Specific Extensions Needed

### New Packages (Not in Plannotator)
```
packages/
├── plan-model/           # Goal, Phase, Task, Dependency, Agent, Skill models
├── dependency-engine/    # DAG resolution, critical path, topological sort
├── task-engine/          # Task lifecycle, assignment, progress tracking
├── workflow-state/       # Plan execution state machine
├── agent-runtime/        # OpenCode team API integration
├── skill-registry/       # Dynamic skill discovery & matching
├── event-bus/            # Event sourcing for plan events
└── approval-gate/        # User approval workflow
```

### New Apps
```
apps/
├── opencode/             # OpenCode plugin (goal-builder + orchestrator integration)
└── cli/                  # bkg-plan-engine CLI
```

---

## 12. Rebranding Mapping

| Plannotator | BKG Plan Engine |
|-------------|-----------------|
| `@plannotator/*` | `@bkg/plan-engine-*` |
| `plannotator` binary | `bkg-plan-engine` |
| `~/.plannotator` | `~/.bkg/plan-engine` |
| `PLANNOTATOR_*` env vars | `BKG_PLAN_ENGINE_*` |
| "Plannotator" UI text | "BKG Plan Engine" |
| plannotator.ai | bkg.dev/plan-engine |
| License: backnotprop | License: BKG |

---

## 13. Open Questions for BKG Integration

1. **Event System**: Use Plannotator's session-log or build new event-sourced system?
2. **Plan Storage**: File-based (`.goals/`) vs database?
3. **Real-time Updates**: WebSocket vs Server-Sent Events vs polling?
4. **Multi-tenancy**: Single project vs workspace support?
5. **Plugin System**: How to expose extension points for custom visualizers?
6. **Offline Support**: Local-first architecture requirements?

---

## 14. Conclusion

Plannotator provides an excellent foundation with:
- ✅ Mature plan review workflow
- ✅ Robust VCS/PR integration
- ✅ Rich React UI component library
- ✅ OpenCode plugin (V1+V2)
- ✅ Multi-agent support

**Migration is viable** but requires:
- Significant refactoring (not copy-paste)
- New BKG-specific data models
- Complete OpenCode plugin rewrite
- New packages for dependency management, task engine, workflow state
- Deep integration with goal-builder & goal-orchestrator

**Recommended**: Proceed with phased extraction approach using zenobi-us/bun-module template for each package.