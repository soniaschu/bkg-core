// BKG Goal Orchestrator - Team Builder
// Composes agent teams based on capabilities and goal requirements

import { 
  CapabilityMatrix, 
  GoalClass, 
  AgentTeam, 
  AgentSpec,
  TeamStrategyPlugin 
} from './types.js';
import { PluginRegistry } from './plugin-registry.js';

export class TeamBuilder {
  private pluginRegistry: PluginRegistry;
  
  constructor(pluginRegistry: PluginRegistry) {
    this.pluginRegistry = pluginRegistry;
  }
  
  async compose(capabilities: CapabilityMatrix, goal: GoalClass): Promise<AgentTeam> {
    // Get all team strategies from plugins
    const strategies = await this.pluginRegistry.getTeamStrategies();
    
    // Use the highest priority strategy
    const bestStrategy = strategies.reduce((best, current) => 
      (current.priority || 0) > (best.priority || 0) ? current : best
    , strategies[0]);
    
    // Compose team using the strategy
    const teamSpec = await bestStrategy.compose(capabilities, goal);
    
    // Convert to internal format
    const team: AgentTeam = {
      id: `team-${goal.id}-${Date.now()}`,
      goalId: goal.id,
      agents: teamSpec.agents || [],
      skills: {}, // Will be filled by skill matcher
      tasks: teamSpec.tasks || [],
      createdAt: new Date().toISOString(),
      status: 'forming',
    };
    
    return team;
  }
  
  // Default team composition strategy (used if no plugins provide one)
  async defaultCompose(capabilities: CapabilityMatrix, goal: GoalClass): Promise<{
    agents: AgentSpec[];
    tasks: any[];
  }> {
    const agents: AgentSpec[] = [];
    
    // Always include a manager agent
    agents.push({
      id: `agent-manager-${goal.id}`,
      name: 'Manager Agent',
      type: 'build',
      prompt: `Manage the execution of goal: ${goal.metadata.title}. Coordinate team members, track progress, ensure quality standards are met.`,
      requiredSkills: ['planning', 'organization', 'communication'],
      preferredSkills: ['leadership', 'goal-setting', 'progress-tracking'],
      config: {},
    });
    
    // Add analyst agent if analysis is needed
    const hasAnalysisNeeded = goal.sections['benoetigte-analyse']?.content?.includes('ERFORDERT ANALYSE');
    if (hasAnalysisNeeded) {
      agents.push({
        id: `agent-analyst-${goal.id}`,
        name: 'Analyst Agent',
        type: 'explore',
        prompt: `Analyze the goal requirements and identify what information is needed. Review available data sources and identify gaps.`,
        requiredSkills: ['analysis', 'research', 'investigation'],
        preferredSkills: ['data-analysis', 'critical-thinking', 'documentation'],
        config: {},
      });
    }
    
    // Add architect agent if architectural decisions needed
    const hasArchitectureNeeded = goal.sections['einschraenkungen']?.content?.includes('Architektur') || 
                               goal.sections['implementierungsplan']?.content?.includes('Architektur');
    if (hasArchitectureNeeded) {
      agents.push({
        id: `agent-architect-${goal.id}`,
        name: 'Architect Agent',
        type: 'plan',
        prompt: `Design the technical architecture for implementing the goal. Consider scalability, maintainability, and best practices.`,
        requiredSkills: ['architecture', 'design', 'system-thinking'],
        preferredSkills: ['scalability', 'maintainability', 'patterns'],
        config: {},
      });
    }
    
    // Add builder agents based on goal template
    const templateType = goal.metadata.template;
    if (templateType === 'implementation' || templateType === 'migration') {
      // Add language-specific builders based on project inventory
      const langCounts = this.getLanguageCounts(capabilities);
      const topLanguage = Object.entries(langCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'TypeScript';
      
      agents.push({
        id: `agent-builder-${goal.id}-${topLanguage}`,
        name: `${topLanguage} Builder Agent`,
        type: 'build',
        prompt: `Implement the goal using ${topLanguage}. Follow best practices and write clean, maintainable code.`,
        requiredSkills: [topLanguage.toLowerCase(), 'programming', 'best-practices'],
        preferredSkills: ['testing', 'debugging', 'documentation'],
        config: {},
      });
    }
    
    // Always include a tester agent
    agents.push({
      id: `agent-tester-${goal.id}`,
      name: 'Tester Agent',
      type: 'review',
      prompt: `Ensure quality of implementation by creating and executing tests. Verify that all success criteria are met.`,
      requiredSkills: ['testing', 'validation', 'quality-assurance'],
      preferredSkills: ['test-automation', 'test-design', 'bug-hunting'],
      config: {},
    });
    
    // Add a reviewer agent
    agents.push({
      id: `agent-reviewer-${goal.id}`,
      name: 'Reviewer Agent',
      type: 'review',
      prompt: `Review the work of other team members for correctness, completeness, and adherence to standards.`,
      requiredSkills: ['review', 'critical-thinking', 'attention-to-detail'],
      preferredSkills: ['mentoring', 'quality-standards', 'feedback'],
      config: {},
    });
    
    // Generate tasks based on goal sections
    const tasks = this.generateTasksFromGoal(goal);
    
    return { agents, tasks };
  }
  
  private getLanguageCounts(capabilities: CapabilityMatrix): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const repo of capabilities.repositories) {
      for (const lang of repo.languages) {
        counts[lang.language] = (counts[lang.language] || 0) + lang.percentage;
      }
    }
    
    return counts;
  }
  
  private generateTasksFromGoal(goal: GoalClass): any[] {
    const tasks: any[] = [];
    let taskId = 1;
    
    // Add tasks for each major section
    const sectionTasks: Record<string, string[]> = {
      'ziel': ['Clarify goal definition', 'Identify success metrics'],
      'hintergrund': ['Gather background information', 'Identify stakeholders'],
      'erfolgskriterien': ['Define measurable success criteria', 'Establish measurement methods'],
      'einschraenkungen': ['Identify constraints and limitations', 'Plan for constraint management'],
      'benoetigte-analyse': ['Identify required analyses', 'Plan analysis approach'],
      'abhaengigkeiten': ['List dependencies', 'Plan dependency management'],
      'implementierungsplan': ['Break down into phases', 'Define tasks and dependencies'],
      'validierung': ['Define validation approach', 'Create validation criteria'],
      'tests': ['Define test strategy', 'Create test cases'],
      'artefakte': ['Identify expected artifacts', 'Define artifact specifications'],
      'dokumentation': ['Plan documentation', 'Define documentation standards'],
      'risiken': ['Identify risks', 'Plan risk mitigation'],
      'rollback': ['Design rollback plan', 'Define rollback procedures'],
      'abschlussbedingungen': ['Define definition of done', 'Establish completion criteria'],
      'aenderungsverlauf': ['Set up version tracking', 'Define change process'],
    };
    
    for (const [section, taskList] of Object.entries(sectionTasks)) {
      const sectionContent = goal.sections[section]?.content || '';
      if (sectionContent || section === 'implementierungsplan') { // Always add implementation plan tasks
        for (const taskDesc of taskList) {
          tasks.push({
            id: `task-${taskId++}`,
            title: taskDesc,
            description: `Task for section ${section}: ${taskDesc}`,
            phaseId: `phase-${this.getPhaseForSection(section)}`,
            agentId: this.assignAgentToTask(section, /* agents */ []),
            skillRequirements: this.getSkillsForSection(section),
            dependencies: [],
            status: 'pending',
          });
        }
      }
    }
    
    // Ensure we have at least some tasks
    if (tasks.length === 0) {
      tasks.push({
        id: `task-1`,
        title: 'Implement goal',
        description: `Implement the goal: ${goal.metadata.title}`,
        phaseId: 'phase-1',
        agentId: 'agent-builder-1',
        skillRequirements: ['implementation'],
        dependencies: [],
        status: 'pending',
      });
    }
    
    return tasks;
  }
  
  private getPhaseForSection(section: string): string {
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
    
    return phaseMap[section] || 'phase-1';
  }
  
  private assignAgentToTask(section: string, agents: AgentSpec[]): string | undefined {
    // Simple assignment logic
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
    return agents[0]?.id; // Default to first agent
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
}