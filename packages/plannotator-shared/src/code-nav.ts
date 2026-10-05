// @plannotator/shared/code-nav

export interface CodeNavRequest { [key: string]: any; }
export interface CodeNavRuntime { [key: string]: any; }
export interface CodeNavResponse { [key: string]: any; }
export function resolveCodeNav(request: CodeNavRequest, runtime: CodeNavRuntime): Promise<CodeNavResponse> { return Promise.resolve({}); }
export function validateCodeNavRequest(request: any): boolean { return false; }
export function extractChangedFiles(diff: string): string[] { return []; }

