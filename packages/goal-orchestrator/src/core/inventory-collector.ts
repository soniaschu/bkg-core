// BKG Goal Orchestrator - Inventory Collector
// Collects project inventory for orchestration

import { ProjectAnalyzer } from '@bkg/goal-builder';

export interface InventoryCollectionOptions {
  force?: boolean;
  cacheDuration?: number; // minutes
}

export class InventoryCollector {
  private projectDir: string;
  private analyzer: ProjectAnalyzer;
  private cache: { data: any; timestamp: number } | null = null;
  
  constructor(projectDir: string) {
    this.projectDir = projectDir;
    this.analyzer = new ProjectAnalyzer(projectDir);
  }
  
  async collect(options: InventoryCollectionOptions = {}): Promise<any> {
    const { force = false, cacheDuration = 5 } = options;
    const now = Date.now();
    
    // Use cache if available and not expired
    if (!force && this.cache && 
        (now - this.cache.timestamp) < (cacheDuration * 60 * 1000)) {
      return this.cache.data;
    }
    
    // Collect fresh inventory
    const inventory = await this.analyzer.analyze();
    
    // Update cache
    this.cache = {
      data: inventory,
      timestamp: now,
    };
    
    return inventory;
  }
  
  // Clear cache
  clearCache(): void {
    this.cache = null;
  }
}