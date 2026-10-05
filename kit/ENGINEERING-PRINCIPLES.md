# Engineering Principles

Guiding principles for making engineering tradeoffs. These are judgment aids, not rigid rules — they exist to help reason about design decisions, not to mandate specific outcomes.

Part of the zanshin-pi-extension kit. Ambient craft posture lives in the consumer's always-on context; invoked depth is `skills/craft/SKILL.md`. Stance map and framework borrowings: `DESIGN-PHILOSOPHY.md`.

**Lens index:** DRY · KISS · SRP · Leave it better · YAGNI · **Convention over configuration** · Phases · **Orchestration vs program** · **Shared change scope** · (JBGE/TAGRI via artifact discipline)

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

## Convention over configuration

Pick a **default path** and make it boring. Extra knobs are unpaid configuration: every `enable_*`, extra-var, and pipeline `if:` is a dialect the next human (and the next agent) must learn.

**Smell:** A role or workflow whose `defaults/` is a feature-flag matrix “so we can go slow.” Sometimes that’s **ukemi** for a canary; often the flags survive and *become* the product.

| Prefer | Avoid |
|--------|--------|
| House convention (one way to lint, test, deploy, name tasks) | Snowflake toggles per job/customer with no end date |
| Override the exception in one overlay/inventory | Copy-paste a parallel playbook “just in case” |
| Timeboxed experiment flag, default = convention, then delete | Open-ended `mode:` / `strictness:` / `enable_foo` as the public API |

**Agent incrementalism:** Models (e.g. Codex) often add variables while walking toward a goal so each apply has an off-ramp. That’s a reasonable **mat** for one step. Craft check: after the experiment, **collapse knobs into convention** or extract a program — don’t leave scaffolding as the interface.

**Omakase (お任せ):** the house menu — one blessed path for glue. Complements CoC. **Omakase for the path; Unix for the programs on the path** (`MARTIAL-VOCABULARY.md`, `DESIGN-PHILOSOPHY.md`).

**Collaboration happiness:** optimize for the next human on this repo (and the next agent) — short, sharp, fail loud — not a product-marketing slogan.

**Rule of thumb:** If you can’t name the convention, you don’t have one — you have configuration. If you can’t name when a toggle dies, it isn’t an experiment.

---

## Three Phases — Make It Work, Make It Right, Make It Fast

Three distinct phases, never mix them. Build something that works first. Then refactor it right. Then optimize if it's still too slow.

Mixing phases is where bugs hide — optimizing before the baseline works, then "refactoring" breaks what you thought was working. Every time you're tempted to optimize before the code works, you're in phase one wearing a phase three hat.

- **Phase 1 — Make it work:** Correctness over everything. Get the right output on the right input. Ugly code is fine. Working spaghetti beats perfect nothing.
- **Phase 2 — Make it right:** Apply DRY, SRP, clean names, tests, proper structure. Refactor into something readable. The code should still do the exact same thing.
- **Phase 3 — Make it fast:** Profile first. Optimize only the measured bottleneck. Premature optimization is just phase 1 with extra steps.

**Rule of thumb:** If your PR contains both performance changes and refactoring, you mixed phases. Split it.

---

## Orchestration vs program

CI engines (GitHub Actions, Tekton, Jenkins, GitLab CI) and Ansible are **orchestrators**: sequence steps, bind environment, declare desired state. They are a bad **programming language**: deep `if`/`loop` trees, homemade libraries, domain rules that need a debugger.

**Smell:** "This playbook/pipeline is starting to look like a program." That's SRP in the wrong medium — not a reason to ban automation.

| Keep in CI / Ansible / Helm glue | Extract to a real program (script, module, image, operator) |
|----------------------------------|-------------------------------------------------------------|
| Checkout, build, test, publish, deploy | Branching, parsing, domain rules you need to unit-test |
| Install packages, drop files, restart units | Algorithms and rich error recovery |
| Thin caller of a tested entrypoint | Logic copied across CI *and* Ansible *and* shell |
| Declare desired state | Compute that state |

**Extract when:** failures are *logic* bugs (wrong branch taken), onboarding is "learn our YAML dialect," or you want a unit test for the behavior. **Don't extract** on the first `when:` — that's YAGNI; one more conditional is cheaper *today*. The bar is *where the program lives*, not whether glue may be smart.

**Related stances** (detail in `DESIGN-PHILOSOPHY.md`): omakase defaults; no-one-paradigm (YAML isn’t the runtime); sharp knives (CI/Ansible cut you if used as a general-purpose language). Pair with **CoC** when the smell is a flag forest; with this lens when the smell is control-flow-as-YAML.

**Rule of thumb:** If you need a debugger for the *logic*, it doesn't belong only in YAML. If you're only sequencing tools and passing artifacts, stay in the orchestrator.

---

## Shared change scope

When the change touches **shared** configuration or infrastructure — a chart default, group policy, common CI template, base image, library used by many callers — ask who inherits it before treating the diff as local.

| Ask | Why |
|-----|-----|
| **Who inherits?** | Name the consumers (clusters, teams, pipelines, charts) that pick this up without a further opt-in |
| **What’s outside the intended target?** | Sibling environments, older release trains, forks that still pull the default |
| **What validation covers the affected set?** | One happy-path apply is not coverage of the fan-out |

**Smell:** “It’s just a default” / “only our team uses this path” without naming who else resolves the same value.

**Not this lens:** Ordinary app code with a single deploy target — use YAGNI / phases. Consequence *chains* of a chosen action → `/yomi`. Failure rails for a goal → `/kaeshi`. This lens is the **blast radius of a shared surface**, not a platform checklist.

**Rule of thumb:** If you can’t name who else will get this change without asking, you don’t understand the scope yet.

---

## How to Use These

These are not a checklist. They are lenses — look through the one that illuminates the problem at hand. When two principles conflict (DRY vs YAGNI, CoC vs ukemi, omakase vs Unix composability, shared-scope caution vs ship-the-default), the conflict is the signal — name it; don’t pretend one slogan wins.

---

## Related

- `WORKING-STYLE.md` — dual-layer shoshin, craft, and artifact discipline
- `skills/craft/SKILL.md` — invoked engineering-principles review (includes JBGE lens)
- `kit/AGILE-ARTIFACT-DISCIPLINE.md` — full JBGE/TAGRI reference (Ambler)
- `kit/DESIGN-PHILOSOPHY.md` — stance map; Rails/Unix/CI2/Laravel borrowings
- `kit/kihon/` — easy-pitfall forms (shell, ansible hygiene); **orchestration vs program** and **CoC** are craft, not kihon
