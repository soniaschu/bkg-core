// @plannotator/shared/pr-types

export interface PRRef { [key: string]: any; }
export interface PRMetadata { [key: string]: any; }
export interface PRContext { [key: string]: any; }
export interface PRReviewFileComment { [key: string]: any; }
export interface PRReviewSubmissionResult { [key: string]: any; }
export interface PRStackTree { [key: string]: any; }
export interface PRListItem { [key: string]: any; }
export interface GithubPRMetadata { [key: string]: any; }
export interface PRDiffScope { [key: string]: any; }
export interface PRRuntime { [key: string]: any; }
export interface WorkspaceRepoRuntimeState { [key: string]: any; }
export interface WorkspaceDiffType { [key: string]: any; }
export interface WorkspaceFileChange { [key: string]: any; }
export interface WorkspacePatchAggregate { [key: string]: any; }
export function prRefFromMetadata(metadata: PRMetadata): PRRef { return {}; }
export function isSameProject(a: PRRef, b: PRRef): boolean { return false; }
export function getPlatformLabel(pr: PRRef): string { return ''; }
export function getMRLabel(pr: PRRef): string { return ''; }
export function getMRNumberLabel(pr: PRRef): string { return ''; }
export function getDisplayRepo(pr: PRRef): string { return ''; }
export function getCliName(platform: string): string { return ''; }
export function getCliInstallUrl(platform: string): string { return ''; }
export function parsePRUrl(url: string): PRRef { return {}; }

