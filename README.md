# Zanshin

Portable working-discipline skills for Codex and Cursor. One `skills/` tree is the behavior. `kit/` is shared reference material, linked from skills, not copied. [Pi](https://github.com/earendil-works/pi) is an optional adapter: slash commands, session hooks, and guards.

---

## Install

### Codex

This repo is a skills-only Codex plugin. `skills/` is the only skill tree. Pi hooks are not in the Codex manifest.

Repo-root marketplace path `./` needs Codex 0.142 or newer ([openai/codex#17066](https://github.com/openai/codex/issues/17066), fixed in [PR 28771](https://github.com/openai/codex/pull/28771)).

```bash
codex plugin marketplace add https://github.com/hhellbusch/zanshin-pi-extension.git
codex plugin list
codex plugin add zanshin@zanshin-kit
```

Local checkout:

```bash
codex plugin marketplace add /path/to/zanshin-pi-extension
codex plugin add zanshin@zanshin-kit
```

Ambient practices (bookkeeping, verification, branching) still need a short block in the consuming repo's `AGENTS.md`. See `kit/WORKING-STYLE.md`.

### Cursor

`.cursor-plugin/plugin.json` points at the same `./skills/`. Do not copy the skill tree.

Place this repo at `~/.cursor/plugins/local/zanshin` (or load it from Customize) and reload the window. Skills are discovered from `skills/*/SKILL.md`.

### Skill contract

- Invoked behavior lives in `skills/<name>/SKILL.md` (frontmatter `name` matches the directory).
- Shared rationale lives in `kit/` and is linked. Do not paste a second copy of a procedure into a skill.
- Lab journal: `skills/lab-journal/SKILL.md` is the trigger. The procedure is only `kit/LAB-JOURNAL.md`.
- A skill does not need a Pi slash command. `whats-next` and `lab-journal` are skills-only.

### Pi adapter

```bash
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git#<40-char-sha>
```

Pin a commit when you can. The sections **Pi adapter — commands**, **Auto-behaviors**, and **Guard extensions** apply only after a Pi install.

---

## What's in the package

```
skills/                          ← canonical behavior (Codex, Cursor, Claude, Copilot, Pi)
kit/                             ← shared references (working style, lab journal, kihon, style)
.codex-plugin/plugin.json        ← Codex manifest; skills path ./skills/
.cursor-plugin/plugin.json       ← Cursor manifest; same skills path
.agents/plugins/marketplace.json ← Codex marketplace catalog (this repo is the plugin root)
extensions/                      ← Pi adapter only
```

---

## Pi adapter — commands

Registered by `extensions/zanshin.ts`. Not required for Codex or Cursor.

| Command | What it does |
|---------|-------------|
| `/spar [target]` | Steel-man adversarial review — 3–5 arguments against the current approach or named target, each with type, strength, and why it matters |
| `/shoshin [target]` | Surface assumptions collaboratively — read `skills/shoshin/SKILL.md`, ask sharp questions before building |
| `/kaeshi [goal]` | Inversion — what guarantees failure? Read `skills/kaeshi/SKILL.md` |
| `/yomi [action]` | Second-order — and then what? Read `skills/yomi/SKILL.md` |
| `/craft [target]` | Apply engineering principles to code or design — read `skills/craft/SKILL.md` |
| `/domain-language [term]` | Audit an established term across surfaces — evidence only; read `skills/domain-language/SKILL.md` |
| `/kihon <domain>` | Basics / fixed forms — read `skills/kihon/SKILL.md` + `kit/kihon/` |
| `/unslop [target]` | Cut AI tells from a draft — read `skills/unslop/SKILL.md` |
| `/checkpoint [project]` | Append a handoff to `.planning/<project>/whats-next.md` (named project, else the only BRIEF; ask when several exist) — in flight, just completed, next step, key decision, `branch @ hash · recorded <ISO time>` |
| `/push <topic>` | Push a topic onto the session stack |
| `/pop` | Resolve current topic, return to parent |
| `/stack` | Show the current stack |

---

## Auto-behaviors

Registered by `extensions/zanshin.ts`. Fire without any command.

| Behavior | When | What happens |
|----------|------|-------------|
| **Session notify** | Session starts with an existing project (`BRIEF.md` or `.planning/<project>/whats-next.md`) | Notification: "existing project detected — run /shoshin" |
| **Bookkeeping counter** | After every 5 successful `write` or `edit` tool calls | Notification: "N changes since last checkpoint — run /checkpoint" |
| **Shutdown warning** | Session closes with uncommitted changes and no `.planning/<project>/whats-next.md` | Warning: work is in flight with no handoff |
| **Stack persistence** | Always | Stack state survives context resets and session restarts via `pi.appendEntry()` |

---

## Guard extensions

Eight guard extensions run automatically — no command needed. They intercept tool calls at the right moment and either notify, confirm, or hard-block. The table below shows the full picture; details follow.

### At-a-glance

| Extension | Fires on | Mode | What it catches |
|-----------|----------|------|----------------|
| `write-quality-guard` | `write` tool call | Notify | Missing AI footer in `docs/*.md`; missing `set -euo pipefail` in `.sh` files |
| `dirty-repo-guard` | Session switch / fork / clone | Confirm | Uncommitted changes before context reset |
| `risky-ops-guard` | `bash` tool call | Confirm | `rm -rf`, `chmod -R`, `shred`, `dd of=/dev/`, `mkfs`, `truncate -s 0` |
| `process-guard` | `bash` tool call | Confirm | `pkill`, `killall`, `kill -9`, `kill -SIGKILL`, `fuser -k` |
| `git-force-push-guard` | `bash` tool call | Confirm | `git push --force` / `-f` to main, master, develop, release |
| `secrets-guard` | `bash` tool call — `git commit` | **Hard block** | Passwords, API keys, private keys, PATs, AWS key IDs, OpenAI keys, Slack tokens in staged content |
| `url-commit-guard` | `bash` tool call — `git commit` | Confirm | Broken external URLs (`https://`) in new markdown lines |
| `relative-link-guard` | `bash` tool call — `git commit` | Confirm | Broken relative links in new markdown lines |

**Modes:**
- **Notify** — shows a warning; write proceeds regardless
- **Confirm** — shows a dialog; user or model chooses to proceed or cancel
- **Hard block** — cancels the action immediately; no confirm option

---

### `write-quality-guard`

Fires immediately when a file is written — before it hits disk. Catches quality gaps at creation time rather than accumulating them for batch review at commit.

**AI disclosure footer** — every new file under `docs/` (excluding `README.md`) should include the standard footer linking to `AI-DISCLOSURE.md`. If the written content doesn't contain a reference to `AI-DISCLOSURE.md`, the guard notifies with the standard footer text to add.

**Shell strict mode** — every `.sh` or `.bash` file should include `set -euo pipefail`. If the written content doesn't contain a `set -e` variant, the guard notifies with the fix.

Both checks are notifications only — the write proceeds. The model can fix the issue in the next turn.

---

### `dirty-repo-guard`

Fires before any session context switch: `/new`, `/resume`, `/fork`, `/clone`. Uncommitted changes are invisible to a fresh session — this guard ensures work is committed before the context resets.

If there are uncommitted changes, the guard prompts:
- **Yes, proceed anyway** — allows the switch
- **No, commit first** — cancels; model commits, then switches
- **No, stash first** — runs `git stash push -m dirty-repo-guard` and proceeds

In non-interactive mode, cancels by default.

---

### `risky-ops-guard`

Fires on `bash` commands that contain destructive filesystem operations. Prompts for explicit confirmation before proceeding. Covered patterns:

- `rm -rf` / `rm -r` / `rm --recursive`
- `chmod -R` (recursive permission change)
- `chmod` with world-writable permissions (mode has write bit set for "other")
- `shred` (secure erase)
- `dd of=/dev/...` (writing to a block device)
- `mkfs` (filesystem formatting)
- `truncate -s 0` (zero out a file)

Single-file `rm <file>` is intentionally not covered — low blast radius.

---

### `process-guard`

Fires on `bash` commands that terminate processes. Prompts for confirmation before proceeding. Covered patterns: `pkill`, `killall`, `kill -9`, `kill -SIGKILL`, `kill -SIGTERM`, `fuser -k`, and `lsof ... | xargs kill` pipelines.

---

### `git-force-push-guard`

Fires on `bash` commands containing `git push --force` or `git push -f`. Force-pushes rewrite history that other sessions and harvest cycles depend on — they break the repo as the truth anchor.

If the push targets a protected branch (main, master, develop, release), the guard shows the command and prompts for confirmation. Force-pushes to unprotected branches are also flagged but with lower severity.

---

### `secrets-guard`

Fires on every `git commit`. Scans the full staged diff (`git diff --cached`) for credential patterns. Hard blocks — no confirm dialog — if any are found. Credentials in git history are permanent problems.

Patterns checked (all on new `+` diff lines only):

| Pattern | Label |
|---------|-------|
| `password: <value>` / `password=<value>` | password |
| `api_key: <value>` | API key |
| `secret_key: <value>` / `secret_access: <value>` | secret key |
| `access_token: <value>` | access token |
| `-----BEGIN RSA/EC/OPENSSH PRIVATE KEY-----` | private key (PEM) |
| `ghp_[36 chars]` | GitHub personal access token |
| `sk-[32+ chars]` | OpenAI API key |
| `xoxb-...-...` | Slack bot token |
| `AKIA[20 chars]` | AWS access key ID |

False positives (example values, placeholder strings) can be cleared with an obviously fake value (`your-password-here`) or an inline comment.

---

### `url-commit-guard`

Fires on every `git commit`. Extracts external URLs (`https://`) from new lines in staged `.md` files and fetches each via `curl` to verify it resolves. Runs through the system proxy automatically.

Results:

| Status | Meaning | Behavior |
|--------|---------|----------|
| ✅ HTTP 200–399 | Verified | Silent pass |
| ❌ HTTP 404 / 410 | Broken link | Confirm dialog; hard block in non-interactive mode |
| ⚠️ HTTP 000 / curl error | Unverifiable (proxy block, no egress, timeout) | Warning only — limited egress is expected in container environments |
| ⚠️ HTTP 403 / 5xx | Ambiguous | Warning only |

Motivation: LLMs generate plausible-looking URLs that don't exist. Fluent prose is not evidence the link is real.

---

### `relative-link-guard`

Fires on every `git commit`. Extracts relative markdown links from new lines in staged `.md` files, resolves each against the file's directory and the repo root, and checks whether the target exists on disk.

Resolves:
- `[text](path/to/file.md)` — implicit relative
- `[text](./path/to/file.md)` — explicit relative
- `[text](../path/to/file.md)` — parent traversal
- `[text](file.md#section)` — fragment stripped, file checked

Does not check:
- `[text](https://example.com)` — external (handled by `url-commit-guard`)
- `[text](#section)` — fragment-only, no file target
- `[text](mailto:...)` — email

Results are shown as `[file] → raw-link` with the resolved path for easy diagnosis. Broken links trigger a confirm dialog (not a hard block — the target may be created in a subsequent step). Non-interactive mode hard-blocks.

---

## The pre-commit pipeline

When the model runs `git commit`, five guards fire in extension load order:

```
git commit
  │
  ├── secrets-guard                   → hard block if credentials found
  ├── url-commit-guard                → confirm if external URLs are broken (404)
  ├── relative-link-guard             → confirm if relative paths don't resolve
  └── [commit proceeds if all pass]
```

This pipeline runs automatically on every commit without any command. The model handles remediation when blocked — it reads the block reason, takes the required action (run `/review`, fix a link, remove a credential), and retries.

---

## Kit

Portable markdown files that ship under `kit/`. Any AI tool can read these directly — no Pi required.

| File | Purpose |
|------|---------|
| [`WORKING-STYLE.md`](kit/WORKING-STYLE.md) | Full reference: rationale, examples, edge cases, extension behavior |
| [`STYLE.md`](kit/STYLE.md) | Writing defaults: voice, structure, docs, cross-linking |
| [`STYLE.template.md`](kit/STYLE.template.md) | Blank template with `[DEFINE]` placeholders for project-owned style guides |
| [`AI-DISCLOSURE.md`](kit/AI-DISCLOSURE.md) | Review status conventions: how to interpret AI-assisted content, validation types, standard footer text |
| [`ENGINEERING-PRINCIPLES.md`](kit/ENGINEERING-PRINCIPLES.md) | Craft lenses (DRY, KISS, SRP, YAGNI, CoC, orchestration vs program) |
| [`LAB-JOURNAL.md`](kit/LAB-JOURNAL.md) | Lab journal form — not a checkpoint, ADR, or troubleshooting guide |
| [`DESIGN-PHILOSOPHY.md`](kit/DESIGN-PHILOSOPHY.md) | Stance map — CoC, omakase, Unix/CI2/Laravel borrowings |
| [`AGILE-ARTIFACT-DISCIPLINE.md`](kit/AGILE-ARTIFACT-DISCIPLINE.md) | JBGE, TAGRI, travel light |
| [`MARTIAL-VOCABULARY.md`](kit/MARTIAL-VOCABULARY.md) | Dojo vocabulary map (active + seeds); spar ≈ kumite gloss only — no rename |
| [`kihon/`](kit/kihon/) | Basics — pitfall/signal domains (`/kihon`; see `kit/kihon/README.md`) |
| [`evals/`](kit/evals/) | Surface checks vs LLM evals; manual use-test cards |

**How behavior loads:** Plugin / skills install for invoked depth. Ambient posture in the consumer's `AGENTS.md` (or Pi L0). No separate paste-prompt file — that model is retired in favor of plugins + skills.

---

## Skills

11 skills under `skills/` following the [AgentSkills standard](https://agentskills.io/specification). Discovered by Codex, Cursor, Claude Code, Copilot CLI, and Pi.

| Skill | Job |
|-------|-----|
| `shoshin` | Reset framing — surface load-bearing assumptions before building |
| `kaeshi` | Inversion (返し) — what guarantees failure? |
| `yomi` | Second-order (読み) — and then what? |
| `spar` | Steel-man adversarial review |
| `craft` | Engineering principles on code or design (KISS, SRP, DRY, YAGNI, CoC, orchestration vs program, JBGE) |
| `domain-language` | Term audit — cite surfaces; do not redefine |
| `kihon` | Basics / fixed forms — shell, secrets, git, k8s, testing, lint, thin verticals |
| `unslop` | Cut AI tells from a draft |
| `checkpoint` | Mid-session crash-recovery snapshot |
| `whats-next` | Full session handoff for a fresh context |
| `lab-journal` | Trigger only — procedure is `kit/LAB-JOURNAL.md` |

### Companion skills (not bundled)

Design interrogation (`/grill-me`, `/grill-with-docs`) lives upstream in [Matt Pocock's skills](https://github.com/mattpocock/skills) — install that pack separately rather than forking into this kit:

```bash
# Claude Code (full plugin, auto-updates)
claude plugins install mattpocock-skills

# Or pick skills across agents (e.g. grill-me + grilling only)
npx skills@latest add mattpocock/skills
```

### Removed from this kit

Older TÂCHES-imported packs (`research-*`, twelve `consider-*` stubs, `ask-me-questions`, `debug` stub, `improve-skill`) and a vendored `grill-me` were removed — discovery noise, Claude-only tool coupling, or upstream ownership. Git history retains them if needed. Later spar complements: `kaeshi` (inversion) and `yomi` (second-order) — not a TÂCHES re-import.

---

## Using in other tools

### Copilot CLI

```bash
# Add skills (one-time per machine or project)
/skills add <path-to-zanshin-pi-extension>/skills/
```

Put a short ambient working-style block in `~/.copilot/copilot-instructions.md` or the project's `AGENTS.md` (see `kit/WORKING-STYLE.md` for what ambient covers). The guards are Pi-only.

### Cursor / Claude Code

Cursor install is at the top of this file. Claude Code: `/skills add` this repo's `skills/`. Ambient posture goes in the project's `AGENTS.md`. Pi guards do not apply.

---

## Using as a git submodule

```bash
git submodule add https://github.com/hhellbusch/zanshin-pi-extension.git submodules/zanshin-pi-extension
git submodule update --init --recursive
```

After cloning the parent repo:

```bash
git submodule update --init --recursive
```

---

## License

MIT

### ASCII-safe source files

All  files in  and  are ASCII-only. The edit tool matches bytes exactly — multi-byte UTF-8 in comments causes match failures. See .
