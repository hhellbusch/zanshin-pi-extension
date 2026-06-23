# Working Style — Zanshin (Reference)

> Version: 2026-05-13
>
> Full reference for the **pi** extension. Rationale, examples, edge cases, and
> extension behavior. For a self-contained prompt version, see `kit/STANDALONE.md`.
>
> The separation: docs explain, prompts drive. This file is reference. `STANDALONE.md`
> is what you paste or load into a session to get behavior.

---

## Why these practices exist

Three things break AI-assisted work across sessions:

1. **Context resets** — decisions made in conversation don't persist to the next session
2. **Context compaction** — earlier content compresses and gets approximated as the window fills
3. **Fluent-but-wrong output** — confident prose covering unverified claims

These practices defend against those three failure modes specifically — not general productivity habits.

---

## Extension behavior

The zanshin-pi-extension provides the following auto-behaviors:

| Behavior | Mechanism |
|----------|-----------|
| L0 injection | Injects a minimal practice block into every agent turn |
| Slash commands | `/spar`, `/shoshin`, `/craft`, `/checkpoint`, `/push`, `/pop`, `/stack` |
| Session notify | Detects existing project files (`BRIEF.md`, `whats-next.md`) at session start |
| Bookkeeping counter | Auto-tracks `write`/`edit` calls; notifies after 5 changes |
| Stack persistence | Survives context resets via pi session state |
| Close-out warning | Warns on shutdown if uncommitted changes exist without a handoff |

**Loading the full discipline:** The extension reads on demand — this file is loaded when a practice is invoked, not at session start. This keeps prompt overhead minimal.

---

## Practices overview

| Practice | How it activates |
|----------|-----------------|
| **Spar** | `/spar [target]` — or "spar this" / "challenge this approach" |
| **Shoshin** | `/shoshin` — or auto-notify on session start with existing project |
| **Craft** | `/craft [target]` — or "apply craft principles" on code or design |
| **Progressive bookkeeping** | Extension auto-tracks writes; notifies after 5; `/checkpoint` resets |
| **Stack tracking** | `/push` / `/pop` / `/stack` — state persists across sessions |
| **Verification** | You prompt — "verify that before we proceed" on significant findings |
| **Review discipline** | Always-on — fires on new docs or edits to approved content |
| **Branching discipline** | Default: main + feature. Escalate to develop when testing demands it |

---

### Spar — adversarial review before committing

Use before committing to an approach, design, plan, or significant decision.

#### Trigger

`/spar [target]` or natural language "spar this" / "challenge this approach".

The command accepts an optional target (`/spar the auth refactor`, `/spar this plan`).
Without an argument it targets the current approach or most recent decision.

#### How it works

1. Generate 3–5 arguments *against* the target
2. **Steel-man each:** present the strongest version of the objection — the version that would actually change course
3. **Structure each:**

```
**N. [Argument title]**

Type: Structural | Presentation | Scope | Evidence | Consistency
The argument: [Steel-manned critique]
Why it matters: [What breaks if valid]
Strength: Strong | Moderate | Weak
```

4. **Close with a self-audit:**

```
**Self-Audit**
Strongest: [number] — [why it matters]
Weakest: [number] — [why it might be pattern-matching]
What I might be missing: [blind spots]
```

5. **End with:** "Where am I right, and where am I pattern-matching into a devil's advocate role?"

#### Argument types

- **Structural** — the core logic or mechanism fails
- **Evidence** — confident assertion dressed as a verified finding
- **Scope** — framed too narrowly, too broadly, or solving the wrong problem
- **Presentation** — the claim holds but how it's stated undermines it
- **Consistency** — contradicts something else already decided

#### Rules

- Attack the strongest claims. Three strong arguments beat seven weak ones.
- The self-audit is not optional — it catches performed adversarial review.
- No sycophantic softening.
- If fewer than 3 genuine arguments exist, say so.

#### Failure modes

- **Padding:** Generating weak arguments just to hit the count. The "say so if fewer than 3" rule handles this.
- **Pattern-matching:** Inventing opposition where none exists. The self-audit addresses this.
- **Over-sparring:** Using spar on decisions that don't warrant it. Spar is for significant commitments — approaches, designs, plans, trade-offs. Not for "which color should the logo be?"

---

### Shoshin — beginner's mind

Two layers — don't merge them:

| Layer | Where | Job |
|---|---|---|
| **Ambient posture** | Consumer's always-on context (`AGENTS.md`, `STANDALONE.md`) | Verify framing against sources; ask when context is incomplete; flag scope shifts |
| **Invoked depth** | `skills/shoshin/SKILL.md` | Deliberate assumption-surfacing through collaborative questions |

#### Ambient (L0)

Verify framing against source documents before inheriting prior context. Ask a sharp question when context is incomplete — don't infer silently. Dormant on simple tasks.

#### Invoked

`/shoshin [target]` or "apply shoshin" / "what are we assuming?" → read and follow `skills/shoshin/SKILL.md`.

**Auto-notify (Pi):** Session start with existing project → notify to run `/shoshin` (notify only, not auto-run).

**Ordering:** Apply shoshin before spar when the problem may be mis-stated. Apply spar after shoshin when framing holds but the solution needs challenge.

Full process, output structure, and failure modes: **`skills/shoshin/SKILL.md`**.

---

### Craft — engineering principles on code and design

Two layers — same pattern as shoshin:

| Layer | Where | Job |
|---|---|---|
| **Ambient posture** | Consumer's always-on context | KISS, SRP, DRY-on-divergence, YAGNI, phased delivery — lenses not checklist |
| **Invoked depth** | `skills/craft/SKILL.md` | Deliberate review of a file, diff, or design |

#### Ambient (L0)

Prefer simple over clever. One reason to change per unit. Extract duplication when parts will diverge — not on first coincidence. Don't build for imagined requirements. Respect work → right → fast phases.

#### Invoked

`/craft [target]` or "apply craft principles" → read and follow `skills/craft/SKILL.md`. Full rationale: **`kit/ENGINEERING-PRINCIPLES.md`**.

**Ordering:** Shoshin when scope may be wrong. Craft when implementation quality matters. Spar when the design direction needs challenge.

---

### Artifact discipline — JBGE, TAGRI, document late

Derived from Scott Ambler's Agile Modeling / Agile Data. AI makes artifact production cheap — counterweight required.

| Layer | Where | Job |
|---|---|---|
| **Ambient posture** | Consumer's always-on context | JBGE default; TAGRI before expanding docs; travel light; document late |
| **Invoked depth** | JBGE lens in `skills/craft/SKILL.md`; audience/purpose in `skills/shoshin/SKILL.md` | Deliberate review of drafts and plans |

Full reference: **`kit/AGILE-ARTIFACT-DISCIPLINE.md`**.

**AMDD bracket (sketch):** Envision (minutes) → explore JIT → implement → stabilize (JBGE docs) → release. See kit doc for anti-patterns.

---

### Progressive bookkeeping — keep state current

Session-end bookkeeping is not enough. Crashes, resets, and interruptions happen. The goal: at any point in a session, the current state is recoverable.

#### How it works in pi

- The extension tracks every successful `write` and `edit` tool call.
- After 5 file changes since the last checkpoint, it notifies. The reminder persists until you run `/checkpoint`.
- `/checkpoint` writes the checkpoint and resets the counter.
- Run a checkpoint before risky operations — deletions over ~50 lines, file moves/renames, multi-file refactors.
- On shutdown with uncommitted changes and no handoff, the extension warns.

#### The limitation of "5"

Five is a flat counter. Some file changes are heavy (one big refactor) and some trivial (one config tweak). The counter doesn't distinguish. This is the simplest implementation of a hard problem — adaptive weighting (state-bearing files vs. trivial files, lines changed, etc.) would be better, but adds complexity to the extension. **Workaround:** run `/checkpoint` proactively after heavy edits, even if the counter hasn't hit 5.

#### Checkpoint format

Write to `.planning/<project>/whats-next.md (project-scoped; resolved via BRIEF.md mtime)` — create the directory if it doesn't exist.

```
# Checkpoint — YYYY-MM-DD

**In progress:** [one sentence — what's mid-flight right now]
**Just completed:** [1-3 bullets]
**Next step:** [one sentence — what would happen next if the session continued]
**Key decision:** [one sentence — what would be re-litigated without knowing it was settled]
**Git state:** [hash] — [last commit]
**Open threads:** [stack items or "none"]
```

#### Example

```
# Checkpoint — 2026-04-20

**In progress:** Refactoring the auth middleware to support token refresh
**Just completed:**
- Moved session store to Redis (a3f2c1d)
- Updated login handler to write refresh token (b9e4d2a)
**Next step:** Wire refresh endpoint, then update the client to retry on 401
**Key decision:** Refresh tokens in httpOnly cookies, not localStorage — XSS tradeoff settled
**Git state:** b9e4d2a — auth: update login handler for refresh token support
**Open threads:** none
```

#### Quick capture (fallback)

When there's no time for the full format, append two or three lines, no structure:

```
> YYYY-MM-DD HH:MM — [what's happening / what's next]
```

Quick captures append rather than replace. A future session reads the trail. **Fallback, not default** — if the full format is possible, use it.

#### Session handoff

Same file, same location, more detail — add remaining gaps, framing decisions made, context a fresh session needs. Close-out means the context window is ending, not that the work is finished.

Before writing a handoff, run shoshin:

> "What's in this context window that won't survive the reboot? What have I assumed is captured that isn't? What would a fresh session need to ask for again?"

Check the stack for open threads — those belong in the handoff. Write a checkpoint oriented toward continuation, not just summary.

Trigger: `/checkpoint` — or "close-out" / "write a handoff" / "I'm closing this session."

When the file already has content, append with a datestamp — don't replace.

#### Recovery

If a session ends without a checkpoint, the git log is the fallback. Clean working tree + recent commits = recoverable state.

---

### Stack tracking — manage conversation depth

Conversations naturally branch. Subtopics get pushed, explored, and should be explicitly popped. Without tracking, parent topics get lost.

#### Commands

- `/push <topic>` — push a named topic; notifies with current depth
- `/pop` — mark resolved, return to parent; notifies what you're returning to
- `/stack` — display the full current stack

Stack state persists via pi session and is restored on session start — survives context resets.

#### Rules

- Stack depth ≥ 4 is a signal: park something before going deeper
- `/checkpoint` captures the open stack automatically
- `/pop` immediately when a subtopic resolves

---

### Verification — fluency is not correctness

AI output that sounds confident may still be wrong. Fluent prose covers both assertion and evidence — don't mistake one for the other.

#### Before accepting any AI-generated finding

- Is this an assertion or evidence? What's the source?
- For technical claims: what's the primary source? Paraphrase chains degrade quickly.
- For code: test it, don't read and assume.
- For plans: "If this is wrong, how would I know?" — if there's no answer, it hasn't been verified.

#### The practical test

Can you point to the thing that would prove this wrong? If not, you're trusting fluency.

#### Limitation

The AI can't apply verification discipline to its own output in real time — it can state a finding with the same fluency whether it's verified or not. This works best when the human prompts it: "verify that before we proceed." Don't assume it fires automatically.

---

### Review discipline — AI content is unreviewed until the author says otherwise

AI output is a draft. These behaviors enforce that contract.

#### New files and documents

- Do not mark new files as reviewed, approved, or finalized — that is the author's decision.
- New substantive documentation (not READMEs, code, or ephemeral outputs) should carry a disclosure note:

  > *This document was created with AI assistance and has not been fully reviewed by the author.*

- Include harness and model identifiers when identifiable from session context (system prompt, environment). If the model isn't determinable from the session, ask the user what's currently selected.
  Format: `AI assistance (harness / model)` — e.g., `(pi / claude-sonnet-4-6)`.
- **Never hardcode a harness name** in the footer. If the session context doesn't identify a harness, omit the identifier and use the base form.
- If the project has an AI disclosure policy (`AI-DISCLOSURE.md`), follow it instead.

#### Biographical and first-person content

When generating first-person biographical claims — professional titles, experience statements, personal opinions — flag them:

> "Lines N–M contain first-person biographical statements that need author review."

Flag it, don't block on it.

#### Editing approved content

When an edit makes previously approved content stale, surface it:

> "This file was previously reviewed. This edit makes that approval stale — re-read the changes."

Proceed with the edit. The staleness is the author's problem, not a reason to skip.

---

### Branching discipline

Branching strategy scales with testing complexity. Start simple. Escalate only when testing demands it.

#### Default — main + feature

```
main ──── main ──── main ──── main
        /          \
    feat-a        feat-b
```

Create `feature/<name>` off `main`. Work, commit, push. Merge back via PR or squash when done. Delete the branch. Use this for everything — the default, the common case, the rule.

#### Escalated — main + develop + feature

```
main ──── main ──── main
         /          \
    develop ─── develop ─── develop
       /   \       /
   feat-a feat-b feat-c
```

Escalate when: multiple features need integration testing together, testing on main is too expensive/risky, or you need a stable integration point while features are in flight.

How it works:
1. Create `develop` off main (once per integration cycle, not permanently)
2. Feature branches from `develop`
3. Merge features to `develop` as they complete
4. When all features pass integration testing, merge `develop` to `main`
5. Delete `develop` — ephemeral, not permanent

Git-flow without ceremony. No release branches. No hotfix branches.

#### Hotfixes (always off main)

```
main ──── main ──── main ──── main
              \
          hotfix-x
```

Branch off main, fix, test on main, merge back immediately. Name: `hotfix/<name>`. Delete after merge.

#### Commit discipline

- Commit on logical boundaries. One idea per commit, but a commit can contain multiple file changes if they belong to the same idea.
- Write messages that describe *why*, not just *what*. The commit log is the primary audit trail.
- Format: `type(scope): description` — e.g., `feat(auth): add token refresh handler`, `fix(api): handle missing x-header`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `backlog`
- Squash merge feature branches when the branch has multiple small commits telling a single story. Keep `main` clean.
- Never rebase `main`. Rebasing feature branches is fine when small and not shared.

#### Fork workflow

Keep `main` clean as an upstream mirror. Work lives on feature branches.

```
upstream/main ──── upstream/main
         \
my/main   ──────── my/main         ← tracks upstream, never commits locally
         \
    develop ──── develop           ← your integration branch
       /   \
   feat-a  feat-b
```

1. Set up remotes: `git remote add upstream <url>`
2. `main` is passthrough-only: `git checkout main && git pull upstream main`
3. Feature branches off `main`. Push to fork (`origin`).
4. Integration via `develop`. Merge features to `develop`.
5. PR upstream from feature or develop — not from main.
6. After upstream merge: delete feature branch, update main from upstream.

#### Integration discipline

Before every push (non-negotiable), at the start of a new session (active feature branch), and before creating a PR:

```bash
git pull --rebase origin main    # Replay your commits on top
# Resolve conflicts
# git add && git rebase --continue
git push origin feature/my-feature
```

`--rebase` (not `--merge`) keeps history linear. Cost of pulling is seconds; cost of conflict after pushing is minutes.

---

## Extension source conventions

Applies when authoring or editing `.ts` files in `extensions/` or `lib/`.

### ASCII-safe source files

The Pi agent's built-in edit tool uses exact byte-string matching. Multi-byte UTF-8 in comments causes match failures -- every edit becomes a whole-file rewrite. Keep source structure ASCII-only.

| Avoid | Use instead |
|-------|-------------|
| Box-drawing `--` (`\u2500`) in comments | `--` repeated |
| Raw em dash `--` (`\u2014`) | ` -- ` in comments; `\u2014` in UI strings |
| Raw arrow `->` (`\u2192`) | `->` in comments; `\u2192` in UI strings |
| Raw ellipsis `...` (`\u2026`) | `...` in logic; `\u2026` in UI strings |
| Raw emoji (`\u274c`, `\u2705`) | `\u274c`, `\u2705` escape sequences |

Pre-commit check: run `python3 -c "open('file.ts').read().encode('ascii')"` -- any non-ASCII raises immediately.

### Other conventions

- Strict TypeScript (`tsconfig.json`). No `any` without a comment.
- Guard extensions return `{ block: true, reason: string }` to cancel, nothing to allow. Never throw.
- Use `pi.exec()` for shell commands inside guards -- not `child_process` directly.
- No top-level `await` -- the jiti loader is synchronous.
- File naming: `extensions/<name>-guard.ts` for intercepting guards, `extensions/<name>.ts` for passive extensions, `lib/<name>.ts` for shared utilities.

Full rules and checklist: `docs/CODING-CONVENTIONS.md`.

---

## Session state conventions

### Where things go

- Checkpoints and handoffs → `.planning/<project>/whats-next.md (project-scoped; resolved via BRIEF.md mtime)`
- If no `BACKLOG.md` exists: create one with `## In Progress`, `## Up Next`, `## Ideas`
- Commits → local repository

### Isolation

All artifacts created during this session stay in the project. Nothing writes back to the source workspace.

### On drift

This document is a snapshot of a working style that evolves. If something feels off or outdated, re-copy from the source workspace. The version date indicates how current this snapshot is.
