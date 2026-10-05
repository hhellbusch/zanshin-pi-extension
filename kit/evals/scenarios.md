# Use-test scenarios

Manual eval cards. Each card: setup, invoke, **must**, **must not**. Score pass/fail; one note. Not a product.

Run in the consumer harness you care about (Pi slash, Cursor skill, Codex plugin). Same card, different harness, is a packaging eval — not a new card.

---

## S1 — Craft vs kihon on a flag forest

**Setup:** A small Ansible `defaults/main.yml` with 8+ `enable_*` / `mode` knobs, no kill-by dates.

**Invoke:** `/craft` on that file (or “apply craft to this role”).

**Must:** Name **convention over configuration** (or unpaid config / toggle forest). Treat flags as craft, not a missing `/kihon ansible` bullet.

**Must not:** Invent `/omakase`. Add a new kihon domain. Praise the matrix as “safe incrementalism” with no kill-by date.

---

## S2 — Kihon shell form

**Setup:** A script that runs `make && deploy` without `set -euo pipefail` / `pipefail`.

**Invoke:** `/kihon shell` on the path.

**Must:** Check against `kit/kihon/shell.md` (failed steps, unbound vars, pipefail). Form gaps, not a DRY/YAGNI essay.

**Must not:** Rewrite as a framework. Skip the form because “the script is short.”

---

## S3 — Refuse a decorative skill

**Setup:** None.

**Invoke:** “Add `/mushin` and `/omakase` skills to the kit.”

**Must:** Point at promotion checklist (`MARTIAL-VOCABULARY.md`, `DESIGN-PHILOSOPHY.md`). Omakase stays a CoC companion; mushin stays parked.

**Must not:** Scaffold `skills/mushin/` or `skills/omakase/`.

---

## S4 — Decision order

**Setup:** A plan that smells over-scoped (two products in one PR).

**Invoke:** `/shoshin`, then `/kaeshi` or `/yomi`, then `/spar` if the frame holds.

**Must:** Shoshin questions framing against a source file. Kaeshi/yomi don’t replace spar. Spar steel-mans if you get there.

**Must not:** Jump to spar while the question is still “are we building the right thing?”

---

## S5 — Cold kit (no Field Notes lore)

**Setup:** Clone or open **only** `zanshin-pi-extension` (no parent `AGENTS.md`).

**Invoke:** “Spar this approach” on a one-paragraph design in the repo README.

**Must:** Load `skills/spar/SKILL.md` / `kit/WORKING-STYLE.md` and produce typed arguments + self-audit.

**Must not:** Require Field Notes paths (`gemini-workspace`, `.agents/skills` wrappers) to function.

---

## S6 — Domain language classes

**Setup:** None. Do not use a client glossary.

**Invoke:** `/domain-language` and ask it to classify these two cases only.

1. Public field `accountId`, column `user_id`, glossary documents that they are the same row at different edges.
2. Glossary `retired` = product no longer sold. Identity service `retired` = credential revoked, person still active.

**Must:** (1) intentional translation. (2) contradiction. Cite both sides. Stop without renaming.

**Must not:** Call (1) a legacy name because the glossary says “storage key.” Pick a winner for (2). Edit an ADR in the same turn.

---

## S7 — Lab journal vs checkpoint

**Setup:** A health check failed. The process was up; the check used the wrong port. Separately, a refactor is mid-flight and the session needs to resume later.

**Invoke:** Ask for a lab journal entry and a checkpoint.

**Must:** Journal entry has attempted, observed, surprise, and the disproved hypothesis, with a link to evidence. Checkpoint is the resume note.

**Must not:** Put the port surprise only in `whats-next.md`. Write a journal entry for a routine session with no surprise. Paste the raw log.

---

## Log (append, don’t grow a warehouse)

| Date | Card | Harness | Pass? | Note |
|------|------|---------|-------|------|
| | | | | |
