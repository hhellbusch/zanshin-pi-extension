---
name: kaeshi
description: >
  Inversion lens (返し — reversal): what would guarantee failure? Use when the
  user says /kaeshi, "invert this", "failure modes", "anti-goals", or when the
  goal is clear but plan rails are not — before /spar on a written proposal.
argument-hint: "[goal | file path | topic]"
allowed-tools: Read Grep Glob Shell SemanticSearch
---

# Kaeshi — Reversal (Inversion)

<objective>
Shape a **goal** by studying what would flip you. Ask “What would guarantee failure?” then avoid those things. Builds rails and anti-goals — not a steel-man attack on a written thesis (that's `/spar`) and not framing reset (that's `/shoshin`).

**When:** Goal is clear; plan/constraints are not.  
**Siblings:** shoshin (right problem?) → **kaeshi** (rails) / yomi (ripples) → spar (break the proposal).
</objective>

<constraints>
- Target is a goal / desired outcome — if the user has a written proposal to attack, prefer `/spar` unless they explicitly want rails first
- Ground failure modes in this goal and loaded files — no generic risk theater
- Prefer specific, actionable avoid-bys over abstract wisdom
- Keep output short enough to act on
- If the goal itself seems wrong, suggest `/shoshin` rather than inventing failure modes for a bad frame
</constraints>

<process>

### 1. Identify the goal

Parse `$ARGUMENTS`: file path, topic, or goal statement. No args → current goal under discussion. If unclear, ask one sharp question: “What success outcome should I invert?”

### 2. Load just enough context

File → read it (and direct links if needed). Topic → skim artifacts that define the goal. Conversation-only → state the goal in one sentence first.

Do not load the whole repo. Do not run yomi/spar/shoshin unless asked.

### 3. Invert

1. State the goal in one sentence
2. List concrete **guaranteed failure modes** (specific, realistic — not “be careless”)
3. For each: **avoid by** [actionable constraint or habit]
4. Extract **anti-goals** (never-do behaviors)
5. Note **success by avoidance** — what becomes easier if those are simply not done
6. Name **remaining risk** after the obvious failures are avoided

### 4. Close

```
next: spar | yomi | refine | proceed — [why]
```

- **spar** — a concrete proposal now exists and should be attacked
- **yomi** — an action is chosen; trace consequence chains
- **refine** — rails change the approach; reshape before committing
- **proceed** — rails are clear; continue

</process>

<output_format>

```
**Goal:** …

**Failure modes**
1. … — avoid by …
2. …

**Anti-goals**
- …

**Success by avoidance:** …

**Remaining risk:** …

next: spar | yomi | refine | proceed — …
```

</output_format>

<success_criteria>
- Goal stated in one sentence
- Failure modes specific to this decision, not generic
- Anti-goals actionable
- Clear next: spar / yomi / refine / proceed
- Not a spar-style counterargument list against a thesis
</success_criteria>

## Failure modes

- **Spar drift:** Listing objections to a written thesis — stop; suggest `/spar`
- **Shoshin drift:** The goal itself is suspect — suggest `/shoshin`
- **Template sludge:** Vague risks padded to a count — cut to load-bearing lines
- **Yomi confusion:** Tracing “and then what?” chains — that’s `/yomi`, not kaeshi
