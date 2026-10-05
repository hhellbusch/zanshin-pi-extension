# Kihon — Helm

## Form

1. **Values over hardcoding** — configurable bits in `values.yaml` / `-f` files; templates read `.Values`.
2. **No raw secrets in chart values committed** — reference external secret mechanism (see [`secrets.md`](secrets.md)).
3. **`helm template` / lint before push** — chart must render; use the project’s CI chart-testing if present.
4. **Hooks are rare** — prefer Jobs/Operators/GitOps jobs; if you use hooks, document delete policy and failure behavior.
5. **App version vs chart version** — bump with intent; don’t leave contradictory version comments.
6. **Don’t `helm install` prod by hand as the SoR** — GitOps or recorded release process owns desired state ([`k8s-change.md`](k8s-change.md)).

## Exceptions

`helm install` for a throwaway lab namespace: still no real secrets in values files that might get committed.
