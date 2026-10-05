// BKG Goal Orchestrator - Team Manager
// Manages the lifecycle of agent teams

import { 
  AgentTeam, 
  AgentSpec, 
  Task,
  SkillAssignment
} from '../core/types.js';

export class TeamManager {
  private teams: Map<string, AgentTeam> = new Map();
  
  createTeam(goalId: string, agents: AgentSpec[]): AgentTeam {
    const team: AgentTeam = {
      id: `team-${goalId}-${Date.now()}`,
      goalId,
      agents,
      skills: {}, // agentId -> skillNames[]
      tasks: [],
      createdAt: new Date().toISOString(),
      status: 'forming',
    };
    
    this.teams.set(team.id, team);
    return team;
  }
  
  getTeam(teamId: string): AgentTeam | null {
    return this.teams.get(teamId) || null;
  }
  
  updateTeam(teamId: string, updates: Partial<AgentTeam>): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;
    
    Object.assign(team, updates);
    return true;
  }
  
  assignSkillsToTeam(teamId: string, assignments: SkillAssignment[]): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;
    
    // Group assignments by agentId
    const skillsByAgent: Record<string, string[]> = {};
    for (const assignment of assignments) {
      if (!skillsByAgent[assignment.agentId]) {
        skillsByAgent[assignment.agentId] = [];
      }
      skillsByAgent[assignment.agentId].push(assignment.skill);
    }
    
    // Update team skills
    for (const [agentId, skills] of Object.entries(skillsByAgent)) {
      team.skills[agentId] = skills;
    }
    
    return true;
  }
  
  assignTasksToTeam(teamId: string, tasks: Task[]): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;
    
    team.tasks = tasks;
    return true;
  }
  
  updateTeamStatus(teamId: string, status: AgentTeam['status']): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;
    
    team.status = status;
    return true;
  }
  
  getAllTeams(): AgentTeam[] {
    return Array.from(this.teams.values());
  }
  
  removeTeam(teamId: string): boolean {
    return this.teams.delete(teamId);
  }
}