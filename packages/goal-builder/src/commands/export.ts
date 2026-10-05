// BKG Goal Builder - Export Command
// Exports active goal in various formats

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';

export const exportCommand: Command = {
  name: 'export',
  description: 'Export active goal (Markdown, JSON, YAML)',
  arguments: [],
  options: [
    {
      name: 'format',
      short: 'f',
      description: 'Export format',
      type: 'string',
      choices: ['markdown', 'json', 'yaml'],
      default: 'markdown',
    },
    {
      name: 'output',
      short: 'o',
      description: 'Output file path (stdout if not specified)',
      type: 'string',
    },
    {
      name: 'include-history',
      description: 'Include version history',
      type: 'boolean',
      default: false,
    },
  ],
  async execute(ctx) {
    const { format, output, includeHistory } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const goal = await storage.getActiveGoal();
    
    if (!goal) {
      return { success: false, message: 'Kein aktives Goal zum Exportieren' };
    }
    
    let content: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(goal, null, 2);
        break;
      case 'yaml':
        // Simple YAML-like output
        content = `# Goal Export\n`;
        content += `id: "${goal.id}"\n`;
        content += `version: ${goal.version}\n`;
        content += `metadata:\n`;
        content += `  title: "${goal.metadata.title}"\n`;
        content += `  description: "${goal.metadata.description.replace(/\n/g, '\\n')}"\n`;
        content += `  template: "${goal.metadata.template}"\n`;
        content += `  createdAt: "${goal.metadata.createdAt}"\n`;
        content += `  updatedAt: "${goal.metadata.updatedAt}"\n`;
        content += `  status: "${goal.metadata.status}"\n`;
        content += `sections:\n`;
        for (const [key, section] of Object.entries(goal.sections)) {
          content += `  ${key}:\n`;
          content += `    title: "${section.title}"\n`;
          content += `    required: ${section.required}\n`;
          content += `    completed: ${section.completed}\n`;
          content += `    content: |\n`;
          for (const line of section.content.split('\n')) {
            content += `      ${line}\n`;
          }
        }
        break;
      case 'markdown':
      default:
        content = goal.toMarkdown();
        break;
    }
    
    if (includeHistory) {
      const historyManager = new (await import('../core/history-manager.js')).HistoryManager(storage);
      const versions = await storage.getHistoryVersions(goal.id);
      
      if (format === 'markdown') {
        content += '\n\n## Versionshistorie\n\n';
        for (const v of versions) {
          content += `- v${v.version} - ${new Date(v.timestamp).toLocaleString()}\n`;
        }
      } else if (format === 'json') {
        const parsed = JSON.parse(content);
        parsed.history = versions;
        content = JSON.stringify(parsed, null, 2);
      }
    }
    
    if (output) {
      const fs = await import('fs/promises');
      await fs.writeFile(output, content, 'utf-8');
      return { success: true, message: `Goal nach ${output} exportiert (${format})` };
    }
    
    return { success: true, message: content, data: { format, content } };
  },
};