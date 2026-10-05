// BKG Goal Builder - History Command
// Shows goal version history with diffs

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { HistoryManager } from '../core/history-manager.js';

export const historyCommand: Command = {
  name: 'history',
  description: 'Show goal version history and diffs',
  arguments: [
    {
      name: 'version',
      description: 'Specific version to show (default: all)',
      required: false,
    },
  ],
  options: [
    {
      name: 'diff',
      short: 'd',
      description: 'Show diff between versions (format: "from:to")',
      type: 'string',
    },
    {
      name: 'limit',
      short: 'l',
      description: 'Number of versions to show',
      type: 'number',
      default: 10,
    },
  ],
  async execute(ctx) {
    const { version, diff, limit } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const activeGoal = await storage.getActiveGoal();
    
    if (!activeGoal) {
      return { success: false, message: 'Kein aktives Goal' };
    }
    
    const historyManager = new HistoryManager(storage);
    
    if (diff) {
      const [from, to] = diff.split(':').map(v => parseInt(v, 10));
      if (isNaN(from) || isNaN(to)) {
        return { success: false, message: 'Diff Format: "from:to" (z.B. "1:3")' };
      }
      
      const diffResult = await historyManager.diffVersions(activeGoal.id, from, to);
      const summary = await historyManager.getChangeSummary(activeGoal.id, from, to);
      
      return { success: true, message: summary, diff: diffResult };
    }
    
    if (version) {
      const ver = parseInt(version, 10);
      if (isNaN(ver)) {
        return { success: false, message: 'Ungültige Versionsnummer' };
      }
      
      const historyGoal = await storage.getHistoryVersion(activeGoal.id, ver);
      if (!historyGoal) {
        return { success: false, message: `Version ${ver} nicht gefunden` };
      }
      
      return { success: true, message: historyGoal.toMarkdown() };
    }
    
    // Show timeline
    const timeline = await historyManager.getHistoryTimeline(activeGoal.id);
    const stats = await historyManager.getVersionStats(activeGoal.id);
    
    let output = `\n## History für ${activeGoal.metadata.title}\n`;
    output += `Aktuelle Version: v${activeGoal.version} | Gesamt: ${stats.totalVersions} Versionen\n\n`;
    
    for (const entry of timeline.slice(-limit)) {
      const date = new Date(entry.timestamp).toLocaleString();
      output += `v${entry.version} - ${date}\n`;
    }
    
    return { success: true, message: output.trim() };
  },
};