// @plannotator/shared/workspace-status

export interface WorkspaceStatusPayload { [key: string]: any; }
export function getGitMetadataWatchPaths(): string[] { return []; }
export function getWorkspaceStatusForDirectory(dir: string): WorkspaceStatusPayload { return {}; }
export function filterWorkspaceStatusForDirectory(status: WorkspaceStatusPayload, dir: string): WorkspaceStatusPayload { return {}; }
export function discoverWorkspaceRepoPaths(dir: string): string[] { return []; }
export function isWithinProjectRoot(path: string, root: string): boolean { return false; }
export function resolveWorkspaceFilePath(path: string): string { return path; }
export function resolveWorkspaceInitialDiffType(status: any): string { return ''; }
export function getSemanticDiffAvailability(provider: any): boolean { return false; }
export function getSemanticDiffScratchCwd(): string { return ''; }
export function createDefaultSemanticDiffRuntime(): any { return {}; }
export function semanticDiffCacheKey(a: string, b: string): string { return ''; }
export function semanticDiffFileExtsFromSearchParams(params: any): string[] { return []; }
export function runSemanticDiff(runtime: any, options: any): Promise<unknown> { return Promise.resolve({}); }
export function prefixWorkspacePatchPaths(patch: string, prefix: string): string { return patch; }
export function aggregateWorkspacePatch(patches: any[]): any { return {}; }
export function getSinceBaseSections(diff: any): any[] { return []; }
export function getPRDiffScopeOptions(pr: any): any { return {}; }
export function getPRFullStackFingerprint(pr: any): string { return ''; }
export function getPRFullStackBaseRef(provider: any, pr: any): string { return ''; }
export function getPRViewedFiles(provider: any, pr: any): string[] { return []; }
export function resolvePRFullStackBaseRef(provider: any, pr: any): string { return ''; }
export function getOpenInApp(pr: any): any { return {}; }
export function getFileBrowserMaxFiles(): number { return 100; }
export function getWorkspaceStatusRelativePaths(provider: any): string[] { return []; }

