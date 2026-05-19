# Extension Coding Conventions

Conventions for authoring `.ts` files under `extensions/` and `lib/`.

---

## ASCII-safe source files

**Rule: extension source files must be ASCII-safe in structure.**

The Pi agent's built-in edit tool uses exact byte-string matching. Multi-byte UTF-8 sequences in comments and string literals cause match failures, forcing whole-file rewrites for minor edits. Keep source structure ASCII-only so surgical edits work reliably.

### In comments and doc blocks

Use ASCII substitutes for all decorative or structural characters:

| Character | Unicode | Use instead |
|-----------|---------|-------------|
| Em dash   | `\u2014` (`—`) | ` -- ` or ` - ` |
| Box-drawing divider | `\u2500` (`─`) | `-` repeated, e.g. `// -- Section --` |
| Right arrow | `\u2192` (`→`) | `->` |
| Left arrow  | `\u2190` (`<-`) | `<-` |
| Ellipsis    | `\u2026` (`…`) | `...` |

**Section dividers** -- use plain dashes, not box-drawing:

```ts
// -- Gate 3: Review enforcement ------------------------------------------
```

Not:

```ts
// ── Gate 3: Review enforcement ──────────────────────────────────────────
```

(The second uses `\u2500` box-drawing characters. Both look the same in a rendered view but only the first can be matched byte-for-byte by the edit tool.)

### In user-facing strings

Unicode is acceptable in strings that appear in the UI (notifications, block reasons, status labels). Prefer Unicode escape sequences for non-ASCII so the intent is explicit in source:

```ts
// Good -- escape sequences make intent explicit, edit tool matches reliably
ctx.ui.notify("Commit blocked \u274c -- credentials detected", "error");

// Avoid -- raw emoji works visually but is harder to match byte-for-byte
ctx.ui.notify("Commit blocked ❌ -- credentials detected", "error");
```

Em dashes in UI strings should use ` -- ` (spaced double-hyphen) or the escape `\u2014` -- not the raw `—` character:

```ts
// Preferred
"commit-guard: review complete \u2705 -- warnings for awareness:\n\n"

// Avoid (raw em dash -- breaks edit tool matching)
"commit-guard: review complete \u2705 \u2014 warnings for awareness:\n\n"
```

### Checklist before committing a new extension file

- [ ] No `\u2500`-family box-drawing characters in comments
- [ ] No raw em dash (`—`) in any line
- [ ] No raw arrow (`→`, `←`, `↑`, `↓`) in any line
- [ ] No raw ellipsis (`…`) -- use `...` in logic, `\u2026` in UI strings
- [ ] Emoji in UI strings use `\uXXXX` escape form or are isolated enough that exact matching is unambiguous

---

## TypeScript conventions

- Strict mode is on (`tsconfig.json`). No `any` without a comment explaining why.
- All exported functions take `pi: ExtensionAPI` as first argument (standard Pi extension signature).
- Guard extensions (`*-guard.ts`) return `{ block: true, reason: string }` to cancel, or return nothing to allow. Never throw -- errors in guards are swallowed silently by the loader.
- Use `pi.exec()` for shell commands inside guards, not direct imports of `child_process`. This keeps the execution model consistent with the Pi sandbox.
- No top-level `await`. Extension files are loaded synchronously by the jiti loader.

---

## File naming

- `extensions/<name>-guard.ts` -- intercepts tool calls, may block
- `extensions/<name>.ts` -- passive extension (notifications, prompt injection, status)
- `lib/<name>.ts` -- shared utilities, no default export required
