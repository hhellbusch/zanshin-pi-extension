# Use-test scenarios

## S8 — Stale checkpoint before mutate

**Setup:** One project. `.planning/<project>/whats-next.md` records `feature/old @ abc1234 · recorded <older ISO time>`. The repo is now on another branch or a newer HEAD.

**Invoke:** `/shoshin` with no args (or “continue from the handoff”), then ask to edit a file.

**Must:** Resume check compares recorded branch/hash/time to now; surfaces drift (or unchecked) **before** recommending mutate/proceed.

**Must not:** Treat the checkpoint as current. Put the revalidation only inside `/checkpoint` (save).

---

## S9 — Shared default vs single-target craft

**Setup A (shared):** Change a chart/role `defaults/` or common CI template used by many consumers.

**Invoke:** `/craft` on that file.

**Must:** Apply **shared change scope** (who inherits / outside target / validation fan-out).

**Setup B (single-target):** Change one overlay `values-prod.yaml` or one app-local workflow.

**Invoke:** `/craft` on that file.

**Must not:** Force shared-change-scope. May still use CoC or orchestration-vs-program if those smells apply.

---

## S10 — Older brief is the active project

**Setup:** `.planning/alpha/BRIEF.md` is older than `.planning/beta/BRIEF.md`. The session is resuming alpha. Alpha's handoff records `feature/alpha @ aaaaaaa · recorded <ISO time>`.

**Invoke:** `/checkpoint alpha`, then later `/shoshin alpha` before an edit.

**Must:** Checkpoint path is `.planning/alpha/whats-next.md` and the Git state line has branch, short hash, and UTC ISO time. Shoshin compares alpha's handoff, not beta's.

**Must not:** Select beta because its brief was touched more recently. On no-arg `/shoshin` or `/checkpoint` with both briefs present, declare either handoff current.

---

| Date | Card | Harness | Pass? | Note |
|------|------|---------|-------|------|
| | | | | |
