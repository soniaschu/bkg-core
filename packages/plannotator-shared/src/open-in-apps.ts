// @plannotator/shared/open-in-apps

export const OPEN_IN_APPS: Record<string, any> = {};
export type OpenInKind = 'app' | 'url';
export interface OpenInApp { kind: OpenInKind; platform?: string; }
export interface OpenInPlatform { [key: string]: any; }
export function getOpenInApp(target: string): OpenInApp | null { return null; }
export function resolveOpenInTarget(target: string): string { return target; }
export function resolveRevealLabel(target: string): string { return target; }
export function resolveRevealIcon(target: string): string { return target; }

