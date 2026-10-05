---
name: consider
description: >
  Decision lenses that complement spar: inversion (what guarantees failure?)
  or second-order (and then what?). Use when the user says /consider,
  "invert this", "second-order this", "failure modes", "and then what?",
  or when shaping a goal/action before adversarial review of a written proposal.
argument-hint: "[inversion|second-order] [goal | action | file | topic]"
allowed-tools: Read Grep Glob Shell SemanticSearch
---

# Consider — Inversion & Second-Order

<objective>
Shape a decision with one of two lenses. Not adversarial review (that's `/spar`) and not framing reset (that's `/shoshin`).

| Mode | Question | Best when |
|------|----------|-----------|
| **inversion** | What would guarantee failure? | Goal is clear; plan/rails are not |
| **second-order** | And then what? | Action/choice is clear; consequences are not |

**Ordering with siblings:** shoshin (right problem?) → consider (rails / ripples) → spar (break the written proposal).
</objective>

<constraints>
- One mode per invoke — do not run both unless the user asks for both
- Ground failure modes and effects in the stated goal/action and any loaded files — no generic risk theater
- Prefer specific, actionable lines over abstract wisdom
- Keep output short enough to act on; expand only when the chain is load-bearing
- If the user already has a written proposal to attack, prefer `/spar` unless they explicitly want a lens first
</constraints>

<process>

### 1. Parse mode and target

From `$ARGUMENTS`:

1. **Mode** — first token `inversion` / `invert` / `second-order` / `secondorder` / `2nd`. Natural language: "invert…", "failure modes…", "and then what…", "second-order…"
2. **Target** — remainder: goal, action, file path, topic, or conversation decision

If mode is missing or ambiguous, ask once:

> Inversion (what guarantees failure?) or second-order (and then what)?

If target is missing, use the current decision under discussion. If still unclear, ask one sharp question.

### 2. Load just enough context

- File path → read it (and direct links if the decision depends on them)
- Topic → skim project artifacts that define the goal/action
- Conversation-only → state the goal/action in one sentence before analyzing; confirm if unsure

Do not load the whole repo. Do not re-run shoshin or spar unless the user asked.

### 3a. Mode: inversion

Target is a **goal** (desired outcome).

1. State the goal in one sentence
2. List concrete **guaranteed failure modes** (specific, realistic — not "be careless")
3. For each: **avoid by** [actionable constraint or habit]
4. Extract **anti-goals** (never-do behaviors)
5. Note **success by avoidance** — what becomes easier if those are simply not done
6. Name **remaining risk** after the obvious failures are avoided

### 3b. Mode: second-order

Target is an **action or choice**.

1. State the action in one sentence
2. **First-order** — immediate, obvious effects
3. **Second-order** — for each important first-order: "and then what?"
4. **Third-order / delayed** — only where it changes the go/no-go (feedback loops, atrophy, lock-in, trust)
5. **Revised assessment** — still worth it? under what conditions?

### 4. Close

One line next step:

```
next: spar | refine | proceed — [why]
```

- **spar** — a concrete proposal now exists and should be attacked
- **refine** — rails/ripples change the approach; reshape before committing
- **proceed** — lens didn't surface a course change; continue

</process>

<output_format>

### Inversion

```
**Goal:** …

**Failure modes**
1. … — avoid by …
2. …

**Anti-goals**
- …

**Success by avoidance:** …

**Remaining risk:** …

next: spar | refine | proceed — …
```

### Second-order

```
**Action:** …

**First-order**
- …

**Second-order**
- … → …

**Delayed / third-order**
- …

**Revised assessment:** … because …

next: spar | refine | proceed — …
```

</output_format>

<success_criteria>
- Mode matches user intent; target stated in one sentence
- Failure modes / effects are specific to this decision, not generic
- Anti-goals or revised assessment are actionable
- Clear handoff to spar, refine, or proceed
- Does not duplicate spar (no steel-man counterargument list against a thesis)
</success_criteria>

## Failure modes

- **Spar drift:** Listing objections to a written thesis — stop; suggest `/spar`
- **Shoshin drift:** Questioning whether the goal is the right problem — stop; suggest `/shoshin` if the goal itself is suspect
- **Template sludge:** Filling every bullet with vague risks — cut to load-bearing lines
- **Both modes unprompted:** Running inversion and second-order every time — ask or pick one
