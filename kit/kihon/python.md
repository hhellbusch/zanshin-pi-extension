# Kihon — Python

## Form

1. **Project toolchain wins** — use the repo’s declared manager/linter/tester (`pyproject.toml`, ruff, pytest, uv/poetry/pip-tools); don’t add a second stack casually.
2. **Strict enough for scripts** — new scripts fail loudly (no bare `except:`); type hints on new public functions when the project already uses typing.
3. **No secrets in source** — env or secret manager ([`secrets.md`](secrets.md)).
4. **Tests for behavior changes** — see [`testing.md`](testing.md).
5. **Lint/format on touch** — see [`lint.md`](lint.md).
6. **Virtual env / lock discipline** — don’t commit ad-hoc global package drift; follow the repo’s lockfile or requirements pattern.

## Exceptions

Tiny one-off scratch in `/tmp` or a notebook: don’t block on packaging; still no secrets.
