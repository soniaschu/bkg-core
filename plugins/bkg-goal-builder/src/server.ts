// BKG Goal Builder - Programmatic API
// Exposes the goal builder core as a real library surface for embedding and tests.
// (opencode has no PluginServer interface; this module is a plain API export.)

import {
  GoalStorage,
  ProjectAnalyzer,
  GoalValidator,
  TemplateEngine,
  RulesEngine,
  EventLogger,
  HistoryManager,
} from '@bkg/goal-builder';
import type { Goal } from '@bkg/goal-builder';

export interface BkgGoalBuilderApi {
  storage: GoalStorage;
  analyzer: ProjectAnalyzer;
  templates: TemplateEngine;
  rules: RulesEngine;
  events: EventLogger;
  history: HistoryManager;
  validate(goal: Goal): ReturnType<InstanceType<typeof GoalValidator>['validate']>;
}

export function createGoalBuilder(projectDir: string): BkgGoalBuilderApi {
  const storage = new GoalStorage(projectDir);
  return {
    storage,
    analyzer: new ProjectAnalyzer(projectDir),
    templates: new TemplateEngine(storage),
    rules: new RulesEngine(storage),
    events: new EventLogger(storage),
    history: new HistoryManager(storage),
    validate(goal: Goal) {
      return new GoalValidator(goal).validate();
    },
  };
}

export { GoalStorage, ProjectAnalyzer, GoalValidator, TemplateEngine, RulesEngine, EventLogger, HistoryManager };
