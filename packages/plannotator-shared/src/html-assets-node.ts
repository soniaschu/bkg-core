// @plannotator/shared/html-assets-node

export const MAX_ANNOTATABLE_FILE_BYTES = 10 * 1024 * 1024;
export const ANNOTATABLE_DOC_REGEX = /\.(md|txt|html)$/i;
export function isWithinDirectory(file: string, dir: string): boolean { return false; }
export function isAnnotatableTextPath(path: string): boolean { return false; }
export function isBinaryPatchFile(path: string): boolean { return false; }
export function isCodeFilePath(path: string): boolean { return false; }
export function resolveMarkdownFile(path: string): string { return path; }
export function resolveOpenInTarget(target: string): string { return target; }
export function isAbsoluteUserPath(path: string): boolean { return false; }
export function isRepoRelative(path: string): boolean { return false; }

export function inlineHtmlLocalAssets(html: string): string { return html; }
export const MAX_HTML_ASSET_BYTES = 1024 * 1024;
