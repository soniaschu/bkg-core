// @plannotator/shared/pr-context-live

export const PR_CONTEXT_HEARTBEAT_COMMENT = 'heartbeat';
export const PR_CONTEXT_HEARTBEAT_INTERVAL_MS = 30000;
export interface PRContextLive { [key: string]: any; }
export function getPRContextLive(provider: any, pr: any): Promise<PRContextLive> { return Promise.resolve({}); }
export function createPRContextLiveCache(): any { return {}; }
export function serializePRContextSSEEvent(event: any): string { return ''; }

