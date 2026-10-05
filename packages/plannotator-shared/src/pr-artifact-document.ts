// @plannotator/shared/pr-artifact-document

export interface PRArtifactDocument { [key: string]: any; }
export class PRArtifactDocumentError extends Error {}
export function getPRArtifactDocument(provider: any, pr: any): Promise<PRArtifactDocument> { return Promise.resolve({}); }
export function fetchPRArtifactDocument(provider: any, pr: any): Promise<PRArtifactDocument> { return Promise.resolve({}); }
export function fetchPRArtifactContent(provider: any, pr: any): Promise<string> { return Promise.resolve(''); }

