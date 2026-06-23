---
name: craft
description: Apply engineering principles to code or design — DRY, KISS, SRP, YAGNI, phased delivery
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

</failure_modes>

<success_criteria>

- Findings tied to specific lines, structures, or design choices
- Tensions named where principles conflict
- Phase awareness (work/right/fast) explicit
- At most one judgment-call question unless user invited more
- No sycophantic "looks great" without substance

</success_criteria>
