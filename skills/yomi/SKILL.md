---
name: yomi
description: >
  Second-order lens (読み — reading ahead): and then what? Use when the user
  says /yomi, "second-order this", "and then what?", "consequence chain", or
  when an action is clear but downstream effects are not — before /spar on a
  written proposal.
argument-hint: "[action | choice | file path | topic]"
allowed-tools: Read Grep Glob Shell SemanticSearch
---

# Yomi — Reading Ahead (Second-Order)

<objective>
Shape an **action or choice** by reading the next exchanges. Ask “And then what?” First-order thinking stops at immediate effects; yomi follows the chain. Not adversarial review (`/spar`) and not failure-mode rails (`/kaeshi`).

**When:** Action/choice is clear; consequences are not.  
**Siblings:** shoshin (right problem?) → kaeshi (rails) / **yomi** (ripples) → spar (break the proposal).
</objective>

<constraints>
- Target is an action or choice — if they only have a goal with no chosen move, prefer `/kaeshi` or ask what action to read
- Ground effects in this action and loaded files — no generic futurism
- Trace only chains that could change go/no-go; don’t pad every branch to third-order
- Keep output short enough to act on
- If the user wants objections to a written thesis, prefer `/spar`
</constraints>

<process>

### 1. Identify the action

Parse `$ARGUMENTS`: file path, topic, or action statement. No args → current choice under discussion. If unclear, ask once: “What action should I read ahead on?”

### 2. Load just enough context

File → read it (and direct links if needed). Topic → skim artifacts that define the choice. Conversation-only → state the action in one sentence first.

Do not load the whole repo. Do not run kaeshi/spar/shoshin unless asked.

### 3. Read the chain

1. State the action in one sentence
2. **First-order** — immediate, obvious effects
3. **Second-order** — for each important first-order: “and then what?”
4. **Third-order / delayed** — only where it changes the go/no-go (feedback loops, atrophy, lock-in, trust)
5. **Revised assessment** — still worth it? under what conditions?

### 4. Close

```
next: spar | kaeshi | refine | proceed — [why]
```

- **spar** — a concrete proposal now exists and should be attacked
- **kaeshi** — need anti-goals/rails for the underlying goal
- **refine** — ripples change the approach; reshape before committing
- **proceed** — chain didn’t surface a course change; continue

</process>

<output_format>

```
**Action:** …

**First-order**
- …

**Second-order**
- … → …

**Delayed / third-order**
- …

**Revised assessment:** … because …

next: spar | kaeshi | refine | proceed — …
```

</output_format>

<success_criteria>
- Action stated in one sentence
- Effects specific to this decision, not generic
- Revised assessment actionable (go / no-go / conditions)
- Clear next: spar / kaeshi / refine / proceed
- Not a spar-style counterargument list against a thesis
</success_criteria>

## Failure modes

- **Spar drift:** Listing objections to a written thesis — stop; suggest `/spar`
- **Kaeshi confusion:** Building anti-goals for a goal with no chosen action — that’s `/kaeshi`
- **Template sludge:** Forcing every branch to third-order — stop where the calculus stops changing
- **Shoshin drift:** The action answers the wrong problem — suggest `/shoshin`
