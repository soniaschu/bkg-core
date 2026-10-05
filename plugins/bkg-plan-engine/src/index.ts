// BKG Plan Engine - OpenCode Plugin
// Registers /plan* commands and executable bkg_plan_* tools backed by the PlanEngine core.

import type { Plugin, PluginInput, Hooks } from '@opencode-ai/plugin';
import { z } from 'zod';
import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createPlanEngine, PlanEngine } from './core/plan-engine.js';

interface CommandDef {
  name: string;
  description: string;
  agent?: string;
  model?: string;
  subtask?: boolean;
  template: string;
}

function parseFrontmatter(fm: string): Record<string, unknown> {
  const frontmatter: Record<string, unknown> = {};
  for (const line of fm.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    if (value === 'true') frontmatter[key] = true;
    else if (value === 'false') frontmatter[key] = false;
    else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      frontmatter[key] = value.slice(1, -1);
    else frontmatter[key] = value;
  }
  return frontmatter;
}

function loadCommands(dir: string): CommandDef[] {
  const commands: CommandDef[] = [];
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let body = content;
      let frontmatter: Record<string, unknown> = {};
      if (frontmatterMatch) {
        body = content.slice(frontmatterMatch[0].length).trim();
        frontmatter = parseFrontmatter(frontmatterMatch[1]);
      }
      commands.push({
        name: file.replace(/\.md$/, ''),
        description: (frontmatter['description'] as string) || file.replace(/\.md$/, ''),
        agent: frontmatter['agent'] as string | undefined,
        model: frontmatter['model'] as string | undefined,
        subtask: frontmatter['subtask'] as boolean | undefined,
        template: body,
      });
    }
  } catch {
    // commands dir not found, skip
  }
  return commands;
}

const engines = new Map<string, PlanEngine>();

function getEngine(projectDir: string): PlanEngine {
  let engine = engines.get(projectDir);
  if (!engine) {
    engine = createPlanEngine({ projectDir });
    engines.set(projectDir, engine);
  }
  return engine;
}

const PlanEnginePlugin: Plugin = async (_input: PluginInput, _options?: Record<string, unknown>): Promise<Hooks> => {
  const pluginDir = dirname(fileURLToPath(import.meta.url));
  const commands = loadCommands(pluginDir);

  return {
    async config(config) {
      const cfg = config as Record<string, unknown>;
      const commandRecord = (cfg.command as Record<string, unknown>) || {};
      for (const cmd of commands) {
        commandRecord[`bkg-${cmd.name}-plan`] = {
          template: cmd.template,
          description: cmd.description,
          ...(cmd.agent ? { agent: cmd.agent } : {}),
          ...(cmd.model ? { model: cmd.model } : {}),
          ...(cmd.subtask !== undefined ? { subtask: cmd.subtask } : {}),
        };
      }
      cfg.command = commandRecord;
    },
    tool: {
      'bkg-add-plan': {
        description: 'Create a new BKG plan for a goal and make it the active plan.',
        args: {
          goal: z.string().describe('Goal the plan should achieve'),
          template: z.string().optional().describe('Plan template name'),
        },
        async execute(args: { goal: string; template?: string }, context) {
          try {
            const plan = await getEngine(context.directory).createPlan({ goal: args.goal, template: args.template });
            return JSON.stringify({ success: true, planId: plan.id, title: plan.title }, null, 2);
          } catch (error) {
            return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2);
          }
        },
      },
      'bkg-list-plan': {
        description: 'List all BKG plans in this project, most recently updated first.',
        args: {},
        async execute(_args, context) {
          try {
            const plans = await getEngine(context.directory).listPlans();
            return JSON.stringify({ success: true, count: plans.length, plans: plans.map((p) => ({ id: p.id, title: p.title, status: p.status })) }, null, 2);
          } catch (error) {
            return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2);
          }
        },
      },
      'bkg-show-plan': {
        description: 'Show a BKG plan by id, or the active plan when no id is given.',
        args: {
          plan_id: z.string().optional().describe('Plan id (defaults to active plan)'),
        },
        async execute(args: { plan_id?: string }, context) {
          const engine = getEngine(context.directory);
          try {
            const id = args.plan_id ?? (await engine.getActivePlanId());
            if (!id) return JSON.stringify({ success: false, error: 'No active plan' }, null, 2);
            const plan = await engine.getPlan(id);
            return JSON.stringify(plan ? { success: true, plan } : { success: false, error: `Plan ${id} not found` }, null, 2);
          } catch (error) {
            return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2);
          }
        },
      },
      'bkg-delete-plan': {
        description: 'Delete a BKG plan permanently.',
        args: {
          plan_id: z.string().describe('Plan id to delete'),
        },
        async execute(args: { plan_id: string }, context) {
          try {
            await getEngine(context.directory).deletePlan(args.plan_id);
            return JSON.stringify({ success: true, deleted: args.plan_id }, null, 2);
          } catch (error) {
            return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2);
          }
        },
      },
      'bkg-edit-plan': {
        description:
          'Edit a BKG plan structure: add/remove tasks or dependencies, add phases, assign agents, set task status. Values use colon notation, e.g. add_task "phase1:Implement auth:JWT login".',
        args: {
          plan_id: z.string().optional().describe('Plan id (defaults to active plan)'),
          add_task: z.string().optional().describe('"phaseId:title:description"'),
          remove_task: z.string().optional().describe('Task id'),
          add_dependency: z.string().optional().describe('"fromTaskId:toTaskId[:type]"'),
          remove_dependency: z.string().optional().describe('Dependency id'),
          assign_agent: z.string().optional().describe('"taskId:agentId"'),
          set_status: z.string().optional().describe('"taskId:pending|in_progress|done|blocked"'),
          add_phase: z.string().optional().describe('"title:description"'),
        },
        async execute(args: { plan_id?: string; add_task?: string; remove_task?: string; add_dependency?: string; remove_dependency?: string; assign_agent?: string; set_status?: string; add_phase?: string }, context) {
          const engine = getEngine(context.directory);
          try {
            const id = args.plan_id ?? (await engine.getActivePlanId());
            if (!id) return JSON.stringify({ success: false, error: 'No active plan' }, null, 2);
            const plan = await engine.editPlan(id, {
              addTask: args.add_task,
              removeTask: args.remove_task,
              addDependency: args.add_dependency,
              removeDependency: args.remove_dependency,
              assignAgent: args.assign_agent,
              setStatus: args.set_status,
              addPhase: args.add_phase,
            });
            return JSON.stringify({ success: true, planId: plan.id, phases: plan.phases.length, tasks: plan.tasks.length, dependencies: plan.dependencies.length }, null, 2);
          } catch (error) {
            return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2);
          }
        },
      },
      'bkg-status-plan': {
        description: 'Show BKG plan progress: per-phase task status and overall completion.',
        args: {
          plan_id: z.string().optional().describe('Plan id (defaults to active plan)'),
        },
        async execute(args: { plan_id?: string }, context) {
          const engine = getEngine(context.directory);
          try {
            const id = args.plan_id ?? (await engine.getActivePlanId());
            if (!id) return JSON.stringify({ success: false, error: 'No active plan' }, null, 2);
            const status = await engine.getPlanStatus(id);
            return JSON.stringify(status, null, 2);
          } catch (error) {
            return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2);
          }
        },
      },
      'bkg-visualize-plan': {
        description: 'Generate visualization data for a BKG plan (DAG/Gantt/Kanban/Timeline node-edge graph), optionally written to a JSON file.',
        args: {
          plan_id: z.string().optional().describe('Plan id (defaults to active plan)'),
          type: z.enum(['dag', 'gantt', 'kanban', 'timeline', 'all']).optional().describe('Visualization type'),
          output: z.string().optional().describe('Write visualization data to this file path'),
        },
        async execute(args: { plan_id?: string; type?: 'dag' | 'gantt' | 'kanban' | 'timeline' | 'all'; output?: string }, context) {
          const engine = getEngine(context.directory);
          try {
            const id = args.plan_id ?? (await engine.getActivePlanId());
            if (!id) return JSON.stringify({ success: false, error: 'No active plan' }, null, 2);
            const result = await engine.visualizePlan(id, { type: args.type ?? 'dag', format: 'json', output: args.output });
            return JSON.stringify({ success: true, ...result }, null, 2);
          } catch (error) {
            return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2);
          }
        },
      },
    },
  };
};

export default PlanEnginePlugin;
