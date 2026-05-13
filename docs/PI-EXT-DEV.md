---
name: pi-ext
description: Pi extension development workflow — cache verification, validation, and push discipline
argument-hint: "[validate | cache-check | quick-pull | publish | review | new <name>]"
allowed-tools: Read Write StrReplace Shell Bash
---

# Pi Extension Development Workflow

<objective>
Safe iteration on Pi extensions without hitting cache staleness, loader errors, or untested pushes. Covers validation, cache management, and the push gate enforced by `pi-extension-guard.ts` in the paude-pi-extension.
</objective>

## Context

- Extension repos are checked out as workspace submodules in `submodules/`
- The **installed Pi cache** is a separate clone at `~/.pi/agent/git/github.com/hhellbusch/<name>/`
- The cache is NOT automatically synced with the submodule — it drifts. This is the single most common failure mode in Pi extension development.
- `submodules/paude-pi-extension/extensions/pi-extension-guard.ts` blocks `git push` to Pi extension repos unless `npm test` passes (tsc + jiti loader simulation)

## Repository layout (shared by zanshin-pi-extension and paude-pi-extension)

```
submodules/<name>/
├── package.json              # devDependency: typescript, tsc
├── tsconfig.json             # strict mode, noEmit
├── scripts/
│   └── validate-extensions.mjs  # jiti-based loader simulation
├── extensions/               # *.ts files — each must export a default function
│   └── zanshin.ts            # your extension
├── lib/                      # utility modules — NO default export required
│   └── guard-ui.ts           # shared helpers used by extensions
└── README.md                 # documentation
```

## Guard extensions vs regular extensions

Pi loads every `.ts` file in `extensions/` as an extension. There are two categories:

**Regular extensions** — fire on events to do useful work (sessions, notifications, system prompt injection). Defined by `before_agent_start`, `session_start`, `notification`.

**Guard extensions** — intercept tool calls to validate, confirm, or hard-block. Defined by `tool_call` and `tool_result`.

A single file can be both. Guard extensions use the same factory pattern:

```typescript
export default function (pi: ExtensionAPI) {
    pi.on("tool_call", async (event, ctx) => {
        // Before execution: intercept, validate, block
    });
    pi.on("tool_result", async (event, ctx) => {
        // After execution: inspect, reset state, update flags
    });
}
```

Key guard patterns:
- **`tool_call` + `return { block: true, reason: "..." }`** — hard block, no confirm
- **`pi.sendUserMessage("...")` + `return { block: true, reason: "..." }`** — soft block with context (model sees why)
- **`pi.appendEntry("key", { value })`** — store state across tool calls (flags, counters, hashes)
- **`tool_result`** — reset flags after successful commits, detect review commands

---

## Critical rules

### You must `/reload` after pulling into cache — and the runtime may not load the latest version

This is the single most important rule. Every time.

```bash
# 1. Pull into cache
git -C ~/.pi/agent/git/github.com/hellbusch/<name> pull origin main

# 2. Verify cache is current (not just a no-op pull)
git -C ~/.pi/agent/git/github.com/hellbusch/<name> log --oneline -3

# 3. /reload — ALWAYS
/reload
```

**Why this matters:** The Pi runtime caches compiled extension modules in memory. A successful `git pull` updates the files on disk but does **not** force the runtime to reload. The guard you just pushed code for may still run the old version until `/reload` happens.

**What to watch for:** If the runtime error references a variable or function that no longer exists on disk, the guard is running stale code.

### NEVER run `pi uninstall` or `pi install`

**This rule exists because of a specific failure mode:** the agent sees a broken guard in the runtime, tries to "fix" it by uninstalling and reinstalling the package, and ends up with a worse state — the extension is gone and the runtime has no replacement until the operator reinstalls.

The Pi runtime caches compiled extension modules. Uninstalling removes the extension from the config but leaves the git clone on disk. Reinstalling from the same remote gets the same cached version. **Uninstall/install never fixes a stale runtime.**

**The only correct fix for a broken guard in the runtime:**

1. Push the fix to remote (`git push origin main`)
2. Pull into cache (`git -C ~/.pi/agent/git/github.com/hellbusch/<name> pull origin main`)
3. **Operator runs `/reload`**

The agent must NEVER attempt to fix a stale runtime by uninstalling/reinstalling. If the runtime is broken and the operator says they can't reload right now, commit the fix to disk and wait for them to reload.

**The uninstall guard (`pi-uninstall-guard.ts`) hard-blocks `pi uninstall` — this is not a soft block. If the operator explicitly wants to uninstall, they do it from their terminal, not through the agent.**

### `lib/` not `extensions/`

Pi's loader scans every `.ts` file in `extensions/` and requires a **default export that is a function**. Utility modules (shared helpers, configuration) without a factory function MUST go in `lib/`.

This has caused "does not export a valid factory function" errors twice. When in doubt: if the file doesn't have `export default function (pi: ExtensionAPI) {`, put it in `lib/`.

### Every commit must pass `npm test`

```bash
cd submodules/<name> && npm test
```

This runs `tsc --noEmit` (type checking) followed by `scripts/validate-extensions.mjs` (simulates Pi's exact jiti loader). Both must pass before pushing.

### Cache is separate from submodule

The submodule (`submodules/<name>/`) and the installed Pi cache (`~/.pi/agent/git/github.com/hellbusch/<name>/`) are independent clones. Pulling into the cache can succeed but be a no-op if the cache was already ahead of a previous push.

## Commands

Parse `$ARGUMENTS` to determine the subcommand. If empty, default to **status**.

---

### `validate` — run full test suite

```bash
cd submodules/<name> && npm test
```

Reports:
- Type errors from `tsc --noEmit`
- Missing exports or invalid factory functions from `validate-extensions.mjs`

If either fails, **do not push**. Fix the errors and re-run.

---

### `quick-pull [name]` — pull into cache and reload

The most common post-pull flow: fetch updates into the Pi cache and reload.

```bash
# Quick pull — defaults to zanshin-pi-extension
git -C ~/.pi/agent/git/github.com/hellbusch/<name> pull origin main

# Verify it's current
log --oneline -1
```

The user then runs `/reload` to activate. If the runtime is serving stale content despite the cache being current, see "Cache is stale but cache-check says it's in sync" in the failure modes.

---

### `cache-check` — verify cache is in sync with submodule

This is the most important step before `/reload`. The cache being stale is the #1 reason changes appear to not load.

```bash
SUB="submodules/<name>"
CACHE="~/.pi/agent/git/github.com/hhellbusch/<name>"

# Compare HEAD commits
git -C "$SUB" log --oneline -1
git -C "$CACHE" log --oneline -1
```

**Two scenarios:**

1. **Same HEAD** → cache is current. `/reload` should pick up changes.
2. **Different HEAD** → cache is stale. Pull to fix:
   ```bash
   git -C "$CACHE" pull origin main  # or develop
   ```
   Re-run the comparison. If still different, the local repo may be ahead of origin — push first.

Always verify with `log --oneline -3` (not just `-1`) so you can see whether the pull was a real fetch or a no-op.

---

### `publish` — complete the push cycle

This is the full sequence from local repo to installed cache:

```bash
cd submodules/<name>

# 1. Validate
npm test

# 2. Commit any remaining changes
git add -A && git diff --cached --stat && git commit -m "chore: <message>"

# 3. Push to remote
git push origin main

# 4. Update the Pi cache
git -C ~/.pi/agent/git/github.com/hellbusch/<name> pull origin main

# 5. Verify cache caught up
git -C ~/.pi/agent/git/github.com/hellbusch/<name> log --oneline -1
```

After this, the user can `/reload` to activate changes.

---

### `review` — inspect extension structure before push

Quick audit without running tests:

1. **Export check** — every file in `extensions/` must have `export default function (pi: ExtensionAPI) {`
2. **Import check** — shared utilities import from `../lib/...`, not from sibling `extensions/` files
3. **No side effects** — `extensions/*.ts` files should only contain the `pi.on()` handlers and the default export. Setup code goes in `lib/`.
4. **No secrets** — grep for patterns like `api_key`, `password`, `secret` in staged content before committing

---

### `new <name>` — scaffold a new extension

1. Create `submodules/<name>/extensions/<name>.ts` with the boilerplate:
   ```typescript
   import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

   export default function (pi: ExtensionAPI) {
       pi.on("session_start", async (event, ctx) => {
           // Initialization
       });

       pi.on("tool_call", async (event, ctx) => {
           // Tool interception (for guards)
       });

       pi.on("tool_result", async (event, ctx) => {
           // Post-execution hooks (for guards)
       });
   }
   ```
2. Create `submodules/<name>/lib/` directory for shared utilities
3. Ensure `package.json` has `typescript` as devDependency and `tsconfig.json` exists
4. Run `npm test` to verify clean baseline

---

## Common failure modes

### "Cache is stale but cache-check says it's in sync"

The `cache-check` command compares HEAD commits between the submodule and the Pi cache. But the Pi runtime may be loading a **different version** — from a previous package install or a stale node_modules cache.

If `cache-check` shows both repos at the same commit but the Pi runtime still shows an old error (e.g., `stagedReviewedDiffHash is not defined` when the file on disk has `reviewedDiffHash`), the runtime is serving a compiled/loaded version that was cached before the files on disk changed.

**Do NOT fix this by uninstalling/reinstalling** — that is what caused the broken state in the first place. The uninstall breaks the runtime and the reinstall doesn't help because the Pi runtime already has the compiled modules loaded.

**The fix is always:**

```bash
# 1. Make sure the fix is pushed and pulled
git -C ~/.pi/agent/git/github.com/hellbusch/<name> pull origin main

# 2. Operator reloads — this is the ONLY way to get a fresh compile
/reload
```

If `/reload` doesn't work, the operator needs to fully restart the Pi session. There is no agent-accessible way to clear the compiled module cache without reloading.

If `/reload` doesn't work and the error message references a variable or function that no longer exists on disk, the runtime is serving stale content.

### "Changes don't appear after /reload"

95% of the time: cache is stale. Run `cache-check` first.

### "Extension does not export a valid factory function"

95% of the time: a utility module in `extensions/` instead of `lib/`. Move it.

### "Missing import" errors

The loader resolves `../lib/guard-ui.js` at runtime. If the import path is wrong, the extension fails to load entirely (silent failure — no error in the Pi UI, just missing functionality).

### "guard-ui.ts is in the wrong place"

This specific error happened twice. The file was initially created in `extensions/` where the loader tried to instantiate it as an extension. The fix: `git mv lib/guard-ui.ts extensions/guard-ui.ts` → then back to `lib/`.

---

## When to use which extension event

- **`session_start`** — restore state, auto-notify, set up persistent indicators (e.g., guard footer)
- **`tool_call`** — intercept before execution (e.g., commit-guard, force-push guard)
- **`tool_result`** — inspect after execution (e.g., update flags, reset state, scan output)
- **`before_agent_start`** — inject system prompt content (e.g., L0 kit path)
- **`notification`** — send UI notifications to the user (`ctx.ui.notify()`)

---

## Push gate (enforced by pi-extension-guard)

The `pi-extension-guard.ts` in `submodules/paude-pi-extension/extensions/pi-extension-guard.ts` runs automatically when `git push` targets a Pi extension repo. It detects the repo by checking for `package.json` with `"pi.extensions"` and `"scripts.test"`. It runs `npm test` and blocks the push if either phase fails.

**This means:** `git push` to a Pi extension repo without running `npm test` locally first is redundant — the guard will do it. But running locally first is faster (no network roundtrip) and gives you the compiler error output without the push transaction overhead.
