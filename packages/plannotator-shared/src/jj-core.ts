// @plannotator/shared/jj-core

export const JJ_TRUNK_REVSET = 'trunk()';
export function getJJRepoRoot(): string { return ''; }
export function getJJContext(path: string): any { return {}; }
export function runJjDiff(args: string[]): string { return ''; }
export function detectJjWorkspace(path: string): boolean { return false; }
export function getJjDiffArgs(base: string, target: string): string[] { return []; }
export function getJjFileContentsForDiff(file: string): Promise<string> { return Promise.resolve(''); }
export function parseJjBookmarkList(output: string): string[] { return []; }
export function parseJjRemoteBookmarkList(output: string): string[] { return []; }
export function selectDefaultJjCompareTarget(provider: any): string { return ''; }

export function jjLineBaseRevset(): string { return ''; }
export function jjCompareTargetRevset(): string { return ''; }
export function parseRemoteBookmark(output: string): string[] { return []; }
export function getJjContext(path: string): any { return {}; }
