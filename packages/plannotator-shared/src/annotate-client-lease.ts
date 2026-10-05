// @plannotator/shared/annotate-client-lease

export const ANNOTATE_CLIENT_LEASE_GRACE_MS = 5000;
export const ANNOTATE_CLIENT_LEASE_HEARTBEAT_MS = 1000;
export const ANNOTATE_CLIENT_LEASE_STREAM_PATH = '/lease';
export interface AnnotateClientLeaseStreamSession { [key: string]: any; }
export function createAnnotateClientLeaseStreamSession(): AnnotateClientLeaseStreamSession { return {}; }
export function createAnnotateClientLeaseTracker(): any { return {}; }

