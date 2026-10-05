// @plannotator/shared/resolve-file

export function resolveUserPath(path: string): string { return path; }
export function warmFileListCache(paths: string[]): void {}

export function isAbsoluteUserPath(path: string): boolean { return path.startsWith('/'); }
export function expandHomePath(path: string): string { return path; }
export function resolveMarkdownFile(path: string): string { return path; }
export function normalizeUserPathInput(path: string): string { return path; }

export function isCodeFilePath(path: string): boolean { return /\.(ts|js|tsx|jsx|py|rs|go|java|c|cpp|h|hpp)$/.test(path); }
export function resolveCodeFile(path: string): string { return path; }
export function isWithinProjectRoot(path: string, root: string): boolean { return path.startsWith(root); }
export function getFileBrowserMaxFiles(): number { return 10000; }
export const ANNOTATABLE_DOC_REGEX = /\.(md|mdx|txt|yaml|yml|json|toml)$/;
export const MAX_ANNOTATABLE_FILE_BYTES = 1024 * 1024;
export function isAnnotatableTextPath(path: string): boolean { return ANNOTATABLE_DOC_REGEX.test(path); }
