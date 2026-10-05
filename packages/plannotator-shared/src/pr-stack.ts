// @plannotator/shared/pr-stack

export interface PRStack { [key: string]: any; }
export interface PRStackTree { [key: string]: any; }
export interface PRListItem { [key: string]: any; }
export function getPRStack(provider: any, pr: any): PRStack { return {}; }
export function resolveStackInfo(provider: any, pr: any): any { return {}; }
export function listPatchFiles(stack: PRStack): string[] { return []; }
export function getPRDiffScopeOptions(pr: any): any { return {}; }
export function getPRFullStackFingerprint(pr: any): string { return ''; }
export function getPRStackInfo(provider: any, pr: any): any { return {}; }
export function resolvePRFullStackBaseRef(provider: any, pr: any): string { return ''; }
export function runPRFullStackDiff(provider: any, pr: any): Promise<unknown> { return Promise.resolve({}); }
export function runPRLayerLocalDiff(provider: any, pr: any, layer: any): Promise<unknown> { return Promise.resolve({}); }
export function checkoutPRHead(provider: any, pr: any): Promise<void> { return Promise.resolve(); }

