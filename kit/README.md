# Zanshin kit (bundled)

These markdown files ship with **zanshin-pi-extension** for Pi and for git checkouts.

| File | Purpose |
|------|---------|
| [`WORKING-STYLE.md`](WORKING-STYLE.md) | Full reference — rationale, examples, edge cases, extension behavior |
| [`LAB-JOURNAL.md`](LAB-JOURNAL.md) | Surprise notes — attempted / observed / disproved; not a checkpoint or ADR |
| [`STYLE.md`](STYLE.md) | Writing defaults — voice, structure, docs, ADRs, cross-linking |
| [`STYLE.template.md`](STYLE.template.md) | Blank template with `[DEFINE]` placeholders for project-owned style guides |
| [`AI-DISCLOSURE.md`](AI-DISCLOSURE.md) | Review status conventions — how to interpret AI-assisted content |
| [`ENGINEERING-PRINCIPLES.md`](ENGINEERING-PRINCIPLES.md) | Engineering judgment aids — DRY, KISS, SRP, YAGNI, CoC, orchestration vs program, … |
| [`DESIGN-PHILOSOPHY.md`](DESIGN-PHILOSOPHY.md) | Stance map — CoC, omakase, Unix/CI2/Laravel borrowings (not doctrine) |
| [`AGILE-ARTIFACT-DISCIPLINE.md`](AGILE-ARTIFACT-DISCIPLINE.md) | Artifact economics — JBGE, TAGRI, travel light, document late (Ambler / AM) |
| [`HARNESS-DETECTION.md`](HARNESS-DETECTION.md) | How skills identify harness / model for checkpoints |
| [`MARTIAL-VOCABULARY.md`](MARTIAL-VOCABULARY.md) | Dojo vocabulary map — active (shoshin, spar, kaeshi, …), light promotions, seeds |
| [`kihon/`](kihon/) | Basics / fixed forms — pitfall/signal domains (`/kihon`; see `kihon/README.md`) |

**How behavior loads:** Install the plugin (or `/skills add` this repo's `skills/`). Put ambient posture in the consumer's always-on context (`AGENTS.md`, Pi L0, etc.). Invoked depth is `skills/*/SKILL.md`. There is no separate paste-prompt file.

---

## Field Notes (gemini-workspace)

This directory is wired as a **git submodule** at `zanshin-pi-extension/`. After `git clone`, run `git submodule update --init --recursive`. Edits to kit content should be committed **inside** this submodule and pushed to [zanshin-pi-extension](https://github.com/hhellbusch/zanshin-pi-extension); the parent repo then records the new submodule SHA.
