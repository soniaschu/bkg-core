// BKG Goal Builder - Analysis Engine
// Generates and runs analysis tasks for goals

import { Goal } from './goal.js';
import { AnalysisTask, ProjectInventory } from './types.js';
import { generateId, timestamp } from '@bkg/plan-engine-core';
import { GoalStorage } from './goal-storage.js';

export class AnalysisEngine {
  private goal: Goal;
  private storage: GoalStorage;
  private projectInventory: ProjectInventory | null = null;
  
  constructor(goal: Goal, storage: GoalStorage) {
    this.goal = goal;
    this.storage = storage;
  }
  
  setProjectInventory(inventory: ProjectInventory): void {
    this.projectInventory = inventory;
  }
  
  // Extract required analyses from goal
  extractRequiredAnalyses(): AnalysisTask[] {
    const tasks: AnalysisTask[] = [];
    const analysisSection = this.goal.sections['benoetigte-analyse'];
    
    if (!analysisSection || !analysisSection.content) return tasks;
    
    // Parse checkbox items
    const lines = analysisSection.content.split('\n');
    for (const line of lines) {
      const match = line.match(/^-\s*\[\s*\]\s*(.+):\s*(.+)\s*-\s*(.+)$/);
      if (match) {
        const [, type, target, question] = match;
        tasks.push({
          id: generateId('analysis'),
          type: this.parseAnalysisType(type),
          target: target.trim(),
          question: question.trim(),
          requiredBy: 'benoetigte-analyse',
          status: 'pending',
        });
      }
    }
    
    return tasks;
  }
  
  private parseAnalysisType(type: string): AnalysisTask['type'] {
    const lower = type.toLowerCase();
    if (lower.includes('repo') || lower.includes('struktur')) return 'repository';
    if (lower.includes('api') || lower.includes('spec')) return 'api';
    if (lower.includes('pattern') || lower.includes('architektur')) return 'architecture';
    if (lower.includes('dependenc') || lower.includes('abh')) return 'dependency';
    return 'custom';
  }
  
  // Run all analysis tasks
  async runAnalyses(tasks: AnalysisTask[]): Promise<AnalysisTask[]> {
    for (const task of tasks) {
      if (task.status === 'pending') {
        task.status = 'running';
        task.startedAt = timestamp();
        
        try {
          task.result = await this.runSingleAnalysis(task);
          task.status = 'completed';
        } catch (error) {
          task.status = 'failed';
          task.error = error instanceof Error ? error.message : String(error);
        }
        
        task.completedAt = timestamp();
        
        // Save result
        await this.storage.saveAnalysisResult(task.id, task.result);
        
        // Update goal with result
        this.goal.completeAnalysisTask(task.id, task.result);
      }
    }
    
    return tasks;
  }
  
  private async runSingleAnalysis(task: AnalysisTask): Promise<any> {
    switch (task.type) {
      case 'repository':
        return this.analyzeRepository(task.target);
      case 'api':
        return this.analyzeAPI(task.target);
      case 'architecture':
        return this.analyzeArchitecture(target);
      case 'dependency':
        return this.analyzeDependencies(task.target);
      case 'pattern':
        return this.analyzePattern(task.target);
      default:
        return this.analyzeCustom(task.target, task.question);
    }
  }
  
  private async analyzeRepository(target: string): Promise<any> {
    if (!this.projectInventory) return { error: 'No project inventory available' };
    
    const repo = this.projectInventory.repositories.find(r => 
      r.path.includes(target) || r.name.includes(target)
    ) || this.projectInventory.repositories[0];
    
    if (!repo) return { error: 'Repository not found' };
    
    return {
      name: repo.name,
      path: repo.path,
      languages: repo.languages,
      dependencies: repo.dependencies.slice(0, 20), // Limit
      configs: repo.configs.map(c => ({ path: c.path, type: c.type })),
      architecturePatterns: repo.architecturePatterns,
      fileCount: this.countFiles(repo.structure),
    };
  }
  
  private async analyzeAPI(target: string): Promise<any> {
    // Would analyze API specs (OpenAPI, GraphQL, etc.)
    return { target, analyzed: true, note: 'API analysis not fully implemented' };
  }
  
  private async analyzeArchitecture(target: string): Promise<any> {
    if (!this.projectInventory) return { error: 'No project inventory available' };
    
    return {
      patterns: this.projectInventory.repositories.flatMap(r => r.architecturePatterns),
      workspace: this.projectInventory.workspace,
      buildSystem: this.projectInventory.buildSystem,
    };
  }
  
  private async analyzeDependencies(target: string): Promise<any> {
    if (!this.projectInventory) return { error: 'No project inventory available' };
    
    const allDeps = this.projectInventory.repositories.flatMap(r => r.dependencies);
    const uniqueDeps = new Map(allDeps.map(d => [d.name, d]));
    
    return {
      total: allDeps.length,
      unique: uniqueDeps.size,
      production: allDeps.filter(d => d.type === 'production').length,
      development: allDeps.filter(d => d.type === 'development').length,
      topDependencies: Array.from(uniqueDeps.values()).slice(0, 20),
    };
  }
  
  private async analyzePattern(target: string): Promise<any> {
    return { target, patterns: ['Pattern analysis not fully implemented'] };
  }
  
  private async analyzeCustom(target: string, question: string): Promise<any> {
    return { target, question, answer: 'Custom analysis requires manual implementation' };
  }
  
  private countFiles(tree: any): number {
    let count = 0;
    for (const [, value] of Object.entries(tree)) {
      if (value && typeof value === 'object') {
        if ('type' in value && value.type === 'file') {
          count++;
        } else {
          count += this.countFiles(value);
        }
      }
    }
    return count;
  }
  
  // Get analysis summary for goal
  getAnalysisSummary(): any {
    const tasks = this.extractRequiredAnalyses();
    const pending = tasks.filter(t => t.status === 'pending').length;
    const running = tasks.filter(t => t.status === 'running').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    
    return {
      total: tasks.length,
      pending,
      running,
      completed,
      failed,
      allComplete: pending === 0 && running === 0 && failed === 0,
    };
  }
}