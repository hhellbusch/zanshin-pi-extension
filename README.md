# zanshin-pi-extension

**Zanshin** for [Pi](https://github.com/badlogic/pi-mono): a compact **L0** block appended to the system prompt via `before_agent_start`, plus the **full kit** as markdown files under `kit/`.

## Install

```bash
pi install git:git@github.com:hhellbusch/zanshin-pi-extension.git
```

Or HTTPS:

```bash
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git
```

**Pin a commit** (recommended for supply chain). Use the full 40-character SHA from the [commits](https://github.com/hhellbusch/zanshin-pi-extension/commits/main/) page:

```bash
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git#<40-char-sha>
```

## What ships in the package

| Path | Role |
|------|------|
| `extensions/zanshin-l0.ts` | `before_agent_start` → append L0 + **absolute paths** to `kit/*.md` |
| `kit/WORKING-STYLE.md` | Full working discipline |
| `kit/STYLE.md` | Style guide defaults |
| `kit/STYLE.template.md` | Template for team-owned style guides |
| `kit/README.md` | Short index of the kit directory |
| `kit/STANDALONE-KIT.md` | Long-form setup doc (historical standalone kit README) |

L0 stays short; the model is pointed at `kit/WORKING-STYLE.md` on disk when it needs depth (not loaded into the prompt every turn).

Pattern matches [pi-caveman-mode](https://github.com/habitssss/pi-caveman-mode): `package.json` field `pi.extensions` → `./extensions`.

## Field Notes / gemini-workspace

That repository vendors this repo as a **git submodule** at `zanshin-pi-extension/`. Clone the parent with:

```bash
git submodule update --init --recursive
```

## License

MIT
