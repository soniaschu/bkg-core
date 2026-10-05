// BKG Goal Builder - List Command
// Lists active, history, and archived goals

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';

export const listCommand: Command = {
  name: 'list',
  description: 'List active, history, and archived goals',
  arguments: [],
  options: [
    {
      name: 'type',
      short: 't',
      description: 'Filter by type',
      type: 'string',
      choices: ['active', 'history', 'archive', 'all'],
      default: 'all',
    },
    {
      name: 'limit',
      short: 'l',
      description: 'Maximum number of goals to show',
      type: 'number',
      default: 20,
    },
    {
      name: 'output',
      short: 'o',
      description: 'Output format',
      type: 'string',
      choices: ['table', 'json', 'markdown'],
      default: 'table',
    },
  ],
  async execute(ctx) {
    const { type, limit, output } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const index = await storage.getIndex();
    
    if (!index) {
      return { success: true, message: 'Keine Goals gefunden' };
    }
    
    let outputStr = '';
    
    if (type === 'active' || type === 'all') {
      if (index.active) {
        outputStr += `\n## Aktives Goal\n`;
        // Would load and show active goal
        outputStr += `  ${index.active} (use /goal status for details)\n`;
      } else {
        outputStr += `\n## Aktives Goal\n  Keins\n`;
      }
    }
    
    if (type === 'history' || type === 'all') {
      outputStr += `\n## History (${index.history?.length || 0} Versionen)\n`;
      const history = (index.history || []).slice(-limit);
      for (const h of history) {
        const date = new Date(h.timestamp).toLocaleString();
        outputStr += `  v${h.version} ${h.goalId} - ${date}\n`;
      }
    }
    
    if (type === 'archive' || type === 'all') {
      outputStr += `\n## Archiv (${index.archive?.length || 0} Goals)\n`;
      const archive = (index.archive || []).slice(-limit);
      for (const a of archive) {
        const date = new Date(a.timestamp).toLocaleString();
        outputStr += `  ${a.title} (v${a.version}) - ${date}\n`;
      }
    }
    
    if (output === 'json') {
      return { success: true, data: index };
    }
    
    return { success: true, message: outputStr.trim() || 'Keine Goals gefunden' };
  },
};