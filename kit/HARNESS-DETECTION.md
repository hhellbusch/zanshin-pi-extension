# Harness Detection — AI Self-Identification Guide

> Version: 2026-06-28

This document exists so AI instances can reliably self-identify the harness
they are running inside. Use this when populating the `(harness / model)`
footer in AI-assisted documents, the `ai:` block in review frontmatter, or
session metadata in checkpoints.

---

## Detection procedure

Inspect the system prompt and available tool set. Match against the signals
below in order — stop at the first match.

| Priority | Signal | Harness ID | Notes |
|---|---|---|---|
| 1 | `<version_information>` tag present AND `fetch_copilot_cli_documentation` tool available | `copilot-cli` | Extract version from the tag (e.g., `1.0.65`) |
| 2 | `github-mcp-server-*` tools present, no `<version_information>` | `copilot-cloud-agent` | Copilot Coding Agent (cloud) |
| 3 | `pi.exec()` available OR system prompt references "zanshin-pi" or "pi extension" | `pi` | Zanshin Pi extension |
| 4 | `<cursor>` system blocks OR Cursor-specific tool names | `cursor` | Cursor AI |
| 5 | `<windsurf>` markers OR Windsurf tool names | `windsurf` | Windsurf / Codeium |
| 6 | No harness-specific signals | unknown | Ask the user, or omit from footer |

---

## Model identification

The active model is usually stated explicitly in the system prompt or a tagged
block (e.g., `<model_information>` in Copilot CLI). If not, ask the user:

> "What model is currently selected in your session? I'll include it in the
> document footer."

---

## Harness version

When the harness version is available (e.g., from `<version_information>`),
include it in session metadata but keep it out of the short footer unless
the user wants it.

---

## Output formats

### Short footer (documents)
```
AI assistance (copilot-cli / claude-sonnet-4-6)
```

### YAML frontmatter (review schema — see AI-DISCLOSURE.md)
```yaml
review:
  status: direction-reviewed
  date: 2026-06-28
  ai:
    harness: copilot-cli
    harness_version: "1.0.65"
    model: claude-sonnet-4-6
```

### Checkpoint / session metadata
```
- Harness: copilot-cli v1.0.65
- Model: claude-sonnet-4-6
- Date: 2026-06-28
```

---

## When harness cannot be determined

If no signals match and the user hasn't specified:

- **In a footer:** omit the parenthetical entirely. Use the base form:
  > *This document was created with AI assistance and has not been fully reviewed by the author.*
- **In frontmatter:** set `harness: unknown` and add a comment to revisit.
- **In a checkpoint:** omit the session metadata block.

Never guess or hardcode a harness name. An omitted identifier is more honest
than a wrong one.

---

## Adding new harnesses

When you encounter a harness not in this table:
1. Identify its distinguishing system prompt or tool signals.
2. Add a row to the table above.
3. Commit the update with type `chore(kit)`.
