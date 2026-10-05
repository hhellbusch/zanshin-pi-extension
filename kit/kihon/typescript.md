# Kihon — TypeScript / JavaScript

## Form

1. **Project `tsconfig` / eslint win** — strictness and rules as configured; don’t weaken `strict` in a drive-by PR.
2. **No `any` without a comment** — prefer `unknown` + narrow; justify unavoidable `any`.
3. **No secrets in source or client bundles** — ([`secrets.md`](secrets.md)).
4. **Lint/format on touch** — ([`lint.md`](lint.md)).
5. **Tests for behavior changes** — ([`testing.md`](testing.md)).
6. **ASCII-safe when the repo requires it** — some agent edit tools break on fancy Unicode in comments (zanshin extension source convention); follow the consumer’s coding conventions doc when present.

## Exceptions

Plain JS config files the project already ships: don’t TS-ify in passing unless asked.
