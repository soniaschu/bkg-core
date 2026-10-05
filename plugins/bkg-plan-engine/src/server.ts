// BKG Plan Engine - Programmatic API
// Exposes the PlanEngine as a real library surface for embedding and tests.
// (opencode has no PluginServer interface; this module is a plain API export.)

export { PlanEngine, createPlanEngine } from './core/plan-engine.js';
export type { PlanEngineOptions, VisualizationOptions, EditOptions } from './core/plan-engine.js';
