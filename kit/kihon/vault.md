# Kihon — HashiCorp Vault

Builds on [`secrets.md`](secrets.md). Vault-specific fixed forms.

## Form

1. **No secret material in git** — not even “just the unseal sketch.” Policies, paths, and *names* of secrets are fine; values are not.
2. **Path before value** — document KV/engine paths and auth mounts in prose; fetch values at runtime (CLI, agent, injector, ESO).
3. **Auth method explicit** — AppRole, K8s auth, token, OIDC: name which one and the bound identity; don’t default to long-lived root/admin tokens in automation.
4. **TTL and renew** — prefer short TTLs; agents/injectors renew; don’t bake forever-tokens into CronJobs.
5. **Inject over bake** — K8s: agent-inject / secrets operator / ESO over copying Vault output into a committed manifest.
6. **Audit the miss** — if a secret was pasted into chat, logs, or a commit: rotate, revoke, note in the incident/journal (redacted).

## Exceptions

Break-glass root procedures live in offline/runbook stores the consumer defines — not in the public kit and not in agent session logs.
