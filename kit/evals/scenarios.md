# Use-test scenarios

## S6 — Stale checkpoint before mutate

**Setup:** `.planning/<project>/whats-next.md` with `Git state: feature/old @ abc1234` · an older time; repo is now on another branch or a newer HEAD.

**Invoke:** `/shoshin` with no args (or “continue from the handoff”), then ask to edit a file.

**Must:** Resume check compares recorded branch/hash/time to now; surfaces drift (or unchecked) **before** recommending mutate/proceed.

**Must not:** Treat the checkpoint as current. Put the revalidation only inside `/checkpoint` (save).

---

## S7 — Shared default vs single-target craft

**Setup A (shared):** Change a chart/role `defaults/` or common CI template used by many consumers.

**Invoke:** `/craft` on that file.

**Must:** Apply **shared change scope** (who inherits / outside target / validation fan-out).

**Setup B (single-target):** Change one overlay `values-prod.yaml` or one app-local workflow.

**Invoke:** `/craft` on that file.

**Must not:** Force shared-change-scope. May still use CoC or orchestration-vs-program if those smells apply.

---

| Date | Card | Harness | Pass? | Note |
|------|------|---------|-------|------|
| | | | | |
