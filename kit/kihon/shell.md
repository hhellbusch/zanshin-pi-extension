# Kihon — shell strict mode

**Pitfall:** A script or CI step looks green while a command failed, a variable was unset, or a failure was swallowed in a pipe.  
**Signal:** Non-zero exit when something goes wrong — fail loud, early.

## Required header

For bash scripts (`*.sh`, `*.bash`):

```bash
#!/usr/bin/env bash
set -euo pipefail
```

- `#!/usr/bin/env bash` — you’re using bash; don’t pretend POSIX if you rely on bashisms / `pipefail`
- `set -e` — exit on command failure (see exceptions below)
- `set -u` — unset variables are errors
- `set -o pipefail` — failure anywhere in a pipeline fails the pipeline (e.g. `false | true`)

## CI inline scripts

Every `run:` / `script:` block with **more than one command** starts with `set -euo pipefail`.

Single-command blocks: optional but encouraged.

## Makefiles

```makefile
SHELL := /usr/bin/env bash
.SHELLFLAGS := -euo pipefail -c
```

## Lint signal (when the project has it)

If the repo runs **shellcheck** (or equivalent) in CI, fix findings or justify with a scoped disable — see [`lint.md`](lint.md). Don’t expand this kihon into a shell style guide; toolchain wins.

## Exceptions

Comment at the top when intentional:

- Cleanup / trap paths that must continue after a failure
- Known `set -e` edge cases (e.g. commands in certain `if` / `&&` contexts) — prefer explicit `||` handling over disabling strict mode globally

## Not this kihon

Quoting every array, inventing a second shell framework, or rewriting POSIX sh for purity — that’s craft or a local guide.
