export interface Provider {
  id?: string;
  fetchModels?(): Promise<void>;
}

export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map();

  register(provider: Provider): string {
    const id = provider.id ?? `provider-${this.providers.size + 1}`;
    this.providers.set(id, provider);
    return id;
  }

  disposeAll(): void {
    this.providers.clear();
  }
}

export class SessionManager {
  disposeAll(): void {
    // stub
  }
}

export interface CreateProviderConfig {
  type: string;
  cwd?: string;
  [key: string]: unknown;
}

export type PiSDKConfig = CreateProviderConfig & {
  type: "pi-sdk";
  piExecutablePath?: string;
};

export function createProvider(config: CreateProviderConfig): Provider {
  return {
    id: `${config.type}-${Date.now()}`,
    fetchModels: undefined,
  };
}

export interface AIEndpoints {
  [path: string]: ((req: Request) => Response | Promise<Response>) | undefined;
}

export interface CreateAIEndpointsOptions {
  registry: ProviderRegistry;
  sessionManager: SessionManager;
  getCwd?: () => string;
  beforeCapabilities?: () => Promise<void>;
  beforeProviderSession?: (providerId: string) => Promise<void>;
}

export function createAIEndpoints(_options: CreateAIEndpointsOptions): AIEndpoints {
  return {
    "/api/ai/query": (_req: Request) => Response.json({ error: "AI not available" }, { status: 503 }),
    "/api/ai/capabilities": () => Response.json({ available: false, providers: [] }),
  };
}

export function createBestEffortOnce<T extends (...args: never[]) => Promise<unknown>>(fn: T): T {
  let running = false;
  return ((...args: never[]) => {
    if (running) return Promise.resolve();
    running = true;
    return fn(...args).finally(() => {
      running = false;
    });
  }) as T;
}

export function isAIEndpointPath(path: string): boolean {
  return path.startsWith("/api/ai/");
}
