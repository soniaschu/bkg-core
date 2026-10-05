// BKG Goal Orchestrator - Agent Specification
// Defines the structure and capabilities of orchestrator agents

import { Skill } from '@bkg/goal-builder';

export interface AgentSpec {
  id: string;
  name: string;
  type: AgentType;
  prompt: string;
  requiredSkills: string[];
  preferredSkills: string[];
  config: Record<string, any>;
  metadata?: Record<string, any>;
}

export type AgentType = 
  | 'build'      // Implementation agents
  | 'plan'       // Planning and architecture agents
  | 'explore'    // Analysis and research agents
  | 'review'     // Review and quality agents
  | 'analyst'    // Data analysis specialists
  | 'architect'  // System design specialists
  | 'tester'     // Testing and validation specialists
  | 'security'   // Security and compliance specialists
  | 'devops';    // Deployment and infrastructure specialists

export interface AgentCapabilities {
  agentId: string;
  skills: Skill[];
  proficiencyLevel: 'expert' | 'intermediate' | 'basic';
  availability: 'available' | 'busy' | 'offline';
  currentLoad: number; // 0-100%
}

export interface AgentFactory {
  createAgent(spec: AgentSpec): Promise<any>;
}