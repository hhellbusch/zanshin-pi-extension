---
name: kihon
description: >
  Basics / fixed forms (基本): shell, secrets, vault, sql, git, k8s, testing,
  lint, ansible, helm, kustomize, python, typescript, structured edit. Use when
  the user says /kihon or asks for strict mode, secret hygiene, or stack basics.
argument-hint: "[domain] [optional path or topic]"
allowed-tools: Read Grep Glob Shell
---

# Kihon — Basics (Invoked)

<objective>
Apply a **fixed form** (kihon), not craft judgment. Load the domain doc and check the target against it — or state the form if no target.

Domains: `kit/kihon/` (`../../kit/kihon/` relative to this skill). Index: `../../kit/kihon/README.md`.
</objective>

<constraints>
- One primary domain per invoke unless the user asks for more
- Forms are execute/check — not tradeoff essays (use `/craft` for judgment)
- Prefer citing the kit file over pasting the whole doc
- Product depth (OCP guides, chart patterns) stays in the consumer repo — don’t invent it here
</constraints>

<process>

### 1. Parse domain

From `$ARGUMENTS` first token (or natural language), or infer from path:

| Token / cue | Domain file |
|-------------|-------------|
| `shell`, `bash`, `strict`, `makefile` | `shell.md` |
| `edit`, `anchor`, `structured-edit`, `insert` | `structured-edit.md` |
| `secrets`, `secret`, `credential`, `token`, `.env` | `secrets.md` |
| `vault` | `vault.md` |
| `sql`, `database`, `db`, `migration` | `sql.md` |
| `git`, `commit`, `rebase` | `git.md` |
| `k8s`, `kubernetes`, `ocp`, `openshift`, `kubectl`, `oc`, `manifest` | `k8s-change.md` |
| `test`, `testing`, `pytest`, `jest` | `testing.md` |
| `lint`, `eslint`, `ruff`, `format` | `lint.md` |
| `ansible`, `playbook`, `role` | `ansible.md` |
| `helm`, `chart` | `helm.md` |
| `kustomize`, `overlay`, `kustomization` | `kustomize.md` |
| `python`, `py`, `.py` | `python.md` |
| `typescript`, `ts`, `javascript`, `js`, `tsx` | `typescript.md` |

Path inference examples: `*.sh` → shell; `*.py` → python; `Chart.yaml` → helm; `**/vault/**` → vault + secrets.

If still ambiguous, ask once with a short domain list (axes first).

### 2. Load form + target

- Read `../../kit/kihon/<domain>.md` (and `secrets.md` automatically when domain is vault or paths look credential-shaped)
- If a path or diff is given, read it; else state the form and stop (teaching mode)

### 3. Check or apply

- **Review:** list gaps vs the form
- **Implement:** only if asked — apply the form; comment exceptions

### 4. Close

`compliant | gaps fixed | gaps listed` — next: craft if judgment needed; consumer devops guide if depth exceeded kihon.

</process>

<output_format>

```
## Kihon — [domain]

**Form:** kit/kihon/[file].md
**Target:** [path | none]

### Result
- …

next: craft | proceed | consumer-guide — …
```

</output_format>

<success_criteria>
- Correct domain selected
- Gaps tied to concrete lines or clear teaching output
- No craft essay; no pasted product-guide novel
</success_criteria>
