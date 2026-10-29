---
name: whats-next
description: Analyze the current conversation and create a handoff document for continuing
  this work in a fresh context
allowed-tools: Read Write Shell WebSearch WebFetch
---

# Whats-Next — Session Handoff

Create a **compact** handoff so a fresh session can continue safely. Same file and project rules as `/checkpoint`; close-out may add framing assumptions and open threads. Not a full session transcript.

Canonical fields: `kit/WORKING-STYLE.md` → Progressive bookkeeping → Continuation contract.

## Instructions

**PRIORITY: Continuation over completeness.** Preserve the contract fields. Link durable detail. Expand only when the user asks or when safety / continuation requires it.

### Step 0: Evaluate whether a handoff is needed

Before creating anything, check whether the session's work is already fully persisted:

1. Check `git status` and `git log --oneline -5` — is the working tree clean? Are all changes committed?
2. Is there any in-flight state — a half-finished task, a pending decision, context that only exists in the conversation?

**If all work is committed and there's no in-flight state:** tell the user the session is fully persisted and no handoff is needed. If a stale `whats-next.md (project-scoped)` exists, ask whether to delete it.

**If there is genuine in-flight state:** proceed to Step 1.

---

### Step 1: Capture continuation state

Record only what the next session needs:

1. **Outcome** — what is true now (deliverable status; committed vs draft)
2. **Next action** — the immediate next step, with precise targets (paths, URLs) when known
3. **Decisions that bind** — trade-offs that would be re-litigated without knowing they were settled
4. **Boundaries** — constraints, authorization, safety limits
5. **Evidence pointers** — artifact paths + revisions, commits, dated observations; link rather than paste
6. **Checks and limits** — what was verified and what those checks do *not* prove
7. **Unresolved gate** — pending decision or blocker, if any
8. **Retry-relevant failures** — approaches that failed and would otherwise be retried; omit dead ends that are already obvious from git/docs
9. **Owner** — who holds the thread (default: this session’s human, unless delegated)

Write to `.planning/<project>/whats-next.md` using the same project rule as `/checkpoint` and `/shoshin`: an explicit project name wins; one BRIEF is enough; several briefs and no name means ask and do not write. Do not pick the newest `BRIEF.md`. Append with a datestamp when the file already has content — do not replace.

Before the narrative, record comparison fields a later `/shoshin` can check: current branch (`git branch --show-current`), short hash (`git rev-parse --short HEAD`), and UTC ISO time (`YYYY-MM-DDTHH:MM:SSZ`).

---

### Step 1.3: Spar trigger evaluation

Before writing the handoff, evaluate the session output against these triggers. If **two or more** fire, surface a recommendation before proceeding:

| Trigger | Signal |
|---|---|
| **Argumentative output** | An essay, proposal, brief, or plan was drafted or significantly revised this session |
| **Decision with trade-offs** | A non-trivial technical or design choice was made (architecture, tool, scope, framing) |
| **External-facing output** | Work is being prepared to share, publish, or submit |
| **Unchallenged direction** | The session has produced uniformly agreeable outputs — no pushback, no alternatives considered |
| **Load-bearing claim** | The work rests on a claim that wasn't verified or challenged during the session |
| **Scope expansion** | The task broadened mid-session beyond what was originally requested |
| **Surprising conclusion** | The session arrived at a conclusion that would have been non-obvious at the start |

**If two or more triggers fire:**
> "Spar conditions detected: [list which triggers]. Want to run `/spar` on [specific target] before closing? It would take ~5 minutes and this is the highest-value moment — the output is fresh and a spar here prevents carrying a weak argument into the next session."

Do not run the spar automatically. Always ask first.

If the session was purely mechanical — no arguments, no decisions, no output that could be wrong — skip entirely.

---

### Step 1.5: Shoshin — Assumptions check

Before writing the handoff, identify assumptions this session is carrying that a fresh session should question rather than inherit:

- What framing decisions were made in this session?
- What was taken as given that might not be true?
- Did the project's scope or framing shift during this session?

If any assumptions are worth surfacing, include an `<assumptions_carried>` section in the handoff. If the session was straightforward with no framing decisions, skip it.

---

## Output Format

Write `whats-next.md` using this structure. `<resume_compare>` is required. Keep sections short; omit empty optional blocks.

```xml
<resume_compare>
branch: [git branch --show-current]
commit: [short hash]
recorded: [YYYY-MM-DDTHH:MM:SSZ]
external: [cluster/env/deploy note, or none]
</resume_compare>

<original_task>
[Initial request — precise scope, one short paragraph]
</original_task>

<current_state>
[Outcome now: deliverable status; committed vs draft; owner]
</current_state>

<next_action>
[Immediate next step with precise targets; unresolved gate if any]
</next_action>

<decisions_and_boundaries>
[Binding decisions; authorization/safety constraints; checks run and their limits]
</decisions_and_boundaries>

<evidence>
[Links/paths + revisions or dated observations — not pasted dumps]
</evidence>

<retry_avoid>
[Optional — failed approaches only if they would otherwise be retried]
</retry_avoid>

<assumptions_carried>
[Optional — framing decisions a fresh session should question]
</assumptions_carried>

<open_threads>
[Optional — only if multiple stack threads remain.

Format:
- `[bottom]` Parent topic — status
  - `[open]` Subtopic — what's waiting]
</open_threads>
```
