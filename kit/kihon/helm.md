# Kihon — Helm

Minimum form. Chart design and “should this be a value?” stay in consumer `devops/` guides and `/craft`.

## Form

1. **Values for what actually varies** — env/install deltas in `values.yaml` / `-f` files; templates read `.Values`. House constants stay in the template (or a single default), not a second schema.
2. **Don’t grow a values control panel** — new keys / `enable_*` / nested option trees need a reason (real second installer, not “someone might want it”). Flag forests are craft **convention over configuration**, not more Helm kihon.
3. **No raw secrets in chart values committed** — reference external secret mechanism (see [`secrets.md`](secrets.md)).
4. **`helm template` / lint before push** — chart must render; use the project’s CI chart-testing if present.
5. **Hooks are rare** — prefer Jobs/Operators/GitOps jobs; if you use hooks, document delete policy and failure behavior.
6. **App version vs chart version** — bump with intent; don’t leave contradictory version comments.
7. **Don’t `helm install` prod by hand as the SoR** — GitOps or recorded release process owns desired state ([`k8s-change.md`](k8s-change.md)).

## Exceptions

`helm install` for a throwaway lab namespace: still no real secrets in values files that might get committed.

If every string in the chart is `.Values.*` “for flexibility,” that’s unpaid configuration — `/craft`, not a missing bullet. See `ENGINEERING-PRINCIPLES.md`.
