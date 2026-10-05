// BKG Goal Builder - Events Command
// Shows event log for goals

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { EventLogger } from '../core/event-logger.js';

export const eventsCommand: Command = {
  name: 'events',
  description: 'Show event log for goals',
  arguments: [],
  options: [
    {
      name: 'filter',
      short: 'f',
      description: 'Filter by event type',
      type: 'string',
    },
    {
      name: 'since',
      short: 's',
      description: 'Show events since timestamp (ISO 8601)',
      type: 'string',
    },
    {
      name: 'limit',
      short: 'l',
      description: 'Maximum number of events',
      type: 'number',
      default: 50,
    },
    {
      name: 'goal',
      short: 'g',
      description: 'Filter by goal ID',
      type: 'string',
    },
    {
      name: 'stats',
      description: 'Show event statistics',
      type: 'boolean',
      default: false,
    },
  ],
  async execute(ctx) {
    const { filter, since, limit, goal, stats } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const eventLogger = new EventLogger(storage);
    
    if (stats) {
      const statistics = await eventLogger.getStatistics();
      let output = `\n## Event Statistics\n`;
      output += `Total Events: ${statistics.totalEvents}\n`;
      output += `Unique Goals: ${statistics.uniqueGoals}\n`;
      output += `Unique Users: ${statistics.uniqueUsers}\n`;
      if (statistics.timeRange) {
        output += `Time Range: ${statistics.timeRange.first} - ${statistics.timeRange.last}\n`;
      }
      output += `\nEvent Types:\n`;
      for (const [event, count] of Object.entries(statistics.eventCounts).sort((a, b) => b[1] - a[1])) {
        output += `  ${event}: ${count}\n`;
      }
      return { success: true, message: output.trim() };
    }
    
    const events = await eventLogger.getEvents(filter ? { event: filter, since, limit } : { since, limit });
    
    const filteredEvents = goal 
      ? events.filter(e => e.goalId === goal)
      : events;
    
    if (filteredEvents.length === 0) {
      return { success: true, message: 'Keine Events gefunden' };
    }
    
    let output = `\n## Events (${filteredEvents.length})\n`;
    
    for (const event of filteredEvents) {
      const time = new Date(event.timestamp).toLocaleString();
      const goalInfo = event.goalId ? ` [${event.goalId.slice(0, 8)}...]` : '';
      output += `\n${time}${goalInfo} ${event.event}\n`;
      if (Object.keys(event.data).length > 0) {
        output += `  ${JSON.stringify(event.data, null, 2).split('\n').join('\n  ')}\n`;
      }
    }
    
    return { success: true, message: output.trim() };
  },
};