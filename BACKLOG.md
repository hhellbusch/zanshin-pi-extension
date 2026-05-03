# Backlog

## In Progress

_none_

## Up Next

_none_

## Ideas

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
