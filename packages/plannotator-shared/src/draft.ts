// @plannotator/shared/draft

export function getDraftDir(): string { return ''; }
export function contentHash(content: string): string { return ''; }
export function saveDraft(id: string, content: string): void {}
export function loadDraft(id: string): string | null { return null; }
export function deleteDraft(id: string): void {}
export function getDraftGeneration(id: string): number { return 0; }
export function savePlan(id: string, plan: any): void {}
export function readArchivedPlan(id: string): any { return null; }
export function listArchivedPlans(): string[] { return []; }
export function parseArchiveFilename(filename: string): any { return {}; }
export function generateFilename(input: string): string { return ''; }
export function generateSlug(input: string): string { return ''; }
export function extractTitle(content: string): string { return ''; }

