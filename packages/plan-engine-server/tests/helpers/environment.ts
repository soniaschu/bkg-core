import { tmpdir } from "node:os";
import { join } from "node:path";

export interface TestEnvironment {
  reset(): void;
  restore(): void;
  makeTempDir(): string;
}

export function createTestEnvironment(
  envKeys: readonly string[],
  _prefix: string,
): TestEnvironment {
  const saved: Record<string, string | undefined> = {};

  function reset() {
    for (const key of envKeys) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  }

  function restore() {
    for (const key of envKeys) {
      if (saved[key] !== undefined) {
        process.env[key] = saved[key];
      } else {
        delete process.env[key];
      }
    }
  }

  function makeTempDir(): string {
    const dir = join(tmpdir(), `plannotator-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    Bun.write(join(dir, ".keep"), "");
    return dir;
  }

  return { reset, restore, makeTempDir };
}
