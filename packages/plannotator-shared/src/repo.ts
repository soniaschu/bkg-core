// @plannotator/shared/repo

export interface RepoInfo { [key: string]: any; }
export interface CommitDiffInfo { [key: string]: any; }
export function parseRemoteUrl(url: string): RepoInfo { return {}; }
export function parseRemoteHost(url: string): string { return ''; }
export function getDirName(path: string): string { return ''; }
export function getCommitDiffInfo(commit: string): CommitDiffInfo { return {}; }

