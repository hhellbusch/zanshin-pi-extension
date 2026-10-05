# Kit quality: checks vs evals

> Reader: kit maintainer. Decision: which gate to run, and whether to buy an eval product. Date: 2026-10-05

Two different jobs. Don’t collapse them.

| | **Surface checks** (`scripts/check-kit-surface.mjs`) | **Evals** (scenarios below) |
|---|---|---|
| Question | Did we *ship* the command / file / path we claimed? | Did a *model* follow the practice when invoked? |
| Kind of answer | Deterministic pass/fail | Probabilistic — needs a rubric, often a human or LLM judge |
| When | Every `npm test` | After a real session, or a planned use-test |
| Cost | Seconds, no API | Tokens + judgment time |

The 2026-10-05 miss (L0 advertised `/kaeshi` `/yomi` `/kihon` with no `registerCommand`) is a **surface** bug. An eval would not have caught it.

---

## What “evals” means here

In ML/agent work, an **eval** is: freeze a prompt + fixture, run a model, score the output against a rubric, repeat. Products (Promptfoo, Inspect, Braintrust, LangSmith) wrap that loop. The loop is useful when behavior is fuzzy. It is overhead when the bug is “string A doesn’t match string B.”

**This kit does not vendor an eval runner.** Scenarios in [`scenarios.md`](scenarios.md) are cards you can:

1. Run by hand in Pi / Cursor / Codex (default)
2. Later drop into Promptfoo (or similar) if the same card fails twice across models

Promotion bar for a hosted eval stack: the scenarios have been run *manually* at least once, and a miss was *not* catchable by `check-kit-surface.mjs`.

---

## House path

```bash
cd submodules/zanshin-pi-extension && npm run surface   # no Pi required
cd submodules/zanshin-pi-extension && npm test          # tsc + surface + planning + Pi jiti validate
```

Use-tests: pick a card in `scenarios.md`, run it, note pass/fail in the log table there. Don’t add a hosted eval runner until a card fails twice and surface checks cannot catch it.

Related: `DESIGN-PHILOSOPHY.md` (next craft use-test), `MARTIAL-VOCABULARY.md` (don’t promote from aesthetic fit).
