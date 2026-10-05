// BKG Goal Builder - Import Command
// Imports a goal from file with validation

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { GoalClass } from '../core/goal.js';
import { RulesEngine } from '../core/rules-engine.js';
import { EventLogger } from '../core/event-logger.js';

export const importCommand: Command = {
  name: 'import',
  description: 'Import goal from file with validation',
  arguments: [
    {
      name: 'file',
      description: 'Path to goal file (Markdown, JSON, YAML)',
      required: true,
    },
  ],
  options: [
    {
      name: 'force',
      short: 'f',
      description: 'Force import even if validation fails',
      type: 'boolean',
      default: false,
    },
    {
      name: 'activate',
      short: 'a',
      description: 'Activate imported goal immediately',
      type: 'boolean',
      default: true,
    },
  ],
  async execute(ctx) {
    const { file, force, activate } = ctx.args;
    
    const fs = await import('fs/promises');
    const path = await import('path');
    
    let content: string;
    try {
      content = await fs.readFile(file, 'utf-8');
    } catch {
      return { success: false, message: `Datei nicht gefunden: ${file}` };
    }
    
    let goal: GoalClass;
    
    const ext = path.extname(file).toLowerCase();
    
    if (ext === '.json') {
      try {
        const data = JSON.parse(content);
        goal = new GoalClass(data);
      } catch {
        return { success: false, message: 'Ungültiges JSON' };
      }
    } else if (ext === '.yaml' || ext === '.yml') {
      // Simple YAML parsing (would use yaml library in production)
      return { success: false, message: 'YAML Import noch nicht implementiert' };
    } else {
      // Assume Markdown
      goal = GoalClass.fromMarkdown(content);
    }
    
    // Validate
    const storage = new GoalStorage(ctx.projectDir);
    await storage.initialize();
    
    const rulesEngine = new RulesEngine(storage);
    await rulesEngine.initialize();
    
    const validation = await rulesEngine.validateGoal(goal);
    
    if (!validation.valid && !force) {
      return { 
        success: false, 
        message: `Validierung fehlgeschlagen. Verwenden Sie --force zum Importieren trotzdem.`,
        errors: validation.errors.length,
        warnings: validation.warnings.length,
      };
    }
    
    // Archive existing if any
    const existing = await storage.getActiveGoal();
    if (existing) {
      await storage.archiveGoal(existing);
    }
    
    // Save as new version
    goal.version = 1;
    goal.metadata.status = 'ready';
    goal.metadata.updatedAt = new Date().toISOString();
    goal.addHistoryEntry(`Imported from ${file}`);
    
    await storage.saveActiveGoal(goal);
    await storage.saveHistoryVersion(goal);
    
    const eventLogger = new EventLogger(storage);
    await eventLogger.log('goal_imported', { 
      goalId: goal.id, 
      source: file, 
      validation: validation.valid ? 'passed' : 'forced',
    });
    
    return { 
      success: true, 
      message: `Goal "${goal.metadata.title}" importiert (v${goal.version})`,
      goalId: goal.id,
      validation: validation.valid ? 'passed' : 'forced',
    };
  },
};