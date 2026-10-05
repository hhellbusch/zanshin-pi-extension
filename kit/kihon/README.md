# Kihon (基本) — basics

Fixed forms that **avoid easy pitfalls** and act as **quality signal generators** — the system fails loudly or the miss is obvious in review, instead of lying green.

Not craft judgment (tradeoffs). Not a product wiki. **Execute the form.** If it needs “it depends,” use `/craft` or a consumer `devops/` guide.

---

## What qualifies as kihon

Add or keep a domain only if most of these hold:

| Test | Pass means |
|------|------------|
| **Easy pitfall** | Skilled people still trip on it under time pressure or with agents |
| **Signal generator** | Following it makes failure visible (exit non-zero, CI red, secret scanner, dry-run diff) — or blocks a silent lie |
| **Short form** | Fits one screen (~5–8 bullets). Longer ⇒ guide, not kihon |
| **Mostly always-on** | Default is “do this”; exceptions are rare and commented |
| **Portable** | True outside one company’s repo layout (consumer guides hold the rest) |
| **Not craft** | You’re not weighing DRY vs YAGNI — you’re applying a fixed hygiene bar |

**Headline kihon** — wrong and the system can *lie* (green CI, committed secret, pipeline that ignored a failed stage): secrets, shell, git, k8s-change, testing, lint, vault, sql.

**Thin verticals** — minimum bar when touching that stack; depth stays in consumer guides: ansible, helm, kustomize, python, typescript.

**Footnote kihon** — real but narrow/tooling-specific; don’t catalog as peers to secrets/shell: [`structured-edit.md`](structured-edit.md) (agent insert/replace hazard).

**Reject / don’t add:** CSS style guides, full GitOps topology, OCP product deep-dives, second testing pyramids, “how to design a chart.” Those aren’t easy-pitfall forms.

**Promotion checklist (future domains):**

1. Name the pitfall and the false signal it causes  
2. Write ≤8 bullets an agent can check  
3. Prefer axis over vertical; vertical only if the bar is truly always-on  
4. Link out to consumer `devops/` for depth — don’t grow the kit file  
5. Demote to footnote or delete if models/tools stop failing that way

**Shu / ha / ri:** Follow → comment intentional exceptions → drop the ritual when the stance is loaded. Fake ri skips the form without a reason.

---

## Axes (cross-cutting)

| Domain | File | Pitfall / signal |
|--------|------|------------------|
| Shell | [`shell.md`](shell.md) | Failed steps ignored; unbound vars; pipefail |
| Secrets | [`secrets.md`](secrets.md) | Creds in git/logs/journals |
| Vault | [`vault.md`](vault.md) | Vault-specific auth/TTL/inject misses |
| SQL / data | [`sql.md`](sql.md) | Injection, hand-fix prod, priv sprawl |
| Git | [`git.md`](git.md) | Force-push main, secret history, junk commits |
| K8s change | [`k8s-change.md`](k8s-change.md) | Blind apply; no undo; secrets in manifests |
| Testing | [`testing.md`](testing.md) | Behavior change with no proof |
| Lint / static check | [`lint.md`](lint.md) | Silent disables; merge red checks |

## Verticals (thin)

| Domain | File |
|--------|------|
| Ansible | [`ansible.md`](ansible.md) |
| Helm | [`helm.md`](helm.md) |
| Kustomize | [`kustomize.md`](kustomize.md) |
| Python | [`python.md`](python.md) |
| TypeScript / JS | [`typescript.md`](typescript.md) |

## Footnotes

| Domain | File | Notes |
|--------|------|-------|
| Structured edit | [`structured-edit.md`](structured-edit.md) | Agent `old_str`/`new_str` insert hazard — still true, rarely invoked |

---

**Invoke:** `/kihon <domain> [target]` · `/craft` auto-loads shell and credential-shaped secrets/vault hints.

Related: `ENGINEERING-PRINCIPLES.md` (judgment), `DESIGN-PHILOSOPHY.md` (stances — not kihon), `MARTIAL-VOCABULARY.md` (kihon vocabulary).
