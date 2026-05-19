# Backlog

## In Progress

_none_

## Up Next

_none_

## Ideas

### Turn counter -- loop-break heuristic

**Context:** Diagnosed from session log (2026-05-18) where the model looped 70+ turns on a single commit without user input. The `blockedDiffHashes` auto-pass in commit-guard fixes in-session commit loops, but doesn't catch loops that don't involve commits, and doesn't survive context compaction (Map resets).

**What:** Track consecutive assistant turns since the last user message in the zanshin extension. Emit `ctx.ui.notify` when the count crosses a threshold (suggested: 15-20 turns). Notify only -- do not block. Reset on user message.

**Where:** `extensions/zanshin.ts`. The extension already has a write counter and checkpoint notifications; this is the same pattern applied to turn depth.

**Implementation notes:**
- Count `tool_result` events as a proxy for model turns (each tool call = one turn). Or count `message` events with `role: assistant` if the event model exposes them.
- Threshold should be configurable or at least documented -- 15 is conservative, 20 is probably right for complex tasks.
- The notification message should name the turn count and suggest checking in: "N turns since your last message -- consider pausing to verify direction."
- Does NOT need to survive compaction (the human sees the notification before compaction resets the counter).

**Why not in pi-openai-compat:** Turn counting is workspace behavior, not provider behavior. Zanshin is the right home.

### Checkpoint-on-block -- compaction resilience for commit-guard

**Context:** Same session (2026-05-18). After each context compaction, the model forgot it had already implemented a feature and tried to re-implement it. The `blockedDiffHashes` Map resets on compaction, so Gate 3 blocks again on the first post-compaction commit. The model then re-enters planning mode instead of retrying.

**What:** When Gate 3 blocks a commit (first block of a diff hash), append a one-liner to the active `whats-next.md` checkpoint file: `blocked commit: "<message>", diff hash <N>, <timestamp>`. This gives the model a persistent anchor that survives compaction -- when it reads the checkpoint next turn, it knows it was mid-commit, not mid-implementation.

**Where:** `extensions/commit-guard.ts`, Gate 3 first-block path. Resolve the checkpoint file path the same way zanshin does (find BRIEF.md by mtime, derive `.planning/<project>/whats-next.md`).

**Dependency:** Shares path-resolution logic with zanshin.ts. May want to extract that into `lib/` before implementing.

**Why this matters:** The turn counter (above) catches the loop faster. Checkpoint-on-block prevents it from starting in the first place post-compaction. Both are worth doing; turn counter is simpler and higher value per effort.

### paude-aware pi extension

**Context:** paude (https://github.com/bbrowning/paude) is a container-based AI agent harness. Pi runs inside a paude container with limited capabilities — no persistent home outside the container, constrained filesystem, network limits.

**What would make sense to surface in pi:**

- **Harvest/sync cycle awareness** — paude has a harvest/sync pattern for moving work in and out of the container. An extension hook (e.g. before risky ops, or on `/checkpoint`) could surface whether a sync is needed or whether unsaved work would be lost on container teardown.
- **Container capability limits** — notify when an operation is likely to fail due to container constraints (no GPU, no external network, limited disk). Complements Zanshin's verification discipline.
- **Workspace isolation** — pi currently assumes the repo is truth; inside paude the "truth" boundary is different (container vs. host). Worth clarifying what persists across paude cycles vs. what dies with the container.

**Questions before designing:**
- What does the harvest/sync API look like? Is it a CLI command, a filesystem convention, or an HTTP endpoint?
- What paude metadata is available at runtime inside the container (env vars, mounts, manifests)?
- Should this be part of zanshin-pi-extension or a separate paude-pi-extension package?

**Definition of done:** TBD — needs paude API exploration first.
