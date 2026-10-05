// @plannotator/shared/pr-provider

export interface PRProvider { [key: string]: any; }
export interface PRDiffScope { [key: string]: any; }
export function createPRProvider(selection: any): PRProvider { return {}; }
export function fetchPRList(provider: PRProvider, options: any): Promise<unknown[]> { return Promise.resolve([]); }
export function fetchPR(provider: PRProvider, pr: any): Promise<void> { return Promise.resolve(); }
export function submitPRReview(provider: PRProvider, review: any): Promise<unknown> { return Promise.resolve({}); }
export function markPRFilesViewed(provider: PRProvider, pr: any): Promise<void> { return Promise.resolve(); }
export function fetchPRStack(provider: PRProvider, pr: any): Promise<unknown> { return Promise.resolve({}); }
export function getPRDiffScopeOptions(pr: any): any { return {}; }
export function getPRFullStackFingerprint(pr: any): string { return ''; }
export function getPRFullStackBaseRef(provider: any, pr: any): string { return ''; }
export function fetchPRViewedFiles(provider: PRProvider, pr: any): string[] { return []; }
export function fetchPRFileContent(provider: PRProvider, pr: any, file: string): Promise<string> { return Promise.resolve(''); }
export function fetchPRContext(provider: PRProvider, pr: any): Promise<unknown> { return Promise.resolve({}); }
export function checkAuth(provider: PRProvider): Promise<boolean> { return Promise.resolve(false); }
export function getUser(provider: PRProvider): Promise<unknown> { return Promise.resolve(null); }

