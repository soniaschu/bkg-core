// @plannotator/shared/source-save-node

import type { SourceSaveCapability, SourceFileSnapshot } from './source-save';
export function createSourceSaveCapability(): SourceSaveCapability { return { enabled: false }; }
export function createSourceSaveCapabilityFromText(text: string): SourceSaveCapability { return { enabled: false }; }
export function createSourceSaveCapabilityFromSnapshot(snapshot: SourceFileSnapshot): SourceSaveCapability { return { enabled: false }; }
export function readSourceFileSnapshot(path: string): SourceFileSnapshot | null { return null; }
export function resolveFolderSourceFile(folder: string, path: string): string { return path; }
export function resolveFolderSourceFileForSave(folder: string, path: string): string { return path; }
export function resolveExistingSourceSaveFile(folder: string, path: string): string | null { return null; }
export function saveSourceFileAtomic(path: string, content: string): void {}

