// @plannotator/shared/agent-jobs

export interface AgentJobInfo { [key: string]: any; }
export interface AgentJobEvent { [key: string]: any; }
export interface AgentCapabilities { [key: string]: any; }
export const REVIEW_OUTPUT_FAILED = 'failed';
export const AGENT_HEARTBEAT_COMMENT = 'heartbeat';
export const AGENT_HEARTBEAT_INTERVAL_MS = 30000;
export const HEARTBEAT_COMMENT = 'heartbeat';
export const HEARTBEAT_INTERVAL_MS = 30000;
export function getAgentJobAnnotationContext(job: AgentJobInfo): any { return null; }
export function markJobReviewFailed(jobId: string): void {}
export function isTerminalStatus(status: string): boolean { return false; }
export function jobSource(source: string): any { return null; }
export function serializeAgentSSEEvent(event: any): string { return ''; }
export function createAnnotationStore(): any { return {}; }

