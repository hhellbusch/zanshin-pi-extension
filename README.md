# zanshin-pi-extension

Working discipline for [Pi](https://github.com/earendil-works/pi): session lifecycle hooks, slash commands, a pre-commit quality pipeline, and a minimal L0 system prompt. Full kit markdown ships under `kit/` for use in any AI tool.

---

## Install

```bash
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git
```

Pin a commit (recommended — supply chain hygiene):

```bash
pi install git:https://github.com/hhellbusch/zanshin-pi-extension.git#<40-char-sha>
```

---

## What's in the package

```
extensions/   ← Pi extension entry points (auto-loaded by Pi)
kit/          ← Portable markdown: working discipline, style guide, AI disclosure
skills/       ← AgentSkills standard: /spar, /checkpoint, /grill-me, /debug, research, consider-*
```

---

## Commands

Registered by `extensions/zanshin.ts`. Available in Pi after install.

| Command | What it does |
|---------|-------------|
| `/spar [target]` | Steel-man adversarial review — 3–5 arguments against the current approach or named target, each with type, strength, and why it matters |
| `/shoshin` | Surface assumptions before proceeding — find the one assumption whose examination changes the problem framing |
| `/checkpoint` | Write a structured handoff to `.planning/<project>/whats-next.md (project-scoped; resolved via BRIEF.md mtime)` — what's in flight, what was just completed, next step, key decision, git state |
| `/push <topic>` | Push a topic onto the session stack |
| `/pop` | Resolve current topic, return to parent |
| `/stack` | Show the current stack |

---

## Auto-behaviors

Registered by `extensions/zanshin.ts`. Fire without any command.

| Behavior | When | What happens |
|----------|------|-------------|
| **Session notify** | Session starts with an existing project (`BRIEF.md`, `.planning/<project>/whats-next.md (project-scoped; resolved via BRIEF.md mtime)`) | Notification: "existing project detected — run /shoshin" |
| **Bookkeeping counter** | After every 5 successful `write` or `edit` tool calls | Notification: "N changes since last checkpoint — run /checkpoint" |
| **Shutdown warning** | Session closes with uncommitted changes and no `.planning/<project>/whats-next.md (project-scoped; resolved via BRIEF.md mtime)` | Warning: work is in flight with no handoff |
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
| `commit-guard` (secrets) | `bash` tool call — `git commit` | **Hard block** | Passwords, API keys, private keys, PATs, AWS key IDs, OpenAI keys, Slack tokens in staged content |
| `commit-guard` (review) | `bash` tool call — `git commit` | Confirm / block | Committing without reviewing staged content (`git diff --cached`) |
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

### `commit-guard`

Two gates in one extension. Both fire on every `git commit` bash command, before the commit executes.

**Gate 1 — Secrets scan (hard block)**

Scans the full staged diff (`git diff --cached`) for credential patterns. Hard blocks — no confirm dialog — if any are found. Credentials in git history are permanent problems.

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

**Gate 2 — Review loop (confirm)**

Tracks whether the model has run `git diff --cached` since the last commit. This is the command `/review` always runs — so running `/review` sets the flag automatically.

If staged content hasn't been reviewed:

- **Interactive:** select dialog — "Run /review first (recommended)" (blocks) or "Proceed without review" (allows)
- **Non-interactive:** hard block

When blocked with "Run /review first," the block reason tells the model exactly what to do. The model runs `/review`, which runs `git diff --cached`, which sets the flag. The next commit attempt passes the gate automatically — no second interrupt.

The flag resets after each successful commit so every commit cycle requires its own review pass.

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
  ├── commit-guard: secrets scan      → hard block if credentials found
  ├── commit-guard: review gate       → confirm/block if git diff --cached not run
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
| [`STANDALONE.md`](kit/STANDALONE.md) | Self-contained prompt — load this at session start in any tool |
| [`STYLE.md`](kit/STYLE.md) | Writing defaults: voice, structure, docs, cross-linking |
| [`STYLE.template.md`](kit/STYLE.template.md) | Blank template with `[DEFINE]` placeholders for project-owned style guides |
| [`AI-DISCLOSURE.md`](kit/AI-DISCLOSURE.md) | Review status conventions: how to interpret AI-assisted content, validation types, standard footer text |

**Separation of concerns:** `WORKING-STYLE.md` explains. `STANDALONE.md` drives behavior. Load the latter when you need the working discipline active; read the former when you need to understand why something works the way it does.

---

## Skills

27 skills under `skills/` following the [AgentSkills standard](https://agentskills.io/specification). Discovered natively by Pi, Copilot CLI, and Claude Code.

Categories:
- **Working discipline:** `spar`, `checkpoint`, `grill-me`, `debug`, `ask-me-questions`
- **Consider-\*:** `consider-10-10-10`, `consider-5-whys`, `consider-eisenhower-matrix`, `consider-first-principles`, `consider-inversion`, `consider-occams-razor`, `consider-one-thing`, `consider-opportunity-cost`, `consider-pareto`, `consider-second-order`, `consider-swot`, `consider-via-negativa`
- **Research:** `research-competitive`, `research-deep-dive`, `research-feasibility`
- **Improvement:** `improve-skill`

---

## Using in other tools

### Copilot CLI

```bash
# Add skills (one-time per machine or project)
/skills add <path-to-zanshin-pi-extension>/skills/

# Load the working discipline — add to ~/.copilot/copilot-instructions.md:
## Working Style
At the start of every session, read and apply:
<path-to-zanshin-pi-extension>/kit/WORKING-STYLE.md
```

The guards are Pi-only (TypeScript extensions). The skills and kit markdown work in any tool.

### Cursor / Claude Code

Load `kit/STANDALONE.md` as a project rule or system prompt. The guards don't apply — Cursor and Claude Code don't have the same extension API. The kit and skills cover the discipline layer.

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
