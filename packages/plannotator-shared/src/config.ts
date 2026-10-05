// @plannotator/shared/config

export interface PlannotatorConfig { [key: string]: any; }
export interface DiffOptions { [key: string]: any; }
export function loadConfig(): PlannotatorConfig { return {}; }
export function saveConfig(config: PlannotatorConfig): void {}
export function detectGitUser(): string { return ''; }
export function getServerConfig(): PlannotatorConfig { return {}; }
export function resolveAIEnabled(config: PlannotatorConfig): boolean { return false; }
export function resolveAnnotateHistory(config: PlannotatorConfig): any { return null; }
export function resolveCursorSandbox(config: PlannotatorConfig): string { return ''; }
export function resolveGuideHistory(config: PlannotatorConfig): any { return null; }
export function resolveUseGlimpse(config: PlannotatorConfig): boolean { return false; }

