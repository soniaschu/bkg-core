// BKG Goal Builder - Activate Command
// Activates an archived or history goal

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { EventLogger } from '../core/event-logger.js';

export const activateCommand: Command = {
  name: 'activate',
  description: 'Activate an archived or history goal as the new active goal',
  arguments: [
    {
      name: 'source',
      description: 'Source: "archive:<id>" or "history:<version>"',
      required: true,
    },
  ],
  options: [],
  async execute(ctx) {
    const { source } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const eventLogger = new EventLogger(storage);
    
    if (source.startsWith('archive:')) {
      const archiveId = source.replace('archive:', '');
      const archivedGoals = await storage.listArchivedGoals();
      const archiveEntry = archivedGoals.find(a => a.goalId === archiveId || a.file.includes(archiveId));
      
      if (!archiveEntry) {
        return { success: false, message: `Archivierte Goal nicht gefunden: ${archiveId}` };
      }
      
      const goal = await storage.activateArchivedGoal(archiveEntry);
      await eventLogger.log('goal_activated', { goalId: goal.id, from: 'archive', source: archiveEntry.file });
      
      return { 
        success: true, 
        message: `Goal "${goal.metadata.title}" (v${goal.version}) aus Archiv aktiviert`,
        goalId: goal.id,
      };
    }
    
    if (source.startsWith('history:')) {
      const versionStr = source.replace('history:', '');
      const version = parseInt(versionStr, 10);
      
      if (isNaN(version)) {
        return { success: false, message: 'Ungültige Versionsnummer' };
      }
      
      // Get active goal ID first
      const activeGoal = await storage.getActiveGoal();
      if (!activeGoal) {
        return { success: false, message: 'Kein aktives Goal für History-Aktivierung' };
      }
      
      const historyManager = new (await import('../core/history-manager.js')).HistoryManager(storage);
      const goal = await historyManager.rollbackToVersion(activeGoal.id, version);
      await eventLogger.log('goal_activated', { goalId: goal.id, from: 'history', version });
      
      return { 
        success: true, 
        message: `Goal v${goal.version} aus History aktiviert (Rollback zu v${version})`,
        goalId: goal.id,
      };
    }
    
    return { success: false, message: 'Unbekannte Quelle. Verwenden Sie "archive:<id>" oder "history:<version>"' };
  },
};