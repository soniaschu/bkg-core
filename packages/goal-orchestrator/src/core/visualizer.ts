// BKG Goal Orchestrator - Visualizer
// Renders execution plans for visualization

import { 
  ExecutionPlan, 
  VisualizerPlugin, 
  VisualizationResult 
} from './types.js';
import { PluginRegistry } from './plugin-registry.js';

export class Visualizer {
  private pluginRegistry: PluginRegistry;
  
  constructor(pluginRegistry: PluginRegistry) {
    this.pluginRegistry = pluginRegistry;
  }
  
  async render(plan: ExecutionPlan): Promise<VisualizationResult> {
    // Get all visualizer plugins
    const visualizers = await this.pluginRegistry.getVisualizers();
    
    // Use the highest priority visualizer
    const bestVisualizer = visualizers.reduce((best, current) => 
      (current.priority || 0) > (best.priority || 0) ? current : best
    , visualizers[0]);
    
    // Render using the visualizer
    return await bestVisualizer.render(plan);
  }
  
  // Default visualizer implementation
  async defaultRender(plan: ExecutionPlan): Promise<VisualizationResult> {
    // Return data that can be used by frontend to render
    return {
      type: 'dag',
      data: {
        planId: plan.id,
        goalId: plan.goalId,
        phases: plan.phases.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          order: p.order,
        })),
        tasks: plan.tasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          phaseId: t.phaseId,
          agentId: t.agentId,
          skillRequirements: t.skillRequirements,
          dependencies: t.dependencies,
          status: t.status,
          priority: t.priority,
          estimatedDuration: t.estimatedDuration,
        })),
        dependencies: plan.dependencies.map(d => ({
          id: d.id,
          from: d.from,
          to: d.to,
          type: d.type,
        })),
      },
      mimeType: 'application/json',
    };
  }
}