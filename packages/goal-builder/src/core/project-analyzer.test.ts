import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProjectAnalyzer } from "./project-analyzer";

// Regression tests for two defects that made goal analysis unusable / silently lossy:
//
// 1. findConfigFiles() gated readFile() behind fileExists(), which is fs.access(F_OK).
//    That also resolves for DIRECTORIES, and the pattern list contains
//    '.github/workflows' and '.circleci'. Any repository shipping a .github/workflows
//    directory (i.e. essentially every CI-enabled repo) aborted the whole analysis
//    with an uncaught EISDIR from readFile().
//
// 2. analyzeRepository() computed `architecturePatterns` but never returned it, so
//    every consumer saw an empty pattern list: TypeScript/Next.js/Containerized/CI
//    detection was silently discarded.

let root: string;

function makeRepo(name: string, files: Record<string, string>): string {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, content);
  }
  // analyzeRepositories() only treats a directory as a repository if it is a git repo.
  execFileSync("git", ["init", "-q"], { cwd: dir });
  return dir;
}

async function patternsFor(dir: string): Promise<string[]> {
  const inventory = await new ProjectAnalyzer(dir).analyze();
  return inventory.repositories?.[0]?.architecturePatterns ?? [];
}

async function configsFor(dir: string): Promise<string[]> {
  const inventory = await new ProjectAnalyzer(dir).analyze();
  return (inventory.repositories?.[0]?.configs ?? []).map((c) => c.path);
}

beforeAll(() => {
  // realpathSync: on macOS /tmp is a symlink to /private/tmp, which would make the
  // path returned by mkdtempSync differ from the path reported by the analyzer.
  root = realpathSync(mkdtempSync(join(tmpdir(), "bkg-analyzer-")));
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("ProjectAnalyzer EISDIR regression", () => {
  test("does not throw when '.github/workflows' is a directory", async () => {
    const dir = makeRepo("with-ci-dir", {
      "package.json": JSON.stringify({ name: "with-ci" }),
      // a directory, not a file - this is what used to crash the analysis
      ".github/workflows/build.yml": "name: ci\non: [push]\n",
      "README.md": "# with-ci\n",
    });

    // The whole point: this used to reject with EISDIR.
    expect(patternsFor(dir)).resolves.toBeDefined();
    const configs = await configsFor(dir);
    expect(configs).toContain("package.json");
    expect(configs).toContain("README.md");
  });

  test("does not throw when '.circleci' is a directory", async () => {
    const dir = makeRepo("with-circleci", {
      "package.json": JSON.stringify({ name: "cc" }),
      ".circleci/config.yml": "version: 2.1\n",
    });
    expect(patternsFor(dir)).resolves.toBeDefined();
  });

  test("still collects regular config files alongside directory patterns", async () => {
    const dir = makeRepo("mixed", {
      "package.json": JSON.stringify({ name: "mixed", dependencies: { next: "15.0.0" } }),
      "tsconfig.json": JSON.stringify({ compilerOptions: {} }),
      "Dockerfile": "FROM alpine\n",
      "README.md": "# mixed\n",
      "CONTRIBUTING.md": "# contributing\n",
      ".github/workflows/build.yml": "on: [push]\n",
    });

    const configs = await configsFor(dir);
    expect(configs).toContain("package.json");
    expect(configs).toContain("tsconfig.json");
    expect(configs).toContain("Dockerfile");
    expect(configs).toContain("README.md");
    expect(configs).toContain("CONTRIBUTING.md");
    // directories must not be reported as if they were files
    expect(configs).not.toContain(".github/workflows");
  });
});

describe("ProjectAnalyzer architecturePatterns regression", () => {
  test("returns architecturePatterns instead of dropping them", async () => {
    const dir = makeRepo("patterns", {
      "package.json": JSON.stringify({ name: "patterns", dependencies: { next: "15.0.0" } }),
      "tsconfig.json": JSON.stringify({ compilerOptions: {} }),
    });

    const patterns = await patternsFor(dir);
    expect(patterns).toContain("TypeScript Project");
    expect(patterns).toContain("Node.js Project");
    expect(patterns).toContain("Next.js");
  });

  test("detects GitHub Actions CI only when a workflow file exists", async () => {
    const withCi = makeRepo("ci-present", {
      "package.json": JSON.stringify({ name: "ci-present" }),
      ".github/workflows/build.yml": "on: [push]\n",
    });
    expect(await patternsFor(withCi)).toContain("GitHub Actions CI");
  });

  test("does not report CI for an empty .github/workflows directory", async () => {
    const emptyCi = makeRepo("ci-empty", {
      "package.json": JSON.stringify({ name: "ci-empty" }),
      ".github/workflows/.gitkeep": "",
    });
    expect(await patternsFor(emptyCi)).not.toContain("GitHub Actions CI");
  });

  test("does not report CI when .github/workflows is absent", async () => {
    const noCi = makeRepo("ci-absent", {
      "package.json": JSON.stringify({ name: "ci-absent" }),
    });
    expect(await patternsFor(noCi)).not.toContain("GitHub Actions CI");
  });

  test("detects containerized projects", async () => {
    const dir = makeRepo("docker", {
      "package.json": JSON.stringify({ name: "docker" }),
      "docker-compose.yml": "services:\n  app:\n    image: alpine\n",
    });
    expect(await patternsFor(dir)).toContain("Multi-container");
  });
});
