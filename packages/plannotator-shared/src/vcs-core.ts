// @plannotator/shared/vcs-core

export interface VcsProvider { [key: string]: any; }
export interface VcsSelection { [key: string]: any; }
export interface GitCommandOptions { [key: string]: any; }
export interface GitCommandResult { [key: string]: any; }
export interface GitContext { [key: string]: any; }
export interface GitDiffOptions { [key: string]: any; }
export interface DiffResult { [key: string]: any; }
export interface DiffType { [key: string]: any; }
export interface WorktreeInfo { [key: string]: any; }
export interface ReviewGitRuntime { [key: string]: any; }
export interface ReviewJjRuntime { [key: string]: any; }
export interface PRRuntime { [key: string]: any; }
export interface WorkspaceReviewSession { [key: string]: any; }
export interface WorkspaceReviewBuildOptions { [key: string]: any; }
export interface ReviewProfilesResponse { [key: string]: any; }
export interface SemanticDiffResponseCache { [key: string]: any; }
export interface SinceBaseSections { [key: string]: any; }
export interface DiffOption { [key: string]: any; }
export interface WorkspaceFileChange { [key: string]: any; }
export interface WorkspacePatchAggregate { [key: string]: any; }
export function createVcsApi(selection: VcsSelection): VcsProvider { return {}; }
export function createGitProvider(options: GitCommandOptions): VcsProvider { return {}; }
export function createJjProvider(options: any): VcsProvider { return {}; }
export function createGitButlerProvider(options: any): VcsProvider { return {}; }
export function getCurrentBranch(provider: VcsProvider): string { return ''; }
export function getDefaultBranch(provider: VcsProvider): string { return ''; }
export function runGitDiff(provider: VcsProvider, options: GitDiffOptions): DiffResult { return {}; }
export function runGitDiffWithContext(provider: VcsProvider, options: GitDiffOptions): DiffResult { return {}; }
export function runJjDiff(provider: VcsProvider, options: any): DiffResult { return {}; }
export function gitAddFile(provider: VcsProvider, file: string): void {}
export function gitResetFile(provider: VcsProvider, file: string): void {}
export function prepareGitCommand(args: string[]): string { return ''; }
export function getUser(): string { return ''; }
export function checkoutPRHead(provider: VcsProvider, pr: any): void {}
export function fetchPR(provider: VcsProvider, pr: any): Promise<void> { return Promise.resolve(); }
export function getFileContentsForDiff(provider: VcsProvider, file: string): Promise<string> { return Promise.resolve(''); }
export function getWorkspaceStatusForDirectory(provider: VcsProvider, dir: string): any { return {}; }
export function getWorkspaceStatusRelativePaths(provider: VcsProvider): string[] { return []; }
export function getWorktrees(provider: VcsProvider): WorktreeInfo[] { return []; }
export function runPRFullStackDiff(provider: VcsProvider, options: any): Promise<DiffResult> { return Promise.resolve({}); }
export function runPRLayerLocalDiff(provider: VcsProvider, options: any): Promise<DiffResult> { return Promise.resolve({}); }
export function runSemanticDiff(provider: VcsProvider, options: any): Promise<DiffResult> { return Promise.resolve({}); }
export function fetchPRList(provider: VcsProvider, options: any): Promise<unknown[]> { return Promise.resolve([]); }
export function fetchPRFileContent(provider: VcsProvider, pr: any, file: string): Promise<string> { return Promise.resolve(''); }
export function fetchPRArtifactContent(provider: VcsProvider, pr: any): Promise<string> { return Promise.resolve(''); }
export function fetchPRContext(provider: VcsProvider, pr: any): Promise<unknown> { return Promise.resolve({}); }
export function markPRFilesViewed(provider: VcsProvider, pr: any): Promise<void> { return Promise.resolve(); }
export function submitPRReview(provider: VcsProvider, review: any): Promise<unknown> { return Promise.resolve({}); }
export function resolveBaseBranch(provider: VcsProvider): string { return ''; }
export function selectDefaultJjCompareTarget(provider: VcsProvider): string { return ''; }
export function detectJjWorkspace(path: string): boolean { return false; }
export function jjCompareTargetRevset(): string { return ''; }
export function jjLineBaseRevset(): string { return ''; }
export function getJjContext(path: string): any { return {}; }
export function getJjDiffArgs(base: string, target: string): string[] { return []; }
export function getJjFileContentsForDiff(file: string): Promise<string> { return Promise.resolve(''); }
export function parseJjBookmarkList(output: string): string[] { return []; }
export function parseJjRemoteBookmarkList(output: string): string[] { return []; }
export function parseCommitDiffType(diff: string): DiffType { return {}; }
export function parseP4DiffType(diff: string): DiffType { return {}; }
export function parseWorktreeDiffType(diff: string): DiffType { return {}; }
export function mapRepoDiffTypeToWorkspaceMode(type: DiffType): string { return ''; }
export function mapWorkspaceModeToRepoDiffType(mode: string): DiffType { return {}; }
export function parseRemoteBookmark(output: string): string[] { return []; }
export function getGitButlerContextRevision(provider: VcsProvider): string { return ''; }
export function getGitButlerPatchFingerprint(patch: string): string { return ''; }
export function checkAuth(provider: VcsProvider): boolean { return false; }
export function createGitProvider(options: any): ReviewGitRuntime { return {}; }
export function createJjProvider(options: any): ReviewJjRuntime { return {}; }
export function createPRContextLiveCache(): any { return {}; }
export function serializeSSEEvent(event: any): string { return ''; }
export function transformReviewInput(input: any): any { return input; }
export function stripH1(html: string): string { return html; }
export function saveAnnotations(session: any, annotations: any[]): void {}
export function saveFinalSnapshot(session: any): void {}
export function saveToHistory(session: any): void {}
export function profileHasCustomSection(profile: any, section: string): boolean { return false; }

export function parseWorktreeDiffType(diff: string): any { return {}; }
export function resolveInitialDiffType(context: any, fallback: string): string { return fallback; }
export const JJ_TRUNK_REVSET = 'trunk()';
export function validateFilePath(path: string): boolean { return true; }
