# zanshin-pi-extension

**Zanshin** for [Pi](https://github.com/badlogic/pi-mono): pi-native working discipline — slash commands, session lifecycle hooks, state persistence, and a minimal L0 system prompt block. Full kit markdown ships under `kit/`.

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
| `extensions/zanshin.ts` | Main extension: commands, events, state, minimal L0 prompt |
| `kit/WORKING-STYLE.md` | Full working discipline (read on demand, not every turn) |
| `kit/STYLE.md` | Style guide defaults |
| `kit/STYLE.template.md` | Template for team-owned style guides |
| `kit/README.md` | Short index of the kit directory |
| `kit/STANDALONE-KIT.md` | Setup doc for Copilot Chat, Cursor, and other non-pi tools |

## Commands

| Command | What it does |
|---------|-------------|
| `/spar [target]` | Steel-man adversarial review of the current approach or named target |
| `/shoshin` | Surface assumptions before proceeding |
| `/checkpoint` | Write a structured checkpoint to `.planning/whats-next.md` |
| `/push <topic>` | Push a topic onto the stack |
| `/pop` | Resolve current topic, return to parent |
| `/stack` | Display the current stack |

## Auto-behaviors

- **Session start:** Notifies if `.planning/brief.md`, `.planning/whats-next.md`, or `BRIEF.md` is detected — prompts you to run `/shoshin`.
- **Progressive bookkeeping:** Counts successful `write` and `edit` tool calls; notifies after 5 changes without a checkpoint.
- **Session shutdown:** Warns if uncommitted changes exist and no `.planning/whats-next.md` is present.
- **Stack persistence:** Stack state survives context resets and session restarts via `pi.appendEntry()`.

Pattern matches [pi-caveman-mode](https://github.com/habitssss/pi-caveman-mode): `package.json` field `pi.extensions` → `./extensions`.

## Field Notes / gemini-workspace

That repository vendors this repo as a **git submodule** at `zanshin-pi-extension/`. Clone the parent with:

```bash
git submodule update --init --recursive
```

## License

MIT
