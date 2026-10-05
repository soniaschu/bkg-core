// @plannotator/shared/integrations-common

export interface IntegrationResult { [key: string]: any; }
export function getIntegrationConfig(): any { return {}; }

export function generateFilename(input: string): string { return input; }
export function generateFrontmatter(content: string): string { return ''; }
export function buildBearContent(note: any): string { return ''; }
export function stripH1(html: string): string { return html; }
export function generateOctarineFrontmatter(content: string): string { return ''; }
export function buildHashtags(tags: string[]): string[] { return tags; }
export function detectObsidianVaults(): any { return []; }
export function extractTitle(content: string): string { return content; }
