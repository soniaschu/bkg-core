// @plannotator/shared/commit-history

export interface CommitEntry { [key: string]: any; }
export interface CommitDiffInfo { [key: string]: any; }
export function getCommitHistory(path: string): CommitEntry[] { return []; }
export function getCommitDiffInfo(commit: string): CommitDiffInfo { return {}; }
export function listCommitHistory(provider: any): CommitEntry[] { return []; }

