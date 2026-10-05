// BKG Plan Engine - Core Plan Engine
// Central engine for plan management, visualization, and execution

import { 
  Plan, 
  Phase, 
  Task, 
  Dependency, 
  Agent, 
  Skill,
  PlanEvent,
  PlanStatus,
  TaskStatus,
  AgentStatus,
} from '@bkg/plan-engine-core';
import {
  generateId,
  timestamp,
  readJsonFile,
  writeJsonFile,
  ensureDir,
} from '@bkg/plan-engine-core';
import { 
  createServer as createPlanServer,
  PlanServer 
} from '@bkg/plan-engine-server';

export interface PlanEngineOptions {
  projectDir: string;
  dataDir?: string;
}

export interface VisualizationOptions {
  type: 'dag' | 'gantt' | 'kanban' | 'timeline' | 'all';
  format: 'svg' | 'png' | 'html' | 'json';
  output?: string;
}

export interface EditOptions {
  addTask?: string;
  removeTask?: string;
  addDependency?: string;
  removeDependency?: string;
  assignAgent?: string;
  setStatus?: string;
  addPhase?: string;
}

export class PlanEngine {
  private projectDir: string;
  private dataDir: string;
  private plansDir: string;
  private activePlanFile: string;
  
  constructor(options: PlanEngineOptions) {
    this.projectDir = options.projectDir;
    this.dataDir = options.dataDir || `${options.projectDir}/.bkg/plan-engine`;
    this.plansDir = `${this.dataDir}/plans`;
    this.activePlanFile = `${this.dataDir}/active-plan.json`;
  }
  
  async initialize(): Promise<void> {
    await ensureDir(this.plansDir);
  }
  
  // Plan CRUD
  async createPlan(input: { goal: string; template?: string }): Promise<Plan> {
    await this.initialize();
    
    const plan: Plan = {
      id: generateId('plan'),
      title: input.goal.slice(0, 80),
      goal: input.goal,
      template: input.template || 'implementation',
      status: 'draft',
      phases: [],
      tasks: [],
      dependencies: [],
      agents: [],
      skills: [],
      metadata: {
        createdAt: timestamp(),
        updatedAt: timestamp(),
        version: 1,
      },
      events: [{
        id: generateId('event'),
        type: 'created',
        timestamp: timestamp(),
        data: { goal: input.goal, template: input.template },
      }],
    };
    
    await this.savePlan(plan);
    await this.setActivePlan(plan.id);
    
    return plan;
  }
  
  async getPlan(planId: string): Promise<Plan | null> {
    const planPath = `${this.plansDir}/${planId}.json`;
    return readJsonFile<Plan>(planPath);
  }
  
  async savePlan(plan: Plan): Promise<void> {
    plan.metadata.updatedAt = timestamp();
    plan.metadata.version += 1;
    const planPath = `${this.plansDir}/${plan.id}.json`;
    await writeJsonFile(planPath, plan);
  }
  
  async listPlans(): Promise<Plan[]> {
    await this.initialize();
    const fs = await import('fs/promises');
    const files = await fs.readdir(this.plansDir);
    const plans: Plan[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const plan = await readJsonFile<Plan>(`${this.plansDir}/${file}`);
        if (plan) plans.push(plan);
      }
    }
    
    return plans.sort((a, b) => 
      new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
    );
  }
  
  async deletePlan(planId: string): Promise<void> {
    const fs = await import('fs/promises');
    const planPath = `${this.plansDir}/${planId}.json`;
    await fs.unlink(planPath);
    
    // Clear active if deleted
    const active = await this.getActivePlanId();
    if (active === planId) {
      await this.clearActivePlan();
    }
  }
  
  async archivePlan(planId: string): Promise<void> {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    
    plan.status = 'archived';
    plan.events.push({
      id: generateId('event'),
      type: 'archived',
      timestamp: timestamp(),
      data: {},
    });
    
    await this.savePlan(plan);
    
    const active = await this.getActivePlanId();
    if (active === planId) {
      await this.clearActivePlan();
    }
  }
  
  // Active plan management
  async getActivePlanId(): Promise<string | null> {
    const active = await readJsonFile<{ planId: string; updatedAt: string }>(this.activePlanFile);
    return active?.planId || null;
  }
  
  async setActivePlan(planId: string): Promise<void> {
    await writeJsonFile(this.activePlanFile, { planId, updatedAt: timestamp() });
  }
  
  async clearActivePlan(): Promise<void> {
    const fs = await import('fs/promises');
    try {
      await fs.unlink(this.activePlanFile);
    } catch {
      // Ignore if not exists
    }
  }
  
  // Plan editing
  async editPlan(planId: string, edits: EditOptions): Promise<Plan> {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    
    // Add task
    if (edits.addTask) {
      const [phaseId, title, description] = edits.addTask.split(':');
      const task: Task = {
        id: generateId('task'),
        phaseId: phaseId || plan.phases[0]?.id || 'default',
        title,
        description: description || '',
        status: 'pending',
        dependencies: [],
        agentId: undefined,
        skillRequirements: [],
      };
      plan.tasks.push(task);
    }
    
    // Remove task
    if (edits.removeTask) {
      plan.tasks = plan.tasks.filter(t => t.id !== edits.removeTask);
    }
    
    // Add dependency
    if (edits.addDependency) {
      const [from, to, type] = edits.addDependency.split(':');
      const dep: Dependency = {
        id: generateId('dep'),
        from,
        to,
        type: (type as Dependency['type']) || 'blocks',
      };
      plan.dependencies.push(dep);
    }
    
    // Remove dependency
    if (edits.removeDependency) {
      plan.dependencies = plan.dependencies.filter(d => d.id !== edits.removeDependency);
    }
    
    // Assign agent
    if (edits.assignAgent) {
      const [taskId, agentId] = edits.assignAgent.split(':');
      const task = plan.tasks.find(t => t.id === taskId);
      if (task) task.agentId = agentId;
    }
    
    // Set status
    if (edits.setStatus) {
      const [taskId, status] = edits.setStatus.split(':');
      const task = plan.tasks.find(t => t.id === taskId);
      if (task) task.status = status as TaskStatus;
    }
    
    // Add phase
    if (edits.addPhase) {
      const [title, description] = edits.addPhase.split(':');
      const phase: Phase = {
        id: generateId('phase'),
        title,
        description: description || '',
        order: plan.phases.length,
        taskIds: [],
      };
      plan.phases.push(phase);
    }
    
    plan.events.push({
      id: generateId('event'),
      type: 'updated',
      timestamp: timestamp(),
      data: { edits },
    });
    
    await this.savePlan(plan);
    return plan;
  }
  
  // Visualization
  async visualizePlan(planId: string, options: VisualizationOptions): Promise<{ url?: string; data?: any }> {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    
    // Generate visualization data
    const vizData = this.generateVisualizationData(plan, options.type);
    
    if (options.output) {
      await writeJsonFile(options.output, vizData);
      return { data: vizData };
    }
    
    // Return data for rendering
    return { data: vizData };
  }
  
  private generateVisualizationData(plan: Plan, type: string): any {
    const nodes = [
      ...plan.phases.map(p => ({ id: p.id, label: p.title, type: 'phase', data: p })),
      ...plan.tasks.map(t => ({ id: t.id, label: t.title, type: 'task', data: t })),
    ];
    
    const edges = [
      ...plan.dependencies.map(d => ({ from: d.from, to: d.to, type: d.type })),
      ...plan.tasks.map(t => ({ from: t.phaseId, to: t.id, type: 'contains' })),
    ];
    
    return {
      planId: plan.id,
      planTitle: plan.title,
      type,
      nodes,
      edges,
      metadata: {
        generatedAt: timestamp(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
    };
  }
  
  // Plan status
  async getPlanStatus(planId: string): Promise<any> {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    
    const totalTasks = plan.tasks.length;
    const doneTasks = plan.tasks.filter(t => t.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    
    const phasesWithTasks = plan.phases.map(phase => ({
      ...phase,
      tasks: plan.tasks.filter(t => t.phaseId === phase.id),
      progress: this.calculatePhaseProgress(phase, plan.tasks),
    }));
    
    return {
      planId: plan.id,
      planTitle: plan.title,
      status: plan.status,
      progress,
      totalTasks,
      doneTasks,
      phases: phasesWithTasks,
      agents: plan.agents,
      events: plan.events.slice(-10), // Last 10 events
    };
  }
  
  private calculatePhaseProgress(phase: Phase, tasks: Task[]): number {
    const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
    if (phaseTasks.length === 0) return 0;
    const done = phaseTasks.filter(t => t.status === 'done').length;
    return Math.round((done / phaseTasks.length) * 100);
  }
  
  // Watch mode
  async *watchPlanStatus(planId: string, options: { interval: number; output: string }): AsyncGenerator<any> {
    while (true) {
      const status = await this.getPlanStatus(planId);
      yield this.formatStatusOutput(status, options.output);
      await new Promise(r => setTimeout(r, options.interval * 1000));
    }
  }
  
  private formatStatusOutput(status: any, format: string): string {
    if (format === 'json') return JSON.stringify(status, null, 2);
    if (format === 'markdown') return JSON.stringify(status, null, 2);
    
    // Table format
    let out = `\n📋 ${status.planTitle} (${status.planId})\n`;
    out += `Status: ${status.status} | Progress: ${status.progress}% (${status.doneTasks}/${status.totalTasks})\n`;
    
    for (const phase of status.phases) {
      out += `\n## ${phase.title} - ${phase.progress}%\n`;
      for (const task of phase.tasks) {
        const icon = task.status === 'done' ? '✅' : task.status === 'in_progress' ? '🔄' : task.status === 'blocked' ? '⛔' : '⏳';
        const agent = task.agentId ? ` @${task.agentId}` : '';
        out += `  ${icon} ${task.title}${agent}\n`;
      }
    }
    
    return out;
  }
  
  // Browser integration
  async startReviewServer(planId: string, options: { port?: number; browser?: string }): Promise<string> {
    const server = await createPlanServer({
      port: options.port || 19432,
      dataDir: this.dataDir,
      projectDir: this.projectDir,
    });

    await server.start();
    const url = `http://localhost:${server.port}/review/${planId}`;
    return url;
  }
  
  async openInBrowser(url: string, browser?: string): Promise<void> {
    const { spawn } = await import('child_process');
    const cmd = browser || process.env.BROWSER || 'xdg-open';
    spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref();
  }
}

// Export singleton factory
export function createPlanEngine(options: PlanEngineOptions): PlanEngine {
  return new PlanEngine(options);
}