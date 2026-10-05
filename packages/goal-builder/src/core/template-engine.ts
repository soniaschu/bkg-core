// BKG Goal Builder - Template Engine
// Handles built-in and custom templates

import { Template, TemplateSection } from './types.js';
import { GoalStorage } from './goal-storage.js';
import { readFile, listFiles } from '@bkg/plan-engine-core/utils.js';

export class TemplateEngine {
  private storage: GoalStorage;
  private builtinTemplates: Map<string, Template> = new Map();
  
  constructor(storage: GoalStorage) {
    this.storage = storage;
    this.loadBuiltinTemplates();
  }
  
  private loadBuiltinTemplates(): void {
    const templates: Template[] = [
      {
        name: 'implementation',
        description: 'Standard implementation task',
        triggers: ['implement', 'build', 'create', 'develop', 'code', 'feature'],
        sections: this.getImplementationSections(),
      },
      {
        name: 'migration',
        description: 'Migration from one system to another',
        triggers: ['migrate', 'port', 'move', 'upgrade', 'switch'],
        sections: this.getMigrationSections(),
      },
      {
        name: 'analyse',
        description: 'Analysis and research task',
        triggers: ['analyze', 'research', 'investigate', 'study', 'evaluate'],
        sections: this.getAnalysisSections(),
      },
      {
        name: 'bugfix',
        description: 'Bug fix task',
        triggers: ['fix', 'bug', 'issue', 'error', 'crash', 'regression'],
        sections: this.getBugfixSections(),
      },
      {
        name: 'release',
        description: 'Release and deployment task',
        triggers: ['release', 'deploy', 'publish', 'ship', 'launch'],
        sections: this.getReleaseSections(),
      },
      {
        name: 'refactoring',
        description: 'Code refactoring task',
        triggers: ['refactor', 'cleanup', 'improve', 'optimize', 'restructure'],
        sections: this.getRefactoringSections(),
      },
      {
        name: 'documentation',
        description: 'Documentation task',
        triggers: ['document', 'docs', 'readme', 'guide', 'tutorial'],
        sections: this.getDocumentationSections(),
      },
      {
        name: 'deployment',
        description: 'Infrastructure deployment task',
        triggers: ['deploy', 'infrastructure', 'kubernetes', 'docker', 'cloud'],
        sections: this.getDeploymentSections(),
      },
    ];
    
    for (const t of templates) {
      this.builtinTemplates.set(t.name, t);
    }
  }
  
  // Detect best template from natural language description
  detectTemplate(description: string): string {
    const lower = description.toLowerCase();
    let bestMatch = 'implementation';
    let maxMatches = 0;
    
    for (const [name, template] of this.builtinTemplates) {
      const matches = template.triggers.filter(t => lower.includes(t)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = name;
      }
    }
    
    return bestMatch;
  }
  
  // Get template by name
  async getTemplate(name: string): Promise<Template | null> {
    // Check builtin first
    if (this.builtinTemplates.has(name)) {
      return this.builtinTemplates.get(name)!;
    }
    
    // Check custom templates
    const content = await this.storage.getTemplate(`${name}.md`);
    if (content) {
      return this.parseTemplateMarkdown(name, content);
    }
    
    return null;
  }
  
  // List all available templates
  async listTemplates(): Promise<Template[]> {
    const templates: Template[] = Array.from(this.builtinTemplates.values());
    
    const customNames = await this.storage.listTemplates();
    for (const name of customNames) {
      const custom = await this.getTemplate(name.replace('.md', ''));
      if (custom) templates.push(custom);
    }
    
    return templates;
  }
  
  // Apply template to create initial goal structure
  applyTemplate(template: Template, title: string, description: string): Partial<Template> {
    return {
      name: template.name,
      description: template.description,
      sections: template.sections,
    };
  }
  
  private parseTemplateMarkdown(name: string, content: string): Template {
    // Simple parsing of template markdown
    return {
      name,
      description: `Custom template: ${name}`,
      triggers: [],
      sections: [],
    };
  }
  
  // Section definitions for each template
  private getImplementationSections(): TemplateSection[] {
    return [
      { key: 'ziel', title: 'Ziel', description: 'Was soll erreicht werden', required: true },
      { key: 'hintergrund', title: 'Hintergrund', description: 'Kontext und Motivation', required: true },
      { key: 'erfolgskriterien', title: 'Erfolgskriterien', description: 'Messbare Kriterien für Erfolg', required: true },
      { key: 'einschraenkungen', title: 'Einschränkungen', description: 'Technische/zeitliche Limits', required: true },
      { key: 'benoetigte-analyse', title: 'Benötigte Analyse', description: 'Was muss vorab geklärt werden', required: true },
      { key: 'abhaengigkeiten', title: 'Abhängigkeiten', description: 'Externe Abhängigkeiten', required: true },
      { key: 'implementierungsplan', title: 'Implementierungsplan', description: 'Phasen und Tasks', required: true },
      { key: 'validierung', title: 'Validierung', description: 'Wie wird validiert', required: true },
      { key: 'tests', title: 'Tests', description: 'Test-Strategie', required: true },
      { key: 'artefakte', title: 'Artefakte', description: 'Erwartete Ergebnisse', required: true },
      { key: 'dokumentation', title: 'Dokumentation', description: 'Was muss dokumentiert werden', required: true },
      { key: 'risiken', title: 'Risiken', description: 'Identifizierte Risiken', required: true },
      { key: 'rollback', title: 'Rollback', description: 'Rollback-Plan', required: true },
      { key: 'abschlussbedingungen', title: 'Abschlussbedingungen', description: 'Definition of Done', required: true },
      { key: 'aenderungsverlauf', title: 'Änderungsverlauf', description: 'Versionshistorie', required: true },
    ];
  }
  
  private getMigrationSections(): TemplateSection[] {
    return [
      { key: 'ziel', title: 'Ziel', description: 'Migration von X nach Y', required: true },
      { key: 'hintergrund', title: 'Hintergrund', description: 'Gründe für Migration', required: true },
      { key: 'erfolgskriterien', title: 'Erfolgskriterien', description: 'Alle Tests grün, keine Regressionen', required: true },
      { key: 'einschraenkungen', title: 'Einschränkungen', description: 'Downtime, Rollback-Zeit', required: true },
      { key: 'benoetigte-analyse', title: 'Benötigte Analyse', description: 'Architektur, Datenmodell, Dependencies', required: true },
      { key: 'abhaengigkeiten', title: 'Abhängigkeiten', required: true },
      { key: 'implementierungsplan', title: 'Implementierungsplan', description: 'Vorbereitung, Migration, Validierung', required: true },
      { key: 'validierung', title: 'Validierung', required: true },
      { key: 'tests', title: 'Tests', description: 'Unit, Integration, E2E', required: true },
      { key: 'artefakte', title: 'Artefakte', description: 'Scripts, Rollback-Plans', required: true },
      { key: 'dokumentation', title: 'Dokumentation', description: 'Migrations-Guide, Changelog', required: true },
      { key: 'risiken', title: 'Risiken', description: 'Datenverlust, Downtime', required: true },
      { key: 'rollback', title: 'Rollback', description: 'Detaillierter Rollback-Plan', required: true },
      { key: 'abschlussbedingungen', title: 'Abschlussbedingungen', required: true },
      { key: 'aenderungsverlauf', title: 'Änderungsverlauf', required: true },
    ];
  }
  
  private getAnalysisSections(): TemplateSection[] {
    return [
      { key: 'ziel', title: 'Ziel', description: 'Analyse von X', required: true },
      { key: 'hintergrund', title: 'Hintergrund', description: 'Warum Analyse nötig', required: true },
      { key: 'erfolgskriterien', title: 'Erfolgskriterien', description: 'Analyse abgeschlossen, Empfehlungen', required: true },
      { key: 'einschraenkungen', title: 'Einschränkungen', description: 'Zeitbudget, Tools', required: true },
      { key: 'benoetigte-analyse', title: 'Benötigte Analyse', description: 'Datenquellen, Methoden', required: true },
      { key: 'abhaengigkeiten', title: 'Abhängigkeiten', required: true },
      { key: 'implementierungsplan', title: 'Implementierungsplan', description: 'Datensammlung, Auswertung, Dokumentation', required: true },
      { key: 'validierung', title: 'Validierung', required: true },
      { key: 'tests', title: 'Tests', description: 'Validierung der Ergebnisse', required: true },
      { key: 'artefakte', title: 'Artefakte', description: 'Report, Rohdaten', required: true },
      { key: 'dokumentation', title: 'Dokumentation', required: true },
      { key: 'risiken', title: 'Risiken', required: true },
      { key: 'rollback', title: 'Rollback', description: 'Nicht anwendbar', required: true },
      { key: 'abschlussbedingungen', title: 'Abschlussbedingungen', required: true },
      { key: 'aenderungsverlauf', title: 'Änderungsverlauf', required: true },
    ];
  }
  
  private getBugfixSections(): TemplateSection[] {
    return [
      { key: 'ziel', title: 'Ziel', description: 'Fix für Bug X', required: true },
      { key: 'hintergrund', title: 'Hintergrund', description: 'Bug Report, Steps to Reproduce', required: true },
      { key: 'erfolgskriterien', title: 'Erfolgskriterien', description: 'Bug reproduzierbar, Fix implementiert, Tests grün', required: true },
      { key: 'einschraenkungen', title: 'Einschränkungen', description: 'Hotfix, betroffene Versionen', required: true },
      { key: 'benoetigte-analyse', title: 'Benötigte Analyse', description: 'Root Cause, betroffener Code', required: true },
      { key: 'abhaengigkeiten', title: 'Abhängigkeiten', required: true },
      { key: 'implementierungsplan', title: 'Implementierungsplan', description: 'Analyse, Fix, Validierung', required: true },
      { key: 'validierung', title: 'Validierung', required: true },
      { key: 'tests', title: 'Tests', description: 'Regressionstest für Bug', required: true },
      { key: 'artefakte', title: 'Artefakte', description: 'Fix-Commit, Test-Case', required: true },
      { key: 'dokumentation', title: 'Dokumentation', description: 'Changelog Entry', required: true },
      { key: 'risiken', title: 'Risiken', required: true },
      { key: 'rollback', title: 'Rollback', description: 'Revert Commit', required: true },
      { key: 'abschlussbedingungen', title: 'Abschlussbedingungen', required: true },
      { key: 'aenderungsverlauf', title: 'Änderungsverlauf', required: true },
    ];
  }
  
  private getReleaseSections(): TemplateSection[] {
    return [
      { key: 'ziel', title: 'Ziel', description: 'Release Version X', required: true },
      { key: 'hintergrund', title: 'Hintergrund', description: 'Release Notes, Features, Fixes', required: true },
      { key: 'erfolgskriterien', title: 'Erfolgskriterien', description: 'Tests grün, Build, Deploy, Smoke Tests', required: true },
      { key: 'einschraenkungen', title: 'Einschränkungen', description: 'Release Window, Rollback Plan', required: true },
      { key: 'benoetigte-analyse', title: 'Benötigte Analyse', description: 'Changelog, Breaking Changes', required: true },
      { key: 'abhaengigkeiten', title: 'Abhängigkeiten', required: true },
      { key: 'implementierungsplan', title: 'Implementierungsplan', description: 'Vorbereitung, Build, Deploy, Post-Release', required: true },
      { key: 'validierung', title: 'Validierung', required: true },
      { key: 'tests', title: 'Tests', description: 'Full Test Suite, Smoke Tests', required: true },
      { key: 'artefakte', title: 'Artefakte', description: 'Binary, Docker Images, SBOM', required: true },
      { key: 'dokumentation', title: 'Dokumentation', description: 'Release Notes, Upgrade Guide', required: true },
      { key: 'risiken', title: 'Risiken', required: true },
      { key: 'rollback', title: 'Rollback', required: true },
      { key: 'abschlussbedingungen', title: 'Abschlussbedingungen', required: true },
      { key: 'aenderungsverlauf', title: 'Änderungsverlauf', required: true },
    ];
  }
  
  private getRefactoringSections(): TemplateSection[] {
    return [
      { key: 'ziel', title: 'Ziel', description: 'Refactoring von Component X', required: true },
      { key: 'hintergrund', title: 'Hintergrund', description: 'Technical Debt, Performance, Maintainability', required: true },
      { key: 'erfolgskriterien', title: 'Erfolgskriterien', description: 'Code Metrics, Tests grün, Verhalten gleich', required: true },
      { key: 'einschraenkungen', title: 'Einschränkungen', description: 'Scope, Zeitbudget', required: true },
      { key: 'benoetigte-analyse', title: 'Benötigte Analyse', description: 'Aktueller Code, Tests, Dependencies', required: true },
      { key: 'abhaengigkeiten', title: 'Abhängigkeiten', required: true },
      { key: 'implementierungsplan', title: 'Implementierungsplan', description: 'Vorbereitung, Refactoring, Validierung', required: true },
      { key: 'validierung', title: 'Validierung', required: true },
      { key: 'tests', title: 'Tests', description: 'Bestehende + neue Tests', required: true },
      { key: 'artefakte', title: 'Artefakte', description: 'Refactored Code, Metrics Report', required: true },
      { key: 'dokumentation', title: 'Dokumentation', description: 'ADR', required: true },
      { key: 'risiken', title: 'Risiken', required: true },
      { key: 'rollback', title: 'Rollback', description: 'Git Revert', required: true },
      { key: 'abschlussbedingungen', title: 'Abschlussbedingungen', required: true },
      { key: 'aenderungsverlauf', title: 'Änderungsverlauf', required: true },
    ];
  }
  
  private getDocumentationSections(): TemplateSection[] {
    return [
      { key: 'ziel', title: 'Ziel', description: 'Dokumentation für X', required: true },
      { key: 'hintergrund', title: 'Hintergrund', description: 'Warum Doku nötig', required: true },
      { key: 'erfolgskriterien', title: 'Erfolgskriterien', description: 'Vollständig, Verständlich, Aktuell', required: true },
      { key: 'einschraenkungen', title: 'Einschränkungen', description: 'Format, Sprache', required: true },
      { key: 'benoetigte-analyse', title: 'Benötigte Analyse', description: 'Bestehende Doku, Zielgruppe', required: true },
      { key: 'abhaengigkeiten', title: 'Abhängigkeiten', required: true },
      { key: 'implementierungsplan', title: 'Implementierungsplan', description: 'Recherche, Erstellung, Review', required: true },
      { key: 'validierung', title: 'Validierung', required: true },
      { key: 'tests', title: 'Tests', description: 'Link Check, Code Examples', required: true },
      { key: 'artefakte', title: 'Artefakte', description: 'Dokumentation, Beispiele', required: true },
      { key: 'dokumentation', title: 'Dokumentation', required: true },
      { key: 'risiken', title: 'Risiken', required: true },
      { key: 'rollback', title: 'Rollback', description: 'Vorherige Version', required: true },
      { key: 'abschlussbedingungen', title: 'Abschlussbedingungen', required: true },
      { key: 'aenderungsverlauf', title: 'Änderungsverlauf', required: true },
    ];
  }
  
  private getDeploymentSections(): TemplateSection[] {
    return [
      { key: 'ziel', title: 'Ziel', description: 'Deployment von X nach Y', required: true },
      { key: 'hintergrund', title: 'Hintergrund', description: 'Release Info, Changes', required: true },
      { key: 'erfolgskriterien', title: 'Erfolgskriterien', description: 'Deploy erfolgreich, Health Checks, Smoke Tests', required: true },
      { key: 'einschraenkungen', title: 'Einschränkungen', description: 'Downtime, Rollback Time', required: true },
      { key: 'benoetigte-analyse', title: 'Benötigte Analyse', description: 'Infrastructure, Config, Secrets', required: true },
      { key: 'abhaengigkeiten', title: 'Abhängigkeiten', required: true },
      { key: 'implementierungsplan', title: 'Implementierungsplan', description: 'Vorbereitung, Deploy, Validierung', required: true },
      { key: 'validierung', title: 'Validierung', required: true },
      { key: 'tests', title: 'Tests', description: 'Smoke Tests, Integration Tests', required: true },
      { key: 'artefakte', title: 'Artefakte', required: true },
      { key: 'dokumentation', title: 'Dokumentation', description: 'Runbook', required: true },
      { key: 'risiken', title: 'Risiken', required: true },
      { key: 'rollback', title: 'Rollback', required: true },
      { key: 'abschlussbedingungen', title: 'Abschlussbedingungen', required: true },
      { key: 'aenderungsverlauf', title: 'Änderungsverlauf', required: true },
    ];
  }
}