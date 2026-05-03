# Zanshin kit (bundled)

These markdown files ship with **zanshin-pi-extension** for Pi and for git checkouts of this repo.

| File | Purpose |
|------|---------|
| `WORKING-STYLE.md` | Full working discipline — spar, shoshin, checkpoints, stack, verification, review |
| `STYLE.md` | Voice and structure defaults for docs, ADRs, technical writing |
| `STYLE.template.md` | Blank template with `[DEFINE]` placeholders for team-owned style guides |
| `STANDALONE-KIT.md` | Long-form setup and team workflows (historical top-level kit README) |

**Field Notes (gemini-workspace):** This directory is wired as a **git submodule** at `zanshin-pi-extension/`. After `git clone`, run `git submodule update --init --recursive`. Edits to kit content should be committed **inside** this submodule and pushed to [zanshin-pi-extension](https://github.com/hhellbusch/zanshin-pi-extension); the parent repo then records the new submodule SHA.
