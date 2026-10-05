// @plannotator/shared/external-annotation

export interface ExternalAnnotationEvent { [key: string]: any; }
export interface AnnotationStore { [key: string]: any; }
export function createExternalAnnotationHandler(): any { return {}; }
export function classifyFindingPlacement(finding: any): string { return ''; }
export function createAnnotationStore(): AnnotationStore { return {}; }
export function transformPlanInput(input: any): any { return input; }
export function transformReviewInput(input: any): any { return input; }
export const HEARTBEAT_COMMENT = 'heartbeat';
export const HEARTBEAT_INTERVAL_MS = 30000;

export function serializeSSEEvent(event: any): string { return ''; }
