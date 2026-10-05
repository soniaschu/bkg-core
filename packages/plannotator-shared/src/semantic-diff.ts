// @plannotator/shared/semantic-diff

export interface SemanticDiffAvailability { [key: string]: any; }
export interface SemanticDiffResponse { [key: string]: any; }
export type SemanticDiffResponseCache = Record<string, any>;
export class SemanticDiffResponseCacheImpl {
  constructor() { }
}
export const SemanticDiffResponseCache = SemanticDiffResponseCacheImpl;
export function getSemanticDiffAvailability(provider: any): boolean { return false; }
export function createDefaultSemanticDiffRuntime(): any { return {}; }
export function semanticDiffCacheKey(a: string, b: string): string { return ''; }
export function semanticDiffFileExtsFromSearchParams(params: any): string[] { return []; }
export function runSemanticDiff(runtime: any, options: any): Promise<unknown> { return Promise.resolve({}); }
export function getSemanticDiffScratchCwd(): string { return ''; }

