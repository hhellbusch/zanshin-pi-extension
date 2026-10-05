# Kihon — secrets

## Form

1. **Never commit secrets** — passwords, tokens, private keys, kubeconfigs, `.env` with real values, pull secrets, cloud creds.
2. **Prefer a secret manager** — Vault, cloud SM, sealed/external secrets — over plaintext or “temporary” files in the repo.
3. **Examples are fake** — docs and `*.example` use obvious placeholders (`changeme`, `REDACTED`, synthetic hosts).
4. **Redact in journals** — checkpoints, whats-next, incident notes, chat paste: no live credentials.
5. **Least privilege** — scope tokens to the task; rotate when exposed; don’t reuse personal PATs in shared automation.
6. **Agent caution** — don’t write secrets into skills, prompts, or committed task specs. Pass via env / mounted secret / vault inject at runtime.

## Exceptions

If a lab *must* ship a credential-shaped fixture, mark it non-production, document rotation, and keep it out of default paths agents commit.

## Related

- Vault-specific form: [`vault.md`](vault.md)
- Cluster apply hygiene: [`k8s-change.md`](k8s-change.md)
