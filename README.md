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
| `kit/AI-DISCLOSURE.md` | Portable AI disclosure policy — review states, validation types, standard footer |
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

## Copilot CLI

Two steps to wire up the Zanshin working discipline in Copilot CLI:

**Step 1 — Add the skills** (one-time per machine, or per project):

```bash
# From wherever you cloned or vendored this repo:
/skills add <path-to-zanshin-pi-extension>/skills/
```

This makes commands like `/spar`, `/grill-me`, `/checkpoint`, `/whats-next`, and all `/consider-*` and `/research-*` skills available in Copilot CLI sessions.

**Step 2 — Load the working discipline** (one-time per machine):

Add to `~/.copilot/copilot-instructions.md`:

```markdown
## Working Style
At the start of every session, read and apply the practices in:
<path-to-zanshin-pi-extension>/kit/WORKING-STYLE.md
```

Replace `<path-to-zanshin-pi-extension>` with the absolute path to your clone. This runs once per machine; the working style then loads in every Copilot CLI session regardless of project.

If you vendor this as a git submodule, the path is wherever the submodule is checked out (e.g. `~/my-project/submodules/zanshin-pi-extension`).

---

## Using as a git submodule

To vendor this repo in your workspace, add it as a submodule under `submodules/zanshin-pi-extension/`. Clone the parent with:

```bash
git submodule update --init --recursive
```

## License

MIT
