// BKG Goal Orchestrator - Task Distributor
// Distributes tasks to team members based on skills and availability

import { 
  AgentTeam, 
  AgentSpec, 
  Task, 
  SkillAssignment 
} from '../core/types.js';

export class TaskDistributor {
  /**
   * Assign tasks to team members based on skills, availability, and workload
   */
  distributeTasks(team: AgentTeam, tasks: Task[], assignments: SkillAssignment[]): AgentTeam {
    // Create a copy of the team to avoid mutating the original
    const updatedTeam = { ...team };
    
    // Build skill matrix: agentId -> set of skills they have
    const agentSkills: Record<string, Set<string>> = {};
    for (const agent of team.agents) {
      agentSkills[agent.id] = new Set();
    }
    
    // Add skills from assignments
    for (const assignment of assignments) {
      if (!agentSkills[assignment.agentId]) {
        agentSkills[assignment.agentId] = new Set();
      }
      agentSkills[assignment.agentId].add(assignment.skill);
    }
    
    // Build availability matrix
    const agentAvailability: Record<string, { available: boolean; workload: number }> = {};
    for (const agent of team.agents) {
      agentAvailability[agent.id] = {
        available: true,  // Would be determined by actual agent status
        workload: 0,      // Current task load (0-100%)
      };
    }
    
    // Distribute tasks
    const assignedTasks: Task[] = [];
    
    for (const task of tasks) {
      // Find best agent for this task
      const bestAgent = this.findBestAgentForTask(task, agentSkills, agentAvailability, team.agents);
      
      if (bestAgent) {
        // Assign task to agent
        const assignedTask = { ...task, agentId: bestAgent.id };
        assignedTasks.push(assignedTask);
        
        // Update agent workload
        agentAvailability[bestAgent.id].workload = Math.min(100, 
          agentAvailability[bestAgent.id].workload + (task.estimatedDuration || 60) / 10
        );
        
        // Mark agent as busy if over threshold
        if (agentAvailability[bestAgent.id].workload > 80) {
          agentAvailability[bestAgent.id].available = false;
        }
      } else {
        // No suitable agent found - leave unassigned
        assignedTasks.push({ ...task, agentId: undefined });
      }
    }
    
    // Update team with assigned tasks
    updatedTeam.tasks = assignedTasks;
    
    return updatedTeam;
  }
  
  /**
   * Find the best agent for a given task based on skills and availability
   */
  private findBestAgentForTask(
    task: Task, 
    agentSkills: Record<string, Set<string>>, 
    agentAvailability: Record<string, { available: boolean; workload: number }>,
    agents: AgentSpec[]
  ): AgentSpec | null {
    // Filter to available agents
    const availableAgents = agents.filter(agent => 
      agentAvailability[agent.id]?.available === true
    );
    
    if (availableAgents.length === 0) {
      return null; // No available agents
    }
    
    // Score each agent based on skill match and workload
    const scoredAgents: Array<{ agent: AgentSpec; score: number }> = [];
    
    for (const agent of availableAgents) {
      let score = 0;
      
      // Skill matching score (0-100)
      const agentSkillSet = agentSkills[agent.id] || new Set();
      const requiredSkills = new Set(task.skillRequirements || []);
      
      if (requiredSkills.size === 0) {
        // No specific skills required - give base score
        score += 50;
      } else {
        // Calculate skill match percentage
        let matchedSkills = 0;
        for (const skill of requiredSkills) {
          if (agentSkillSet.has(skill)) {
            matchedSkills++;
          }
        }
        const skillMatchPercentage = (matchedSkills / requiredSkills.size) * 100;
        score += skillMatchPercentage;
      }
      
      // Availability and workload preference (lower workload is better)
      const workload = agentAvailability[agent.id]?.workload || 100;
      const workloadScore = Math.max(0, 100 - workload); // 0 workload = 100 score, 100 workload = 0 score
      score += workloadScore * 0.3; // Weight workload at 30%
      
      // Prefer agents whose type matches task requirements
      // This would be enhanced with more sophisticated matching
      scoredAgents.push({ agent, score });
    }
    
    // Sort by score descending and return the best agent
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents.length > 0 ? scoredAgents[0].agent : null;
  }
  
  /**
   * Get workload statistics for the team
   */
  getTeamWorkload(team: AgentTeam, agentAvailability: Record<string, { available: boolean; workload: number }>): {
    averageWorkload: number;
    maxWorkload: number;
    minWorkload: number;
    overloadedAgents: string[];
    availableAgents: string[];
  } {
    const workloads: number[] = [];
    const overloaded: string[] = [];
    const available: string[] = [];
    
    for (const agent of team.agents) {
      const info = agentAvailability[agent.id];
      if (info) {
        workloads.push(info.workload);
        if (info.workload > 80) {
          overloaded.push(agent.id);
        }
        if (info.available) {
          available.push(agent.id);
        }
      }
    }
    
    return {
      averageWorkload: workloads.length > 0 ? 
        workloads.reduce((sum, w) => sum + w, 0) / workloads.length : 0,
      maxWorkload: workloads.length > 0 ? Math.max(...workloads) : 0,
      minWorkload: workloads.length > 0 ? Math.min(...workloads) : 0,
      overloadedAgents: overloaded,
      availableAgents: available,
    };
  }
  
  /**
   * Redistribute tasks to balance workload
   */
  redistributeTasks(team: AgentTeam, tasks: Task[], assignments: SkillAssignment[]): AgentTeam {
    // This would implement workload balancing algorithms
    // For now, just return the original distribution
    return this.distributeTasks(team, tasks, assignments);
  }
}