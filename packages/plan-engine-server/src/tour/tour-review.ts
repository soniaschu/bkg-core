export const TOUR_EMPTY_OUTPUT_ERROR = new Error("Tour produced no output");

export interface TourSession {
  buildCommand(options: {
    cwd: string;
    patch: string;
    diffType: string;
    options: Record<string, unknown>;
    prMetadata?: { url: string };
    config: Record<string, unknown>;
  }): Promise<unknown | null>;
  onJobComplete(options: { job: { id: string }; meta: { jobId: string } }): Promise<{ summary?: string }>;
  getTour(jobId: string): unknown | null;
  saveChecklist(jobId: string, checked: boolean[]): void;
  getFailedPayload(jobId: string): string | null;
}

export function createTourSession(): TourSession {
  const tours = new Map<string, unknown>();
  const failedPayloads = new Map<string, string>();

  return {
    async buildCommand() {
      return null;
    },
    async onJobComplete() {
      return {};
    },
    getTour(jobId: string) {
      return tours.get(jobId) ?? null;
    },
    saveChecklist(jobId: string, _checked: boolean[]) {
      tours.set(jobId, { jobId, checklist: _checked });
    },
    getFailedPayload(jobId: string) {
      return failedPayloads.get(jobId) ?? null;
    },
  };
}
