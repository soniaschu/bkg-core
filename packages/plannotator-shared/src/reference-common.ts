// @plannotator/shared/reference-common

export interface VaultNode { [key: string]: any; }
export function isFileBrowserExcludedPath(path: string): boolean { return false; }
export function buildFileTree(paths: string[]): VaultNode { return {}; }
export function isAbsoluteUserPath(path: string): boolean { return false; }
export function isRepoRelative(path: string): boolean { return false; }
export function validateFilePath(path: string): boolean { return true; }

export function isAbsoluteUserPath(path: string): boolean { return path.startsWith('/'); }
export function validateFilePath(path: string): boolean { return true; }
