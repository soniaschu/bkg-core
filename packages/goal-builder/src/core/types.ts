// BKG Goal Builder - Core Types

export interface Goal {
  id: string;
  version: number;
  metadata: GoalMetadata;
  sections: Record<string, GoalSection>;
}

export interface GoalMetadata {
  title: string;
  description: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  status: GoalStatus;
  tags: string[];
  author?: string;
}

export type GoalStatus = 
  | 'analysis_pending' 
  | 'ready' 
  | 'executing' 
  | 'completed' 
  | 'failed' 
  | 'archived';

export interface GoalSection {
  title: string;
  content: string;
  required: boolean;
  completed: boolean;
  order: number;
  validation?: SectionValidation;
}

export interface SectionValidation {
  minLength?: number;
  maxLength?: number;
  forbiddenTerms?: string[];
  requiredTerms?: string[];
  pattern?: string;
}

export interface AnalysisTask {
  id: string;
  type: 'repository' | 'api' | 'pattern' | 'dependency' | 'architecture' | 'custom';
  target: string;
  question: string;
  requiredBy: string; // section name
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Template {
  name: string;
  description: string;
  sections: TemplateSection[];
  triggers: string[]; // keywords that suggest this template
}

export interface TemplateSection {
  key: string;
  title: string;
  description: string;
  required: boolean;
  defaultContent?: string;
  validation?: SectionValidation;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  section: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  section: string;
  message: string;
  code: string;
}

export interface Skill {
  name: string;
  description: string;
  triggers: string[];
  category: 'process' | 'technique' | 'pattern' | 'reference' | 'verification';
  dependencies: string[];
  testScenarios: any[];
}

export interface ProjectInventory {
  repositories: RepositoryInventory[];
  workspace: WorkspaceStructure;
  agents: AgentInventory;
  skills: SkillInventory;
  mcpServers: MCPServerInventory;
  plugins: PluginInventory;
  commands: CommandInventory;
  templates: TemplateInventory;
  cicd: CICDInventory;
  docker: DockerInventory;
  containers: ContainerInventory;
  buildSystem: BuildSystemInfo;
  testSystem: TestSystemInfo;
  documentation: DocumentationInventory;
  gitStatus: GitStatus;
}

export interface RepositoryInventory {
  path: string;
  name: string;
  type: 'git' | 'svn' | 'other';
  structure: FileTree;
  languages: LanguageInfo[];
  dependencies: DependencyInfo[];
  configs: ConfigFile[];
  architecturePatterns: string[];
  testCoverage?: number;
}

export interface FileTree {
  [path: string]: FileTree | { type: 'file' | 'dir'; size?: number };
}

export interface LanguageInfo {
  language: string;
  percentage: number;
  files: number;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'production' | 'development' | 'peer' | 'optional';
}

export interface ConfigFile {
  path: string;
  type: 'package.json' | 'tsconfig.json' | 'dockerfile' | 'ci' | 'other';
  content: any;
}

export interface WorkspaceStructure {
  root: string;
  worktrees: WorktreeInfo[];
  submodules: SubmoduleInfo[];
}

export interface WorktreeInfo {
  path: string;
  branch: string;
  commit: string;
}

export interface SubmoduleInfo {
  path: string;
  url: string;
  commit: string;
}

export interface AgentInventory {
  available: AgentInfo[];
  active: ActiveAgentInfo[];
}

export interface AgentInfo {
  name: string;
  type: string;
  description: string;
  capabilities: string[];
}

export interface ActiveAgentInfo {
  name: string;
  id: string;
  status: string;
  currentTask?: string;
}

export interface SkillInventory {
  global: SkillInfo[];
  project: SkillInfo[];
  categories: Record<string, SkillInfo[]>;
}

export interface SkillInfo {
  name: string;
  description: string;
  triggers: string[];
  category: string;
  version: string;
}

export interface MCPServerInventory {
  servers: MCPServerInfo[];
}

export interface MCPServerInfo {
  name: string;
  transport: 'stdio' | 'http' | 'sse';
  tools: string[];
  resources: string[];
  prompts: string[];
}

export interface PluginInventory {
  plugins: PluginInfo[];
}

export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  commands: string[];
  hooks: string[];
}

export interface CommandInventory {
  commands: CommandInfo[];
}

export interface CommandInfo {
  name: string;
  description: string;
  plugin: string;
}

export interface TemplateInventory {
  templates: TemplateInfo[];
}

export interface TemplateInfo {
  name: string;
  description: string;
  path: string;
}

export interface CICDInventory {
  providers: CICDProviderInfo[];
  pipelines: PipelineInfo[];
}

export interface CICDProviderInfo {
  name: string;
  type: 'github' | 'gitlab' | 'jenkins' | 'circleci' | 'other';
  configPath?: string;
}

export interface PipelineInfo {
  name: string;
  file: string;
  triggers: string[];
}

export interface DockerInventory {
  dockerfiles: DockerfileInfo[];
  composeFiles: ComposeFileInfo[];
}

export interface DockerfileInfo {
  path: string;
  baseImage: string;
  exposedPorts: number[];
}

export interface ComposeFileInfo {
  path: string;
  services: string[];
}

export interface ContainerInventory {
  runtime: 'docker' | 'podman' | 'containerd' | 'other';
  images: ContainerImageInfo[];
}

export interface ContainerImageInfo {
  name: string;
  tag: string;
  size: number;
}

export interface BuildSystemInfo {
  type: 'bun' | 'npm' | 'yarn' | 'pnpm' | 'make' | 'cmake' | 'gradle' | 'maven' | 'cargo' | 'go' | 'other';
  configFiles: string[];
  scripts: Record<string, string>;
}

export interface TestSystemInfo {
  framework: 'bun' | 'jest' | 'vitest' | 'mocha' | 'pytest' | 'go test' | 'cargo test' | 'other';
  configFiles: string[];
  coverage?: number;
}

export interface DocumentationInventory {
  files: DocFile[];
  structure: DocStructure;
}

export interface DocFile {
  path: string;
  type: 'markdown' | 'html' | 'pdf' | 'other';
  title?: string;
}

export interface DocStructure {
  readme: boolean;
  contributing: boolean;
  license: boolean;
  changelog: boolean;
  apiDocs: boolean;
}

export interface GitStatus {
  branch: string;
  commit: string;
  clean: boolean;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
  remotes: RemoteInfo[];
}

export interface RemoteInfo {
  name: string;
  url: string;
  fetch: string;
  push: string;
}