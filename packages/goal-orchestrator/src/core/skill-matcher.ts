// BKG Goal Orchestrator - Skill Matcher
// Matches agents to required skills based on task requirements

import { 
  AgentSpec, 
  Skill, 
  SkillAssignment, 
  SkillMatcherPlugin 
} from './types.js';
import { PluginRegistry } from './plugin-registry.js';

export class SkillMatcher {
  private pluginRegistry: PluginRegistry;
  
  constructor(pluginRegistry: PluginRegistry) {
    this.pluginRegistry = pluginRegistry;
  }
  
  async matchAgent(agent: AgentSpec, task: any): Promise<SkillAssignment[]> {
    // Get all available skills from plugins
    const availableSkills = await this.pluginRegistry.getAllSkills();
    
    // Match required skills
    const assignments: SkillAssignment[] = [];
    
    for (const requiredSkill of agent.requiredSkills) {
      const matchingSkills = availableSkills.filter(skill => 
        this.skillMatches(skill, requiredSkill)
      );
      
      if (matchingSkills.length > 0) {
        // Use the best match (first for now)
        const bestMatch = matchingSkills[0];
        assignments.push({
          agentId: agent.id,
          skill: bestMatch.name,
          proficiency: this.determineProficiency(agent, bestMatch),
          source: this.determineSkillSource(bestMatch),
        });
      }
    }
    
    // Also match skills from task requirements
    const taskSkills = task.skillRequirements || [];
    for (const requiredSkill of taskSkills) {
      // Skip if already assigned
      if (assignments.some(a => a.skill === requiredSkill && a.agentId === agent.id)) {
        continue;
      }
      
      const matchingSkills = availableSkills.filter(skill => 
        this.skillMatches(skill, requiredSkill)
      );
      
      if (matchingSkills.length > 0) {
        const bestMatch = matchingSkills[0];
        assignments.push({
          agentId: agent.id,
          skill: bestMatch.name,
          proficiency: this.determineProficiency(agent, bestMatch),
          source: this.determineSkillSource(bestMatch),
        });
      }
    }
    
    return assignments;
  }
  
  async matchTeam(team: any, inventory: any): Promise<SkillAssignment[]> {
    const assignments: SkillAssignment[] = [];
    
    for (const agent of team.agents) {
      // For each agent, we need to match against their tasks
      // For now, create a dummy task
      const dummyTask = {
        skillRequirements: agent.requiredSkills,
        description: 'Generic task for agent',
      };
      
      const agentAssignments = await this.matchAgent(agent, dummyTask);
      assignments.push(...agentAssignments);
    }
    
    return assignments;
  }
  
  private skillMatches(skill: any, requiredSkill: string): boolean {
    if (!skill || !requiredSkill) return false;
    
    const skillName = skill.name.toLowerCase();
    const requiredLower = requiredSkill.toLowerCase();
    
    // Exact match
    if (skillName === requiredLower) return true;
    
    // Partial match
    if (skillName.includes(requiredLower) || requiredLower.includes(skillName)) {
      return true;
    }
    
    // Check in triggers
    if (skill.triggers && skill.triggers.some(t => 
      t.toLowerCase().includes(requiredLower) || 
      requiredLower.includes(t.toLowerCase())
    )) {
      return true;
    }
    
    // Check in description
    if (skill.description && 
      skill.description.toLowerCase().includes(requiredLower)) {
      return true;
    }
    
    return false;
  }
  
  private determineProficiency(agent: AgentSpec, skill: any): 'expert' | 'intermediate' | 'basic' {
    // Simple heuristic based on agent type and skill match
    if (agent.requiredSkills.includes(skill.name)) {
      return 'expert';
    }
    if (agent.preferredSkills.includes(skill.name)) {
      return 'intermediate';
    }
    return 'basic';
  }
  
  private determineSkillSource(skill: any): 'global' | 'project' | 'built-in' {
    // This would check where the skill came from
    // For now, default to global
    return 'global';
  }
}