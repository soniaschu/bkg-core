// BKG Goal Orchestrator - Plugin Registry
// Manages discovery and loading of plugins for extensibility

import { 
  AnalyzerPlugin,
  TeamStrategyPlugin,
  SkillMatcherPlugin,
  PlannerPlugin,
  VisualizerPlugin,
  ExporterPlugin,
  ApprovalPlugin,
  PluginMetadata
} from './types.js';

export class PluginRegistry {
  private analyzers: AnalyzerPlugin[] = [];
  private teamStrategies: TeamStrategyPlugin[] = [];
  private skillMatchers: SkillMatcherPlugin[] = [];
  private planners: PlannerPlugin[] = [];
  private visualizers: VisualizerPlugin[] = [];
  private exporters: ExporterPlugin[] = [];
  private approvals: ApprovalPlugin[] = [];
  
  constructor() {
    // Register built-in plugins
    this.registerBuiltInPlugins();
  }
  
  private registerBuiltInPlugins(): void {
    // Register default analyzer
    this.analyzers.push({
      name: 'default-analyzer',
      priority: 1,
      analyze: async (context: any) => ({
        analyses: {},
        insights: ['Default analysis completed'],
        recommendations: ['Proceed with standard approach'],
      }),
    });
    
    // Register default team strategy
    this.teamStrategies.push({
      name: 'default-team-strategy',
      priority: 1,
      compose: async (capabilities: any, goal: any) => {
        // This would be implemented by the team builder's default compose
        return {
          agents: [],
          tasks: [],
        };
      },
    });
    
    // Register default skill matcher
    this.skillMatchers.push({
      name: 'default-skill-matcher',
      priority: 1,
      match: async (agent: any, task: any, availableSkills: any[]) => {
        return availableSkills.map(s => s.name);
      },
    });
    
    // Register default planner
    this.planners.push({
      name: 'default-planner',
      priority: 1,
      generate: async (team: any, goal: any) => {
        // This would be implemented by the plan generator's default generate
        return {
          id: `plan-${Date.now()}`,
          goalId: goal.id || 'unknown',
          phases: [],
          tasks: [],
          dependencies: [],
          agents: [],
          skills: [],
          status: 'draft',
          createdAt: new Date().toISOString(),
          estimatedDuration: 0,
          criticalPath: [],
        };
      },
    });
    
    // Register default visualizer
    this.visualizers.push({
      name: 'default-visualizer',
      priority: 1,
      render: async (plan: any) => ({
        type: 'json',
        data: plan,
        mimeType: 'application/json',
      }),
    });
    
    // Register default exporter
    this.exporters.push({
      name: 'default-exporter',
      priority: 1,
      export: async (goal: any, format: 'md' | 'json' | 'yaml') => {
        if (format === 'json') {
          return JSON.stringify(goal, null, 2);
        }
        return `# Goal Export\n\n${JSON.stringify(goal, null, 2)}`;
      },
    });
    
    // Register default approval plugin
    this.approvals.push({
      name: 'default-approval',
      priority: 1,
      prompt: async (context: any) => ({
        decision: 'start',
        modifications: {},
        confirmedAt: new Date().toISOString(),
        userId: 'system',
      }),
    });
  }
  
  // Getters for plugin types
  async getAnalyzers(): Promise<AnalyzerPlugin[]> {
    return [...this.analyzers];
  }
  
  async getTeamStrategies(): Promise<TeamStrategyPlugin[]> {
    return [...this.teamStrategies];
  }
  
  async getSkillMatchers(): Promise<SkillMatcherPlugin[]> {
    return [...this.skillMatchers];
  }
  
  async getPlanners(): Promise<PlannerPlugin[]> {
    return [...this.planners];
  }
  
  async getVisualizers(): Promise<VisualizerPlugin[]> {
    return [...this.visualizers];
  }
  
  async getExporters(): Promise<ExporterPlugin[]> {
    return [...this.exporters];
  }
  
  async getApprovalPlugins(): Promise<ApprovalPlugin[]> {
    return [...this.approvals];
  }
  
  // Get all skills from all plugins
  async getAllSkills(): Promise<any[]> {
    // This would collect skills from all plugin types
    // For now, return empty array
    return [];
  }
  
  // Add plugin methods (for runtime plugin loading)
  addAnalyzer(plugin: AnalyzerPlugin): void {
    this.analyzers.push(plugin);
    this.analyzers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  addTeamStrategy(plugin: TeamStrategyPlugin): void {
    this.teamStrategies.push(plugin);
    this.teamStrategies.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  addSkillMatcher(plugin: SkillMatcherPlugin): void {
    this.skillMatchers.push(plugin);
    this.skillMatchers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  addPlanner(plugin: PlannerPlugin): void {
    this.planners.push(plugin);
    this.planners.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  addVisualizer(plugin: VisualizerPlugin): void {
    this.visualizers.push(plugin);
    this.visualizers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  addExporter(plugin: ExporterPlugin): void {
    this.exporters.push(plugin);
    this.exporters.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  addApproval(plugin: ApprovalPlugin): void {
    this.approvals.push(plugin);
    this.approvals.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
}