# Kihon — Kubernetes / OpenShift changes

## Form

1. **Prefer GitOps path** — change lands in git and syncs; ad-hoc `kubectl apply` / `oc apply` is exception, not default.
2. **Dry-run before apply** — server-side dry-run or diff (e.g. `kubectl diff`, Argo diff) when changing live objects by hand.
3. **Name the mat (ukemi)** — before a risky apply: rollback / previous revision / undo path in one line.
4. **Namespace explicit** — no relying on mystery current-context namespace for prod changes.
5. **No secret payloads in manifests committed to git** — use sealed/external/vault inject (see [`secrets.md`](secrets.md), [`vault.md`](vault.md)).
6. **Don’t scale or delete without confirming target** — context + namespace + name read back before destroy operations.

## Exceptions

Break-glass production hotfix: still dry-run when possible, still name the mat, still follow up with a git commit so GitOps catches up.
