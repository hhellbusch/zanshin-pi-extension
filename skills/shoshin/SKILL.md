---
name: shoshin
description: >
  Surfaces load-bearing assumptions against source artifacts before building.
  Use when the user says /shoshin, "apply shoshin", "what are we assuming?",
  "beginner's mind", checks framing or scope drift, resumes from a handoff or
  checkpoint, or before /spar when the problem may be mis-stated.
argument-hint: "[file path | topic | inline content from conversation]"
allowed-tools: Read Grep Glob Shell SemanticSearch
---

# Shoshin — Beginner's Mind (Invoked)

<objective>
Bring beginner's mind to the foreground. Reset framing: surface what is being assumed — grounded in artifacts, not conversation memory — and work *with* the user through sharp questions before building on a frame that may be wrong.

Curious, not adversarial. Prefer dialogue over monologue: ask before inferring when a key assumption would change the approach.

**Ambient vs invoked:** Minimal posture may live in the consumer's always-on context (e.g. `AGENTS.md`, plugin L0). This skill is **invoked depth** only.

**Not this skill:** Artifact economics (TAGRI, JBGE, travel light) live in ambient artifact discipline and `/craft`. Shoshin's job is framing reset, not doc hygiene. `/checkpoint` and `/whats-next` **save** handoffs — they do not revalidate; this skill (and session-start “run /shoshin”) is the resume entry point that does.
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

### 2. Resume revalidation (handoff / checkpoint present)

Run this when a project handoff exists **and** the session may mutate the repo or a live environment — including no-arg `/shoshin` after “existing project detected,” “continue from the handoff,” or similar. Skip for a pure file/plan framing ask with no mutation intent and no handoff.

1. Choose the project the same way `/checkpoint` does. An explicit project (`/shoshin <project>`, or a path under `.planning/<project>/`) wins even when its `BRIEF.md` is older. If exactly one `.planning/*/BRIEF.md` exists, use it. If several exist and none was named, list them and stop — do not treat the newest brief's handoff as current.
2. Read that project's `whats-next.md`. Read recorded **branch**, **commit/hash**, **time**, and any noted external state (cluster, env, deploy).
3. Compare with now: `git branch --show-current`, `git rev-parse --short HEAD`, `git status --short`, and the external facts if noted.
4. **If drift:** say what changed; refresh assumptions that depended on the old state before proceeding to mutate.
5. **If unchecked or the project was ambiguous:** state the uncertainty explicitly — do not treat the handoff as current.

Keep this to a short comparison block (see output format). Full rationale: `kit/WORKING-STYLE.md` → Progressive bookkeeping → On resume.

### 3. Read source artifacts

Load external ground truth — not inherited summaries:

- Documents the target depends on (briefs, specs, requirements, linked docs)
- Recent commits / git log when the target references evolving work
- Prior decisions committed to files, not conversation memory

Missing key artifact that would change framing → ask: "I don't see X — should I read it, or are we working without it?"

### 4. Surface assumptions — collaboratively

Name a few assumptions grounded in artifacts. Each must be testable: *if this is wrong, then Y breaks.*

Lead with questions, not a lecture. Use the output shape in `<output_format>` when helpful; shorten freely for small targets.

Optional probes (use only what illuminates — not a dump):

- Is the problem stated correctly, or are we solving the wrong thing?
- Are the constraints real, or inherited from habit / prior context?
- Has scope drifted from the authoritative source?
- What would a beginner ask that an expert would skip?

### 5. Name the pivotal assumption

Identify the **one** assumption whose examination dissolves complexity or reframes the problem. State it as dialogue:

> I'm assuming **X**. If that's wrong, **[consequence]**. Does that still hold?

**Pause** when load-bearing. Analysis-only requests: deliver the question and stop.

### 6. Frame-check (organizing docs only)

When the target is a plan, epic, brief, or design — and a signal appears — ask:

> *Is this asking the right question — or a well-written answer to the wrong one?*

Signals (don't run routinely):

- External feedback shows fundamental confusion about what the document is trying to do
- A structural choice survives review but still feels off
- Author intent has evolved beyond what the brief can express
- Major transition: first external review, publish, handoff to someone cold

**Ceiling:** Shoshin catches drift between sessions and documents. It cannot catch a wrong frame *embedded in* the documents — that needs user pushback or explicit reframing. Name the ceiling; don't overpromise.

Skip this step for routine decisions.

### 7. Recommend next step

- Handoff stale / unchecked → revalidate or update assumptions before mutating
- Framing may be wrong → reframe or update source documents before continuing
- Framing holds, solution untested → suggest `/spar` on the approach
- Framing and approach clear → proceed with user confirmation

**Ordering:** shoshin before spar when the problem may be mis-stated; spar after shoshin when framing holds but the solution needs challenge.

</process>

<output_format>

```
## Assumptions — [target]

### Resume check *(omit if step 2 skipped)*
Recorded: `[branch @ hash]` · [time] · [external notes or "none"]
Now: `[branch @ hash]` · [status one-liner] · [external or "n/a"]
Verdict: current | drifted — [what changed] | unchecked — [what couldn't be verified]

1. **[Assumption]** — *If wrong:* [what breaks]
   **Question:** [one sharp question]

2. ...

### Pivotal
I'm assuming **X**. If that's wrong, **[consequence]**. Does that still hold?

### Next
revalidate | reframe | spar | proceed — [one line why]
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
- **Stale-handoff trust:** Treating a checkpoint as current without comparing branch/hash/time (or stating unchecked)

</gotchas>

<success_criteria>

- Assumptions grounded in artifacts the user can verify
- When a handoff exists and mutation is likely: resume check completed (or uncertainty stated) before recommending proceed-to-mutate
- At least one sharp question directed at the user (when anything is load-bearing)
- One pivotal assumption stated as dialogue, not assertion
- Load-bearing assumptions get a pause for user response
- Clear recommendation: revalidate, reframe, spar, or proceed
- Depth matched to target size — no ceremony for trivial work

</success_criteria>
