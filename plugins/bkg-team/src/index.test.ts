import { describe, expect, test, beforeAll } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Regression test for a silent bundle-level defect in @bkg/team-opencode.
//
// src/index.ts imports `join as joinPath` from "path" but loadCommands() called a
// bare `join(dir, file)`. That identifier does not exist, so every call threw
// ReferenceError - swallowed by the surrounding `catch {}`. Result: the plugin
// loaded fine and registered its 6 tools, but registered ZERO commands, so
// /bkg-debate, /bkg-zero, /bkg-rules, /bkg-dashboard, /bkg-project and /bkg-focus
// were all silently unavailable.
//
// The build script additionally omitted `cp commands/*.md dist/`, which the other
// three wrappers do, so a clean build produced a dist/ without any command
// templates at all. Both halves are asserted here against a real build.

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(pluginRoot, "dist");
const EXPECTED_COMMANDS = ["dashboard", "debate", "focus", "project", "rules", "zero"];

beforeAll(async () => {
  // Build once so the assertions run against the artifact OpenCode actually loads.
  const proc = Bun.spawn(["bun", "run", "build"], { cwd: pluginRoot, stdout: "pipe", stderr: "pipe" });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`build failed (exit ${code}): ${await new Response(proc.stderr).text()}`);
  }
});

describe("bkg-team build output", () => {
  test("dist/index.js exists", () => {
    expect(existsSync(join(distDir, "index.js"))).toBe(true);
  });

  test("command templates are copied into dist", () => {
    // The build must ship commands/*.md next to the bundle: loadCommands() reads
    // them from dirname(import.meta.url), i.e. the dist directory itself.
    const shipped = readdirSync(distDir).filter((f) => f.endsWith(".md")).sort();
    expect(shipped).toEqual([...EXPECTED_COMMANDS].sort().map((n) => `${n}.md`));
  });
});

describe("bkg-team command registration", () => {
  test("registers every command template", async () => {
    const mod = await import(join(distDir, "index.js"));
    const hooks = await (mod as any).default({ directory: pluginRoot, client: {} }, {});
    const config: Record<string, unknown> = {};
    await hooks.config(config);

    const commands = (config.command ?? {}) as Record<string, { description?: string; subtask?: boolean }>;
    const registered = Object.keys(commands).sort();

    expect(registered).toEqual(EXPECTED_COMMANDS.map((n) => `bkg-${n}`).sort());
    for (const name of registered) {
      expect(commands[name].description).toBeTruthy();
    }
  });

  test("still registers its tools", async () => {
    const mod = await import(join(distDir, "index.js"));
    const hooks = await (mod as any).default({ directory: pluginRoot, client: {} }, {});
    expect(Object.keys(hooks.tool ?? {}).sort()).toEqual([
      "bkg-brain-team",
      "bkg-dashboard-team",
      "bkg-git-team",
      "bkg-research-team",
      "bkg-supervisor-team",
      "bkg-vote-team",
    ]);
  });
});
