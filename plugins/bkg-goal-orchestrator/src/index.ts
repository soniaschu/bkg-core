// BKG Goal Orchestrator - OpenCode Plugin
// Registers /orchestrate commands and executable bkg-orchestrate-goal_* tools backed by @bkg/goal-orchestrator

import type { Plugin, PluginInput, Hooks } from '@opencode-ai/plugin';
import { z } from 'zod';
import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { orchestrateCommand, goalOrchestrateCommand } from '@bkg/goal-orchestrator';

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

async function run(command: { execute(ctx: { args: any; projectDir: string }): Promise<unknown> }, args: unknown, projectDir: string): Promise<unknown> {
  try {
    return await command.execute({ args, projectDir });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const GoalOrchestratorPlugin: Plugin = async (_input: PluginInput, _options?: Record<string, unknown>): Promise<Hooks> => {
  const pluginDir = dirname(fileURLToPath(import.meta.url));
  const commands = loadCommands(pluginDir);

  return {
    async config(config) {
      const cfg = config as Record<string, unknown>;
      const commandRecord = (cfg.command as Record<string, unknown>) || {};
      for (const cmd of commands) {
        commandRecord[`bkg-${cmd.name}-goal`] = {
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
      'bkg-orchestrate-goal': {
        description:
          'Orchestrate execution of the active BKG goal: read the goal, collect project inventory, compose an agent team, generate an execution plan, request approval and execute.',
        args: {
          replan: z.boolean().optional().describe('Re-plan from existing team and skills'),
          reteam: z.boolean().optional().describe('Re-compose team from existing inventory'),
          reanalyze: z.boolean().optional().describe('Re-run project analysis'),
          dry_run: z.boolean().optional().describe('Stop before execution'),
          visualize_only: z.boolean().optional().describe('Only generate plan and visualization'),
          output: z.enum(['summary', 'full', 'json']).optional().describe('Output verbosity'),
        },
        async execute(args, context) {
          const result = await run(orchestrateCommand, {
            replan: args.replan ?? false,
            reteam: args.reteam ?? false,
            reanalyze: args.reanalyze ?? false,
            dryRun: args.dry_run ?? false,
            visualizeOnly: args.visualize_only ?? false,
            output: args.output ?? 'summary',
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-orchestrate-goal': {
        description: 'Alias of bkg-orchestrate-goal operating under the /goal namespace semantics (same pipeline).',
        args: {
          replan: z.boolean().optional().describe('Re-plan from existing team and skills'),
          reteam: z.boolean().optional().describe('Re-compose team from existing inventory'),
          reanalyze: z.boolean().optional().describe('Re-run project analysis'),
          dry_run: z.boolean().optional().describe('Stop before execution'),
          visualize_only: z.boolean().optional().describe('Only generate plan and visualization'),
          output: z.enum(['summary', 'full', 'json']).optional().describe('Output verbosity'),
        },
        async execute(args, context) {
          const result = await run(goalOrchestrateCommand, {
            replan: args.replan ?? false,
            reteam: args.reteam ?? false,
            reanalyze: args.reanalyze ?? false,
            dryRun: args.dry_run ?? false,
            visualizeOnly: args.visualize_only ?? false,
            output: args.output ?? 'summary',
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
    },
  };
};

export default GoalOrchestratorPlugin;
