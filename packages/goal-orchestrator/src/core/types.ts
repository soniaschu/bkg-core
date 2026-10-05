// BKG Goal Orchestrator - Core Types

import { Goal, Skill } from '@bkg/goal-builder';

export interface OrchestrationResult {
  success: boolean;
  goalId: string;
  teamId: string;
  planId: string;
  visualizationUrl?: string;
  approvalDecision: ApprovalDecision;
  executionStarted: boolean;
  message: string;
}

export interface AgentTeam {
  id: string;
  goalId: string;
  agents: AgentSpec[];
  skills: Record<string, string[]>; // agentId -> skillNames
  tasks: Task[];
  createdAt: string;
  status: 'forming' | 'ready' | 'executing' | 'completed' | 'failed';
}

export interface AgentSpec {
  id: string;
  name: string;
  type: 'build' | 'plan' | 'explore' | 'review' | 'analyst' | 'architect' | 'tester' | 'security' | 'devops';
  prompt: string;
  requiredSkills: string[];
  preferredSkills: string[];
  config: Record<string, any>;
}

export interface SkillAssignment {
  agentId: string;
  skill: string;
  proficiency: 'expert' | 'intermediate' | 'basic';
  source: 'global' | 'project' | 'built-in';
}

export interface ExecutionPlan {
  id: string;
  goalId: string;
  phases: Phase[];
  tasks: Task[];
  dependencies: Dependency[];
  agents: AgentSpec[];
  skills: Skill[];
  status: 'draft' | 'ready' | 'executing' | 'completed' | 'failed';
  createdAt: string;
  estimatedDuration: number; // in minutes
  criticalPath: string[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  order: number;
  taskIds: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  phaseId: string;
  agentId?: string;
  skillRequirements: string[];
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  result?: any;
}

export interface Dependency {
  from: string; // taskId
  to: string;   // taskId
  type: 'blocks' | 'relates' | 'duplicates';
}

export interface ApprovalDecision {
  decision: 'start' | 'cancel' | 'edit_plan' | 'edit_team' | 'edit_skills' | 'reanalyze' | 'replan' | 'add_agent' | 'remove_agent';
  modifications: Record<string, any>;
  confirmedAt: string;
  userId: string;
}

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  hooks: string[];
  capabilities: string[];
}

// Plugin Interfaces
export interface AnalyzerPlugin {
  name: string;
  priority: number;
  analyze(context: AnalysisContext): Promise<AnalysisResult>;
}

export interface TeamStrategyPlugin {
  name: string;
  compose(capabilities: CapabilityMatrix, goal: Goal): Promise<AgentTeam>;
}

export interface SkillMatcherPlugin {
  name: string;
  match(agent: AgentSpec, task: Task, availableSkills: Skill[]): Promise<Skill[]>;
}

export interface PlannerPlugin {
  name: string;
  generate(team: AgentTeam, goal: Goal): Promise<ExecutionPlan>;
}

export interface VisualizerPlugin {
  name: string;
  render(plan: ExecutionPlan): Promise<VisualizationResult>;
}

export interface ExporterPlugin {
  name: string;
  export(goal: Goal, format: 'md'|'json'|'yaml'): Promise<string>;
}

export interface ApprovalPlugin {
  name: string;
  prompt(context: ApprovalContext): Promise<ApprovalDecision>;
}

// Context Types
export interface AnalysisContext {
  goal: Goal;
  projectInventory: any;
  capabilities: CapabilityMatrix;
}

export interface AnalysisResult {
  analyses: Record<string, any>;
  insights: string[];
  recommendations: string[];
}

export interface CapabilityMatrix {
  repositories: RepositoryInfo[];
  workspace: WorkspaceStructure;
  agents: AgentInfo[];
  skills: SkillInventory;
  mcpServers: MCPServerInfo[];
  plugins: PluginInfo[];
  commands: CommandInfo[];
  templates: TemplateInfo[];
  cicd: CICDInfo;
  docker: DockerInfo;
  containers: ContainerInfo;
  buildSystem: BuildSystemInfo;
  testSystem: TestSystemInfo;
  documentation: DocumentationInfo;
  gitStatus: GitInfo;
}

export interface VisualizationResult {
  type: 'dag' | 'gantt' | 'kanban' | 'timeline';
  data: any;
  url?: string;
  mimeType: string;
}