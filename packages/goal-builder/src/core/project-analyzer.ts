// BKG Goal Builder - Project Analyzer
// Comprehensive project analysis for goal creation

import { ProjectInventory, RepositoryInventory, WorkspaceStructure } from './types.js';
import { 
  ensureDir, 
  readJsonFile, 
  writeJsonFile, 
  readFile, 
  listFiles, 
  fileExists 
} from '@bkg/plan-engine-core';
import { promises as fs } from 'fs';
import { join, relative, basename, extname } from 'path';

export class ProjectAnalyzer {
  private projectDir: string;
  
  constructor(projectDir: string) {
    this.projectDir = projectDir;
  }
  
  async analyze(): Promise<ProjectInventory> {
    const [repositories, workspace, agents, skills, mcpServers, plugins, commands, templates, cicd, docker, containers, buildSystem, testSystem, documentation, gitStatus] = await Promise.all([
      this.analyzeRepositories(),
      this.analyzeWorkspace(),
      this.analyzeAgents(),
      this.analyzeSkills(),
      this.analyzeMCPServers(),
      this.analyzePlugins(),
      this.analyzeCommands(),
      this.analyzeTemplates(),
      this.analyzeCICD(),
      this.analyzeDocker(),
      this.analyzeContainers(),
      this.analyzeBuildSystem(),
      this.analyzeTestSystem(),
      this.analyzeDocumentation(),
      this.analyzeGitStatus(),
    ]);
    
    return {
      repositories,
      workspace,
      agents,
      skills,
      mcpServers,
      plugins,
      commands,
      templates,
      cicd,
      docker,
      containers,
      buildSystem,
      testSystem,
      documentation,
      gitStatus,
    };
  }
  
  private async analyzeRepositories(): Promise<RepositoryInventory[]> {
    const repos: RepositoryInventory[] = [];
    
    // Check for git repos in project dir and subdirs
    const gitDirs = await this.findGitDirectories(this.projectDir);
    
    for (const gitDir of gitDirs) {
      const repo = await this.analyzeRepository(gitDir);
      repos.push(repo);
    }
    
    return repos;
  }
  
  private async findGitDirectories(root: string): Promise<string[]> {
    const dirs: string[] = [];
    
    async function scan(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.name === '.git') {
            dirs.push(dir);
          } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await scan(join(dir, entry.name));
          }
        }
      } catch {}
    }
    
    await scan(root);
    return dirs;
  }
  
  private async analyzeRepository(repoPath: string): Promise<RepositoryInventory> {
    const structure = await this.buildFileTree(repoPath);
    const languages = await this.detectLanguages(repoPath);
    const dependencies = await this.extractDependencies(repoPath);
    const configs = await this.findConfigFiles(repoPath);
    const architecturePatterns = await this.detectArchitecturePatterns(repoPath);
    
    return {
      path: repoPath,
      name: basename(repoPath),
      type: 'git',
      structure,
      languages,
      dependencies,
      configs,
      architecturePatterns
    };
  }
  
  private async buildFileTree(dir: string, maxDepth: number = 3): Promise<any> {
    const tree: any = {};
    
    async function scan(currentDir: string, currentTree: any, depth: number) {
      if (depth > maxDepth) return;
      
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
          
          const fullPath = join(currentDir, entry.name);
          
          if (entry.isDirectory()) {
            currentTree[entry.name] = {};
            await scan(fullPath, currentTree[entry.name], depth + 1);
          } else {
            const stats = await fs.stat(fullPath);
            currentTree[entry.name] = { type: 'file', size: stats.size };
          }
        }
      } catch {}
    }
    
    await scan(dir, tree, 0);
    return tree;
  }
  
  private async detectLanguages(repoPath: string): Promise<any[]> {
    const extensions: Record<string, string> = {
      '.ts': 'TypeScript',
      '.js': 'JavaScript',
      '.tsx': 'TypeScript (React)',
      '.jsx': 'JavaScript (React)',
      '.py': 'Python',
      '.rs': 'Rust',
      '.go': 'Go',
      '.java': 'Java',
      '.cs': 'C#',
      '.cpp': 'C++',
      '.c': 'C',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.clj': 'Clojure',
      '.hs': 'Haskell',
      '.ml': 'OCaml',
      '.fs': 'F#',
      '.dart': 'Dart',
      '.lua': 'Lua',
      '.r': 'R',
      '.jl': 'Julia',
    };
    
    const langCounts: Record<string, number> = {};
    let totalFiles = 0;
    
    async function scan(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
          
          const fullPath = join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await scan(fullPath);
          } else {
            const ext = extname(entry.name);
            if (extensions[ext]) {
              langCounts[extensions[ext]] = (langCounts[extensions[ext]] || 0) + 1;
              totalFiles++;
            }
          }
        }
      } catch {}
    }
    
    await scan(repoPath);
    
    return Object.entries(langCounts)
      .map(([language, count]) => ({ language, percentage: Math.round((count / totalFiles) * 100), files: count }))
      .sort((a, b) => b.percentage - a.percentage);
  }
  
  private async extractDependencies(repoPath: string): Promise<any[]> {
    const deps: any[] = [];
    
    // package.json
    const pkgPath = join(repoPath, 'package.json');
    const pkg = await readJsonFile(pkgPath);
    if (pkg) {
      for (const [name, version] of Object.entries(pkg.dependencies || {})) {
        deps.push({ name, version: version as string, type: 'production' });
      }
      for (const [name, volume] of Object.entries(pkg.devDependencies || {})) {
        deps.push({ name, volume: volume as string, type: 'development' });
      }
      for (const [name, volume] of Object.entries(pkg.peerDependencies || {})) {
        deps.push({ name, volume: volume as string, type: 'peer' });
      }
      for (const [name, volume] of Object.entries(pkg.optionalDependencies || {})) {
        deps.push({ name, volume: volume as string, type: 'optional' });
      }
    }
    
    // Cargo.toml
    const cargoPath = join(repoPath, 'Cargo.toml');
    if (await fileExists(cargoPath)) {
      // Would parse Cargo.toml
    }
    
    // go.mod
    const goModPath = join(repoPath, 'go.mod');
    if (await fileExists(goModPath)) {
      // Would parse go.mod
    }
    
    // requirements.txt / pyproject.toml
    const pyPaths = ['requirements.txt', 'pyproject.toml', 'setup.py'];
    for (const pyPath of pyPaths) {
      const fullPath = join(repoPath, pyPath);
      if (await fileExists(fullPath)) {
        // Would parse Python deps
      }
    }
    
    return deps;
  }
  
  private async isRegularFile(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  private async dirHasFiles(dir: string, extensions?: string[]): Promise<boolean> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      return entries.some((entry) => {
        if (!entry.isFile()) return false;
        if (!extensions || extensions.length === 0) return true;
        return extensions.some((ext) => entry.name.endsWith(ext));
      });
    } catch {
      return false;
    }
  }

  private async findConfigFiles(repoPath: string): Promise<any[]> {
    const configs: any[] = [];
    const configPatterns = [
      'package.json', 'tsconfig.json', 'jsconfig.json',
      'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
      '.github/workflows', '.gitlab-ci.yml', 'Jenkinsfile', '.circleci',
      'Makefile', 'CMakeLists.txt', 'build.gradle', 'pom.xml',
      'cargo.toml', 'go.mod', 'pyproject.toml', 'setup.cfg',
      'README.md', 'CONTRIBUTING.md', 'LICENSE', 'CHANGELOG.md',
    ];
    
    for (const pattern of configPatterns) {
      const fullPath = join(repoPath, pattern);
      // fileExists() is fs.access(F_OK), which also resolves for DIRECTORIES.
      // Patterns like '.github/workflows' and '.circleci' are directories, so
      // readFile() would throw EISDIR and abort the whole analysis. Only read
      // regular files; directory patterns are covered by detectArchitecturePatterns().
      if (await this.isRegularFile(fullPath)) {
        const content = await readFile(fullPath);
        let type = 'other';
        if (pattern.includes('package.json')) type = 'package.json';
        else if (pattern.includes('tsconfig')) type = 'tsconfig.json';
        else if (pattern.includes('Dockerfile') || pattern.includes('docker-compose')) type = 'docker';
        else if (pattern.includes('workflow') || pattern.includes('gitlab-ci') || pattern.includes('Jenkinsfile') || pattern.includes('circleci')) type = 'ci';
        
        configs.push({ path: pattern, type, type, content });
      }
    }
    
    return configs;
  }
  
  private async detectArchitecturePatterns(repoPath: string): Promise<string[]> {
    const patterns: string[] = [];
    
    // Check for common patterns
    const hasPackageJson = await fileExists(join(repoPath, 'package.json'));
    const hasTsConfig = await fileExists(join(repoPath, 'tsconfig.json'));
    const hasDockerfile = await fileExists(join(repoPath, 'Dockerfile'));
    const hasDockerCompose = await fileExists(join(repoPath, 'docker-compose.yml')) || await fileExists(join(repoPath, 'docker-compose.yaml'));
    // '.github/workflows' is normally a DIRECTORY, so fileExists() alone would
    // report true even when it holds no workflow. Require an actual .yml/.yaml.
    const hasGitHubActions = await this.dirHasFiles(join(repoPath, '.github/workflows'), ['.yml', '.yaml']);
    const hasGitLabCI = await fileExists(join(repoPath, '.gitlab-ci.yml'));
    
    if (hasPackageJson && hasTsConfig) patterns.push('TypeScript Project');
    if (hasPackageJson) patterns.push('Node.js Project');
    if (hasDockerfile) patterns.push('Containerized');
    if (hasDockerCompose) patterns.push('Multi-container');
    if (hasGitHubActions) patterns.push('GitHub Actions CI');
    if (hasGitLabCI) patterns.push('GitLab CI');
    
    // Check for specific frameworks
    const pkg = await readJsonFile(join(repoPath, 'package.json'));
    if (pkg) {
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps['next']) patterns.push('Next.js');
      if (allDeps['react']) patterns.push('React');
      if (allDeps['vue']) patterns.push('Vue.js');
      if (allDeps['svelte']) patterns.push('Svelte');
      if (allDeps['@angular/core']) patterns.push('Angular');
      if (allDeps['nest']) patterns.push('NestJS');
      if (allDeps['fastify']) patterns.push('Fastify');
      if (allDeps['express']) patterns.push('Express');
      if (allDeps['@opencode-ai/sdk']) patterns.push('OpenCode Plugin');
    }
    
    return patterns;
  }
  
  private async analyzeWorkspace(): Promise<WorkspaceStructure> {
    const worktrees: any[] = [];
    const submodules: any[] = [];
    
    try {
      // Check for git worktrees
      const gitDir = join(this.projectDir, '.git');
      if (await fileExists(gitDir)) {
        const worktreesFile = join(gitDir, 'worktrees');
        if (await fileExists(worktreesFile)) {
          // Would parse worktrees
        }
      }
      
      // Check for submodules
      const gitmodules = join(this.projectDir, '.gitmodules');
      if (await fileExists(gitmodules)) {
        const content = await readFile(gitmodules);
        // Would parse submodules
      }
    } catch {}
    
    return {
      root: this.projectDir,
      worktrees,
      submodules,
    };
  }
  
  private async analyzeAgents(): Promise<any> {
    // Check for agent configurations
    const agents: any[] = [];
    const activeAgents: any[] = [];
    
    // Would check for agent configs in .opencode, .claude, etc.
    
    return { available: agents, active: activeAgents };
  }
  
  private async analyzeSkills(): Promise<any> {
    const skills: any[] = [];
    const categories: Record<string, any[]> = {};
    
    // Global skills
    const globalSkillsDir = join(process.env.HOME || '', '.config/opencode/skills');
    if (await fileExists(globalSkillsDir)) {
      const skillDirs = await listFiles(globalSkillsDir);
      for (const dir of skillDirs) {
        const skillPath = join(globalSkillsDir, dir, 'SKILL.md');
        const content = await readFile(skillPath);
        if (content) {
          const skill = this.parseSkillMarkdown(content, dir);
          skills.push(skill);
          
          if (!categories[skill.category]) categories[skill.category] = [];
          categories[skill.category].push(skill);
        }
      }
    }
    
    // Project skills
    const projectSkillsDir = join(this.projectDir, '.opencode/skills');
    const projectSkills: any[] = [];
    if (await fileExists(projectSkillsDir)) {
      const skillDirs = await listFiles(projectSkillsDir);
      for (const dir of skillDirs) {
        const skillPath = join(projectSkillsDir, dir, 'SKILL.md');
        const content = await readFile(skillPath);
        if (content) {
          const skill = this.parseSkillMarkdown(content, dir);
          projectSkills.push(skill);
        }
      }
    }
    
    return { global: skills, project: projectSkills, categories };
  }
  
  private parseSkillMarkdown(content: string, dirName: string): any {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let description = '';
    let triggers: string[] = [];
    let category = 'other';
    
    if (frontmatterMatch) {
      const fm = frontmatterMatch[1];
      const descMatch = fm.match(/description:\s*(.+)/);
      if (descMatch) description = descMatch[1].trim();
      
      // Extract triggers from description
      const triggerWords = ['Use when', 'Trigger', 'when', 'if'];
      triggers = triggerWords.flatMap(w => 
        fm.split('\n').filter(l => l.toLowerCase().includes(w.toLowerCase()))
      );
    }
    
    // Determine category from directory name
    if (dirName.includes('test') || dirName.includes('tdd')) category = 'testing';
    else if (dirName.includes('debug')) category = 'debugging';
    else if (dirName.includes('review')) category = 'review';
    else if (dirName.includes('plan') || dirName.includes('brainstorm')) category = 'planning';
    else if (dirName.includes('analy')) category = 'analysis';
    else if (dirName.includes('implement')) category = 'implementation';
    else if (dirName.includes('deploy') || dirName.includes('release')) category = 'deployment';
    else if (dirName.includes('worktree') || dirName.includes('git')) category = 'workspace';
    else if (dirName.includes('skill') || dirName.includes('using')) category = 'meta';
    
    return { name: dirName, description, triggers, category, version: '1.0.0' };
  }
  
  private async analyzeMCPServers(): Promise<any> {
    // Check for MCP server configs
    return { servers: [] };
  }
  
  private async analyzePlugins(): Promise<any> {
    // Check for OpenCode plugins
    return { plugins: [] };
  }
  
  private async analyzeCommands(): Promise<any> {
    // Check for custom commands
    return { commands: [] };
  }
  
  private async analyzeTemplates(): Promise<any> {
    // Check for templates
    return { templates: [] };
  }
  
  private async analyzeCICD(): Promise<any> {
    return { providers: [], pipelines: [] };
  }
  
  private async analyzeDocker(): Promise<any> {
    return { dockerfiles: [], composeFiles: [] };
  }
  
  private async analyzeContainers(): Promise<any> {
    return { runtime: 'docker', images: [] };
  }
  
  private async analyzeBuildSystem(): Promise<any> {
    const pkg = await readJsonFile(join(this.projectDir, 'package.json'));
    if (pkg) {
      return {
        type: 'bun',
        configFiles: ['package.json'],
        scripts: pkg.scripts || {},
      };
    }
    
    if (await fileExists(join(this.projectDir, 'Cargo.toml'))) {
      return { type: 'cargo', configFiles: ['Cargo.toml'], scripts: {} };
    }
    
    if (await fileExists(join(this.projectDir, 'go.mod'))) {
      return { type: 'go', configFiles: ['go.mod'], scripts: {} };
    }
    
    if (await fileExists(join(this.projectDir, 'pyproject.toml')) || await fileExists(join(this.projectDir, 'setup.py'))) {
      return { type: 'pip', configFiles: ['pyproject.toml'], scripts: {} };
    }
    
    return { type: 'other', configFiles: [], scripts: {} };
  }
  
  private async analyzeTestSystem(): Promise<any> {
    const pkg = await readJsonFile(join(this.projectDir, 'package.json'));
    if (pkg) {
      const scripts = pkg.scripts || {};
      const hasTest = scripts.test || scripts['test:unit'] || scripts['test:e2e'];
      if (hasTest) {
        // Detect framework from devDependencies
        const deps = { ...pkg.devDependencies, ...pkg.dependencies };
        if (deps['vitest']) return { framework: 'vitest', configFiles: ['vitest.config.ts'], coverage: undefined };
        if (deps['jest']) return { framework: 'jest', configFiles: ['jest.config.js'], coverage: undefined };
        if (deps['@playwright/test']) return { framework: 'playwright', configFiles: ['playwright.config.ts'], coverage: undefined };
        return { framework: 'bun', configFiles: ['package.json'], coverage: undefined };
      }
    }
    
    return { framework: 'unknown', configFiles: [], coverage: undefined };
  }
  
  private async analyzeDocumentation(): Promise<any> {
    const docs: any[] = [];
    const structure: any = {};
    
    const docFiles = ['README.md', 'CONTRIBUTING.md', 'LICENSE', 'CHANGELOG.md', 'docs/'];
    for (const doc of docFiles) {
      const fullPath = join(this.projectDir, doc);
      if (await fileExists(fullPath)) {
        docs.push({ path: doc, type: doc.endsWith('/') ? 'directory' : 'markdown' });
      }
    }
    
    structure.readme = await fileExists(join(this.projectDir, 'README.md'));
    structure.contributing = await fileExists(join(this.projectDir, 'CONTRIBUTING.md'));
    structure.license = await fileExists(join(this.projectDir, 'LICENSE'));
    structure.changelog = await fileExists(join(this.projectDir, 'CHANGELOG.md'));
    structure.apiDocs = await fileExists(join(this.projectDir, 'docs'));
    
    return { files: docs, structure };
  }
  
  private async analyzeGitStatus(): Promise<any> {
    // Would use git CLI to get status
    return {
      branch: 'main',
      commit: 'unknown',
      clean: true,
      staged: [],
      unstaged: [],
      untracked: [],
      ahead: 0,
      behind: 0,
      remotes: [],
    };
  }
}