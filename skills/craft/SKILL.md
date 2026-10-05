---
name: craft
description: >
  Apply engineering principles to code or design — DRY, KISS, SRP, YAGNI,
  convention over configuration, orchestration vs program, shared change scope,
  phased delivery. Use when the user says /craft or asks to review for craft /
  CoC / glue-vs-program / shared-config blast radius.
argument-hint: "[file path | diff | design | inline content from conversation]"
allowed-tools: Read Grep Glob Shell SemanticSearch
---

# Craft — Engineering Principles (Invoked)

<objective>
Deliberately review code, a diff, or a design through engineering judgment lenses. Surface tradeoffs and tensions — not a checklist scorecard. Ask when a principle conflict needs a human call.

Read `kit/ENGINEERING-PRINCIPLES.md` in the zanshin package (`../../kit/ENGINEERING-PRINCIPLES.md` relative to this skill file) for full rationale and rule-of-thumb detail.

**Ambient vs invoked:** A minimal craft posture may live in always-on context. This skill is **invoked depth** — run when the user says `/craft`, "apply craft principles", "review this for DRY/KISS", or before committing a non-trivial design.
</objective>

<process>

### Step 1: Identify the target

Parse `$ARGUMENTS`:

- **File path(s)** → read the file and immediate dependencies
- **"diff" / "changes" / no path** → `git diff` and `git diff --cached` for pending work
- **Design or plan in conversation** → the approach, API, or structure under discussion

If ambiguous, ask: "What should I apply craft to — pending diff, a specific file, or this design?"

### Step 2: Load context

- Read the target in full (or the diff with enough surrounding context)
Read `../../kit/ENGINEERING-PRINCIPLES.md` — use as lenses, don't recite it
- Read `../../kit/AGILE-ARTIFACT-DISCIPLINE.md` when target is a doc, plan, epic, or design artifact
- **Kihon (basics):** auto-load matching forms as **form gaps** (not craft tradeoffs). Qualifying bar: `../../kit/kihon/README.md` (“What qualifies as kihon”).
  - shell/CI/Makefile → `../../kit/kihon/shell.md`
  - paths/names suggesting credentials, vault, `.env`, kubeconfig → `../../kit/kihon/secrets.md` (and `vault.md` if Vault-specific)
  - `*.py` / `*.ts` behavior change → skim `testing.md` + `lint.md` when CI exists
  - insert-style edits → only if reviewing a suspicious replace: footnote `structured-edit.md`
  Full catalog: `/kihon <domain>` · `../../kit/kihon/README.md`
- **Orchestration vs program / CoC:** when the target is CI, Ansible, Helm, or a defaults/extra-vars forest *and* that smell is present, apply those lenses in `ENGINEERING-PRINCIPLES.md` (not kihon). Selective — not every YAML touch.
- **Shared change scope:** only when the changed surface is **shared** — many consumers inherit without a further opt-in (chart/role defaults, group policy, common CI template, base image, widely imported library config). Skip for a single-target playbook, one-off values override, or app-local CI job. Stance map: `../../kit/DESIGN-PHILOSOPHY.md` (skim; don't recite).
- Note what phase the work is in: **make it work** / **make it right** / **make it fast** — flag mixed phases

### Step 3: Apply lenses (only what illuminates)

Evaluate through relevant principles. Skip principles that don't apply — don't pad.

| Lens | Ask |
|---|---|
| **KISS** | Simplest solution that works? Unnecessary layers or ceremony? |
| **SRP** | One reason to change per unit? Can you name it in a single noun phrase? |
| **DRY** | Real duplication that will diverge — or coincidence? (Two = question; three = extract if divergence is real) |
| **YAGNI** | Built for a requirement that exists, or one imagined? |
| **Phases** | Work / right / fast mixed in one change? |
| **Leave it better** | Small fix while here (≤5 min) or backlog it? |
| **JBGE** | Sufficient for task, no more? (TAGRI: who reads it, what decision?) |
| **Travel light** | Can sections/models be discarded after purpose served? |
| **Convention over config** | Extra knobs/toggles — house default, or unpaid dialect? Timeboxed canary vs public API. |
| **Orchestration vs program** | CI/Ansible/Helm still glue — or an untested program in YAML? Extract when the logic needs a debugger. |
| **Omakase** | One blessed path for glue? Or a 40-option menu pretending to be flexible? |
| **Shared change scope** | Who inherits this shared default/policy/template? What’s outside the intended target? What validation covers the fan-out? |

**SRP note:** This kit covers SRP from SOLID, not OCP/Liskov/ISP/DIP. Name interface-segregation or dependency concerns in plain language if they arise — don't force SOLID vocabulary.

### Step 4: Surface tensions

Principles conflict by design. When they do, name the tension — don't pretend one wins:

> **Tension:** DRY suggests extracting X; YAGNI says the second use case doesn't exist yet.

Present findings as **observations**, not mandates. Severity: **worth fixing now** | **worth noting** | **acceptable tradeoff** (say why).

### Step 5: Collaborate on judgment calls

For load-bearing tradeoffs, ask one sharp question instead of deciding silently:

> This duplicates [pattern] in [file]. Extract now, or wait for a third divergence?

Do not rewrite large sections unless the user asked for implementation. Default: review output.

</process>

<output_format>

```
## Craft review — [target]

**Phase:** work | right | fast | mixed (flag if mixed)

### Observations
1. **[Lens]: [title]** — [observation]
   Severity: worth fixing now | worth noting | acceptable tradeoff

### Tensions
- [Principle A] vs [Principle B]: [what's in conflict] — [question or recommendation]

### Question (if any)
[One sharp question for a judgment call only you can make]

### Summary
[1–2 sentences — overall craft assessment, not a grade]
```

</output_format>

<failure_modes>

- **Checklist mode:** Rating every principle when most don't apply.
- **Premature abstraction:** Recommending DRY extract on first duplication.
- **Phase mixing:** Suggesting performance work before correctness is proven.
- **Silent refactor:** Large rewrites during a review request.
- **Kihon laundering:** Treating CoC / orchestration-vs-program as a `/kihon` domain instead of craft judgment.
- **Toggle theater:** Praising a permanent `enable_*` matrix as “safe incrementalism” without a kill-by date (ukemi mat vs unpaid config).
- **Local-diff myopia:** Treating a shared chart/policy/template change as single-consumer because the PR only shows one file.

</failure_modes>

<success_criteria>

- Findings tied to specific lines, structures, or design choices
- Tensions named where principles conflict
- Phase awareness (work/right/fast) explicit
- At most one judgment-call question unless user invited more
- No sycophantic "looks great" without substance

</success_criteria>
