// @plannotator/shared/agent-terminal

export interface AgentTerminalAgent { [key: string]: any; }
export interface AgentTerminalCapability { [key: string]: any; }
export interface AgentTerminalDisabledReason { [key: string]: any; }
export const AGENT_TERMINAL_WS_BASE_PATH = '/agent-terminal';
export function isAgentTerminalWsRoute(path: string): boolean { return false; }
export function supportsAnnotateAgentTerminalMode(): boolean { return false; }
export function buildAgentTerminalWsPath(base: string, id: string): string { return ''; }

