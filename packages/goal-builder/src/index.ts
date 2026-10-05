// BKG Goal Builder - Main Entry Point
// Exports all goal management commands

export { makeCommand } from './commands/make.js';
export { checkCommand } from './commands/check.js';
export { statusCommand } from './commands/status.js';
export { listCommand } from './commands/list.js';
export { archiveCommand } from './commands/archive.js';
export { activateCommand } from './commands/activate.js';
export { deleteCommand } from './commands/delete.js';
export { exportCommand } from './commands/export.js';
export { importCommand } from './commands/import.js';
export { historyCommand } from './commands/history.js';
export { eventsCommand } from './commands/events.js';
export { analyzeCommand } from './commands/analyze.js';

// Core
export { Goal, GoalClass } from './core/goal.js';
export { GoalValidator } from './core/goal-validator.js';
export { GoalStorage } from './core/goal-storage.js';
export { ProjectAnalyzer } from './core/project-analyzer.js';
export { AnalysisEngine } from './core/analysis-engine.js';
export { TemplateEngine } from './core/template-engine.js';
export { RulesEngine } from './core/rules-engine.js';
export { EventLogger } from './core/event-logger.js';
export { HistoryManager } from './core/history-manager.js';

// Types
export { Skill } from './core/types.js';

// Templates
export * from './templates/index.js';

// Types
export type { 
  Goal as GoalType,
  GoalMetadata,
  GoalSection,
  AnalysisTask,
  Template,
  ValidationResult,
} from './core/types.js';