// BKG Goal Orchestrator - Plan Generator
// Generates execution plans from teams and goals

import { 
  AgentTeam, 
  GoalClass, 
  ExecutionPlan, 
  Phase, 
  Task, 
  Dependency,
  PlannerPlugin 
} from './types.js';
import { PluginRegistry } from './plugin-registry.js';

export class PlanGenerator {
  private pluginRegistry: PluginRegistry;
  
  constructor(pluginRegistry: PluginRegistry) {
    this.pluginRegistry = pluginRegistry;
  }
  
  async generate(team: AgentTeam, goal: GoalClass, capabilities: any): Promise<ExecutionPlan> {
    // Get all planner plugins
    const planners = await this.pluginRegistry.getPlanners();
    
    // Use the highest priority planner
    const bestPlanner = planners.reduce((best, current) => 
      (current.priority || 0) > (best.priority || 0) ? current : best
    , planners[0]);
    
    // Generate plan using the planner
    return await bestPlanner.generate(team, goal);
  }
  
  // Default planner implementation
  async defaultGenerate(team: AgentTeam, goal: GoalClass): Promise<ExecutionPlan> {
    const planId = `plan-${goal.id}-${Date.now()}`;
    
    // Create phases based on goal sections
    const phases: Phase[] = this.createPhasesFromGoal(goal);
    
    // Create tasks from team tasks and goal analysis
    const tasks: Task[] = this.createTasksFromTeamAndGoal(team, goal);
    
    // Create dependencies
    const dependencies: Dependency[] = this.createDependencies(tasks);
    
    // Extract agents and skills from team
    const agents: any[] = team.agents;
    const skills: any[] = []; // Would be populated from skill assignments
    
    // Calculate estimated duration
    const estimatedDuration = this.estimateDuration(tasks);
    
    // Find critical path
    const criticalPath = this.findCriticalPath(tasks, dependencies);
    
    return {
      id: planId,
      goalId: goal.id,
      phases,
      tasks,
      dependencies,
      agents,
      skills,
      status: 'draft',
      createdAt: new Date().toISOString(),
      estimatedDuration,
      criticalPath,
    };
  }
  
  private createPhasesFromGoal(goal: GoalClass): Phase[] {
    const phases: Phase[] = [];
    
    // Define standard phases based on goal lifecycle
    const phaseDefinitions: { id: string; title: string; description: string; order: number; sectionKeys: string[] }[] = [
      { id: 'phase-1', title: 'Analyse und Planung', description: 'Zielklärung, Hintergrundanalyse, Erfolgskriterien definieren', order: 1, sectionKeys: ['ziel', 'hintergrund', 'erfolgskriterien', 'einschraenkungen'] },
      { id: 'phase-2', title: 'Analyse und Vorbereitung', description: 'Benötigte Analysen durchführen, Abhängigkeiten klären', order: 2, sectionKeys: ['benoetigte-analyse', 'abhaengigkeiten'] },
      { id: 'phase-3', title: 'Implementierungsplanung', description: 'Phasenplanung, Task-Definition, Ressourcenplanung', order: 3, sectionKeys: ['implementierungsplan'] },
      { id: 'phase-4', title: 'Validierung und Tests', description: 'Validierungsstrategie definieren, Testfälle erstellen', order: 4, sectionKeys: ['validierung', 'tests'] },
      { id: 'phase-5', title: 'Artefakte und Dokumentation', description: 'Erwartete Artefakte definieren, Dokumentation planen', order: 5, sectionKeys: ['artefakte', 'dokumentation'] },
      { id: 'phase-6', title: 'Risikomanagement', description: 'Risiken identifizieren, Gegenmaßnahmen planen', order: 6, sectionKeys: ['risiken'] },
      { id: 'phase-7', title: 'Rollback-Planung', description: 'Rollback-Strategie entwickeln, Notfallpläne erstellen', order: 7, sectionKeys: ['rollback'] },
      { id: 'phase-8', title: 'Abschluss und Übergabe', description: 'Abschlusskriterien definieren, Übergabe planen', order: 8, sectionKeys: ['abschlussbedingungen'] },
      { id: 'phase-9', title: 'Versionskontrolle und Änderungsmanagement', description: 'Änderungsverlauf etablieren, Kontrollmechanismen implementieren', order: 9, sectionKeys: ['aenderungsverlauf'] },
    ];
    
    for (const { id, title, description, order, sectionKeys } of phaseDefinitions) {
      // Check if any section in this phase has content or is required
      const hasContent = sectionKeys.some(key => {
        const section = goal.sections[key];
        return section && (section.content || section.required);
      });
      
      if (hasContent) {
        phases.push({
          id,
          title,
          description,
          order,
          taskIds: [], // Will be populated when tasks are created
        });
      }
    }
    
    return phases;
  }
  
  private createTasksFromTeamAndGoal(team: AgentTeam, goal: GoalClass): Task[] {
    const tasks: Task[] = [];
    let taskId = 1;
    
    // Add tasks from team (if any)
    for (const teamTask of team.tasks) {
      tasks.push({
        id: `task-${taskId++}`,
        title: teamTask.title || `Task ${taskId}`,
        description: teamTask.description || '',
        phaseId: this.assignTaskToPhase(teamTask, /* phases */ []),
        agentId: teamTask.agentId,
        skillRequirements: teamTask.skillRequirements || [],
        dependencies: teamTask.dependencies || [],
        status: 'pending',
        priority: teamTask.priority || 'medium',
        estimatedDuration: teamTask.estimatedDuration || 60, // Default 1 hour
      });
    }
    
    // Add goal-based tasks if no team tasks
    if (team.tasks.length === 0) {
      const sectionTasks = this.createSectionBasedTasks(goal);
      tasks.push(...sectionTasks);
    }
    
    // Ensure we have at least some tasks
    if (tasks.length === 0) {
      tasks.push({
        id: `task-1`,
        title: 'Implement goal',
        description: `Implement the goal: ${goal.metadata.title}`,
        phaseId: 'phase-3',
        agentId: team.agents[0]?.id || 'agent-1',
        skillRequirements: ['implementation'],
        dependencies: [],
        status: 'pending',
        priority: 'high',
        estimatedDuration: 240, // 4 hours
      });
    }
    
    return tasks;
  }
  
  private createSectionBasedTasks(goal: GoalClass): Task[] {
    const tasks: Task[] = [];
    let taskId = 1;
    
    // Map sections to task descriptions
    const sectionTasks: Record<string, string[]> = {
      'ziel': ['Define goal statement', 'Identify success metrics'],
      'hintergrund': ['Research background context', 'Identify stakeholders'],
      'erfolgskriterien': ['Define measurable criteria', 'Establish tracking methods'],
      'einschraenkungen': ['Document constraints', 'Plan constraint management'],
      'benoetigte-analyse': ['List required analyses', 'Plan analysis approach'],
      'abhaengigkeiten': ['Identify dependencies', 'Research dependency options'],
      'implementierungsplan': ['Break into phases', 'Define tasks and dependencies', 'Estimate effort'],
      'validierung': ['Define validation approach', 'Create validation criteria'],
      'tests': ['Design test strategy', 'Create test cases', 'Plan test execution'],
      'artefakte': ['List expected outputs', 'Define artifact specifications'],
      'dokumentation': ['Plan documentation', 'Create documentation outline'],
      'risiken': ['Identify potential risks', 'Plan risk mitigation strategies'],
      'rollback': ['Design rollback procedure', 'Define rollback triggers'],
      'abschlussbedingungen': ['Define definition of done', 'Establish quality gates'],
      'aenderungsverlauf': ['Set up version control', 'Define change request process'],
    };
    
    const phaseMap: Record<string, string> = {
      'ziel': 'phase-1',
      'hintergrund': 'phase-1',
      'erfolgskriterien': 'phase-1',
      'einschraenkungen': 'phase-1',
      'benoetigte-analyse': 'phase-2',
      'abhaengigkeiten': 'phase-2',
      'implementierungsplan': 'phase-3',
      'validierung': 'phase-4',
      'tests': 'phase-4',
      'artefakte': 'phase-5',
      'dokumentation': 'phase-5',
      'risiken': 'phase-6',
      'rollback': 'phase-7',
      'abschlussbedingungen': 'phase-8',
      'aenderungsverlauf': 'phase-9',
    };
    
    for (const [section, taskDescriptions] of Object.entries(sectionTasks)) {
      const sectionContent = goal.sections[section]?.content || '';
      const hasContent = sectionContent.trim().length > 0 || goal.sections[section]?.required === true;
      
      if (hasContent) {
        for (const taskDesc of taskDescriptions) {
          tasks.push({
            id: `task-${taskId++}`,
            title: taskDesc,
            description: `Task for ${section}: ${taskDesc}`,
            phaseId: phaseMap[section] || 'phase-1',
            agentId: this.assignAgentForSection(section, /* agents */ []),
            skillRequirements: this.getSkillsForSection(section),
            dependencies: [],
            status: 'pending',
            priority: this.getTaskPriority(section),
            estimatedDuration: this.estimateTaskDuration(section, taskDesc),
          });
        }
      }
    }
    
    return tasks;
  }
  
  private assignTaskToPhase(task: any, phases: Phase[]): string {
    // Simple assignment - in reality would be more sophisticated
    return phases.length > 0 ? phases[0].id : 'phase-1';
  }
  
  private assignAgentForSection(section: string, agents: AgentSpec[]): string | undefined {
    if (section.includes('analyse') || section.includes('research')) {
      return agents.find(a => a.type === 'explore')?.id;
    }
    if (section.includes('architektur') || section.includes('plan')) {
      return agents.find(a => a.type === 'plan')?.id;
    }
    if (section.includes('implementieren') || section.includes('build') || section.includes('code')) {
      return agents.find(a => a.type === 'build')?.id;
    }
    if (section.includes('test') || section.includes('validierung')) {
      return agents.find(a => a.type === 'review')?.id;
    }
    return agents[0]?.id;
  }
  
  private getSkillsForSection(section: string): string[] {
    const skillMap: Record<string, string[]> = {
      'ziel': ['goal-setting', 'clarification'],
      'hintergrund': ['research', 'background-analysis'],
      'erfolgskriterien': ['metrics-definition', 'measurement-planning'],
      'einschraenkungen': ['constraint-analysis', 'risk-assessment'],
      'benoetigte-analyse': ['analysis-planning', 'research-design'],
      'abhaengigkeiten': ['dependency-management', 'research'],
      'implementierungsplan': ['planning', 'task-breakdown', 'estimation'],
      'validierung': ['validation-planning', 'quality-assurance'],
      'tests': ['test-design', 'test-automation'],
      'artefakte': ['artifact-definition', 'specification-writing'],
      'dokumentation': ['technical-writing', 'communication'],
      'risiken': ['risk-identification', 'mitigation-planning'],
      'rollback': ['rollback-planning', 'contingency-planning'],
      'abschlussbedingungen': ['definition-of-done', 'quality-standards'],
      'aenderungsverlauf': ['version-control', 'change-management'],
    };
    
    return skillMap[section] || ['general'];
  }
  
  private getTaskPriority(section: string): 'low' | 'medium' | 'high' {
    const highPriority = ['ziel', 'erfolgskriterien', 'benoetigte-analyse', 'abschlussbedingungen'];
    const lowPriority = ['aenderungsverlauf'];
    
    if (highPriority.includes(section)) return 'high';
    if (lowPriority.includes(section)) return 'low';
    return 'medium';
  }
  
  private estimateTaskDuration(section: string, taskDesc: string): number {
    // Base durations in minutes
    const baseDurations: Record<string, number> = {
      'ziel': 30,
      'hintergrund': 60,
      'erfolgskriterien': 45,
      'einschraenkungen': 30,
      'benoetigte-analyse': 120, // Analysis can take time
      'abhaengigkeiten': 60,
      'implementierungsplan': 90,
      'validierung': 60,
      'tests': 90,
      'artefakte': 45,
      'dokumentation': 60,
      'risiken': 45,
      'rollback': 30,
      'aenderungsverlauf': 30,
    };
    
    return baseDurations[section] || 60;
  }
  
  private createDependencies(tasks: Task[]): Dependency[] {
    const dependencies: Dependency[] = [];
    
    // Simple sequential dependencies for now
    // In reality, would be based on actual task relationships
    for (let i = 1; i < tasks.length; i++) {
      dependencies.push({
        id: `dep-${i}`,
        from: tasks[i-1].id,
        to: tasks[i].id,
        type: 'blocks',
      });
    }
    
    return dependencies;
  }
  
  private estimateDuration(tasks: Task[]): number {
    // Sum of estimated durations, adjusted for parallelism
    const totalMinutes = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 60), 0);
    
    // Assume some parallelism - divide by estimated parallel factor
    const parallelFactor = Math.min(tasks.length, 3); // Assume max 3 tasks can run in parallel
    return Math.ceil(totalMinutes / parallelFactor);
  }
  
  private findCriticalPath(tasks: Task[], dependencies: Dependency[]): string[] {
    // Simplified critical path - just return first few tasks for now
    // In reality, would implement proper critical path algorithm
    if (tasks.length === 0) return [];
    
    // Return first 3 tasks or all if less than 3
    const count = Math.min(3, tasks.length);
    return tasks.slice(0, count).map(t => t.id);
  }
}