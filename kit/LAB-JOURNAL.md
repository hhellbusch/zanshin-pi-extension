# Lab journal

> Reader: whoever just had a procedure surprise them.  
> Decision: append one short entry, or skip. Not a session handoff.

A lab journal records an **attempt that taught something**: what you tried, what you saw, what surprised you, and which hypothesis the evidence knocked down.

Routine sessions do not get an entry. Write one after a meaningful surprise — a procedure that behaved unlike the model you brought in.

## Entry (append)

New correction = **new entry**. Do not edit the old one into correctness.

```markdown
## YYYY-MM-DD — [one line]

- **Attempted:** …
- **Observed:** … — link the log, commit, diff, or command output; do not paste the dump
- **Surprise:** …
- **Disproved:** [hypothesis]. Evidence: [link]
- **Undo:** only if the attempt was risky — the rollback. Omit otherwise
- **Next:** one line, or "none". Session continuation belongs in a checkpoint, not here
```

**Where:** the repository’s existing journal (lab notes, research journal, incident scratch). If the repo already has one, use it. If it has none, ask once for a path — do not create a second notes tree next to an existing one, and do not write the entry into `whats-next.md`.

**Secrets:** no live credentials (see [`kihon/secrets.md`](kihon/secrets.md)).

## Not these

| Artifact | Job | Lab journal is not |
|----------|-----|--------------------|
| `/checkpoint`, `/whats-next` | Resume or hand the session to someone else | A status report or task list |
| ADR ([`STYLE.md`](STYLE.md)) | Record a decision and consequences | A decision record |
| Troubleshooting guide | Reusable symptom → cause → fix | A product doc |

## Use test

**Write an entry:** You assumed a health check fails because the process is down. The process was up; the check used the wrong port. Surprise + disproved hypothesis. Link the command output. That is a journal entry.

**Do not write an entry:** You finished a refactor and need the next session to continue. That is a checkpoint. You chose blue/green over recreate and want it binding. That is an ADR. You documented the port fix for the next on-call. That is a troubleshooting note — it may *link* the journal entry; it does not replace it.

## Placement

Kit rule only. No `/journal` skill until a second consumer shows this file is skipped in real surprises. Not an extension of `/checkpoint` — mixing them makes every session look like a lab and every lab look like a resume file.
