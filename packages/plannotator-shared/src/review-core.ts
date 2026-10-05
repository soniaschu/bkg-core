// @plannotator/shared/review-core

export interface GitContext { [key: string]: any; }
export interface ReviewGitButlerRuntime { [key: string]: any; }
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

export function profileHasCustomSection(profile: any, section: string): boolean { return false; }
export function parseWorktreeDiffType(diff: string): any { return {}; }
export function validateFilePath(path: string): boolean { return true; }
export function parseP4DiffType(diff: string): any { return {}; }
export function getCurrentBranch(provider: any): string { return ''; }
export function gitAddFile(provider: any, file: string): void {}
export function parseP4DiffType(diff: string): any { return {}; }
export function getCurrentBranch(provider: any): string { return ''; }
export function transformReviewInput(input: any): any { return input; }
export function validateFilePath(path: string): boolean { return true; }
export function gitResetFile(provider: any, file: string): void {}
export function prepareGitCommand(args: string[], options?: any, env?: Record<string, string>): any { return {}; }
export function getWorktrees(provider: any): any[] { return []; }
export function getDefaultBranch(provider: any): string { return ''; }
export function getGitContext(provider: any): any { return {}; }
export function runGitDiff(provider: any, options: any): any { return {}; }
export function getFileContentsForDiff(provider: any, file: string): Promise<string> { return Promise.resolve(''); }
export function runGitDiffWithContext(provider: any, options: any): any { return {}; }
export function isSameCwdCommitSwitch(provider: any, commit: string): boolean { return false; }
export function parseCommitDiffType(diff: string): any { return {}; }
export function resolveBaseBranch(provider: any): string { return ''; }
export function getSinceBaseSections(provider: any, base: string): any { return {}; }
export function detectRemoteDefaultInfo(provider: any): any { return {}; }
export function isBinaryPatchFile(file: string): boolean { return false; }
export function listPatchFiles(provider: any): string[] { return []; }
