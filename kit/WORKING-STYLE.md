# Working Style — Zanshin

> Version: 2026-05-03 (pi-native)
>
> Primary reference for the **pi** extension. For Copilot Chat, Cursor, or other AI tools,
> see `kit/STANDALONE-KIT.md`.

---

## Why these practices exist

Three things break AI-assisted work across sessions: **context resets** (decisions made in conversation don't persist to the next session), **context compaction** (earlier content gets compressed and approximated as the context window fills mid-session), and **fluent-but-wrong output** (confident prose covering unverified claims). These practices defend against those three failure modes specifically — not general productivity habits.

---

## How to load this

**Pi:** Install the extension once — practices are active in every session automatically.

```bash
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git
```

The extension injects a minimal L0 block into every agent turn, registers `/spar`, `/shoshin`, `/checkpoint`, `/push`, `/pop`, and `/stack` as slash commands, and hooks into session lifecycle events for auto-behaviors. Full discipline lives in this file and is read on demand — not loaded into every prompt.

**Other tools (Copilot Chat, Cursor, generic AI):** See `kit/STANDALONE-KIT.md`.

---

## Collaboration style

Prefer shorter over longer. Cut before adding. When context is incomplete, ask a sharp question rather than produce a long draft. Do not echo the user's phrasing back as the output — find language that serves the idea.

---

## Practices

| Practice | How it activates |
|----------|-----------------|
| **Spar** | `/spar [target]` command — or natural language "spar this" |
| **Shoshin** | `/shoshin` command — or auto-notify on session start with existing project |
| **Progressive bookkeeping** | Extension auto-tracks file writes; notifies after 5; `/checkpoint` resets counter |
| **Stack tracking** | `/push <topic>` / `/pop` / `/stack` — state persists across sessions |
| **Verification** | You prompt — "verify that before we proceed" on significant findings |
| **Review discipline** | Always-on — fires when generating new documents or editing approved content |

---

### Spar — adversarial review before committing

Use before committing to an approach, design, plan, or significant decision.

**Trigger:** `/spar [target]` command — or natural language "spar this" / "challenge this approach"

The `/spar` command accepts an optional target argument (`/spar the auth refactor`, `/spar this plan`). Without an argument it targets the current approach or most recent decision.

**How it works:**
1. Generate 3–5 arguments *against* the target — approach, design, or decision
2. **Steel-man each:** present the *strongest* version of the objection. Not a dismissal, not a strawman — the version that would make someone actually change course
3. **For each argument, produce this structure:**

```
**N. [Argument title]**

Type: Structural | Presentation | Scope | Evidence | Consistency
The argument: [Steel-manned critique — the strongest version, not a strawman]
Why it matters: [What breaks or weakens if this criticism is valid — in concrete terms]
Strength: Strong | Moderate | Weak — [one sentence: genuine weakness or contrarian reflex?]
```

4. **Close with a self-audit in this format:**

```
**Self-Audit**
Strongest: [number] — [why this one actually matters]
Weakest: [number] — [why this might be contrarian pattern-matching]
What I might be missing: [blind spots in this review itself]
```

5. **End with:** "Where am I right, and where am I pattern-matching into a devil's advocate role?"

**Argument types:**
- **Structural** — the core logic or mechanism fails
- **Evidence** — confident assertion dressed as a verified finding
- **Scope** — framed too narrowly, too broadly, or solving the wrong problem
- **Presentation** — the claim holds but how it's stated undermines it
- **Consistency** — contradicts something else that's already decided

**Rules:**
- Attack the *strongest* claims, not the weakest. Three strong arguments beat seven weak ones.
- The self-audit is not optional — it catches performed adversarial review.
- No sycophantic softening ("these are minor points" or "overall this is great, but...").
- If fewer than 3 genuine arguments exist, say so rather than padding.

---

### Shoshin — surface assumptions before proceeding

Use when a plan feels settled, when complexity is growing fast, or when you've been on a problem long enough that premises feel obvious.

**Trigger:** `/shoshin` command — or natural language "apply shoshin" / "what are we assuming?"

Also fires automatically at two moments:

- **Session start with an existing project:** The extension detects `.planning/brief.md`, `.planning/whats-next.md`, or `BRIEF.md` and notifies: *"Zanshin: existing project detected — run /shoshin before proceeding."* This is a notify, not an auto-run — invoke `/shoshin` to actually surface assumptions.
- **Scope shift mid-conversation:** When scope language appears ("actually, let's broaden this...", "I've been rethinking..."), name the shift explicitly. Surface which documents carry the old framing. If multiple are affected, flag them together — updating one while leaving others stale creates conflicting signals for the next session. If a changelog exists, log the scope change there.

**How it works:**
Before generating arguments or building anything, pause and name what's being assumed:
- Is the problem stated correctly, or is this solving the wrong thing?
- Are the constraints real, or inherited from habit or prior context?
- Is the scope appropriate, or has it drifted?
- What would a beginner ask that an expert would skip?

Shoshin is not adversarial. It's genuinely curious. The goal is to find the one assumption whose examination dissolves the complexity or reframes the whole problem. State it plainly: "I'm assuming X — is that still true?"

**Apply shoshin before spar** when the problem itself may be mis-stated. Apply spar after shoshin when the problem is clear but the solution needs challenge.

**What this is not:** Not a blocker — for simple tasks without project framing, it's dormant. Not paranoia. Not a replacement for sparring (which challenges a solution) or zero-base evaluation (which challenges priorities) — shoshin challenges the framing that sits underneath both.

---

### Progressive bookkeeping — keep state current

Session-end bookkeeping is not enough. Crashes, context resets, and interruptions happen. The goal: at any point in a session, the current state is recoverable without re-litigating decisions.

**How it works in pi:**
- The extension tracks every successful `write` and `edit` tool call.
- After 5 file changes since the last checkpoint, it notifies: *"Zanshin: N file changes since last checkpoint — run /checkpoint."* The reminder persists until you run `/checkpoint`.
- `/checkpoint` writes the checkpoint and resets the counter.
- Write a checkpoint before any risky operation — deletions over ~50 lines, file moves or renames, refactors touching multiple files, anything that would be hard to reverse.
- If the session ends with uncommitted changes and no `.planning/whats-next.md` exists, the extension warns on shutdown.

---

### Checkpoints and session handoffs

**Checkpoint** (mid-session save, fast): Write to `.planning/whats-next.md` — create the directory if it doesn't exist.

```
# Checkpoint — YYYY-MM-DD

**In progress:** [one sentence — what's mid-flight right now]
**Just completed:** [1-3 bullets]
**Next step:** [one sentence — what would happen next if the session continued]
**Key decision:** [one sentence capturing anything that would be re-litigated without knowing it was settled — or "none"]
**Git state:** [short hash] — [last commit message]
**Open threads:** [see stack tracking below — or "none"]
```

**Example:**

```
# Checkpoint — 2026-04-20

**In progress:** Refactoring the auth middleware to support token refresh
**Just completed:**
- Moved session store to Redis (a3f2c1d)
- Updated login handler to write refresh token (b9e4d2a)
**Next step:** Wire refresh endpoint, then update the client to retry on 401
**Key decision:** Refresh tokens stored in httpOnly cookies, not localStorage — XSS tradeoff settled
**Git state:** b9e4d2a — auth: update login handler for refresh token support
**Open threads:** none
```

**Quick capture** (time-short, no template): When there's no time for the full format, append two or three lines — no structure required:

```
> YYYY-MM-DD HH:MM — [what's happening / what's next]
```

Quick captures append to the file rather than replacing it. A future session can read the trail and reconstruct state well enough. **Quick capture is a fallback, not a default** — if the full format is possible, use it.

**Session handoff** (end-of-session, fuller): Same file, same location, more detail — add remaining gaps, framing decisions made, and context a fresh session would need to pick up without asking questions already answered.

**Recovery:** If a session ends without a checkpoint, the git log is the fallback. It shows what landed, not what was in flight — but clean working tree + recent commits = recoverable state.

---

### Stack tracking — manage conversation depth

Conversations naturally branch. Subtopics get pushed, explored, and should be explicitly popped. Without tracking, parent topics get lost.

**Commands:**
- `/push <topic>` — push a named topic onto the stack; notifies with current depth
- `/pop` — mark the current topic resolved, return to parent; notifies what you're returning to
- `/stack` — display the full current stack

Stack state is persisted via the pi session and restored on session start — it survives context resets.

**Rules:**
- Stack depth ≥ 4 is a signal: park something before going deeper
- `/checkpoint` captures the open stack in the checkpoint file automatically
- When a subtopic resolves, `/pop` immediately — don't leave stale entries

---

### Verification — fluency is not correctness

AI output that sounds confident may still be wrong. Fluent prose covers both assertion and evidence — don't mistake one for the other.

**Before accepting any AI-generated finding:**
- Is this an assertion or evidence? What's the source?
- For technical claims: what's the primary source? Paraphrase chains degrade quickly.
- For code: test it, don't read and assume it works.
- For plans: "If this is wrong, how would I know?" — if there's no answer, it hasn't been verified.

**The practical test:** Can you point to the thing that would prove this wrong? If not, you're trusting fluency.

**Limitation:** The AI can't apply verification discipline to its own output in real time — it can state a finding with the same fluency whether it's verified or not. This practice works best when the human prompts it on significant findings: "verify that before we proceed." Don't assume it fires automatically.

---

### Review discipline — AI-generated content is unreviewed until the author says otherwise

AI output is a draft. These behaviors enforce that contract without requiring the author to remember to enforce it.

**New files and documents:**
- Do not mark new files as reviewed, approved, or finalized — that is the author's decision, not the AI's
- New substantive documentation files (not READMEs, code, or ephemeral outputs) should carry a disclosure note at the bottom:

  > *This document was created with AI assistance and has not been fully reviewed by the author.*

  Adjust wording to fit the project's conventions. If the project has an AI disclosure policy (`AI-DISCLOSURE.md`), follow it. This kit ships a portable template at `kit/AI-DISCLOSURE.md` — copy it to the project root to adopt the convention.

**Biographical and first-person content:**
When generating content that contains first-person biographical claims — professional titles, experience statements, personal opinions, biographical details — flag it explicitly at the point of generation:

> "Lines N–M contain first-person biographical statements that need author review before publishing."

Proceed with generation; flag it, don't block on it.

**Editing approved content:**
When the author has previously marked content as approved or reviewed (via frontmatter, annotation, or explicit statement), and an edit makes that approval stale, surface it before or during the edit:

> "This file was previously reviewed/approved. This edit makes that approval stale — re-read the changes before treating it as reviewed again."

Proceed with the edit. The staleness is the author's problem to resolve, not a reason to skip the edit.

---

## Session state conventions

**Isolation:** All artifacts created during this session stay in this project. This document contains no references to any external workspace — artifacts here don't write back anywhere.

**Where things go:**
- Checkpoints and handoffs → `.planning/whats-next.md` — run `/checkpoint` to trigger the LLM to write one in the correct format
- If no `BACKLOG.md` exists: create one with `## In Progress`, `## Up Next`, `## Ideas` sections
- Commits go to the local repository

**Close-out mode** (window closing, work may or may not be done): Close-out means this context window is ending — not that the work is finished. A fresh session may need to continue from here.

Skip spar — there's no approach to challenge. Run shoshin before writing the handoff:

> "What's in this context window that won't survive the reboot? What have I assumed is captured that isn't? What would a fresh session need to ask for again to pick this up without relitigating?"

Check the stack for open threads — those belong in the handoff. Then write a checkpoint or quick capture oriented toward continuation, not just summary.

Trigger: `/checkpoint` command — or natural language "close-out" / "write a handoff" / "I'm closing this session."

When the session state file already has content from a previous context, append with a datestamp — don't replace. The most recent entry is the active state.

**On drift:** This document is a snapshot of a working style that evolves. If something feels off or outdated, re-copy from the source workspace. The version date above indicates how current this snapshot is.
