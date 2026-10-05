// BKG Goal Orchestrator - Main Entry Point
// Exports orchestrator commands

export { orchestrateCommand } from './commands/index.js';
export { goalOrchestrateCommand } from './commands/index.js';

// Core
export { GoalReader } from './core/goal-reader.js';
export { InventoryCollector } from './core/inventory-collector.js';
export { CapabilityMatrix } from './core/capability-matrix.js';
export { SkillMatcher } from './core/skill-matcher.js';
export { TeamBuilder } from './core/team-builder.js';
export { PlanGenerator } from './core/plan-generator.js';
export { Visualizer } from './core/visualizer.js';
export { ApprovalGate } from './core/approval-gate.js';
export { ExecutionEngine } from './core/execution-engine.js';
export { PluginRegistry } from './core/plugin-registry.js';

// Agents
export { AgentSpec } from './agents/agent-spec.js';
export { TeamManager } from './agents/team-manager.js';
export { TaskDistributor } from './agents/task-distributor.js';

// Plugins
export * from './plugins/index.js';

// Types
export type { 
  OrchestrationResult,
  AgentTeam,
  SkillAssignment,
  ExecutionPlan,
  ApprovalDecision,
} from './core/types.js';