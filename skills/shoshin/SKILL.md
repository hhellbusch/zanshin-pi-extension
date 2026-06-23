---
name: shoshin
description: Surface assumptions collaboratively before proceeding — beginner's mind, invoked depth
argument-hint: "[file path | topic | inline content from conversation]"
allowed-tools: Read Grep Glob Shell SemanticSearch
---

# Shoshin — Beginner's Mind (Invoked)

<objective>
Deliberately bring beginner's mind to the foreground. Surface what is being assumed — grounded in artifacts, not conversation memory — and work *with* the user through sharp questions before building on a frame that may be wrong.

Shoshin is genuinely curious, not adversarial. Prefer dialogue over monologue: ask before inferring when a key assumption would change the approach.

**Ambient vs invoked:** A minimal shoshin posture may live in the consumer's always-on context (e.g. `AGENTS.md`). This skill is **invoked depth** — run when the user says `/shoshin`, "apply shoshin", "what are we assuming?", or before `/spar` when the problem may be mis-stated.
</objective>

<process>

### Step 1: Identify the target

Parse `$ARGUMENTS`:

- **File path** → read the file and what it references
- **Topic or inline content** → the plan, epic, design, or decision in conversation
- **No arguments** → the current approach, most recent decision, or framing the session inherited

If ambiguous, ask one sharp question: "What should I apply shoshin to — a specific file, this plan, or the framing we've been working in?"

### Step 2: Audience and purpose (model with a purpose)

Before assumptions, for any plan, epic, doc, or design target:

- **Who is the reader?** (Specific role — not "the team.")
- **What decision or action does this enable?** If none, say so and ask whether to proceed.

If either is unclear, ask one sharp question instead of expanding the artifact. See `kit/AGILE-ARTIFACT-DISCIPLINE.md` (TAGRI, JBGE).

### Step 3: Read source artifacts

Before naming assumptions, load external ground truth — not inherited summaries:

- Source documents the target depends on (briefs, specs, requirements, linked docs)
- Recent commits or git log when the target references evolving work
- Prior decisions committed to files, not conversation memory

If a key artifact is missing and would change framing, **ask** rather than infer: "I don't see X — should I read it, or are we working without it?"

### Step 4: Surface assumptions — collaboratively

Name 3–5 assumptions grounded in artifacts. For each, make it testable: *if this is wrong, then Y breaks*.

**Collaborative default:** lead with questions, not a lecture.

```
## Assumptions

1. **[Assumption]** — *If wrong:* [what breaks]
   **Question:** [one sharp question to the user]

2. ...
```

Guiding probes (use as needed, not as a checklist to dump):

- Is the problem stated correctly, or are we solving the wrong thing?
- Are the constraints real, or inherited from habit or prior context?
- Is the scope appropriate, or has it drifted?
- What would a beginner ask that an expert would skip?

**Do not** produce a long internal reasoning essay. **Do** ask when context is incomplete.

### Step 5: Find the pivotal assumption

Identify the **one assumption** whose examination dissolves complexity or reframes the problem.

State it plainly as dialogue:

> I'm assuming **X**. If that's wrong, **[consequence]**. Does that still hold?

**Pause here** when the assumption is load-bearing — wait for the user's answer before proceeding to implementation, spar, or large output. If the user asked for analysis only, deliver the question and stop.

### Step 6: Recommend next step

- Framing may be wrong → suggest reframing or updating source documents before continuing
- Framing holds, solution untested → suggest `/spar` on the approach
- Framing and approach clear → proceed with user confirmation

</process>

<failure_modes>

- **Self-referential circling:** Naming assumptions invented in this turn. Ground in artifacts.
- **False clarity:** Insightful-sounding but untestable assumptions. Require "if wrong, then Y."
- **Monologue mode:** Long assumption lists without questions. Default to 1–3 sharp questions.
- **Silent inference:** Proceeding on a load-bearing guess. Ask first.

</failure_modes>

<success_criteria>

- Assumptions grounded in artifacts the user can verify
- At least one sharp question directed at the user
- One pivotal assumption stated as dialogue, not assertion
- Load-bearing assumptions get a pause for user response
- Clear recommendation: reframe, spar, or proceed

</success_criteria>
