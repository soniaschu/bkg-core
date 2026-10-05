export const GUIDE_EMPTY_OUTPUT_ERROR = new Error("Guide produced no output");

export interface GuideSession {
  buildCommand(options: {
    cwd: string;
    patch: string;
    diffType: string;
    options: Record<string, unknown>;
    prMetadata?: { url: string };
    changedFiles: { path: string }[];
    config: Record<string, unknown>;
    repair?: { payload: string };
  }): Promise<unknown | null>;
  onJobComplete(options: {
    job: { id: string };
    meta: { jobId: string };
    changedFiles: string[];
  }): Promise<{ summary?: string; error?: string }>;
  getGuide(jobId: string): unknown | null;
  saveReviewed(jobId: string, reviewed: boolean[]): void;
  getFailedPayload(jobId: string): string | null;
  submitManualOutput(jobId: string, payload: string, changedFiles: string[]): { sections: number; files: number } | { error: string };
  getLaunchChangedFiles(jobId: string): string[] | undefined;
}

export function createGuideSession(): GuideSession {
  const guides = new Map<string, unknown>();
  const launchChangedFiles = new Map<string, string[]>();
  const failedPayloads = new Map<string, string>();

  return {
    async buildCommand() {
      return null;
    },
    async onJobComplete() {
      return {};
    },
    getGuide(jobId: string) {
      return guides.get(jobId) ?? null;
    },
    saveReviewed(jobId: string, reviewed: boolean[]) {
      guides.set(jobId, { jobId, reviewed });
    },
    getFailedPayload(jobId: string) {
      return failedPayloads.get(jobId) ?? null;
    },
    submitManualOutput(_jobId: string, _payload: string, changedFiles: string[]) {
      return { sections: 0, files: changedFiles.length };
    },
    getLaunchChangedFiles(jobId: string) {
      return launchChangedFiles.get(jobId);
    },
  };
}
