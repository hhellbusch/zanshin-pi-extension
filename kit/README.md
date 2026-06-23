# Zanshin kit (bundled)

These markdown files ship with **zanshin-pi-extension** for Pi and for git checkouts.

| File | Purpose |
|------|---------|
| [`WORKING-STYLE.md`](WORKING-STYLE.md) | Full reference — rationale, examples, edge cases, extension behavior |
| [`STANDALONE.md`](STANDALONE.md) | Self-contained prompt — paste or load this into any session for working discipline |
| [`STYLE.md`](STYLE.md) | Writing defaults — voice, structure, docs, ADRs, cross-linking |
| [`STYLE.template.md`](STYLE.template.md) | Blank template with `[DEFINE]` placeholders for project-owned style guides |
| [`AI-DISCLOSURE.md`](AI-DISCLOSURE.md) | Review status conventions — how to interpret AI-assisted content |
| [`ENGINEERING-PRINCIPLES.md`](ENGINEERING-PRINCIPLES.md) | Engineering judgment aids — DRY, KISS, SRP, YAGNI, broken windows, phased delivery |
| [`AGILE-ARTIFACT-DISCIPLINE.md`](AGILE-ARTIFACT-DISCIPLINE.md) | Artifact economics — JBGE, TAGRI, travel light, document late (Ambler / AM) |

**Separation of concerns:** `WORKING-STYLE.md` is reference documentation. `STANDALONE.md` is the prompt version — concise, self-contained, designed to be loaded at session start. The former explains; the latter drives behavior.

---

## Field Notes (gemini-workspace)

This directory is wired as a **git submodule** at `zanshin-pi-extension/`. After `git clone`, run `git submodule update --init --recursive`. Edits to kit content should be committed **inside** this submodule and pushed to [zanshin-pi-extension](https://github.com/hhellbusch/zanshin-pi-extension); the parent repo then records the new submodule SHA.
