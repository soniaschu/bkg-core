// BKG Goal Builder - Status Command
// Shows active goal status and progress

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { EventLogger } from '../core/event-logger.js';

export const statusCommand: Command = {
  name: 'status',
  description: 'Show active goal status, progress, and recent events',
  arguments: [],
  options: [
    {
      name: 'events',
      short: 'e',
      description: 'Number of recent events to show',
      type: 'number',
      default: 10,
    },
    {
      name: 'watch',
      short: 'w',
      description: 'Watch for live updates',
      type: 'boolean',
      default: false,
    },
    {
      name: 'interval',
      short: 'i',
      description: 'Update interval in seconds (watch mode)',
      type: 'number',
      default: 5,
    },
  ],
  async execute(ctx) {
    const { events: eventsLimit, watch, interval } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const goal = await storage.getActiveGoal();
    
    if (!goal) {
      return { success: false, message: 'No active goal found' };
    }
    
    const eventLogger = new EventLogger(storage);
    const recentEvents = await eventLogger.getRecentEvents(eventsLimit);
    const goalEvents = recentEvents.filter(e => e.goalId === goal.id);
    
    const renderStatus = () => {
      let output = `\n���📋 ${goal.metadata.title}\n`;
      output += `ID: ${goal.id} | Version: ${goal.version} | Status: ${goal.metadata.status}\n`;
      output += `Template: ${goal.metadata.template} | Progress: ${goal.getProgress()}%\n`;
      output += `Created: ${goal.metadata.createdAt} | Updated: ${goal.metadata.updatedAt}\n\n`;
      
      // Section progress
      output += `## Sections\n`;
      const requiredSections = Object.entries(goal.sections).filter(([_, s]) => s.required);
      for (const [key, section] of requiredSections) {
        const icon = section.completed ? '��✅' : '��⏳';
        output += `  ${icon} ${section.title}\n`;
      }
      
      const optionalSections = Object.entries(goal.sections).filter(([_, s]) => !s.required && s.content);
      if (optionalSections.length > 0) {
        output += `\n## Optional Sections\n`;
        for (const [key, section] of optionalSections) {
          output += `  � ✏��️ ${section.title}\n`;
        }
      }
      
      // Analysis status
      const analysisSummary = goal.sections['benoetigte-analyse'];
      if (analysisSummary) {
        const pendingCount = (analysisSummary.content.match(/-\s*\[\s*\]/g) || []).length;
        const doneCount = (analysisSummary.content.match(/-\s*\[x\]/g) || []).length;
        output += `\n## Analyses\n`;
        output += `  Completed: ${doneCount} | Pending: ${pendingCount}\n`;
      }
      
      // Recent events
      if (goalEvents.length > 0) {
        output += `\n## Recent Events\n`;
        for (const event of goalEvents.slice(0, eventsLimit)) {
          const time = new Date(event.timestamp).toLocaleTimeString();
          output += `  ${time} ${event.event}: ${JSON.stringify(event.data).slice(0, 80)}\n`;
        }
      }
      
      return output;
    };
    
    if (watch) {
      // Return async generator for watch mode
      return {
        success: true,
        watch: true,
        async *updates() {
          while (true) {
            yield renderStatus();
            await new Promise(r => setTimeout(r, interval * 1000));
          }
        },
      };
    }
    
    return { success: true, message: renderStatus() };
  },
};