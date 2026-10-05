# bkg-core

The BKG core plugin set for [OpenCode](https://opencode.ai), merged into **one** repository and built from source.

Four OpenCode plugins that used to live in four separate trees, plus the eight libraries they
are built on, now live here as a single bun workspace:

| Plugin | Tool surface |
|---|---|
| `plugins/bkg-goal-builder` | 13 goal tools (`bkg-add-goal`, `bkg-analyze-goal`, `bkg-check-goal`, …) |
| `plugins/bkg-goal-orchestrator` | `bkg-orchestrate-goal` |
| `plugins/bkg-plan-engine` | 7 plan tools (`bkg-add-plan`, `bkg-visualize-plan`, …) |
| `plugins/bkg-team` | 6 team tools (`bkg-brain-team`, `bkg-vote-team`, …) |

```
packages/    goal-builder, goal-orchestrator, plan-engine-{core,server,shared,ui},
             plannotator-{ai,shared}          <- the real implementations
plugins/     bkg-goal-builder, bkg-goal-orchestrator,
             bkg-plan-engine, bkg-team        <- the OpenCode plugin wrappers
```

The libraries carry the behaviour; the wrappers are thin OpenCode adapters that register the
tools and load the `commands/*.md` templates. Before this merge the wrappers referenced
`node_modules/@bkg/*` symlinks that pointed at a `packages/` directory which did not exist,
so nothing could be built and every artifact had to be hand-copied into place.

## Build

Requires **bun** (see `packageManager` in `package.json`).

```bash
bun install
bun run build        # build:packages then build:plugins
bun test
```

`bun run build` writes each wrapper's bundle to `plugins/<name>/dist/index.js`, which is the
exact artifact the OpenCode `plugin` block loads.

### Installing into OpenCode

The `plugin` array in `opencode.jsonc` points at `dist/index.js` paths. Either copy the built
output into your plugins directory, or point the entries straight at this repo:

```jsonc
{
  "plugin": [
    "./plugins/bkg-core/plugins/bkg-goal-builder/dist/index.js",
    "./plugins/bkg-core/plugins/bkg-goal-orchestrator/dist/index.js",
    "./plugins/bkg-core/plugins/bkg-plan-engine/dist/index.js",
    "./plugins/bkg-core/plugins/bkg-team/dist/index.js"
  ]
}
```

## Targets

`plugins/bkg-plan-engine` builds with `--target bun`, not `--target node`, because
`packages/plan-engine-server` imports Bun builtins (`import { $ } from "bun"`). OpenCode runs
plugins on Bun, so this is the correct target. The other three wrappers target Node.

## Tests

`bun test` runs the suite. Note that a substantial number of pre-existing failures in
`packages/plan-engine-server` are unrelated to this merge — they stem from API drift against
a newer bun than the pinned `bun@1.1.0` (for example `store.onMutation is not a function`).
