// BKG Goal Builder - Templates Export

export const BUILTIN_TEMPLATES = [
  'implementation',
  'migration', 
  'analyse',
  'bugfix',
  'release',
  'refactoring',
  'documentation',
  'deployment',
] as const;

export type BuiltinTemplate = typeof BUILTIN_TEMPLATES[number];

export function isBuiltinTemplate(name: string): name is BuiltinTemplate {
  return BUILTIN_TEMPLATES.includes(name as BuiltinTemplate);
}

export const TEMPLATE_TRIGGERS: Record<BuiltinTemplate, string[]> = {
  implementation: ['implement', 'build', 'create', 'develop', 'code', 'feature'],
  migration: ['migrate', 'port', 'move', 'upgrade', 'switch'],
  analyse: ['analyze', 'research', 'investigate', 'study', 'evaluate'],
  bugfix: ['fix', 'bug', 'issue', 'error', 'crash', 'regression'],
  release: ['release', 'deploy', 'publish', 'ship', 'launch'],
  refactoring: ['refactor', 'cleanup', 'improve', 'optimize', 'restructure'],
  documentation: ['document', 'docs', 'readme', 'guide', 'tutorial'],
  deployment: ['deploy', 'infrastructure', 'kubernetes', 'docker', 'cloud'],
};