---
name: shoshin
description: >
  Surfaces load-bearing assumptions against source artifacts before building.
  Use when the user says /shoshin, "apply shoshin", "what are we assuming?",
  "beginner's mind", checks framing or scope drift, or before /spar when the
  problem may be mis-stated.
argument-hint: "[file path | topic | inline content from conversation]"
allowed-tools: Read Grep Glob Shell SemanticSearch
---

# Shoshin — Beginner's Mind (Invoked)

<objective>
Bring beginner's mind to the foreground. Reset framing: surface what is being assumed — grounded in artifacts, not conversation memory — and work *with* the user through sharp questions before building on a frame that may be wrong.

Curious, not adversarial. Prefer dialogue over monologue: ask before inferring when a key assumption would change the approach.

**Ambient vs invoked:** Minimal posture may live in the consumer's always-on context (e.g. `AGENTS.md`, plugin L0). This skill is **invoked depth** only.

**Not this skill:** Artifact economics (TAGRI, JBGE, travel light) live in ambient artifact discipline and `/craft`. Shoshin's job is framing reset, not doc hygiene.
</objective>

<constraints>
- Ground every named assumption in a file or observable artifact the user can check
- Prefer 1–3 sharp questions over long assumption lists
- Pause on load-bearing assumptions — do not proceed to implementation, `/spar`, or large output until the user answers (unless they asked for analysis only)
- Adapt depth to the target: a one-line decision needs less ceremony than a brief or epic
- Do not railroad: steps below are a preferred path, not a script that must be recited
</constraints>

<process>

### 1. Identify the target

Parse `$ARGUMENTS`:

- **File path** → read the file and what it references
- **Topic or inline content** → the plan, epic, design, or decision in conversation
- **No arguments** → current approach, most recent decision, or framing the session inherited

If ambiguous, ask one question: "What should I apply shoshin to — a specific file, this plan, or the framing we've been working in?"

### 2. Read source artifacts

Load external ground truth — not inherited summaries:

- Documents the target depends on (briefs, specs, requirements, linked docs)
- Recent commits / git log when the target references evolving work
- Prior decisions committed to files, not conversation memory

Missing key artifact that would change framing → ask: "I don't see X — should I read it, or are we working without it?"

### 3. Surface assumptions — collaboratively

Name a few assumptions grounded in artifacts. Each must be testable: *if this is wrong, then Y breaks.*

Lead with questions, not a lecture. Use the output shape in `<output_format>` when helpful; shorten freely for small targets.

Optional probes (use only what illuminates — not a dump):

- Is the problem stated correctly, or are we solving the wrong thing?
- Are the constraints real, or inherited from habit / prior context?
- Has scope drifted from the authoritative source?
- What would a beginner ask that an expert would skip?

### 4. Name the pivotal assumption

Identify the **one** assumption whose examination dissolves complexity or reframes the problem. State it as dialogue:

> I'm assuming **X**. If that's wrong, **[consequence]**. Does that still hold?

**Pause** when load-bearing. Analysis-only requests: deliver the question and stop.

### 5. Frame-check (organizing docs only)

When the target is a plan, epic, brief, or design — and a signal appears — ask:

> *Is this asking the right question — or a well-written answer to the wrong one?*

Signals (don't run routinely):

- External feedback shows fundamental confusion about what the document is trying to do
- A structural choice survives review but still feels off
- Author intent has evolved beyond what the brief can express
- Major transition: first external review, publish, handoff to someone cold

**Ceiling:** Shoshin catches drift between sessions and documents. It cannot catch a wrong frame *embedded in* the documents — that needs user pushback or explicit reframing. Name the ceiling; don't overpromise.

Skip this step for routine decisions.

### 6. Recommend next step

- Framing may be wrong → reframe or update source documents before continuing
- Framing holds, solution untested → suggest `/spar` on the approach
- Framing and approach clear → proceed with user confirmation

**Ordering:** shoshin before spar when the problem may be mis-stated; spar after shoshin when framing holds but the solution needs challenge.

</process>

<output_format>

```
## Assumptions — [target]

1. **[Assumption]** — *If wrong:* [what breaks]
   **Question:** [one sharp question]

2. ...

### Pivotal
I'm assuming **X**. If that's wrong, **[consequence]**. Does that still hold?

### Next
reframe | spar | proceed — [one line why]
```

Omit sections that don't apply. Never pad to fill the template.

</output_format>

<gotchas>

Highest-signal failure modes — update this list when new ones show up in real use:

- **Self-referential circling:** Assumptions invented this turn, not grounded in artifacts
- **False clarity:** Insightful-sounding but untestable ("if wrong, then Y" missing)
- **Monologue mode:** Long lists, no questions to the user
- **Silent inference:** Proceeding on a load-bearing guess
- **Confirming the wrong frame:** Trusting documents that *are* the problem — see frame-check
- **Checklist theater:** Running every step and probe on a trivial ask
- **Doc-hygiene drift:** Turning shoshin into TAGRI/JBGE review — wrong skill; use `/craft` or ambient artifact discipline

</gotchas>

<success_criteria>

- Assumptions grounded in artifacts the user can verify
- At least one sharp question directed at the user (when anything is load-bearing)
- One pivotal assumption stated as dialogue, not assertion
- Load-bearing assumptions get a pause for user response
- Clear recommendation: reframe, spar, or proceed
- Depth matched to target size — no ceremony for trivial work

</success_criteria>
