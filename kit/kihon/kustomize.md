# Kihon — Kustomize

## Form

1. **Overlays for env delta** — bases stay shared; env-specific changes live in overlays, not forked copies of the whole tree.
2. **No secret generators with real data in git** — use external secrets / sealed secrets / vault inject ([`secrets.md`](secrets.md)).
3. **`kustomize build` (or `kubectl kustomize`) must succeed** before commit.
4. **Namespace transformer intentional** — know which overlay sets namespace; don’t rely on apply-time accidents.
5. **Strategic merge patches stay small** — prefer patches that change named fields; avoid wholesale resource replacement when a patch will do.
6. **GitOps-friendly** — build output isn’t committed unless the consumer’s pattern requires it; source of truth is the kustomization tree.

## Exceptions

Vendoring build output for an air-gapped flow: document why and keep secrets out of the render.
