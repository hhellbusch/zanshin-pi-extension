# Kihon (基本) — basics

Fixed forms you drill until automatic. Not craft judgment (tradeoffs) — **execute the form**.
If it needs “it depends,” it belongs in a product guide or `/craft`, not here.

## Axes (cross-cutting)

| Domain | File | When |
|--------|------|------|
| Shell | [`shell.md`](shell.md) | `*.sh` / CI `run:` / Makefiles |
| Structured edit | [`structured-edit.md`](structured-edit.md) | Agent insert via edit anchors |
| Secrets | [`secrets.md`](secrets.md) | Any credentials, tokens, kubeconfigs, `.env` |
| Vault | [`vault.md`](vault.md) | HashiCorp Vault paths, agents, inject, policies |
| SQL / data | [`sql.md`](sql.md) | SQL, migrations, DB access from apps/scripts |
| Git | [`git.md`](git.md) | Commits, branches, push/rebase hygiene |
| K8s change | [`k8s-change.md`](k8s-change.md) | Cluster applies, manifests, GitOps syncs |
| Testing | [`testing.md`](testing.md) | New behavior, bugfixes, CI test gates |
| Lint / static check | [`lint.md`](lint.md) | Formatters, linters, `nocheck` / `# noqa` |

## Verticals (thin forms only)

Depth stays in the consumer’s `devops/` (or equivalent). These are minimum always-on forms.

| Domain | File | When |
|--------|------|------|
| Ansible | [`ansible.md`](ansible.md) | Playbooks, roles, collections |
| Helm | [`helm.md`](helm.md) | Charts, values, hooks |
| Kustomize | [`kustomize.md`](kustomize.md) | Overlays, bases, generators |
| Python | [`python.md`](python.md) | `*.py`, pyproject tooling |
| TypeScript / JS | [`typescript.md`](typescript.md) | `*.ts` / `*.tsx` / `*.js` |

**Not kihon (yet):** CSS, Node-as-runtime packaging, full GitOps topology, OCP product deep-dives — too situational. Use consumer guides.

**Shu / ha / ri:** Follow → comment intentional exceptions → drop the ritual when the stance is loaded. Fake ri skips the form without a reason.

**Invoke:** `/kihon <domain> [target]` · `/craft` auto-loads shell (and secrets when paths look credential-shaped).

Related: `ENGINEERING-PRINCIPLES.md` (judgment), `MARTIAL-VOCABULARY.md` (kihon vocabulary).
