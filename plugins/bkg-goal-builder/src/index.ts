// BKG Goal Builder - OpenCode Plugin
// Registers /goal commands and executable bkg-* tools backed by @bkg/goal-builder

import type { Plugin, PluginInput, Hooks } from '@opencode-ai/plugin';
import { z } from 'zod';
import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  makeCommand,
  checkCommand,
  statusCommand,
  listCommand,
  archiveCommand,
  activateCommand,
  deleteCommand,
  exportCommand,
  importCommand,
  historyCommand,
  eventsCommand,
  analyzeCommand,
  GoalStorage,
} from '@bkg/goal-builder';

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

const GoalBuilderPlugin: Plugin = async (_input: PluginInput, _options?: Record<string, unknown>): Promise<Hooks> => {
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
      'bkg-add-goal': {
        description:
          'Create a new BKG goal from a natural language description. Analyzes the project, detects a matching template, validates the goal and stores it as the active goal.',
        args: {
          description: z.string().describe('Natural language goal description'),
          template: z.string().optional().describe('Template override (implementation, migration, analysis, bugfix, release, refactoring, documentation, deployment)'),
          title: z.string().optional().describe('Goal title override'),
          no_analysis: z.boolean().optional().describe('Skip automatic project analysis'),
        },
        async execute(args, context) {
          const result = await run(makeCommand, {
            description: args.description,
            template: args.template,
            title: args.title,
            noAnalysis: args.no_analysis ?? false,
            interactive: false,
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-edit-goal': {
        description:
          'Edit the active BKG goal: fill a section, set status or title, add/complete analysis tasks, append a change-log note.',
        args: {
          section: z.string().optional().describe('Section key to set content for (e.g. ziel, hintergrund, erfolgskriterien)'),
          content: z.string().optional().describe('New content for the section'),
          status: z.enum(['analysis_pending', 'ready', 'executing', 'completed']).optional().describe('New goal status'),
          title: z.string().optional().describe('New goal title'),
          add_analysis: z.string().optional().describe('Add analysis task as "repository|api|pattern|dependency|architecture|custom:target:question"'),
          complete_analysis: z.string().optional().describe('Mark analysis task id as completed'),
          analysis_result: z.string().optional().describe('Result text for complete_analysis'),
          history_note: z.string().optional().describe('Append entry to the change log'),
        },
        async execute(args: {
          section?: string; content?: string; status?: 'analysis_pending' | 'ready' | 'executing' | 'completed';
          title?: string; add_analysis?: string; complete_analysis?: string; analysis_result?: string; history_note?: string;
        }, context) {
          try {
            const storage = new GoalStorage(context.directory);
            const goal = await storage.getActiveGoal();
            if (!goal) return JSON.stringify({ success: false, error: 'No active goal' }, null, 2);

            const applied: string[] = [];
            if (args.section && args.content !== undefined) {
              if (!goal.sections[args.section]) return JSON.stringify({ success: false, error: `Unknown section "${args.section}"` }, null, 2);
              goal.updateSection(args.section, args.content);
              applied.push(`section:${args.section}`);
            }
            if (args.status) { goal.setStatus(args.status); applied.push(`status:${args.status}`); }
            if (args.title) { goal.metadata.title = args.title; goal.metadata.updatedAt = new Date().toISOString(); applied.push('title'); }
            if (args.add_analysis) {
              const [type, target, question] = args.add_analysis.split(':').map((s) => s.trim());
              if (!type || !target || !question) {
                return JSON.stringify({ success: false, error: 'add_analysis format: type:target:question' }, null, 2);
              }
              goal.addAnalysisTask({
                id: `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                type: type as any,
                target,
                question,
                requiredBy: args.section || 'benoetigte-analyse',
                status: 'pending',
              } as any);
              applied.push('analysis-task-added');
            }
            if (args.complete_analysis) {
              goal.completeAnalysisTask(args.complete_analysis, args.analysis_result ?? '');
              applied.push(`analysis-completed:${args.complete_analysis}`);
            }
            if (args.history_note) { goal.addHistoryEntry(args.history_note); applied.push('history'); }

            if (applied.length === 0) {
              return JSON.stringify({ success: false, error: 'No edit operation given' }, null, 2);
            }
            await storage.saveActiveGoal(goal);
            await storage.saveHistoryVersion(goal);
            return JSON.stringify({ success: true, goalId: goal.id, version: goal.version, progress: goal.getProgress(), applied }, null, 2);
          } catch (error) {
            return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2);
          }
        },
      },
      'bkg-check-goal': {
        description: 'Validate the active BKG goal against its rules (required sections, forbidden TODO/TBD markers, etc.).',
        args: {
          verbose: z.boolean().optional().describe('Include detailed rule results'),
          fix: z.boolean().optional().describe('Attempt automatic fixes where possible'),
        },
        async execute(args, context) {
          const result = await run(checkCommand, { verbose: args.verbose ?? false, fix: args.fix ?? false }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-status-goal': {
        description: 'Show status and progress of the active BKG goal.',
        args: {},
        async execute(_args, context) {
          const result = await run(statusCommand, {}, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-list-goal': {
        description: 'List BKG goals: active, history, and archived.',
        args: {
          type: z.enum(['all', 'active', 'history', 'archived']).optional().describe('Which goals to list'),
          limit: z.number().int().positive().optional().describe('Maximum number of entries'),
          output: z.enum(['summary', 'full', 'json']).optional().describe('Output format'),
        },
        async execute(args, context) {
          const result = await run(listCommand, {
            type: args.type ?? 'all',
            limit: args.limit,
            output: args.output ?? 'summary',
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-archive-goal': {
        description: 'Archive the active BKG goal.',
        args: {
          force: z.boolean().optional().describe('Archive even if validation fails'),
        },
        async execute(args, context) {
          const result = await run(archiveCommand, { force: args.force ?? false }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-activate-goal': {
        description: 'Activate an archived or historical BKG goal.',
        args: {
          source: z.string().describe('Archive entry id or path to activate'),
        },
        async execute(args, context) {
          const result = await run(activateCommand, { source: args.source }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-delete-goal': {
        description: 'Permanently delete an archived BKG goal.',
        args: {
          archive_id: z.string().describe('Archive entry id to delete'),
          force: z.boolean().optional().describe('Delete without confirmation'),
        },
        async execute(args, context) {
          const result = await run(deleteCommand, { archiveId: args.archive_id, force: args.force ?? false }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-export-goal': {
        description: 'Export the active BKG goal as Markdown, JSON, or YAML.',
        args: {
          format: z.enum(['markdown', 'json', 'yaml']).optional().describe('Export format'),
          output: z.string().optional().describe('Output file path (defaults to stdout)'),
          include_history: z.boolean().optional().describe('Include version history in export'),
        },
        async execute(args, context) {
          const result = await run(exportCommand, {
            format: args.format ?? 'markdown',
            output: args.output,
            includeHistory: args.include_history ?? false,
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-import-goal': {
        description: 'Import a BKG goal from a file with validation.',
        args: {
          file: z.string().describe('Path to the goal file to import'),
          force: z.boolean().optional().describe('Import even if validation fails'),
          activate: z.boolean().optional().describe('Activate the imported goal'),
        },
        async execute(args, context) {
          const result = await run(importCommand, {
            file: args.file,
            force: args.force ?? false,
            activate: args.activate ?? true,
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-history-goal': {
        description: 'Show version history of BKG goals with diffs.',
        args: {
          version: z.number().int().optional().describe('Show a specific version'),
          diff: z.boolean().optional().describe('Show diff between versions'),
          limit: z.number().int().positive().optional().describe('Maximum versions to show'),
        },
        async execute(args, context) {
          const result = await run(historyCommand, {
            version: args.version,
            diff: args.diff ?? false,
            limit: args.limit,
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-events-goal': {
        description: 'Show the structured event log for BKG goals.',
        args: {
          filter: z.string().optional().describe('Event name filter'),
          since: z.string().optional().describe('Only events since timestamp'),
          limit: z.number().int().positive().optional().describe('Maximum events to show'),
          stats: z.boolean().optional().describe('Show aggregate statistics instead of entries'),
        },
        async execute(args, context) {
          const result = await run(eventsCommand, {
            filter: args.filter,
            since: args.since,
            limit: args.limit,
            stats: args.stats ?? false,
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
      'bkg-analyze-goal': {
        description: 'Re-run project analysis for BKG goal sections that require analysis.',
        args: {
          section: z.string().optional().describe('Analyze only this section'),
          force: z.boolean().optional().describe('Force re-analysis even if results exist'),
          output: z.enum(['summary', 'full', 'json']).optional().describe('Output format'),
        },
        async execute(args, context) {
          const result = await run(analyzeCommand, {
            section: args.section,
            force: args.force ?? false,
            output: args.output ?? 'summary',
          }, context.directory);
          return JSON.stringify(result, null, 2);
        },
      },
    },
  };
};

export default GoalBuilderPlugin;
