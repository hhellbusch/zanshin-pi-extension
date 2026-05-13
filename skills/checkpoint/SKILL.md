---
name: checkpoint
description: Save current session state mid-session — faster than /whats-next, designed
  for crash recovery
allowed-tools: Read Write Shell
---

# Checkpoint — Mid-Session State Save

<objective>
Write a minimal but accurate snapshot to `whats-next.md (project-scoped)` that would let a new session recover context within 60 seconds. Faster and lighter than `/whats-next` — no lengthy sections, no full retrospective. The goal is: if the session ended right now, what would the next session need to know?

Run this:
- Before any risky operation (git mv, large multi-file refactor, anything that could fail mid-way)
- After completing a significant unit of work
- When more than 3–5 commits have happened since the last checkpoint
- Anytime you want to save state before a context-heavy task
</objective>

<context>
- Last commits: `git log --oneline -5`
- Git state: `git status --short`
- Last commit hash: `git rev-parse --short HEAD`
- Existing handoff (if any): `whats-next.md (project-scoped)`
</context>

<process>

### Step 1: Assess current state

From the context above, identify:
1. **What is actively in progress** — what task is mid-flight right now?
2. **What was just completed** — last 1-3 units of work (from commits)
3. **What is the next intended step** — what would happen next if the session continued?
4. **Any key decision made since last checkpoint** — anything that would be re-litigated by a new session without knowing

If there is no in-progress work and nothing was just completed, the checkpoint is trivial — note that clearly ("No active work — clean state") and write the file anyway so the timestamp is current.

### Step 2: Write the checkpoint

Overwrite `whats-next.md (project-scoped)` (project root) with the following compact format:

```markdown
# Checkpoint — [YYYY-MM-DD HH:MM]

**In progress:** [One sentence: what we're working on right now — or "Nothing in flight, clean state"]

**Just completed:** [1-3 bullet points: what finished since the last checkpoint]

**Next step:** [One sentence: what would happen next if this session continued]

**Key decision (if any):** [One sentence, or "None" — captures anything that would be re-litigated without knowing it was settled]

**Git state:** `[short hash]` — [last commit message, truncated to ~60 chars]

**Uncommitted work:** [None / Yes — brief description of what's staged or modified]

**Open threads (stack):** *(optional — omit if only one active thread)*
- `[bottom]` Parent topic — status
  - `[open]` Subtopic — what's waiting

---

*Checkpoint — not a full session summary. See git log for full history.*
```

Keep it short. Five minutes to write, thirty seconds to read.

---

### Step 2.5: Spar trigger evaluation

Before logging the checkpoint, ask: **would a spar be beneficial right now?**

Score the current session output against these triggers. If **two or more** fire, surface a recommendation before saving the checkpoint:

| Trigger | Signal |
|---|---|
| **Argumentative output** | An essay, proposal, brief, or plan was drafted or significantly revised |
| **Decision with trade-offs** | A non-trivial technical or design choice was made (architecture, tool, scope) |
| **External-facing output** | Work is being prepared to share, publish, or submit |
| **Unchallenged direction** | The session has produced only agreeable outputs — no pushback, no alternatives explored |
| **Load-bearing claim** | A claim is being made that the rest of the work depends on, but wasn't verified |
| **Scope expansion** | The work broadened mid-session beyond the original request |

**If two or more triggers fire:**
> "Spar conditions detected: [list which triggers fired]. Want me to run `/spar` on [specific target — the document, claim, or decision] before closing?"

Do not run the spar automatically. Always ask first — the user may be in a "getting things done" mode where interruption costs more than the value.

**If zero or one trigger fires:** skip this step entirely.

---

### Step 3: Confirm

After writing, report:
```
Checkpoint saved to whats-next.md (project-scoped)
In progress: [brief]
Next step: [brief]
Git state: [hash]
```

Do NOT commit the checkpoint file automatically. The user can commit it alongside their next commit, or leave it uncommitted so it stays current.

</process>

<success_criteria>
- `whats-next.md (project-scoped)` updated with current timestamp
- In progress, next step, and git state captured accurately
- Written in under 30 seconds of agent time
- New session could read the checkpoint and orient in under 60 seconds
</success_criteria>
