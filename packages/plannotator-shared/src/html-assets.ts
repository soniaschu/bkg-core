// @plannotator/shared/html-assets

export const HTML_ASSET_ROUTE_PREFIX = '/html-assets';
export const MAX_HTML_ASSET_BYTES = 1024 * 1024;
export function encodeHtmlAssetRoute(path: string): string { return path; }
export function normalizeHtmlAssetRoute(path: string): string { return path; }
export function inlineHtmlLocalAssets(html: string): string { return html; }
export function htmlAssetContentType(path: string): string { return 'text/html'; }
export function rewriteHtmlAssetReferences(html: string): string { return html; }
export function createHtmlAssetRegistry(): any { return {}; }

export function inlineHtmlLocalAssets(html: string): string { return html; }
export function encodeHtmlAssetPath(path: string): string { return path; }
export function normalizeHtmlAssetRoutePath(path: string): string { return path; }
