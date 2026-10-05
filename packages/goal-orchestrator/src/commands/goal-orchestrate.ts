// BKG Goal Orchestrator - Goal Orchestrate Command
// Alias for /orchestrate command under /goal namespace

import { orchestrateCommand } from './orchestrate.js';

export const goalOrchestrateCommand: Command = {
  ...orchestrateCommand,
  name: 'goal-orchestrate',
  description: 'Orchestrate goal execution (alias for /orchestrate)',
};