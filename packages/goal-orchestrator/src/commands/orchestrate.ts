// BKG Goal Orchestrator - Main Orchestrate Command
// Orchestrates goal execution: team composition, planning, visualization, approval, execution

import type { Command } from '@opencode-ai/sdk';
import { GoalStorage, EventLogger } from '@bkg/goal-builder';
import { GoalReader } from '../core/goal-reader.js';
import { InventoryCollector } from '../core/inventory-collector.js';
import { CapabilityMatrix } from '../core/capability-matrix.js';
import { SkillMatcher } from '../core/skill-matcher.js';
import { TeamBuilder } from '../core/team-builder.js';
import { PlanGenerator } from '../core/plan-generator.js';
import { Visualizer } from '../core/visualizer.js';
import { ApprovalGate } from '../core/approval-gate.js';
import { ExecutionEngine } from '../core/execution-engine.js';
import { PluginRegistry } from '../core/plugin-registry.js';

export const orchestrateCommand: Command = {
  name: 'orchestrate',
  description: 'Orchestrate goal execution: compose team, generate plan, visualize, approve, execute',
  arguments: [],
  options: [
    {
      name: 'replan',
      description: 'Re-plan from existing team and skills',
      type: 'boolean',
      default: false,
    },
    {
      name: 'reteam',
      description: 'Re-compose team from existing inventory',
      type: 'boolean',
      default: false,
    },
    {
      name: 'reanalyze',
      description: 'Re-run project analysis',
      type: 'boolean',
      default: false,
    },
    {
      name: 'dry-run',
      description: 'Run orchestration but stop before execution',
      type: 'boolean',
      default: false,
    },
    {
      name: 'visualize-only',
      description: 'Only generate and visualize plan, no approval or execution',
      type: 'boolean',
      default: false,
    },
    {
      name: 'output',
      short: 'o',
      description: 'Output format',
      type: 'string',
      choices: ['summary', 'full', 'json'],
      default: 'summary',
    },
  ],
  async execute(ctx) {
    const { replan, retear, reanalyze, dryRun, visualizeOnly, output } = ctx.args;
    
    // Initialize core components
    const storage = new GoalStorage(ctx.projectDir);
    const eventLogger = new EventLogger(storage);
    const pluginRegistry = new PluginRegistry();
    
    await eventLogger.log('orchestration_started', { 
      replan, retear, reanalyze, dryRun, visualizeOnly 
    });
    
    try {
      // Step 1: Read goal
      await eventLogger.log('goal_reading_started');
      const goalReader = new GoalReader(storage);
      const goal = await goalReader.readActiveGoal();
      
      if (!goal) {
        return { 
          success: false, 
          message: 'Kein aktives Goal gefunden. Erstellen Sie eines mit /goal make' 
        };
      }
      
      await eventLogger.log('goal_reading_completed', { 
        goalId: goal.id, 
        version: goal.version 
      });
      
      // Step 2: Collect inventory (unless retear)
      await eventLogger.log('inventory_collection_started');
      const inventoryCollector = new InventoryCollector(ctx.projectDir);
      const inventory = await inventoryCollector.collect({ 
        force: reanalyze 
      });
      await eventLogger.log('inventory_collection_completed');
      
      // Step 3: Build capability matrix
      await eventLogger.log('capability_matrix_building');
      const capabilityMatrix = new CapabilityMatrix(goal, inventory);
      const capabilities = capabilityMatrix.build();
      await eventLogger.log('capability_matrix_built');
      
      // Step 4: Compose team (unless replan)
      let team: any;
      if (!replan) {
        await eventLogger.log('team_composition_started');
        const teamBuilder = new TeamBuilder(pluginRegistry);
        team = await teamBuilder.compose(capabilities, goal);
        await eventLogger.log('team_composition_completed', { 
          agentCount: team.agents.length 
        });
      } else {
        // Load existing team from storage or goal
        team = await this.loadExistingTeam(goal.id, storage);
        await eventLogger.log('team_loaded_from_storage');
      }
      
      // Step 5: Match skills
      await eventLogger.log('skill_matching_started');
      const skillMatcher = new SkillMatcher(pluginRegistry);
      const skillAssignments = await skillMatcher.matchTeam(team, capabilities);
      await eventLogger.log('skill_matching_completed');
      
      // Step 6: Generate plan
      await eventLogger.log('plan_generation_started');
      const planGenerator = new PlanGenerator(pluginRegistry);
      const plan = await planGenerator.generate(team, goal, capabilities);
      await eventLogger.log('plan_generation_completed');
      
      // Step 7: Visualize plan
      await eventLogger.log('plan_visualization_started');
      const visualizer = new Visualizer(pluginRegistry);
      const visualization = await visualizer.render(plan);
      await eventLogger.log('plan_visualization_completed');
      
      // Step 8: Approval gate (unless visualize-only or dry-run)
      let approvalDecision: any;
      if (!visualizeOnly && !dryRun) {
        await eventLogger.log('approval_gate_started');
        const approvalGate = new ApprovalGate(pluginRegistry);
        approvalDecision = await approvalGate.prompt({
          goal,
          team,
          plan,
          visualization,
          capabilities,
        });
        await eventLogger.log('approval_gate_completed', { 
          decision: approvalDecision.decision 
        });
      } else {
        approvalDecision = {
          decision: visualizeOnly ? 'visualize_only' : 'dry_run',
          modifications: {},
          confirmedAt: new Date().toISOString(),
          userId: 'system',
        };
        await eventLogger.log('approval_skipped', { 
          reason: visualizeOnly ? 'visualize_only' : 'dry_run' 
        });
      }
      
      // Handle approval decision
      if (approvalDecision.decision === 'start') {
        // Step 9: Execute plan
        await eventLogger.log('execution_started');
        const executionEngine = new ExecutionEngine(pluginRegistry);
        const executionResult = await executionEngine.execute({
          goal,
          team,
          plan,
          skillAssignments,
        });
        await eventLogger.log('execution_completed');
        
        if (output === 'json') {
          return { 
            success: true, 
            data: { 
              goalId: goal.id,
              teamId: team.id,
              planId: plan.id,
              visualizationUrl: visualization.url,
              approvalDecision,
              executionResult,
            } 
          };
        }
        
        return { 
          success: true, 
          message: `
��✔ Ziel eingelesen
��✔ Projektinventar erstellt
��✔ Fähigkeitsmatrix berechnet
��✔ Agent-Team zusammengestellt (${team.agents.length} Agenten)
��✔ Skills zugewiesen
��✔ Ausführungsplan erstellt (${plan.phases.length} Phasen, ${plan.tasks.length} Tasks)
��✔ Plan visualisiert
��✔ Genehmigung erteilt: ${approvalDecision.decision}
��✔ Ausführung gestartet

Goal: ${goal.metadata.title}
Team: ${team.agents.length} Agenten
Plan: ${plan.phases.length} Phasen, ${plan.tasks.length} Tasks
Visualisierung: ${visualization.url || 'Lokal generiert'}
`.trim()
        };
      } else if (approvalDecision.decision === 'cancel') {
        return { 
          success: false, 
          message: 'Orchestrierung vom Benutzer abgebrochen' 
        };
      } else {
        // Other decisions (edit_plan, edit_team, etc.) would trigger re-orchestration
        return { 
          success: false, 
          message: `Orchestrierung benötigt Benutzeraktion: ${approvalDecision.decision}. Implementierung ausstehend.` 
        };
      }
    } catch (error) {
      await eventLogger.log('orchestration_failed', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined 
      });
      
      return { 
        success: false, 
        message: `Orchestrierung fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
  
  async loadExistingTeam(goalId: string, storage: GoalStorage): Promise<any> {
    // Would load team from storage
    // For now, return a basic team structure
    return {
      id: `team-${goalId}`,
      goalId,
      agents: [
        { id: 'agent-1', name: 'Manager', type: 'build', prompt: 'Manage goal execution', requiredSkills: [], preferredSkills: [] },
        { id: 'agent-2', name: 'Analyzer', type: 'explore', prompt: 'Analyze requirements', requiredSkills: [], preferredSkills: [] },
      ],
      skills: {},
      tasks: [],
      createdAt: new Date().toISOString(),
      status: 'ready',
    };
  }
};