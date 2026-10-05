# Kihon — structured edit (anchor rule)

Applies when the goal is **inserting** code before or after an existing block — not replacing the whole file.

## The anchor rule

When using `old_str` (or any edit anchor) to locate an insertion point:

- Every line in `old_str` that should survive the edit **must appear verbatim in `new_str`**.
- If a line is in `old_str` but absent from `new_str`, that is a **deletion** — verify it is intentional before proceeding.
- "Context lines" used only to locate the anchor are not context if they disappear. They are casualties.

## Why this is kihon

Agent edit tools match bytes exactly. Dropping an anchor line looks like a successful insert and silently deletes code. Drill the form: surviving lines must appear on both sides of the edit.

Consumer repos may add language-specific safety nets (e.g. post-edit AST checks). Those are local; this rule is portable.
