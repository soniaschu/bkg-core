// BKG Goal Builder - Rules Engine
// Enforces goal rules and validation

import { Goal } from './goal.js';
import { GoalStorage } from './goal-storage.js';
import { FORBIDDEN_TERMS, ALLOWED_TERMS } from './goal.js';

export class RulesEngine {
  private storage: GoalStorage;
  private rules: string = '';
  private customRules: CustomRule[] = [];
  
  constructor(storage: GoalStorage) {
    this.storage = storage;
  }
  
  async initialize(): Promise<void> {
    this.rules = await this.storage.getRules();
    this.parseCustomRules();
  }
  
  private parseCustomRules(): void {
    // Parse custom rules from markdown
    const lines = this.rules.split('\n');
    let inCustomSection = false;
    
    for (const line of lines) {
      if (line.includes('Custom Rules') || line.includes('Benutzerdefinierte Regeln')) {
        inCustomSection = true;
        continue;
      }
      
      if (inCustomSection && line.startsWith('##')) {
        inCustomSection = false;
      }
      
      if (inCustomSection && line.trim().startsWith('- ')) {
        const ruleText = line.trim().substring(2);
        this.customRules.push(this.parseRule(ruleText));
      }
    }
  }
  
  private parseRule(text: string): CustomRule {
    // Simple rule parsing
    return {
      id: `custom-${Date.now()}`,
      description: text,
      check: (goal: Goal) => ({ pass: true, message: '' }),
    };
  }
  
  // Validate goal against all rules
  async validateGoal(goal: Goal): Promise<RulesValidationResult> {
    const violations: RuleViolation[] = [];
    const warnings: RuleViolation[] = [];
    
    // Core rules
    this.checkSingleActiveGoal(goal, violations);
    this.checkNoForbiddenTerms(goal, violations);
    this.checkRequiredSections(goal, violations);
    this.checkSuccessCriteria(goal, violations);
    this.checkTestsDefined(goal, violations);
    this.checkRollbackPlan(goal, violations);
    this.checkArchitecturePreserved(goal, warnings);
    this.checkReproducibleSteps(goal, warnings);
    this.checkEvidenceForTasks(goal, warnings);
    this.checkValidationForImplementation(goal, warnings);
    this.checkNoTodos(goal, violations);
    this.checkNoPlaceholders(goal, violations);
    this.checkTimestamps(goal, warnings);
    
    // Custom rules
    for (const rule of this.customRules) {
      const result = rule.check(goal);
      if (!result.pass) {
        violations.push({
          rule: rule.id,
          message: result.message,
          severity: 'error',
        });
      }
    }
    
    return {
      valid: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      warnings: warnings.filter(v => v.severity === 'warning'),
    };
  }
  
  private checkSingleActiveGoal(goal: Goal, violations: RuleViolation[]): void {
    // This is enforced at storage level
  }
  
  private checkNoForbiddenTerms(goal: Goal, violations: RuleViolation[]): void {
    for (const [key, section] of Object.entries(goal.sections)) {
      if (!section.content) continue;
      
      for (const term of FORBIDDEN_TERMS) {
        if (section.content.includes(term) && !ALLOWED_TERMS.includes(term)) {
          violations.push({
            rule: 'no-forbidden-terms',
            message: `Forbidden term "${term}" in section "${section.title}"`,
            severity: 'error',
            section: key,
          });
        }
      }
    }
  }
  
  private checkRequiredSections(goal: Goal, violations: RuleViolation[]): void {
    for (const [key, section] of Object.entries(goal.sections)) {
      if (section.required && !section.completed) {
        violations.push({
          rule: 'required-sections',
          message: `Required section "${section.title}" is incomplete`,
          severity: 'error',
          section: key,
        });
      }
    }
  }
  
  private checkSuccessCriteria(goal: Goal, violations: RuleViolation[]): void {
    const section = goal.sections['erfolgskriterien'];
    if (!section || !section.content) {
      violations.push({
        rule: 'success-criteria',
        message: 'No success criteria defined',
        severity: 'error',
        section: 'erfolgskriterien',
      });
      return;
    }
    
    const criteriaCount = (section.content.match(/[-*]\s+\[.\]/g) || []).length;
    if (criteriaCount === 0) {
      violations.push({
        rule: 'success-criteria-checkable',
        message: 'Success criteria must be checkable items (use "- [ ]" format)',
        severity: 'error',
        section: 'erfolgskriterien',
      });
    }
  }
  
  private checkTestsDefined(goal: Goal, violations: RuleViolation[]): void {
    const section = goal.sections['tests'];
    if (!section || !section.content) {
      violations.push({
        rule: 'tests-defined',
        message: 'No tests defined',
        severity: 'error',
        section: 'tests',
      });
      return;
    }
    
    const testCount = (section.content.match(/[-*]\s+\[.\]/g) || []).length;
    if (testCount === 0) {
      violations.push({
        rule: 'tests-checkable',
        message: 'Tests must be checkable items (use "- [ ]" format)',
        severity: 'error',
        section: 'tests',
      });
    }
  }
  
  private checkRollbackPlan(goal: Goal, violations: RuleViolation[]): void {
    const section = goal.sections['rollback'];
    if (!section || !section.content || section.content.trim().length < 20) {
      violations.push({
        rule: 'rollback-plan',
        message: 'Rollback plan missing or too short',
        severity: 'error',
        section: 'rollback',
      });
    }
  }
  
  private checkArchitecturePreserved(goal: Goal, warnings: RuleViolation[]): void {
    const section = goal.sections['implementierungsplan'];
    if (section && section.content) {
      const hasArchitectureMention = /architektur|architecture|struktur|structure/i.test(section.content);
      if (!hasArchitectureMention) {
        warnings.push({
          rule: 'architecture-preserved',
          message: 'Implementation plan does not mention architecture preservation',
          severity: 'warning',
          section: 'implementierungsplan',
        });
      }
    }
  }
  
  private checkReproducibleSteps(goal: Goal, warnings: RuleViolation[]): void {
    const section = goal.sections['implementierungsplan'];
    if (section && section.content) {
      const stepCount = (section.content.match(/^\s*[-*]\s+\d+\./gm) || []).length;
      if (stepCount < 3) {
        warnings.push({
          rule: 'reproducible-steps',
          message: 'Implementation plan should have more detailed, reproducible steps',
          severity: 'warning',
          section: 'implementierungsplan',
        });
      }
    }
  }
  
  private checkEvidenceForTasks(goal: Goal, warnings: RuleViolation[]): void {
    const section = goal.sections['implementierungsplan'];
    if (section && section.content) {
      const hasEvidenceMention = /nachweis|evidence|proof|beleg/i.test(section.content);
      if (!hasEvidenceMention) {
        warnings.push({
          rule: 'evidence-for-tasks',
          message: 'Consider adding evidence requirements for completed tasks',
          severity: 'warning',
          section: 'implementierungsplan',
        });
      }
    }
  }
  
  private checkValidationForImplementation(goal: Goal, warnings: RuleViolation[]): void {
    const section = goal.sections['validierung'];
    if (!section || !section.content || section.content.trim().length < 30) {
      warnings.push({
        rule: 'validation-for-implementation',
        message: 'Validation section should describe how implementation will be validated',
        severity: 'warning',
        section: 'validierung',
      });
    }
  }
  
  private checkNoTodos(goal: Goal, violations: RuleViolation[]): void {
    for (const [key, section] of Object.entries(goal.sections)) {
      if (section.content && /TODO|TBD/i.test(section.content)) {
        violations.push({
          rule: 'no-todos',
          message: 'TODO/TBD found in completed goal (use ERFORDERT ANALYSE for unknowns)',
          severity: 'error',
          section: key,
        });
      }
    }
  }
  
  private checkNoPlaceholders(goal: Goal, violations: RuleViolation[]): void {
    const placeholderPatterns = [
      /\{\{.*\}\}/,
      /\[\[.*\]\]/,
      /<.*>/,
      /PLACEHOLDER/i,
      /DUMMY/i,
      /MOCK/i,
    ];
    
    for (const [key, section] of Object.entries(goal.sections)) {
      if (section.content) {
        for (const pattern of placeholderPatterns) {
          if (pattern.test(section.content)) {
            violations.push({
              rule: 'no-placeholders',
              message: `Placeholder syntax detected in "${section.title}" (use ERFORDERT ANALYSE)`,
              severity: 'error',
              section: key,
            });
            break;
          }
        }
      }
    }
  }
  
  private checkTimestamps(goal: Goal, warnings: RuleViolation[]): void {
    if (!goal.metadata.createdAt || !goal.metadata.updatedAt) {
      warnings.push({
        rule: 'timestamps',
        message: 'Goal missing timestamps',
        severity: 'warning',
      });
    }
  }
  
  // Add custom rule
  addCustomRule(rule: CustomRule): void {
    this.customRules.push(rule);
  }
  
  // Get all rules as markdown
  getRulesMarkdown(): string {
    return this.rules;
  }
  
  // Update rules
  async updateRules(newRules: string): Promise<void> {
    this.rules = newRules;
    this.parseCustomRules();
    await this.storage.updateRules(newRules);
  }
}

interface CustomRule {
  id: string;
  description: string;
  check: (goal: Goal) => { pass: boolean; message: string };
}

interface RuleViolation {
  rule: string;
  message: string;
  severity: 'error' | 'warning';
  section?: string;
}

interface RulesValidationResult {
  valid: boolean;
  violations: RuleViolation[];
  warnings: RuleViolation[];
}