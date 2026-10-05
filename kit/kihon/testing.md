# Kihon — testing

High-performing default: **behavior changes ship with automated proof**, or an explicit reason they don’t.

## Form

1. **New behavior → test** — unit, integration, or smoke that would fail if the behavior regressed.
2. **Bugfix → regression test** — reproduce once, lock it; don’t rely on “we checked manually.”
3. **CI is the gate** — don’t merge with failing required tests; don’t delete tests to greenwash.
4. **Determinism** — no flake-dependent sleeps as the only sync; seed data and clocks controlled when practical.
5. **Right layer** — pure logic in fast unit tests; I/O and cluster behavior in integration/e2e that the repo already runs (don’t invent a second pyramid in one PR).
6. **Name the gap** — if you truly can’t automate yet, say so in the PR/commit and file follow-up; silence is not an exception.

## Exceptions

Docs-only and pure refactor with no behavior change: tests not required; if refactor can break behavior, keep/adjust tests.
