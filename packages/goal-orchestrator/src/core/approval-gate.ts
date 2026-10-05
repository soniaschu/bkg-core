// BKG Goal Orchestrator - Approval Gate
// Handles user approval for orchestration steps

import { 
  ApprovalGate, 
  ApprovalDecision, 
  ApprovalPlugin 
} from './types.js';
import { PluginRegistry } from './plugin-registry.js';

export class ApprovalGate {
  private pluginRegistry: PluginRegistry;
  
  constructor(pluginRegistry: PluginRegistry) {
    this.pluginRegistry = pluginRegistry;
  }
  
  async prompt(context: any): Promise<ApprovalDecision> {
    // Get all approval plugins
    const plugins = await this.pluginRegistry.getApprovalPlugins();
    
    // Use the highest priority plugin
    const bestPlugin = plugins.reduce((best, current) => 
      (current.priority || 0) > (best.priority || 0) ? current : best
    , plugins[0]);
    
    // Prompt using the plugin
    return await bestPlugin.prompt(context);
  }
  
  // Default approval gate implementation
  async defaultPrompt(context: any): Promise<ApprovalDecision> {
    // In a real implementation, this would show a UI to the user
    // For now, we'll auto-approve for demonstration
    // In production, this would integrate with the BKG Plan Engine for visualization
    
    return {
      decision: 'start',
      modifications: {},
      confirmedAt: new Date().toISOString(),
      userId: 'system', // Would be actual user in real implementation
    };
  }
}