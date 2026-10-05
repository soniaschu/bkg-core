// BKG Goal Builder - Goal Validator
// Validates goals against rules and requirements

import { Goal } from './goal.js';
import { ValidationResult, ValidationError, ValidationWarning } from './types.js';
import { FORBIDDEN_TERMS, ALLOWED_TERMS } from './goal.js';

export class GoalValidator {
  private goal: Goal;
  
  constructor(goal: Goal) {
    this.goal = goal;
  }
  
  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check required sections
    this.validateRequiredSections(errors);
    
    // Check forbidden terms
    this.validateForbiddenTerms(errors, warnings);
    
    // Check section content quality
    this.validateSectionQuality(warnings);
    
    // Check analysis completeness
    this.validateAnalysisCompleteness(errors, warnings);
    
    // Check task structure
    this.validateTaskStructure(warnings);
    
    // Check success criteria
    this.validateSuccessCriteria(errors, warnings);
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  private validateRequiredSections(errors: ValidationError[]): void {
    for (const section of Object.values(this.goal.sections)) {
      if (section.required && !section.completed) {
        errors.push({
          section: section.title,
          message: `Required section "${section.title}" is not completed`,
          code: 'REQUIRED_SECTION_INCOMPLETE',
        });
      }
    }
  }
  
  private validateForbiddenTerms(errors: ValidationError[], warnings: ValidationWarning[]): void {
    for (const [key, section] of Object.entries(this.goal.sections)) {
      if (!section.content) continue;
      
      for (const term of FORBIDDEN_TERMS) {
        if (section.content.includes(term) && !ALLOWED_TERMS.includes(term)) {
          errors.push({
            section: section.title,
            message: `Forbidden term "${term}" found in section`,
            code: 'FORBIDDEN_TERM',
          });
        }
      }
    }
  }
  
  private validateSectionQuality(warnings: ValidationWarning[]): void {
    for (const [key, section] of Object.entries(this.goal.sections)) {
      if (!section.content) continue;
      
      // Check for very short content in important sections
      const importantSections = ['ziel', 'erfolgskriterien', 'tests', 'implementierungsplan'];
      if (importantSections.includes(key) && section.content.length < 50) {
        warnings.push({
          section: section.title,
          message: `Section "${section.title}" seems very short (< 50 chars)`,
          code: 'SECTION_TOO_SHORT',
        });
      }
      
      // Check for duplicate content
      const words = section.content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const uniqueWords = new Set(words);
      if (words.length > 0 && uniqueWords.size / words.length < 0.3) {
        warnings.push({
          section: section.title,
          message: `Section "${section.title}" has high word repetition`,
          code: 'HIGH_REPETITION',
        });
      }
    }
  }
  
  private validateAnalysisCompleteness(errors: ValidationError[], warnings: ValidationWarning[]): void {
    const analysisSection = this.goal.sections['benoetigte-analyse'];
    if (analysisSection && analysisSection.content.includes('ERFORDERT ANALYSE')) {
      warnings.push({
        section: analysisSection.title,
        message: 'Analysis section still contains "ERFORDERT ANALYSE" markers',
        code: 'ANALYSIS_INCOMPLETE',
      });
    }
  }
  
  private validateTaskStructure(warnings: ValidationWarning[]): void {
    const planSection = this.goal.sections['implementierungsplan'];
    if (!planSection || !planSection.content) return;
    
    // Check for phase structure
    const hasPhases = /phase\s*\d+/i.test(planSection.content) || /##\s*Phase/i.test(planSection.content);
    if (!hasPhases) {
      warnings.push({
        section: planSection.title,
        message: 'Implementation plan does not appear to have defined phases',
        code: 'NO_PHASES',
      });
    }
    
    // Check for task breakdown
    const taskCount = (planSection.content.match(/[-*]\s+\[.\]/g) || []).length;
    if (taskCount < 3) {
      warnings.push({
        section: planSection.title,
        message: `Implementation plan has only ${taskCount} tasks (recommend 3+)`,
        code: 'FEW_TASKS',
      });
    }
  }
  
  private validateSuccessCriteria(errors: ValidationError[], warnings: ValidationWarning[]): void {
    const criteriaSection = this.goal.sections['erfolgskriterien'];
    if (!criteriaSection || !criteriaSection.content) {
      errors.push({
        section: 'Erfolgskriterien',
        message: 'No success criteria defined',
        code: 'NO_SUCCESS_CRITERIA',
      });
      return;
    }
    
    const criteriaCount = (criteriaSection.content.match(/[-*]\s+\[.\]/g) || []).length;
    if (criteriaCount === 0) {
      errors.push({
        section: 'Erfolgskriterien',
        message: 'Success criteria must be checkable items (use "- [ ]" format)',
        code: 'CRITERIA_NOT_CHECKABLE',
      });
    } else if (criteriaCount < 2) {
      warnings.push({
        section: 'Erfolgskriterien',
        message: `Only ${criteriaCount} success criterion (recommend 2+)`,
        code: 'FEW_CRITERIA',
      });
    }
  }
  
  // Quick validation for specific checks
  validateSyntax(): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Check markdown structure
    for (const [key, section] of Object.entries(this.goal.sections)) {
      if (section.content) {
        // Check for unmatched brackets
        const openBrackets = (section.content.match(/\[/g) || []).length;
        const closeBrackets = (section.content.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) {
          errors.push({
            section: section.title,
            message: 'Unmatched brackets in markdown',
            code: 'UNMATCHED_BRACKETS',
          });
        }
      }
    }
    
    return { valid: errors.length === 0, errors, warnings: [] };
  }
  
  validatePlaceholders(): ValidationResult {
    const errors: ValidationError[] = [];
    const placeholderPattern = /\{\{.*\}\}|\[\[.*\]\]|<.*>/;
    
    for (const [key, section] of Object.entries(this.goal.sections)) {
      if (section.content && placeholderPattern.test(section.content)) {
        errors.push({
          section: section.title,
          message: 'Placeholder syntax detected (use ERFORDERT ANALYSE instead)',
          code: 'PLACEHOLDER_SYNTAX',
        });
      }
    }
    
    return { valid: errors.length === 0, errors, warnings: [] };
  }
}