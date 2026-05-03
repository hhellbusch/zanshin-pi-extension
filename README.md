# zanshin-pi-extension

**Zanshin L0** for [Pi](https://github.com/badlogic/pi-mono): a tiny always-on block appended to the system prompt via `before_agent_start`. It carries the three failure modes, collaboration style, and how practices activate — not the full `WORKING-STYLE.md` (that stays on disk for deep reads).

## Install

```bash
pi install git:git@github.com:hhellbusch/zanshin-pi-extension.git
```

Or HTTPS:

```bash
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git
```

**Pin a commit** (recommended for supply chain). Example — initial scaffold:

```bash
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git#85ca55ef8e2ab04f4fa7604141e1a668188e16a4
```

Replace the SHA when you upgrade after reviewing changes.

## Canonical kit

The full portable document lives in the [gemini-workspace](https://github.com/hhellbusch/my-ai-workspace) repo under `zanshin-kit/WORKING-STYLE.md` (or vendor that file into any project). This extension does not bundle the full kit — it only injects the L0 summary.

## Layout

| Path | Role |
|------|------|
| `extensions/zanshin-l0.ts` | `before_agent_start` → append L0 to `systemPrompt` |
| `package.json` | `pi.extensions` → `./extensions` |

Pattern matches [pi-caveman-mode](https://github.com/habitssss/pi-caveman-mode).

## License

MIT
