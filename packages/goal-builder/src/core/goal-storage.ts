// BKG Goal Builder - Goal Storage
// Handles atomic file operations for goals, history, and archive

import { Goal } from './goal.js';
import { ProjectInventory, AnalysisTask } from './types.js';
import { 
  generateId, 
  timestamp,
  readJsonFile,
  writeJsonFile,
  ensureDir,
  readFile,
  writeFile,
  listFiles,
  fileExists,
} from '@bkg/plan-engine-core';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

export class GoalStorage {
  private projectDir: string;
  private goalsDir: string;
  private activeGoalFile: string;
  private historyDir: string;
  private archiveDir: string;
  private indexFile: string;
  private eventsFile: string;
  private analysisDir: string;
  private rulesFile: string;
  private templatesDir: string;
  
  constructor(projectDir: string) {
    this.projectDir = projectDir;
    this.goalsDir = join(projectDir, '.goals');
    this.activeGoalFile = join(this.goalsDir, 'active.goal.md');
    this.historyDir = join(this.goalsDir, 'history');
    this.archiveDir = join(this.goalsDir, 'archive');
    this.indexFile = join(this.goalsDir, 'index.json');
    this.eventsFile = join(this.goalsDir, 'events.log');
    this.analysisDir = join(this.goalsDir, 'analysis');
    this.rulesFile = join(this.goalsDir, 'rules.md');
    this.templatesDir = join(this.goalsDir, 'templates');
  }
  
  async initialize(): Promise<void> {
    await ensureDir(this.goalsDir);
    await ensureDir(this.historyDir);
    await ensureDir(this.archiveDir);
    await ensureDir(this.analysisDir);
    await ensureDir(this.templatesDir);
    
    // Create default rules if not exists
    if (!(await fileExists(this.rulesFile))) {
      await this.createDefaultRules();
    }
    
    // Create default templates if not exists
    await this.createDefaultTemplates();
    
    // Create index if not exists
    if (!(await fileExists(this.indexFile))) {
      await writeJsonFile(this.indexFile, {
        active: null,
        history: [],
        archive: [],
        createdAt: timestamp(),
      });
    }
  }
  
  private async createDefaultRules(): Promise<void> {
    const rules = `# BKG Goal Rules

## Core Principles

1. **Erst analysieren, dann implementieren.** - Never start implementation without complete analysis.
2. **Keine Annahmen treffen.** - All unknowns must be marked as "ERFORDERT ANALYSE".
3. **Keine APIs erfinden.** - Use existing APIs, don't create fictional ones.
4. **Keine Dateien überschreiben ohne Sicherung.** - Always backup before modifying.
5. **Keine Erfolgsmeldung ohne erfolgreiche Tests.** - Tests must pass before claiming completion.
6. **Jede erledigte Aufgabe benötigt Nachweise.** - Evidence required for every completed task.
7. **Jede Implementierung benötigt Validierung.** - Validation step mandatory.
8. **Architektur muss erhalten bleiben.** - Don't break existing architecture.
9. **Keine TODOs im fertigen Goal.** - All TODOs must be resolved.
10. **Keine Platzhalter.** - Use "ERFORDERT ANALYSE" for unknowns.
11. **Immer reproduzierbare Schritte.** - Every step must be reproducible.
12. **Nur ein aktives Goal gleichzeitig.** - Single active goal constraint.
13. **Alte Goals niemals automatisch löschen.** - Archive instead of delete.
14. **Archiv niemals verändern.** - Archive is immutable.
15. **Zeitstempel protokollieren.** - All changes timestamped.

## Forbidden Terms

The following terms are NOT allowed in any goal section:
- TODO
- TBD
- Vielleicht
- Später
- Unknown
- Placeholder
- Dummy
- Mock

Exception: "ERFORDERT ANALYSE" is allowed and encouraged for unknown information.

## Validation Requirements

Every goal MUST have:
- At least one success criterion (checkable)
- At least one test defined
- Rollback plan
- All required sections completed
- No forbidden terms
- Version history maintained
`;
    
    await writeFile(this.rulesFile, rules);
  }
  
  private async createDefaultTemplates(): Promise<void> {
    const templates = [
      { name: 'implementation.md', content: this.getImplementationTemplate() },
      { name: 'migration.md', content: this.getMigrationTemplate() },
      { name: 'analyse.md', content: this.getAnalysisTemplate() },
      { name: 'bugfix.md', content: this.getBugfixTemplate() },
      { name: 'release.md', content: this.getReleaseTemplate() },
      { name: 'refactoring.md', content: this.getRefactoringTemplate() },
      { name: 'documentation.md', content: this.getDocumentationTemplate() },
      { name: 'deployment.md', content: this.getDeploymentTemplate() },
    ];
    
    for (const t of templates) {
      const path = join(this.templatesDir, t.name);
      if (!(await fileExists(path))) {
        await writeFile(path, t.content);
      }
    }
  }
  
  // Active Goal
  async saveActiveGoal(goal: Goal): Promise<void> {
    await this.initialize();
    
    // Save as markdown
    await writeFile(this.activeGoalFile, goal.toMarkdown());
    
    // Save as JSON for programmatic access
    await writeJsonFile(this.activeGoalFile.replace('.md', '.json'), goal);
    
    // Update index
    await this.updateIndex({ active: goal.id });
    
    // Log event
    await this.logEvent('goal_created', { goalId: goal.id, version: goal.version, template: goal.metadata.template });
  }
  
  async getActiveGoal(): Promise<Goal | null> {
    const jsonFile = this.activeGoalFile.replace('.md', '.json');
    return readJsonFile(jsonFile);
  }
  
  async clearActiveGoal(): Promise<void> {
    await writeJsonFile(this.activeGoalFile.replace('.md', '.json'), null);
    await this.updateIndex({ active: null });
  }
  
  // History
  async saveHistoryVersion(goal: Goal): Promise<void> {
    await this.initialize();
    
    const versionFile = join(this.historyDir, `v${goal.version}-${goal.id}.goal.md`);
    await writeFile(versionFile, goal.toMarkdown());
    
    const jsonFile = join(this.historyDir, `v${goal.version}-${goal.id}.goal.json`);
    await writeJsonFile(jsonFile, goal);
    
    // Update index
    const index = await readJsonFile(this.indexFile);
    if (index) {
      index.history.push({
        version: goal.version,
        goalId: goal.id,
        timestamp: timestamp(),
        file: versionFile,
      });
      await writeJsonFile(this.indexFile, index);
    }
    
    await this.logEvent('goal_version_created', { goalId: goal.id, version: goal.version });
  }
  
  async getHistoryVersions(goalId: string): Promise<any[]> {
    const index = await readJsonFile(this.indexFile);
    return index?.history?.filter((h: any) => h.goalId === goalId) || [];
  }
  
  async getHistoryVersion(goalId: string, version: number): Promise<Goal | null> {
    const jsonFile = join(this.historyDir, `v${version}-${goalId}.goal.json`);
    return readJsonFile(jsonFile);
  }
  
  // Archive
  async archiveGoal(goal: Goal): Promise<void> {
    await this.initialize();
    
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const archiveName = `${dateStr}-${goal.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.goal.md`;
    const archiveFile = join(this.archiveDir, archiveName);
    
    await writeFile(archiveFile, goal.toMarkdown());
    
    const jsonFile = archiveFile.replace('.md', '.json');
    await writeJsonFile(jsonFile, goal);
    
    // Update index
    const index = await readJsonFile(this.indexFile);
    if (index) {
      index.archive.push({
        goalId: goal.id,
        title: goal.metadata.title,
        timestamp: timestamp(),
        file: archiveFile,
        version: goal.version,
      });
      index.active = null;
      await writeJsonFile(this.indexFile, index);
    }
    
    await this.clearActiveGoal();
    await this.logEvent('goal_archived', { goalId: goal.id, archiveFile: archiveName });
  }
  
  async listArchivedGoals(): Promise<any[]> {
    const index = await readJsonFile(this.indexFile);
    return index?.archive || [];
  }
  
  async activateArchivedGoal(archiveEntry: any): Promise<Goal> {
    const jsonFile = archiveEntry.file.replace('.md', '.json');
    const goal = await readJsonFile(jsonFile);
    if (!goal) throw new Error('Archived goal not found');
    
    // Save as new active goal (creates new version)
    goal.version++;
    goal.metadata.status = 'ready';
    goal.metadata.updatedAt = timestamp();
    goal.addHistoryEntry('Activated from archive');
    
    await this.saveActiveGoal(goal);
    await this.logEvent('goal_activated', { goalId: goal.id, fromArchive: archiveEntry.file });
    
    return goal;
  }
  
  async deleteArchivedGoal(archiveEntry: any): Promise<void> {
    const files = [archiveEntry.file, archiveEntry.file.replace('.md', '.json')];
    
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch {}
    }
    
    const index = await readJsonFile(this.indexFile);
    if (index) {
      index.archive = index.archive.filter((a: any) => a.file !== archiveEntry.file);
      await writeJsonFile(this.indexFile, index);
    }
    
    await this.logEvent('goal_deleted', { archiveFile: archiveEntry.file });
  }
  
  // Index
  private async updateIndex(updates: any): Promise<void> {
    const index = await readJsonFile(this.indexFile);
    if (index) {
      Object.assign(index, updates);
      index.updatedAt = timestamp();
      await writeJsonFile(this.indexFile, index);
    }
  }
  
  async getIndex(): Promise<any> {
    return readJsonFile(this.indexFile);
  }
  
  // Events
  async logEvent(event: string, data: any): Promise<void> {
    await this.initialize();
    
    const entry = {
      timestamp: timestamp(),
      event,
      data,
    };
    
    const line = JSON.stringify(entry) + '\n';
    await fs.appendFile(this.eventsFile, line);
  }
  
  async getEvents(filter?: { event?: string; since?: string; limit?: number }): Promise<any[]> {
    const content = await readFile(this.eventsFile);
    if (!content) return [];
    
    const lines = content.trim().split('\n').filter(l => l);
    const events = lines.map(l => JSON.parse(l));
    
    let filtered = events;
    
    if (filter?.event) {
      filtered = filtered.filter(e => e.event === filter.event);
    }
    
    if (filter?.since) {
      const sinceDate = new Date(filter.since);
      filtered = filtered.filter(e => new Date(e.timestamp) >= sinceDate);
    }
    
    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }
    
    return filtered;
  }
  
  // Analysis
  async saveAnalysisResult(taskId: string, result: any): Promise<void> {
    await this.initialize();
    const file = join(this.analysisDir, `${taskId}.json`);
    await writeJsonFile(file, {
      taskId,
      result,
      timestamp: timestamp(),
    });
  }
  
  async getAnalysisResult(taskId: string): Promise<any> {
    const file = join(this.analysisDir, `${taskId}.json`);
    return readJsonFile(file);
  }
  
  async listAnalysisResults(): Promise<any[]> {
    const files = await listFiles(this.analysisDir, /\.json$/);
    const results = [];
    for (const file of files) {
      const data = await readJsonFile(join(this.analysisDir, file));
      if (data) results.push(data);
    }
    return results;
  }
  
  // Rules
  async getRules(): Promise<string> {
    return (await readFile(this.rulesFile)) || '';
  }
  
  async updateRules(rules: string): Promise<void> {
    await writeFile(this.rulesFile, rules);
    await this.logEvent('rules_updated', {});
  }
  
  // Templates
  async getTemplate(name: string): Promise<string | null> {
    const file = join(this.templatesDir, name);
    return readFile(file);
  }
  
  async listTemplates(): Promise<string[]> {
    return listFiles(this.templatesDir, /\.md$/);
  }
  
  async saveTemplate(name: string, content: string): Promise<void> {
    const file = join(this.templatesDir, name);
    await writeFile(file, content);
    await this.logEvent('template_saved', { name });
  }
  
  // Utility methods
  private getImplementationTemplate(): string {
    return `# Implementation Template

## Ziel
{{Zielbeschreibung}}

## Hintergrund
{{Kontext und Motivation}}

## Erfolgskriterien
- [ ] Kriterium 1
- [ ] Kriterium 2

## Einschränkungen
- Constraint 1
- Constraint 2

## Benötigte Analyse
- [ ] Repository-Struktur: ERFORDERT ANALYSE
- [ ] Abhängigkeiten: ERFORDERT ANALYSE
- [ ] API-Spezifikationen: ERFORDERT ANALYSE

## Abhängigkeiten
- Dep 1
- Dep 2

## Implementierungsplan
### Phase 1: Analyse
- [ ] Task 1
- [ ] Task 2

### Phase 2: Implementation
- [ ] Task 3
- [ ] Task 4

## Validierung
- Validation 1
- Validation 2

## Tests
- [ ] Test 1
- [ ] Test 2

## Artefakte
- Artifact 1

## Dokumentation
- Doc 1

## Risiken
- Risk 1

## Rollback
Rollback-Plan hier beschreiben

## Abschlussbedingungen
- [ ] Alle Tests bestehen
- [ ] Dokumentation aktualisiert
- [ ] Code Review bestanden

## Änderungsverlauf
- v1: Initial creation
`;
  }
  
  private getMigrationTemplate(): string {
    return `# Migration Template

## Ziel
Migration von {{Von}} nach {{Nach}}

## Hintergrund
{{Gründe für Migration}}

## Erfolgskriterien
- [ ] Alle Tests bestehen
- [ ] Keine Regressionen
- [ ] Performance gleich oder besser

## Einschränkungen
- Downtime: {{Max Downtime}}
- Rollback-Zeit: {{Max Rollback Time}}

## Benötigte Analyse
- [ ] Aktuelle Architektur: ERFORDERT ANALYSE
- [ ] Datenmodell: ERFORDERT ANALYSE
- [ ] Abhängigkeiten: ERFORDERT ANALYSE

## Abhängigkeiten
- Dep 1

## Implementierungsplan
### Phase 1: Vorbereitung
- [ ] Backup erstellen
- [ ] Test-Umgebung aufsetzen

### Phase 2: Migration
- [ ] Schritt 1
- [ ] Schritt 2

### Phase 3: Validierung
- [ ] Tests ausführen
- [ ] Performance prüfen

## Validierung
- Migration erfolgreich
- Daten konsistent

## Tests
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests

## Artefakte
- Migrations-Scripts
- Rollback-Scripts

## Dokumentation
- Migrations-Guide
- Changelog

## Risiken
- Datenverlust
- Downtime

## Rollback
{{Detaillierter Rollback-Plan}}

## Abschlussbedingungen
- [ ] Migration abgeschlossen
- [ ] Tests grün
- [ ] Monitoring aktiv

## Änderungsverlauf
- v1: Initial creation
`;
  }
  
  private getAnalysisTemplate(): string {
    return `# Analysis Template

## Ziel
Analyse von {{Thema}}

## Hintergrund
{{Warum diese Analyse nötig ist}}

## Erfolgskriterien
- [ ] Analyse abgeschlossen
- [ ] Ergebnisse dokumentiert
- [ ] Empfehlungen abgeleitet

## Einschränkungen
- Zeitbudget: {{Timebox}}
- Tools: {{Verfügbare Tools}}

## Benötigte Analyse
- [ ] Datenquelle 1: ERFORDERT ANALYSE
- [ ] Datenquelle 2: ERFORDERT ANALYSE

## Abhängigkeiten
- Zugriff auf {{System}}

## Implementierungsplan
### Phase 1: Datensammlung
- [ ] Task 1
- [ ] Task 2

### Phase 2: Auswertung
- [ ] Task 3
- [ ] Task 4

### Phase 3: Dokumentation
- [ ] Report erstellen

## Validierung
- Ergebnisse plausibel
- Empfehlungen umsetzbar

## Tests
- [ ] Validierung der Ergebnisse

## Artefakte
- Analyse-Report
- Rohdaten

## Dokumentation
- Analyse-Dokumentation

## Risiken
- Unvollständige Daten

## Rollback
Nicht anwendbar (Analyse)

## Abschlussbedingungen
- [ ] Report fertig
- [ ] Stakeholder informiert

## Änderungsverlauf
- v1: Initial creation
`;
  }
  
  private getBugfixTemplate(): string {
    return `# Bugfix Template

## Ziel
Fix für {{Bug-Beschreibung}}

## Hintergrund
{{Bug-Report, Steps to Reproduce, Expected vs Actual}}

## Erfolgskriterien
- [ ] Bug reproduzierbar
- [ ] Fix implementiert
- [ ] Regressionstest grün

## Einschränkungen
- Hotfix: {{Ja/Nein}}
- Betroffene Versionen: {{Versions}}

## Benötigte Analyse
- [ ] Root Cause: ERFORDERT ANALYSE
- [ ] Betroffener Code: ERFORDERT ANALYSE

## Abhängigkeiten
- Issue #{{Number}}

## Implementierungsplan
### Phase 1: Analyse
- [ ] Root Cause finden
- [ ] Fix-Strategie definieren

### Phase 2: Fix
- [ ] Fix implementieren
- [ ] Test schreiben

### Phase 3: Validierung
- [ ] Bug behoben
- [ ] Keine Regressionen

## Validierung
- Bug nicht mehr reproduzierbar
- Alle Tests grün

## Tests
- [ ] Regressionstest für Bug
- [ ] Betroffene Tests

## Artefakte
- Fix-Commit
- Test-Case

## Dokumentation
- Changelog Entry

## Risiken
- Seiteneffekte

## Rollback
Revert Commit {{Hash}}

## Abschlussbedingungen
- [ ] Fix deployed
- [ ] Monitoring prüft

## Änderungsverlauf
- v1: Initial creation
`;
  }
  
  private getReleaseTemplate(): string {
    return `# Release Template

## Ziel
Release {{Version}}

## Hintergrund
{{Release Notes, Features, Fixes}}

## Erfolgskriterien
- [ ] Alle Tests grün
- [ ] Build erfolgreich
- [ ] Deployment erfolgreich
- [ ] Smoke Tests grün

## Einschränkungen
- Release Window: {{Time}}
- Rollback Plan: {{Ja}}

## Benötigte Analyse
- [ ] Changelog: ERFORDERT ANALYSE
- [ ] Breaking Changes: ERFORDERT ANALYSE

## Abhängigkeiten
- Dependencies updated

## Implementierungsplan
### Phase 1: Vorbereitung
- [ ] Version bump
- [ ] Changelog finalisieren
- [ ] Release Notes

### Phase 2: Build & Test
- [ ] CI Pipeline
- [ ] Alle Tests

### Phase 3: Deployment
- [ ] Staging Deploy
- [ ] Smoke Tests
- [ ] Production Deploy

### Phase 4: Post-Release
- [ ] Monitoring
- [ ] Kommunikation

## Validierung
- Version korrekt
- Artifacts verfügbar

## Tests
- [ ] Full Test Suite
- [ ] Smoke Tests

## Artefakte
- Release Binary
- Docker Images
- SBOM

## Dokumentation
- Release Notes
- Upgrade Guide

## Risiken
- Deployment Failure
- Breaking Changes

## Rollback
{{Rollback Procedure}}

## Abschlussbedingungen
- [ ] Release deployed
- [ ] Monitoring grün
- [ ] Team informiert

## Änderungsverlauf
- v1: Initial creation
`;
  }
  
  private getRefactoringTemplate(): string {
    return `# Refactoring Template

## Ziel
Refactoring von {{Component/Module}}

## Hintergrund
{{Gründe: Technical Debt, Performance, Maintainability}}

## Erfolgskriterien
- [ ] Code Metrics verbessert
- [ ] Tests grün
- [ ] Keine Verhaltensänderung

## Einschränkungen
- Scope: {{Limited/Full}}
- Zeitbudget: {{Timebox}}

## Benötigte Analyse
- [ ] Aktueller Code: ERFORDERT ANALYSE
- [ ] Tests: ERFORDERT ANALYSE
- [ ] Dependencies: ERFORDERT ANALYSE

## Abhängigkeiten
- Related Components

## Implementierungsplan
### Phase 1: Vorbereitung
- [ ] Tests sicherstellen (Coverage)
- [ ] Baseline Metrics

### Phase 2: Refactoring
- [ ] Step 1
- [ ] Step 2

### Phase 3: Validierung
- [ ] Tests grün
- [ ] Metrics verbessert

## Validierung
- Verhalten unverändert
- Metrics besser

## Tests
- [ ] Alle bestehenden Tests
- [ ] Neue Tests für Refactoring

## Artefakte
- Refactored Code
- Metrics Report

## Dokumentation
- Architecture Decision Record

## Risiken
- Versteckte Bugs
- Performance Regression

## Rollback
Git Revert

## Abschlussbedingungen
- [ ] Refactoring 완료
- [ ] Tests grün
- [ ] Review bestanden

## Änderungsverlauf
- v1: Initial creation
`;
  }
  
  private getDocumentationTemplate(): string {
    return `# Documentation Template

## Ziel
Dokumentation für {{Thema}}

## Hintergrund
{{Warum diese Doku nötig ist}}

## Erfolgskriterien
- [ ] Vollständig
- [ ] Verständlich
- [ ] Aktuell

## Einschränkungen
- Format: {{Markdown/HTML/PDF}}
- Sprache: {{DE/EN}}

## Benötigte Analyse
- [ ] Bestehende Doku: ERFORDERT ANALYSE
- [ ] Zielgruppe: ERFORDERT ANALYSE

## Abhängigkeiten
- Source Code
- API Specs

## Implementierungsplan
### Phase 1: Recherche
- [ ] Infos sammeln
- [ ] Struktur planen

### Phase 2: Erstellung
- [ ] Kapitel 1
- [ ] Kapitel 2

### Phase 3: Review
- [ ] Technisches Review
- [ ] Sprachliches Review

## Validierung
- Vollständigkeit
- Korrektheit

## Tests
- [ ] Link Check
- [ ] Beispiel-Code lauffähig

## Artefakte
- Dokumentation
- Beispiele

## Dokumentation
- Self-referencing ;)

## Risiken
- Veraltet schnell

## Rollback
Vorherige Version

## Abschlussbedingungen
- [ ] Published
- [ ] Verlinkt

## Änderungsverlauf
- v1: Initial creation
`;
  }
  
  private getDeploymentTemplate(): string {
    return `# Deployment Template

## Ziel
Deployment von {{Application}} nach {{Environment}}

## Hintergrund
{{Release Info, Changes}}

## Erfolgskriterien
- [ ] Deployment erfolgreich
- [ ] Health Checks grün
- [ ] Smoke Tests grün

## Einschränkungen
- Downtime: {{Max}}
- Rollback Time: {{Max}}

## Benötigte Analyse
- [ ] Infrastructure: ERFORDERT ANALYSE
- [ ] Config: ERFORDERT ANALYSE
- [ ] Secrets: ERFORDERT ANALYSE

## Abhängigkeiten
- CI/CD Pipeline
- Infrastructure Ready

## Implementierungsplan
### Phase 1: Vorbereitung
- [ ] Artifacts bereit
- [ ] Config prüfen
- [ ] Secrets setzen

### Phase 2: Deployment
- [ ] Deploy Staging
- [ ] Tests
- [ ] Deploy Production

### Phase 3: Validierung
- [ ] Health Checks
- [ ] Smoke Tests
- [ ] Monitoring

## Validierung
- Alle Services healthy
- Keine Errors in Logs

## Tests
- [ ] Smoke Tests
- [ ] Integration Tests

## Artefakte
- Deployment Logs
- Artifacts

## Dokumentation
- Runbook aktualisiert

## Risiken
- Config Drift
- Capacity Issues

## Rollback
{{Rollback Procedure}}

## Abschlussbedingungen
- [ ] Deployment grün
- [ ] Monitoring grün
- [ ] Team informiert

## Änderungsverlauf
- v1: Initial creation
`;
  }
}