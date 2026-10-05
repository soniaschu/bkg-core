// BKG Goal Builder - Archive Command
// Archives the active goal

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { EventLogger } from '../core/event-logger.js';

export const archiveCommand: Command = {
  name: 'archive',
  description: 'Archive the active goal',
  arguments: [],
  options: [
    {
      name: 'force',
      short: 'f',
      description: 'Force archive without confirmation',
      type: 'boolean',
      default: false,
    },
  ],
  async execute(ctx) {
    const { force } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const goal = await storage.getActiveGoal();
    
    if (!goal) {
      return { success: false, message: 'Kein aktives Goal zum Archivieren' };
    }
    
    if (!force) {
      return { 
        success: false, 
        message: 'Bestätigung erforderlich. Verwenden Sie --force um zu archivieren.',
        needsConfirmation: true,
      };
    }
    
    const eventLogger = new EventLogger(storage);
    await storage.archiveGoal(goal);
    await eventLogger.log('goal_archived', { goalId: goal.id, version: goal.version });
    
    return { 
      success: true, 
      message: `Goal "${goal.metadata.title}" (v${goal.version}) archiviert`,
      goalId: goal.id,
    };
  },
};