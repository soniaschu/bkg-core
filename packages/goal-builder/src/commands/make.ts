// BKG Goal Builder - Make Command
// Creates a new goal from natural language description

import type { Command } from '@opencode-ai/sdk';
import { GoalClass } from '../core/goal.js';
import { GoalStorage } from '../core/goal-storage.js';
import { ProjectAnalyzer } from '../core/project-analyzer.js';
import { AnalysisEngine } from '../core/analysis-engine.js';
import { TemplateEngine } from '../core/template-engine.js';
import { RulesEngine } from '../core/rules-engine.js';
import { EventLogger } from '../core/event-logger.js';
import { HistoryManager } from '../core/history-manager.js';
import { detectTemplate } from '../templates/index.js';

export const makeCommand: Command = {
  name: 'make',
  description: 'Create a new goal from natural language description',
  arguments: [
    {
      name: 'description',
      description: 'Goal description (natural language)',
      required: true,
    },
  ],
  options: [
    {
      name: 'template',
      short: 't',
      description: 'Template to use (auto-detected if not specified)',
      type: 'string',
    },
    {
      name: 'title',
      short: 'n',
      description: 'Goal title (auto-generated from description if not provided)',
      type: 'string',
    },
    {
      name: 'no-analysis',
      description: 'Skip automatic project analysis',
      type: 'boolean',
      default: false,
    },
    {
      name: 'interactive',
      short: 'i',
      description: 'Interactive mode for clarification',
      type: 'boolean',
      default: false,
    },
  ],
  async execute(ctx) {
    const { description, template, title, noAnalysis, interactive } = ctx.args;
    
    // Initialize storage and engines
    const storage = new GoalStorage(ctx.projectDir);
    await storage.initialize();
    
    const eventLogger = new EventLogger(storage);
    const templateEngine = new TemplateEngine(storage);
    const rulesEngine = new RulesEngine(storage);
    await rulesEngine.initialize();
    
    // Check for existing active goal
    const existingGoal = await storage.getActiveGoal();
    if (existingGoal) {
      // Archive existing goal
      await storage.archiveGoal(existingGoal);
      await eventLogger.log('goal_archived', { goalId: existingGoal.id, reason: 'new_goal_created' });
    }
    
    // Detect template
    const detectedTemplate = template || templateEngine.detectTemplate(description);
    const selectedTemplate = await templateEngine.getTemplate(detectedTemplate);
    
    // Generate title if not provided
    const goalTitle = title || description.slice(0, 80);
    
    // Create goal
    const goal = new GoalClass({
      title: goalTitle,
      description,
      template: detectedTemplate,
    });
    
    // Apply template structure
    if (selectedTemplate) {
      for (const section of selectedTemplate.sections) {
        if (goal.sections[section.key]) {
          goal.sections[section.key].title = section.title;
        }
      }
    }
    
    // Run project analysis if not disabled
    if (!noAnalysis) {
      await eventLogger.log('analysis_started', { goalId: goal.id });
      
      const analyzer = new ProjectAnalyzer(ctx.projectDir);
      const inventory = await analyzer.analyze();
      
      // Save inventory for reference
      await storage.saveAnalysisResult(`inventory-${goal.id}`, inventory);
      
      // Run analysis engine
      const analysisEngine = new AnalysisEngine(goal, storage);
      analysisEngine.setProjectInventory(inventory);
      
      const analysisTasks = analysisEngine.extractRequiredAnalyses();
      if (analysisTasks.length > 0) {
        await analysisEngine.runAnalyses(analysisTasks);
      }
      
      await eventLogger.log('analysis_completed', { 
        goalId: goal.id, 
        tasksTotal: analysisTasks.length,
        tasksCompleted: analysisTasks.filter(t => t.status === 'completed').length,
      });
    }
    
    // Validate goal
    const validation = await rulesEngine.validateGoal(goal);
    if (!validation.valid) {
      await eventLogger.log('goal_validation_failed', { 
        goalId: goal.id, 
        errors: validation.errors.length,
        warnings: validation.warnings.length,
      });
    }
    
    // Save goal
    await storage.saveActiveGoal(goal);
    await storage.saveHistoryVersion(goal);
    
    await eventLogger.log('goal_created', { 
      goalId: goal.id, 
      version: goal.version, 
      template: detectedTemplate,
      validation: validation.valid ? 'passed' : 'failed',
    });
    
    // Output success
    const output = `
✔ Goal erstellt
✔ Projekt analysiert
✔ Template "${detectedTemplate}" angewendet
✔ Analysen durchgeführt
✔ Validierung ${validation.valid ? 'bestanden' : 'mit Warnungen'}
✔ Aktives Goal gespeichert
✔ History Version v${goal.version} erstellt
✔ Events protokolliert

Goal ID: ${goal.id}
Version: ${goal.version}
Status: ${goal.metadata.status}
Fortschritt: ${goal.getProgress()}%

Nächste Schritte:
  /goal check       # Validierung prüfen
  /goal status      # Fortschritt anzeigen
  /orchestrate      # Agent-Team erstellen und Plan generieren
`;
    
    return { success: true, message: output.trim(), goalId: goal.id };
  },
};