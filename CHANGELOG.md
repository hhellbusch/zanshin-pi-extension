# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-10-05

### Added

- `domain-language` skill for auditing an established term without renaming it or rewriting ADRs.
- `lab-journal` skill. The procedure lives only in `kit/LAB-JOURNAL.md`.
- Cursor plugin manifest (`.cursor-plugin/plugin.json`) pointing at the same `skills/` tree as Codex.
- Kit surface check so the skill catalog is not defined by Pi `registerCommand`.
- Eval cards in `kit/evals/`.
- Shared-change scope on `/craft` when many consumers inherit a change.
- Resume comparison line on `/checkpoint` and `/whats-next`: `branch @ hash · recorded <UTC ISO> — subject`.

### Changed

- Codex and Cursor are the install path. Pi is the adapter.
- `npm test` runs the core checks, then the Pi typecheck and extension validator. `test:offline` is the core half only.
- An explicit project name wins. One `BRIEF.md` is unambiguous. Several briefs stay ambiguous. The newest brief is not selected.
- Package and plugin manifests read `0.3.0`.

### Fixed

- `/shoshin auth` is a framing topic again. `/checkpoint auth` still refuses an unknown name and writes nothing.
- A handoff at `.planning/<name>/whats-next.md` is visible at startup when that directory has no `BRIEF.md`.
- A project argument must be a real directory that stays one child of `.planning/`. A file, `../outside`, and a symlink that leaves that directory are rejected.
- Detached HEAD records the branch as `detached` and keeps the hash and subject in their own fields.
- The Pi checkpoint prompt uses the absolute package path of `skills/checkpoint/SKILL.md`.

### Removed

- The Field Notes-specific section from the portable kit README.

## [0.2.0] - 2026-10-05

First tagged release.

### Added

- `/kihon` catalog: shell, secrets, git, k8s-change, testing, lint, vault, sql, and thin ansible, helm, kustomize, python, and typescript forms.
- Pi commands `kaeshi`, `yomi`, and `kihon`.
- Craft lenses for convention over configuration and orchestration versus program, plus `kit/DESIGN-PHILOSOPHY.md`.

### Changed

- Helm kihon: values are for what varies, not a control panel.

[Unreleased]: https://github.com/hhellbusch/zanshin-pi-extension/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/hhellbusch/zanshin-pi-extension/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/hhellbusch/zanshin-pi-extension/releases/tag/v0.2.0
