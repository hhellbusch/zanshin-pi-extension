---
name: kihon
description: >
  Basics / fixed forms (基本): shell strict mode, structured edit anchors, and
  other drillable conventions. Use when the user says /kihon, "strict mode",
  "shell basics", "anchor rule", or when writing shell/CI scripts and insert edits.
argument-hint: "[shell|edit] [optional path or topic]"
allowed-tools: Read Grep Glob Shell
---

# Kihon — Basics (Invoked)

<objective>
Apply a **fixed form** (kihon), not craft judgment. Load the domain doc and check the target against it — or state the form if no target.

Domains live in `kit/kihon/` (`../../kit/kihon/` relative to this skill).
</objective>

<constraints>
- One domain per invoke unless the user asks for more
- Forms are execute/check — not tradeoff essays (use `/craft` for judgment)
- Prefer citing the kit file over pasting the whole doc
</constraints>

<process>

### 1. Parse domain

From `$ARGUMENTS` first token (or natural language):

| Token / cue | Domain file |
|-------------|-------------|
| `shell`, `bash`, `strict`, `ci`, `makefile` | `../../kit/kihon/shell.md` |
| `edit`, `anchor`, `structured-edit`, `insert` | `../../kit/kihon/structured-edit.md` |

If missing, infer from target path (`*.sh` → shell) or ask once: `shell` or `edit`?

### 2. Load form + target

- Read the domain file from `kit/kihon/`
- If a path or diff is given, read it; else state the form and stop (teaching mode)

### 3. Check or apply

- **Review:** list gaps vs the form (missing `set -euo pipefail`, dropped anchor lines, …)
- **Implement:** only if the user asked to fix/write — apply the form, note exceptions with comments

### 4. Close

One line: compliant | gaps fixed | gaps listed — next: craft if judgment needed.

</process>

<output_format>

```
## Kihon — [domain]

**Form:** kit/kihon/[file].md
**Target:** [path | none]

### Result
- …

next: craft | proceed — …
```

</output_format>

<success_criteria>
- Correct domain selected
- Gaps tied to concrete lines or clear “form only” teaching output
- No craft-style principle essay unless the miss is an exception needing a comment
</success_criteria>
