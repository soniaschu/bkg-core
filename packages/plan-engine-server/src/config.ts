export {
  loadConfig,
  saveConfig,
  detectGitUser,
  getServerConfig,
  resolveAIEnabled,
  resolveAnnotateHistory,
  resolveCursorSandbox,
  resolveGuideHistory,
  type PlannotatorConfig,
  type DiffOptions,
} from "@plannotator/shared/config";

export class Config {
  constructor(_dataDir?: string) {}
  async load() {}
}
