# Engineering Principles

Guiding principles for making engineering tradeoffs. These are judgment aids, not rigid rules — they exist to help reason about design decisions, not to mandate specific outcomes.

Part of the zanshin-pi-extension kit. For a self-contained session prompt, see `kit/STANDALONE.md`.

---

## DRY — Don't Repeat Yourself

Duplicate code, logic, or configuration is a maintenance burden waiting to manifest. When you copy-paste the same pattern three times, extract it. When two files need the same config value, parameterize it.

**Don't confuse DRY with DFO (Don't Fracture Over).** Over-engineering abstractions to avoid a single duplication point often creates more problems than it solves. Abstraction for abstraction's sake is just complexity with a slogan. Ask: does this duplication represent a real risk (it will change at different times), or is it just noise?

**Rule of thumb:** One duplication = coincidence. Two = question. Three = extract. But only extract if the duplicated parts are likely to diverge.

---

## KISS — Keep It Stupid Simple

Prefer the simplest solution that works. If a three-line script solves a problem that a framework would solve, use the script. Complexity should be earned, not assumed.

Simple does not mean naive. It means the solution doesn't introduce unnecessary layers of indirection, abstraction, or ceremony. A solution is simple when a new team member can understand it in ten minutes, not when it's a few lines of clever code.

**Rule of thumb:** If you'd need more than three sentences to explain why your approach is simpler, it isn't.

---

## SRP — Single Responsibility Principle

A module, function, or component should have one and only one reason to change. If a file does two things, it has two responsibilities. Separate them.

This applies to guards, scripts, config files, and documentation — not just code. A guard that handles secrets, review loops, and scope warnings violates SRP. A README that documents architecture, conventions, and release procedures violates SRP.

**Rule of thumb:** If you can't name the thing in a single noun phrase ("credential scanner", "link validator", "context injection"), it probably has too many responsibilities.

---

## Leave It Better (Broken Windows + Boy Scout Rule)

Leave things better than you found them. When you notice technical debt, a broken link, a stale comment, or a misnamed file — fix it while you're there. Small improvements accumulate. Leave your footprint smaller than when you arrived.

This doesn't mean rewriting everything. If you're touching line 42, fix the typo on line 43. If you're reading this file to understand the format, add a comment for the next person. If you notice a guard that's not doing what its name implies, rename it.

**Rule of thumb:** Five minutes max while you're already there. More than that, log it in the backlog and move on. You're responsible for your footprint, not everything broken in the repo.

---

## YAGNI — You Aren't Gonna Need It

Don't build for requirements you don't have. Every feature starts with "we might need this later" and ends with dead code nobody understands. The heuristic: if you can't point to a specific user story or concrete problem that requires it, it doesn't get built.

YAGNI is the counterweight to DRY. DRY says extract when duplicated; YAGNI says stop if you can't name the actual problem. When they conflict, YAGNI wins — build the duplication until it becomes real, then extract.

**Rule of thumb:** If the requirement exists only in your imagination, it doesn't get committed.

---

## Three Phases — Make It Work, Make It Right, Make It Fast

Three distinct phases, never mix them. Build something that works first. Then refactor it right. Then optimize if it's still too slow.

Mixing phases is where bugs hide — optimizing before the baseline works, then "refactoring" breaks what you thought was working. Every time you're tempted to optimize before the code works, you're in phase one wearing a phase three hat.

- **Phase 1 — Make it work:** Correctness over everything. Get the right output on the right input. Ugly code is fine. Working spaghetti beats perfect nothing.
- **Phase 2 — Make it right:** Apply DRY, SRP, clean names, tests, proper structure. Refactor into something readable. The code should still do the exact same thing.
- **Phase 3 — Make it fast:** Profile first. Optimize only the measured bottleneck. Premature optimization is just phase 1 with extra steps.

**Rule of thumb:** If your PR contains both performance changes and refactoring, you mixed phases. Split it.

---

## How to Use These

These are not a checklist. They are lenses — look through the one that illuminates the problem at hand. When two principles conflict (DRY vs. KISS, for instance), the conflict is the signal — the right answer usually involves accepting the tension rather than resolving it.

---

## Related

- `STANDALONE.md` — self-contained session prompt (includes craft and artifact ambient summaries)
- `WORKING-STYLE.md` — dual-layer shoshin, craft, and artifact discipline
- `skills/craft/SKILL.md` — invoked engineering-principles review (includes JBGE lens)
- `kit/AGILE-ARTIFACT-DISCIPLINE.md` — full JBGE/TAGRI reference (Ambler)
