// BKG Goal Builder - Analyze Command
// Triggers re-analysis of specific sections

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { AnalysisEngine } from '../core/analysis-engine.js';
import { ProjectAnalyzer } from '../core/project-analyzer.js';
import { EventLogger } from '../core/event-logger.js';

export const analyzeCommand: Command = {
  name: 'analyze',
  description: 'Trigger re-analysis for goal sections',
  arguments: [
    {
      name: 'section',
      description: 'Section to re-analyze (optional: all)',
      required: false,
    },
  ],
  options: [
    {
      name: 'force',
      short: 'f',
      description: 'Force re-analysis even if already completed',
      type: 'boolean',
      default: false,
    },
    {
      name: 'output',
      short: 'o',
      description: 'Output format',
      type: 'string',
      choices: ['summary', 'full', 'json'],
      default: 'summary',
    },
  ],
  async execute(ctx) {
    const { section, force, output } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const goal = await storage.getActiveGoal();
    
    if (!goal) {
      return { success: false, message: 'No active goal found' };
    }
    
    const eventLogger = new EventLogger(storage);
    await eventLogger.log('analysis_started', { goalId: goal.id, section: section || 'all' });
    
    // Run project analysis
    const analyzer = new ProjectAnalyzer(ctx.projectDir);
    const inventory = await analyzer.analyze();
    
    // Create analysis engine
    const analysisEngine = new AnalysisEngine(goal, storage);
    analysisEngine.setProjectInventory(inventory);
    
    let results: any;
    
    if (section) {
      // Analyze specific section
      const sectionContent = goal.sections[section]?.content;
      if (!sectionContent) {
        return { success: false, message: `Section "${section}" not found` };
      }
      
      // Extract analysis tasks from section
      const tasks = [];
      const lines = sectionContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^-\s*\[\s*\]\s*(.+):\s*(.+)\s*-\s*(.+)$/);
        if (match) {
          const [, type, target, question] = match;
          tasks.push({
            id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: this.parseAnalysisType(type),
            target: target.trim(),
            question: question.trim(),
            requiredBy: section,
            status: 'pending',
          });
        }
      }
      
      if (tasks.length === 0) {
        return { success: false, message: `No analysis tasks found in section "${section}"` };
      }
      
      // Run analyses
      const completedTasks = await analysisEngine.runAnalyses(tasks);
      
      results = {
        section,
        tasks: completedTasks,
        summary: {
          total: tasks.length,
          completed: completedTasks.filter(t => t.status === 'completed').length,
          failed: completedTasks.filter(t => t.status === 'failed').length,
        },
      };
    } else {
      // Analyze all sections with ERFORDERT ANALYSE
      const allTasks = analysisEngine.extractRequiredAnalyses();
      
      let tasksToRun = allTasks;
      if (!force) {
        tasksToRun = allTasks.filter(t => 
          t.status === 'pending' || t.status === 'failed' || 
          t.content?.includes('ERFORDERT ANALYSE')
        );
      }
      
      if (tasksToRun.length === 0) {
        return { 
          success: true, 
          message: 'All analyses already completed. Use --force to repeat.',
          analysis: await analysisEngine.getAnalysisSummary(),
        };
      }
      
      const completedTasks = await analysisEngine.runAnalyses(tasksToRun);
      
      results = {
        sections: Object.keys(goal.sections),
        tasks: completedTasks,
        summary: await analysisEngine.getAnalysisSummary(),
      };
    }
    
    // Update goal with results
    await eventLogger.log('analysis_completed', { 
      goalId: goal.id, 
      section: section || 'all',
      tasksRun: results.tasks?.length || 0,
    });
    
    // Format output
    if (output === 'json') {
      return { success: true, data: results };
    }
    
    let outputStr = `\n## Analysis Results\n`;
    
    if (results.section) {
      outputStr += `Section: ${results.section}\n\n`;
    }
    
    if (results.tasks) {
      outputStr += `## Completed Analyses (${results.tasks.length})\n\n`;
      for (const task of results.tasks) {
        const icon = task.status === 'completed' ? '������✅' : task.status === 'failed' ? '������❌' : '������⏳';
        outputStr += `${icon} ${task.type}: ${task.target}\n`;
        outputStr += `   Question: ${task.question}\n`;
        outputStr += `   Status: ${task.status}\n`;
        if (task.result) {
          outputStr += `   Result: ${JSON.stringify(task.result).slice(0, 100)}${JSON.stringify(task.result).length > 100 ? '...' : ''}\n`;
        }
        if (task.error) {
          outputStr += `   Error: ${task.error}\n`;
        }
        outputStr += '\n';
      }
    }
    
    if (results.summary) {
      outputStr += `\n## Summary\n`;
      outputStr += `Total: ${results.summary.total || 0} | `;
      outputStr += `Completed: ${results.summary.completed || 0} | `;
      outputStr += `Failed: ${results.summary.failed || 0} | `;
      outputStr += `Pending: ${results.summary.pending || 0}\n`;
      
      if (results.summary.allComplete) {
        outputStr += `\n������✅ All analyses completed!\n`;
        outputStr += `The goal is now ready for orchestration.\n`;
      }
    }
    
    return { success: true, message: outputStr.trim() };
  }
};

// Helper function outside the command object
function parseAnalysisType(type: string): 'repository' | 'api' | 'architecture' | 'dependency' | 'pattern' | 'custom' {
  const lower = type.toLowerCase();
  if (lower.includes('repo') || lower.includes('struktur')) return 'repository';
  if (lower.includes('api') || lower.includes('spec')) return 'api';
  if (lower.includes('pattern') || lower.includes('architektur')) return 'architecture';
  if (lower.includes('dependenc') || lower.includes('abh')) return 'dependency';
  return 'custom';
}