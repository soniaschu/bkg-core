// BKG Goal Orchestrator - Capability Matrix
// Builds a matrix of project capabilities for team composition

import { GoalClass } from '@bkg/goal-builder';

export interface RepositoryInfo {
  path: string;
  name: string;
  languages: Array<{ language: string; percentage: number }>;
  dependencies: Array<{ name: string; type: string }>;
  architecturePatterns: string[];
}

export interface WorkspaceStructure {
  root: string;
  worktrees: Array<{ path: string; branch: string }>;
}

export interface AgentInfo {
  name: string;
  type: string;
  description: string;
  capabilities: string[];
}

export interface SkillInventory {
  global: Array<{ name: string; description: string; triggers: string[] }>;
  project: Array<{ name: string; description: string; triggers: string[] }>;
  categories: Record<string, Array<{ name: string; description: string }>>;
}

export interface MCPServerInfo {
  name: string;
  transport: string;
  tools: string[];
  resources: string[];
  prompts: string[];
}

export interface PluginInfo {
  name: string;
  version: string;
  description: string;
}

export interface CommandInfo {
  name: string;
  description: string;
}

export interface TemplateInfo {
  name: string;
  description: string;
}

export interface CICDInfo {
  providers: Array<{ name: string; type: string }>;
  pipelines: Array<{ name: string; triggers: string[] }>;
}

export interface DockerInfo {
  dockerfiles: Array<{ path: string; baseImage: string }>;
  composeFiles: Array<{ path: string; services: string[] }>;
}

export interface ContainerInfo {
  runtime: string;
  images: Array<{ name: string; tag: string }>;
}

export interface BuildSystemInfo {
  type: string;
  configFiles: string[];
  scripts: Record<string, string>;
}

export interface TestSystemInfo {
  framework: string;
  configFiles: string[];
}

export interface DocumentationInfo {
  files: Array<{ path: string; type: string; title?: string }>;
  structure: Record<string, boolean>;
}

export interface GitInfo {
  branch: string;
  commit: string;
  clean: boolean;
  ahead: number;
  behind: number;
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
  gitInfo: GitInfo;
}

export class CapabilityMatrix {
  private goal: GoalClass;
  private inventory: any;
  
  constructor(goal: GoalClass, inventory: any) {
    this.goal = goal;
    this.inventory = inventory;
  }
  
  build(): CapabilityMatrix {
    return {
      repositories: this.mapRepositories(this.inventory.repositories || []),
      workspace: this.mapWorkspace(this.inventory.workspace),
      agents: this.mapAgents(this.inventory.agents),
      skills: this.mapSkills(this.inventory.skills),
      mcpServers: this.mapMCPservers(this.inventory.mcpServers),
      plugins: this.mapPlugins(this.inventory.plugins),
      commands: this.mapCommands(this.inventory.commands),
      templates: this.mapTemplates(this.inventory.templates),
      cicd: this.mapCICD(this.inventory.cicd),
      docker: this.mapDocker(this.inventory.docker),
      containers: this.mapContainers(this.inventory.containers),
      buildSystem: this.mapBuildSystem(this.inventory.buildSystem),
      testSystem: this.mapTestSystem(this.inventory.testSystem),
      documentation: this.mapDocumentation(this.inventory.documentation),
      gitInfo: this.mapGitInfo(this.inventory.gitStatus),
    };
  }
  
  private mapRepositories(repos: any[]): RepositoryInfo[] {
    return repos.map((repo: any) => ({
      path: repo.path || '',
      name: repo.name || '',
      languages: repo.languages || [],
      dependencies: repo.dependencies || [],
      architecturePatterns: repo.architecturePatterns || [],
    }));
  }
  
  private mapWorkspace(workspace: any): WorkspaceStructure {
    return {
      root: workspace?.root || '',
      worktrees: workspace?.worktrees?.map((wt: any) => ({
        path: wt.path || '',
        branch: wt.branch || ''
      })) || [],
    };
  }
  
  private mapAgents(agents: any): AgentInfo[] {
    if (!agents) return [];
    const { available = [] } = agents;
    return available.map((agent: any) => ({
      name: agent.name || '',
      type: agent.type || '',
      description: agent.description || '',
      capabilities: agent.capabilities || [],
    }));
  }
  
  private mapSkills(skills: any): SkillInventory {
    if (!skills) return { global: [], project: [], categories: {} };
    return {
      global: skills.global || [],
      project: skills.project || [],
      categories: skills.categories || {},
    };
  }
  
  private mapMCPservers(servers: any[]): MCPServerInfo[] {
    return (servers || []).map((server: any) => ({
      name: server.name || '',
      transport: server.transport || 'stdio',
      tools: server.tools || [],
      resources: server.resources || [],
      prompts: server.prompts || [],
    }));
  }
  
  private mapPlugins(plugins: any[]): PluginInfo[] {
    return (plugins || []).map((plugin: any) => ({
      name: plugin.name || '',
      version: plugin.version || '',
      description: plugin.description || '',
    }));
  }
  
  private mapCommands(commands: any[]): CommandInfo[] {
    return (commands || []).map((cmd: any) => ({
      name: cmd.name || '',
      description: cmd.description || '',
    }));
  }
  
  private mapTemplates(templates: any[]): TemplateInfo[] {
    return (templates || []).map((tmpl: any) => ({
      name: tmpl.name || '',
      description: tmpl.description || '',
    }));
  }
  
  private mapCICD(cicd: any): CICDInfo {
    return {
      providers: (cicd?.providers || []).map((p: any) => ({
        name: p.name || '',
        type: p.type || 'unknown',
      })),
      pipelines: (cicd?.pipelines || []).map((p: any) => ({
        name: p.name || '',
        triggers: p.triggers || [],
      })),
    };
  }
  
  private mapDocker(docker: any): DockerInfo {
    return {
      dockerfiles: (docker?.dockerfiles || []).map((df: any) => ({
        path: df.path || '',
        baseImage: df.baseImage || '',
      })),
      composeFiles: (docker?.composeFiles || []).map((cf: any) => ({
        path: cf.path || '',
        services: cf.services || [],
      })),
    };
  }
  
  private mapContainers(containers: any): ContainerInfo {
    return {
      runtime: containers?.runtime || 'unknown',
      images: (containers?.images || []).map((img: any) => ({
        name: img.name || '',
        tag: img.tag || '',
      })),
    };
  }
  
  private mapBuildSystem(bs: any): BuildSystemInfo {
    return {
      type: bs?.type || 'unknown',
      configFiles: bs?.configFiles || [],
      scripts: bs?.scripts || {},
    };
  }
  
  private mapTestSystem(ts: any): TestSystemInfo {
    return {
      framework: ts?.framework || 'unknown',
      configFiles: ts?.configFiles || [],
    };
  }
  
  private mapDocumentation(doc: any): DocumentationInfo {
    return {
      files: (doc?.files || []).map((f: any) => ({
        path: f.path || '',
        type: f.type || 'unknown',
        title: f.title,
      })),
      structure: doc?.structure || {},
    };
  }
  
  private mapGitInfo(git: any): GitInfo {
    return {
      branch: git?.branch || 'unknown',
      commit: git?.commit || 'unknown',
      clean: git?.clean ?? false,
      ahead: git?.ahead ?? 0,
      behind: git?.behind ?? 0,
    };
  }
}