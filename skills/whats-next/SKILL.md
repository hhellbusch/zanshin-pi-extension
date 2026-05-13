---
name: whats-next
description: Analyze the current conversation and create a handoff document for continuing
  this work in a fresh context
allowed-tools: Read Write Shell WebSearch WebFetch
---

# Whats-Next — Session Handoff

Create a comprehensive, detailed handoff document that captures all context from the current conversation. This allows continuing the work in a fresh context with complete precision.

## Instructions

**PRIORITY: Comprehensive detail and precision over brevity.** The goal is to enable someone (or a fresh AI session) to pick up exactly where you left off with zero information loss.

### Step 0: Evaluate whether a handoff is needed

Before creating anything, check whether the session's work is already fully persisted:

1. Check `git status` and `git log --oneline -5` — is the working tree clean? Are all changes committed?
2. Is there any in-flight state — a half-finished task, a pending decision, context that only exists in the conversation?

**If all work is committed and there's no in-flight state:** tell the user the session is fully persisted and no handoff is needed. If a stale `whats-next.md (project-scoped)` exists, ask whether to delete it.

**If there is genuine in-flight state:** proceed to Step 1.

---

### Step 1: Capture session context

Adapt the level of detail to the task type (coding, research, analysis, writing, configuration, etc.) but maintain comprehensive coverage:

1. **Original Task**: Identify what was initially requested (not new scope or side tasks)

2. **Work Completed**: Document everything accomplished in detail
   - All artifacts created, modified, or analyzed (files, documents, research findings, etc.)
   - Specific changes made (code with line numbers, content written, data analyzed, etc.)
   - Actions taken (commands run, APIs called, searches performed, tools used, etc.)
   - Findings discovered (insights, patterns, answers, data points, etc.)
   - Decisions made and the reasoning behind them

3. **Work Remaining**: Specify exactly what still needs to be done
   - Break down remaining work into specific, actionable steps
   - Include precise locations, references, or targets (file paths, URLs, data sources, etc.)
   - Note dependencies, prerequisites, or ordering requirements
   - Specify validation or verification steps needed

4. **Attempted Approaches**: Capture everything tried, including failures
   - Approaches that didn't work and why they failed
   - Errors encountered, blockers hit, or limitations discovered
   - Dead ends to avoid repeating
   - Alternative approaches considered but not pursued

5. **Critical Context**: Preserve all essential knowledge
   - Key decisions and trade-offs considered
   - Constraints, requirements, or boundaries
   - Important discoveries, gotchas, edge cases, or non-obvious behaviors
   - Relevant environment, configuration, or setup details
   - Assumptions made that need validation
   - References to documentation, sources, or resources consulted

6. **Current State**: Document the exact current state
   - Status of deliverables (complete, in-progress, not started)
   - What's committed, saved, or finalized vs. what's temporary or draft
   - Any temporary changes, workarounds, or open questions
   - Current position in the workflow or process

Write to `whats-next.md (project-scoped)` at the project root.

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

Write `whats-next.md (project-scoped)` using this structure:

```xml
<original_task>
[The specific task that was initially requested — be precise about scope]
</original_task>

<work_completed>
[Comprehensive detail of everything accomplished:
- Artifacts created/modified/analyzed (with specific references)
- Specific changes, additions, or findings (with details and locations)
- Actions taken (commands, searches, API calls, tool usage, etc.)
- Key discoveries or insights
- Decisions made and reasoning
- Side tasks completed]
</work_completed>

<work_remaining>
[Detailed breakdown of what needs to be done:
- Specific tasks with precise locations or references
- Exact targets to create, modify, or analyze
- Dependencies and ordering
- Validation or verification steps needed]
</work_remaining>

<attempted_approaches>
[Everything tried, including failures:
- Approaches that didn't work and why
- Errors, blockers, or limitations encountered
- Dead ends to avoid
- Alternative approaches considered but not pursued]
</attempted_approaches>

<critical_context>
[All essential knowledge for continuing:
- Key decisions and trade-offs
- Constraints, requirements, or boundaries
- Important discoveries, gotchas, or edge cases
- Environment, configuration, or setup details
- Assumptions requiring validation
- References to documentation, sources, or resources]
</critical_context>

<current_state>
[Exact state of the work:
- Status of deliverables (complete/in-progress/not started)
- What's finalized vs. what's temporary or draft
- Temporary changes or workarounds in place
- Current position in workflow or process
- Any open questions or pending decisions]
</current_state>

<assumptions_carried>
[Optional — only include if this session made framing decisions or carried assumptions
that the next session should question rather than inherit.]
</assumptions_carried>

<open_threads>
[Optional — only include if the session left multiple threads open in a depth-first stack.

Format:
- `[bottom]` Parent topic — status
  - `[open]` Subtopic — what's waiting

The next session should return to each thread in reverse order (innermost first).]
</open_threads>
```
