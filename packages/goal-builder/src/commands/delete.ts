// BKG Goal Builder - Delete Command
// Deletes archived goals

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { EventLogger } from '../core/event-logger.js';

export const deleteCommand: Command = {
  name: 'delete',
  description: 'Delete an archived goal (permanent)',
  arguments: [
    {
      name: 'archiveId',
      description: 'Archive ID or title to delete',
      required: true,
    },
  ],
  options: [
    {
      name: 'force',
      short: 'f',
      description: 'Force delete without confirmation',
      type: 'boolean',
      default: false,
    },
  ],
  async execute(ctx) {
    const { archiveId, force } = ctx.args;
    
    if (!force) {
      return { 
        success: false, 
        message: 'Löschen ist permanent! Bestätigen Sie mit --force',
        needsConfirmation: true,
      };
    }
    
    const storage = new GoalStorage(ctx.projectDir);
    const eventLogger = new EventLogger(storage);
    
    const archivedGoals = await storage.listArchivedGoals();
    const archiveEntry = archivedGoals.find(a => 
      a.goalId === archiveId || 
      a.title.toLowerCase().includes(archiveId.toLowerCase()) ||
      a.file.includes(archiveId)
    );
    
    if (!archiveEntry) {
      return { success: false, message: `Archivierte Goal nicht gefunden: ${archiveId}` };
    }
    
    await storage.deleteArchivedGoal(archiveEntry);
    await eventLogger.log('goal_deleted', { archiveId: archiveEntry.goalId, file: archiveEntry.file });
    
    return { 
      success: true, 
      message: `Archivierte Goal "${archiveEntry.title}" gelöscht`,
      deletedId: archiveEntry.goalId,
    };
  },
};