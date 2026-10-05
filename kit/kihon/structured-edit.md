# Kihon — structured edit (footnote)

**Status:** Footnote — real failure mode, narrow to agent edit tools. Not a peer to secrets/shell.

**Pitfall:** Insert via search-and-replace drops “context” lines from `new_str` and silently deletes them.  
**Signal:** Diff review / AST hooks — the edit API itself reports success.

## The anchor rule

When using `old_str` (or any edit anchor) to locate an **insertion**:

- Every line in `old_str` that should survive **must appear verbatim in `new_str`**.
- If a line is in `old_str` but absent from `new_str`, that is a **deletion** — confirm intent.
- “Context lines” that disappear are casualties, not context.

Consumer repos may add safety nets (e.g. post-edit AST checks on Python). Those are local; this rule is the portable explanation.
