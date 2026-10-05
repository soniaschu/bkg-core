// @plannotator/shared/source-save

export interface SourceSaveRequest { [key: string]: any; }
export interface SourceFileSnapshot { [key: string]: any; }
export interface SourceSaveCapability { [key: string]: any; }
export function disabledSourceSave(): SourceSaveCapability { return { enabled: false }; }
export function resolveExistingSourceSaveFile(path: string): string | null { return null; }

