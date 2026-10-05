// @plannotator/shared/review-profiles

export interface ResolvedReviewProfile { [key: string]: any; }
export const BUILTIN_DEFAULT_ID = 'builtin-default';
export function composeReviewPrompt(profile: ResolvedReviewProfile, context: any): string { return ''; }

export const BUILTIN_DEFAULT_PROFILE = 'default';
export const HEARTBEAT_INTERVAL_MS = 30000;
export function profileHasCustomSection(profile: any, section: string): boolean { return false; }
