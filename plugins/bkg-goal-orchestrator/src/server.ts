// BKG Goal Orchestrator - Programmatic API
// Exposes the orchestrator core as a real library surface for embedding and tests.
// (opencode has no PluginServer interface; this module is a plain API export.)

import { GoalStorage } from '@bkg/goal-builder';
import {
  GoalReader,
  InventoryCollector,
  CapabilityMatrix,
  SkillMatcher,
  TeamBuilder,
  PlanGenerator,
  Visualizer,
  ApprovalGate,
  ExecutionEngine,
  PluginRegistry,
} from '@bkg/goal-orchestrator';

export interface BkgGoalOrchestratorApi {
  storage: GoalStorage;
  plugins: PluginRegistry;
  goals: GoalReader;
  inventory: InventoryCollector;
  skills: SkillMatcher;
  team: TeamBuilder;
  planner: PlanGenerator;
  visualizer: Visualizer;
  approval: ApprovalGate;
  execution: ExecutionEngine;
}

export function createOrchestrator(projectDir: string): BkgGoalOrchestratorApi {
  const storage = new GoalStorage(projectDir);
  const plugins = new PluginRegistry();
  return {
    storage,
    plugins,
    goals: new GoalReader(storage),
    inventory: new InventoryCollector(projectDir),
    skills: new SkillMatcher(plugins),
    team: new TeamBuilder(plugins),
    planner: new PlanGenerator(plugins),
    visualizer: new Visualizer(plugins),
    approval: new ApprovalGate(plugins),
    execution: new ExecutionEngine(plugins),
  };
}

export {
  GoalReader,
  InventoryCollector,
  CapabilityMatrix,
  SkillMatcher,
  TeamBuilder,
  PlanGenerator,
  Visualizer,
  ApprovalGate,
  ExecutionEngine,
  PluginRegistry,
};
