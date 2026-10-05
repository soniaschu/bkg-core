// @plannotator/shared/storage

export function getPlanVersion(id: string): string | null { return null; }
export function getVersionCount(id: string): number { return 0; }
export function listVersions(id: string): string[] { return []; }
export function saveAnnotations(id: string, annotations: any[]): void {}
export function loadAnnotations(id: string): any[] { return []; }

export function saveToHistory(session: any): void {}
export function generateSlug(input: string): string { return input; }
export function saveFinalSnapshot(session: any): void {}
export function savePlan(id: string, plan: any): void {}
export function parseArchiveFilename(filename: string): any { return {}; }
export function savePlan(id: string, plan: any): void {}
export function saveFinalSnapshot(session: any): void {}
export function listArchivedPlans(): string[] { return []; }
export function readArchivedPlan(id: string): any { return null; }
export function getPlanDir(): string { return ''; }
export function getHistoryDir(): string { return ''; }
export function getPlanVersionPath(id: string): string { return ''; }
