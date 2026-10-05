# Kihon — lint and static checks

## Form

1. **Project tools win** — use the repo’s configured formatter/linter (ruff, eslint, pre-commit, etc.); don’t invent a parallel stack in one PR.
2. **CI lint is a gate** — fix or justify; don’t merge red required checks.
3. **No silent disables** — `# noqa`, `eslint-disable`, `prettier-ignore`, `yamllint disable` need a one-line reason and minimal scope.
4. **Format on touch** — when you edit a file, leave it compliant with the project formatter (or run the project’s format command).
5. **Generated code** — don’t hand-lint generated output; regenerate or exclude via project config.

## Exceptions

Vendor trees and generated assets: exclude in config, don’t sprinkle disables file-wide.
