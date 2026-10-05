// BKG Goal Builder - Check Command
// Validates the active goal

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage } from '../core/goal-storage.js';
import { RulesEngine } from '../core/rules-engine.js';
import { GoalValidator } from '../core/goal-validator.js';

export const checkCommand: Command = {
  name: 'check',
  description: 'Validate the active goal',
  arguments: [],
  options: [
    {
      name: 'verbose',
      short: 'v',
      description: 'Show detailed validation results',
      type: 'boolean',
      default: false,
    },
    {
      name: 'fix',
      short: 'f',
      description: 'Attempt to auto-fix issues',
      type: 'boolean',
      default: false,
    },
  ],
  async execute(ctx) {
    const { verbose, fix } = ctx.args;
    
    const storage = new GoalStorage(ctx.projectDir);
    const goal = await storage.getActiveGoal();
    
    if (!goal) {
      return { success: false, message: 'Kein aktives Goal gefunden. Erstellen Sie eines mit /goal make' };
    }
    
    const rulesEngine = new RulesEngine(storage);
    await rulesEngine.initialize();
    
    const validator = new GoalValidator(goal);
    
    // Run all validations
    const rulesValidation = await rulesEngine.validateGoal(goal);
    const syntaxValidation = validator.validateSyntax();
    const placeholderValidation = validator.validatePlaceholders();
    
    const allValid = rulesValidation.valid && syntaxValidation.valid && placeholderValidation.valid;
    const allErrors = [
      ...rulesValidation.violations.filter(v => v.severity === 'error'),
      ...syntaxValidation.errors,
      ...placeholderValidation.errors,
    ];
    const allWarnings = [
      ...rulesValidation.violations.filter(v => v.severity === 'warning'),
      ...rulesValidation.warnings,
      ...syntaxValidation.warnings,
      ...placeholderValidation.warnings,
    ];
    
    if (allValid) {
      let output = `✔ Goal Validierung bestanden\n\n`;
      output += `Goal: ${goal.metadata.title} (v${goal.version})\n`;
      output += `Fortschritt: ${goal.getProgress()}%\n`;
      
      if (verbose) {
        output += `\nAlle Prüfungen bestanden:\n`;
        output += `  - Erforderliche Sektionen: ${Object.values(goal.sections).filter(s => s.required && s.completed).length}/${Object.values(goal.sections).filter(s => s.required).length}\n`;
        output += `  - Verbotene Begriffe: Keine gefunden\n`;
        output += `  - Syntax: OK\n`;
        output += `  - Platzhalter: Keine gefunden\n`;
        output += `  - Erfolgskriterien: ${goal.sections['erfolgskriterien']?.completed ? 'OK' : 'Fehlt'}\n`;
        output += `  - Tests: ${goal.sections['tests']?.completed ? 'OK' : 'Fehlt'}\n`;
        output += `  - Rollback-Plan: ${goal.sections['rollback']?.completed ? 'OK' : 'Fehlt'}\n`;
      }
      
      return { success: true, message: output.trim() };
    }
    
    let output = `✗ Goal Validierung fehlgeschlagen\n\n`;
    output += `Goal: ${goal.metadata.title} (v${goal.version})\n`;
    output += `Fortschritt: ${goal.getProgress()}%\n\n`;
    
    if (allErrors.length > 0) {
      output += `Fehler (${allErrors.length}):\n`;
      for (const error of allErrors) {
        output += `  ✗ [${error.section || 'global'}] ${error.message}\n`;
      }
      output += '\n';
    }
    
    if (allWarnings.length > 0) {
      output += `Warnungen (${allWarnings.length}):\n`;
      for (const warning of allWarnings) {
        output += `  ⚠ [${warning.section || 'global'}] ${warning.message}\n`;
      }
      output += '\n';
    }
    
    if (verbose && rulesValidation.violations.length > 0) {
      output += `Alle Regel-Prüfungen:\n`;
      for (const v of rulesValidation.violations) {
        const icon = v.severity === 'error' ? '✗' : '⚠';
        output += `  ${icon} [${v.rule}] ${v.message}\n`;
      }
    }
    
    output += `\nUnvollständige Sektionen: ${goal.getIncompleteSections().join(', ') || 'Keine'}`;
    
    return { success: false, message: output.trim(), errors: allErrors.length, warnings: allWarnings.length };
  },
};