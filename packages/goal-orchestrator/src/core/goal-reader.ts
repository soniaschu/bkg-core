// BKG Goal Orchestrator - Goal Reader
// Reads active goal from storage

import { GoalStorage, GoalClass } from '@bkg/goal-builder';

export class GoalReader {
  private storage: GoalStorage;
  
  constructor(storage: GoalStorage) {
    this.storage = storage;
  }
  
  async readActiveGoal(): Promise<GoalClass | null> {
    return await this.storage.getActiveGoal();
  }
  
  async readGoalById(goalId: string): Promise<GoalClass | null> {
    // Would implement reading specific goal by ID
    return await this.storage.getActiveGoal(); // Simplified
  }
  
  async readGoalByVersion(goalId: string, version: number): Promise<GoalClass | null> {
    // Would implement reading specific goal version
    return null; // Simplified
  }
}