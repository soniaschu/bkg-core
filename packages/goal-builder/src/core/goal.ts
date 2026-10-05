// BKG Goal Builder - Goal Class
// Represents a complete goal with versioning and history

import { 
  Goal, 
  GoalMetadata, 
  GoalSection, 
  GoalStatus,
  AnalysisTask,
  ProjectInventory,
} from './types.js';
import { generateId, timestamp } from '@bkg/plan-engine-core';

const REQUIRED_SECTIONS = [
  'ziel',
  'hintergrund',
  'erfolgskriterien',
  'einschraenkungen',
  'benoetigte-analyse',
  'abhaengigkeiten',
  'implementierungsplan',
  'validierung',
  'tests',
  'artefakte',
  'dokumentation',
  'risiken',
  'rollback',
  'abschlussbedingungen',
  'aenderungsverlauf',
];

export const FORBIDDEN_TERMS = [
  'TODO',
  'TBD',
  'Vielleicht',
  'Später',
  'Unknown',
  'Placeholder',
  'Dummy',
  'Mock',
];

export const ALLOWED_TERMS = ['ERFORDERT ANALYSE'];

export class GoalClass implements Goal {
  id: string;
  version: number;
  metadata: GoalMetadata;
  sections: Record<string, GoalSection>;
  
  constructor(input: Partial<Goal> & { title: string; description: string; template: string }) {
    this.id = input.id || generateId('goal');
    this.version = input.version || 1;
    this.metadata = {
      title: input.title,
      description: input.description,
      template: input.template,
      createdAt: input.metadata?.createdAt || timestamp(),
      updatedAt: timestamp(),
      status: input.metadata?.status || 'analysis_pending',
      tags: input.metadata?.tags || [],
      author: input.metadata?.author,
    };
    this.sections = input.sections || this.createDefaultSections();
  }
  
  private createDefaultSections(): Record<string, GoalSection> {
    const sections: Record<string, GoalSection> = {};
    let order = 0;
    
    for (const key of REQUIRED_SECTIONS) {
      sections[key] = {
        title: this.formatSectionTitle(key),
        content: '',
        required: true,
        completed: false,
        order: order++,
      };
    }
    
    return sections;
  }
  
  private formatSectionTitle(key: string): string {
    const titles: Record<string, string> = {
      'ziel': 'Ziel',
      'hintergrund': 'Hintergrund',
      'erfolgskriterien': 'Erfolgskriterien',
      'einschraenkungen': 'Einschränkungen',
      'benoetigte-analyse': 'Benötigte Analyse',
      'abhaengigkeiten': 'Abhängigkeiten',
      'implementierungsplan': 'Implementierungsplan',
      'validierung': 'Validierung',
      'tests': 'Tests',
      'artefakte': 'Artefakte',
      'dokumentation': 'Dokumentation',
      'risiken': 'Risiken',
      'rollback': 'Rollback',
      'abschlussbedingungen': 'Abschlussbedingungen',
      'aenderungsverlauf': 'Änderungsverlauf',
    };
    return titles[key] || key;
  }
  
  updateSection(key: string, content: string): void {
    if (this.sections[key]) {
      this.sections[key].content = content;
      this.sections[key].completed = this.isSectionComplete(key, content);
      this.metadata.updatedAt = timestamp();
      this.version++;
    }
  }
  
  addAnalysisTask(task: AnalysisTask): void {
    const section = this.sections['benoetigte-analyse'];
    if (section) {
      const taskMarker = `\n- [ ] ${task.type}: ${task.target} - ${task.question}`;
      section.content += taskMarker;
      this.metadata.updatedAt = timestamp();
      this.version++;
    }
  }
  
  completeAnalysisTask(taskId: string, result: any): void {
    const section = this.sections['benoetigte-analyse'];
    if (section) {
      section.content = section.content.replace(
        new RegExp(`- \\[ \\] .*${taskId}.*`),
        `- [x] ${taskId} - COMPLETED`
      );
      this.metadata.updatedAt = timestamp();
      this.version++;
    }
  }
  
  setStatus(status: GoalStatus): void {
    this.metadata.status = status;
    this.metadata.updatedAt = timestamp();
    this.version++;
  }
  
  addHistoryEntry(description: string): void {
    const section = this.sections['aenderungsverlauf'];
    if (section) {
      const entry = `\n- v${this.version}: ${description} (${timestamp()})`;
      section.content += entry;
    }
  }
  
  isSectionComplete(key: string, content?: string): boolean {
    const text = content || this.sections[key]?.content || '';
    if (!text.trim()) return false;
    
    // Check for forbidden terms (except allowed)
    for (const term of FORBIDDEN_TERMS) {
      if (text.includes(term) && !ALLOWED_TERMS.includes(term)) {
        return false;
      }
    }
    
    // Check for ERFORDERT ANALYSE in required sections
    if (text.includes('ERFORDERT ANALYSE')) {
      return false;
    }
    
    return text.trim().length > 0;
  }
  
  getProgress(): number {
    const requiredSections = Object.values(this.sections).filter(s => s.required);
    if (requiredSections.length === 0) return 0;
    const completed = requiredSections.filter(s => s.completed).length;
    return Math.round((completed / requiredSections.length) * 100);
  }
  
  getIncompleteSections(): string[] {
    return Object.entries(this.sections)
      .filter(([_, section]) => section.required && !section.completed)
      .map(([key, _]) => key);
  }
  
  toMarkdown(): string {
    let md = `# ${this.metadata.title}\n\n`;
    md += `**ID:** ${this.id}  \n`;
    md += `**Version:** ${this.version}  \n`;
    md += `**Status:** ${this.metadata.status}  \n`;
    md += `**Template:** ${this.metadata.template}  \n`;
    md += `**Created:** ${this.metadata.createdAt}  \n`;
    md += `**Updated:** ${this.metadata.updatedAt}  \n`;
    md += `**Progress:** ${this.getProgress()}%  \n\n`;
    
    md += `## Ziel\n\n${this.metadata.description}\n\n`;
    
    for (const [key, section] of Object.entries(this.sections)) {
      if (section.required || section.content) {
        md += `## ${section.title}\n\n${section.content || '_Not filled_'}\n\n`;
      }
    }
    
    return md;
  }
  
  static fromMarkdown(markdown: string): GoalClass {
    // Parse markdown back to goal (simplified)
    const lines = markdown.split('\n');
    const titleMatch = lines[0].match(/^# (.+)$/);
    const title = titleMatch ? titleMatch[1] : 'Untitled Goal';
    
    const goal = new GoalClass({ title, description: '', template: 'custom' });
    
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const sectionMatch = line.match(/^## (.+)$/);
      if (sectionMatch) {
        if (currentSection && currentContent.length > 0) {
          goal.updateSection(currentSection, currentContent.join('\n').trim());
        }
        currentSection = sectionMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '-');
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }
    
    if (currentSection && currentContent.length > 0) {
      goal.updateSection(currentSection, currentContent.join('\n').trim());
    }
    
    return goal;
  }
}

export type Goal = GoalClass;