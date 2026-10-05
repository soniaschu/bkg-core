// BKG Goal Builder - Event Logger
// Structured event logging for goal lifecycle

import { GoalStorage } from './goal-storage.js';

export interface GoalEvent {
  timestamp: string;
  event: string;
  goalId?: string;
  version?: number;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export class EventLogger {
  private storage: GoalStorage;
  private sessionId: string;
  private userId: string;
  private buffer: GoalEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  constructor(storage: GoalStorage, sessionId?: string, userId?: string) {
    this.storage = storage;
    this.sessionId = sessionId || `session-${Date.now()}`;
    this.userId = userId || process.env.USER || 'unknown';
    
    // Auto-flush every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }
  
  // Log a goal event
  async log(event: string, data: Record<string, any> = {}, goalId?: string, version?: number): Promise<void> {
    const entry: GoalEvent = {
      timestamp: new Date().toISOString(),
      event,
      goalId,
      version,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
    };
    
    this.buffer.push(entry);
    
    // Also write immediately to storage for durability
    await this.storage.logEvent(event, { ...data, goalId, version, sessionId: this.sessionId, userId: this.userId });
  }
  
  // Flush buffer to storage
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    
    // Events are already written via storage.logEvent
    // This is just for any additional batch processing
    this.buffer = [];
  }
  
  // Get events for a goal
  async getGoalEvents(goalId: string): Promise<GoalEvent[]> {
    const events = await this.storage.getEvents({ event: undefined });
    return events
      .filter(e => e.data.goalId === goalId)
      .map(e => ({
        timestamp: e.timestamp,
        event: e.event,
        goalId: e.data.goalId,
        version: e.data.version,
        data: e.data,
        userId: e.data.userId,
        sessionId: e.data.sessionId,
      }));
  }
  
  // Get events by type
  async getEventsByType(eventType: string): Promise<GoalEvent[]> {
    const events = await this.storage.getEvents({ event: eventType });
    return events.map(e => ({
      timestamp: e.timestamp,
      event: e.event,
      goalId: e.data.goalId,
      version: e.data.version,
      data: e.data,
      userId: e.data.userId,
      sessionId: e.data.sessionId,
    }));
  }
  
  // Get recent events
  async getRecentEvents(limit: number = 100): Promise<GoalEvent[]> {
    const events = await this.storage.getEvents({ limit });
    return events.map(e => ({
      timestamp: e.timestamp,
      event: e.event,
      goalId: e.data.goalId,
      version: e.data.version,
      data: e.data,
      userId: e.data.userId,
      sessionId: e.data.sessionId,
    }));
  }
  
  // Get events since timestamp
  async getEventsSince(since: string): Promise<GoalEvent[]> {
    const events = await this.storage.getEvents({ since });
    return events.map(e => ({
      timestamp: e.timestamp,
      event: e.event,
      goalId: e.data.goalId,
      version: e.data.version,
      data: e.data,
      userId: e.data.userId,
      sessionId: e.data.sessionId,
    }));
  }
  
  // Export events as JSONL
  async exportEvents(filter?: { event?: string; since?: string }): Promise<string> {
    const events = filter?.event 
      ? await this.getEventsByType(filter.event)
      : filter?.since
        ? await this.getEventsSince(filter.since)
        : await this.getRecentEvents(10000);
    
    return events.map(e => JSON.stringify(e)).join('\n');
  }
  
  // Get event statistics
  async getStatistics(): Promise<EventStatistics> {
    const events = await this.getRecentEvents(10000);
    
    const eventCounts: Record<string, number> = {};
    const goalCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    
    for (const event of events) {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
      if (event.goalId) {
        goalCounts[event.goalId] = (goalCounts[event.goalId] || 0) + 1;
      }
      userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
    }
    
    return {
      totalEvents: events.length,
      eventCounts,
      uniqueGoals: Object.keys(goalCounts).length,
      uniqueUsers: Object.keys(userCounts).length,
      timeRange: events.length > 0 ? {
        first: events[events.length - 1].timestamp,
        last: events[0].timestamp,
      } : null,
    };
  }
  
  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }
}

interface EventStatistics {
  totalEvents: number;
  eventCounts: Record<string, number>;
  uniqueGoals: number;
  uniqueUsers: number;
  timeRange: { first: string; last: string } | null;
}