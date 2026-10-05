// @plannotator/shared/guide-store

export const SAVED_GUIDE_ID_PREFIX = 'guide-';
export interface GuideStoreSession { [key: string]: any; }
export function createGuideStoreSession(config: any): GuideStoreSession { return {}; }

