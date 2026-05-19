/**
 * Package layout:
 *   kit/        — Raw markdown depth. Any tool can read these directly.
 *                 WORKING-STYLE.md is the canonical working discipline doc.
 *   extensions/ — Pi-only. This file injects the L0 compact prompt +
 *                 absolute kit paths into the Pi system prompt via
 *                 session_start. No changes needed for Copilot users.
 *   skills/     — AgentSkills standard (SKILL.md per command). Discovered
 *                 natively by Copilot CLI, Claude Code, and Pi. Add with:
 *                 /skills add <path-to-skills-dir>
 *
 * Distilled Zanshin L0 — always injected. Full markdown ships in this package
 * under ../kit/ (WORKING-STYLE.md, STYLE.md, STYLE.template.md).
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const extensionDir = dirname(fileURLToPath(import.meta.url));
const kitDir = join(extensionDir, "..", "kit");
const docsDir = join(extensionDir, "..", "docs");
const kitWorking = join(kitDir, "WORKING-STYLE.md");
const kitStyle = join(kitDir, "STYLE.md");
const kitTemplate = join(kitDir, "STYLE.template.md");
const codingConventions = join(docsDir, "CODING-CONVENTIONS.md");

const CHECKPOINT_THRESHOLD = 5;

// Find the checkpoint directory: project-scoped, falls back to root.
// Prefers the most recently modified BRIEF.md to handle multi-project work.
function resolveCheckpointDir(cwd: string): string {
	try {
		const entries = readdirSync(join(cwd, ".planning"));
		let best: string | null = null;
		let bestTime = 0;
		for (const dir of entries) {
			const briefPath = join(cwd, ".planning", dir, "BRIEF.md");
			if (existsSync(briefPath)) {
				try {
					const time = statSync(briefPath).mtimeMs;
					if (time > bestTime) {
						bestTime = time;
						best = join(cwd, ".planning", dir);
					}
				} catch {
					// skip unreadable
				}
			}
		}
		if (best) return best;
	} catch {
		// .planning doesn't exist yet — fall through
	}

	// Fallback: root .planning (backward compat)
	return join(cwd, ".planning");
}

function kitPathBlock(): string {
	if (!existsSync(kitWorking)) {
		return (
			"**Kit files not found** next to this extension (unexpected after `pi install`). " +
			"Ask the user for the path to `WORKING-STYLE.md` if depth is needed."
		);
	}
	return (
		"**Kit (read when task needs full detail — not every turn):**\n" +
		`- \`${kitWorking}\` -- full working discipline\n` +
		`- \`${kitStyle}\` -- style defaults\n` +
		`- \`${kitTemplate}\` -- blank style template\n` +
		`- \`${codingConventions}\` -- extension source file conventions (ASCII-safe, TypeScript style)`
	);
}

/**
 * Minimal L0 — just failure modes, available commands, and auto-behaviors.
 * Full discipline lives in kit/WORKING-STYLE.md (read on demand).
 */
const ZANSHIN_L0 = `\
## Zanshin

Three failure modes: (1) **Cross-session statelessness** — commit decisions to files; use the repo as truth. (2) **Context compaction** — re-read files before depending on their contents. (3) **Fluent-but-wrong** — challenge significant outputs; do not fabricate.

**Commands:** \`/spar [target]\` · \`/shoshin\` · \`/checkpoint\` · \`/push <topic>\` · \`/pop\` · \`/stack\`

**Auto-behaviors:** Notifies on session start when an existing project is detected (run \`/shoshin\`). Surfaces a checkpoint reminder after ${CHECKPOINT_THRESHOLD} file writes. Stack state persists across sessions.

**Collaboration:** Shorter over longer. Cut before adding. Sharp question over long draft. Don't echo the user's phrasing as the answer.`;

export default function (pi: ExtensionAPI) {
	// ── State ──────────────────────────────────────────────────────────────────

	let stack: string[] = [];
	let changesSinceCheckpoint = 0;
	let checkpointNotified = false; // fires once per threshold crossing

	// ── Session start: restore state + auto-shoshin notify ────────────────────

	pi.on("session_start", async (event, ctx) => {
		stack = [];
		changesSinceCheckpoint = 0;
		checkpointNotified = false;

		for (const entry of ctx.sessionManager.getEntries()) {
			if (entry.type !== "custom") continue;
			if (entry.customType === "zanshin-stack") {
				stack = (entry.data as { stack: string[] }).stack ?? [];
			}
			if (entry.customType === "zanshin-changes") {
				changesSinceCheckpoint = (entry.data as { count: number }).count ?? 0;
			}
			if (entry.customType === "zanshin-checkpoint-notified") {
				checkpointNotified = (entry.data as { notified: boolean }).notified ?? false;
			}
		}

		// Guard status footer — count *-guard.ts files in extensions/ so the
		// indicator stays accurate as guards are added or removed.
		try {
			const guardCount = readdirSync(extensionDir).filter(
				(f) => f.endsWith("-guard.ts") || f.endsWith("-guard.js"),
			).length;
			const label = ctx.ui.theme.fg("dim", `🛡 ${guardCount} guards`);
			ctx.ui.setStatus("zanshin-guards", label);
		} catch {
			// Non-fatal — skip if directory read fails
		}

		if (event.reason === "startup") {
			const cpDir = resolveCheckpointDir(ctx.cwd);
			const hasScope =
				existsSync(join(ctx.cwd, ".planning", "BRIEF.md")) ||
				existsSync(join(cpDir, "whats-next.md")) ||
				existsSync(join(ctx.cwd, "BRIEF.md"));

			if (hasScope) {
				ctx.ui.notify(
					"Zanshin: existing project detected — run /shoshin before proceeding",
					"info",
				);
			}
		}
	});

	// ── System prompt: minimal L0 ─────────────────────────────────────────────

	pi.on("before_agent_start", async (event) => {
		const block = `${ZANSHIN_L0}\n\n${kitPathBlock()}`;
		return { systemPrompt: `${event.systemPrompt}\n\n${block}` };
	});

	// ── Progressive bookkeeping: track file writes ────────────────────────────

	pi.on("tool_result", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") return;
		if (event.isError) return;

		changesSinceCheckpoint++;
		pi.appendEntry("zanshin-changes", { count: changesSinceCheckpoint });

		// Fire once per threshold crossing — don't spam on every subsequent write.
		if (changesSinceCheckpoint >= CHECKPOINT_THRESHOLD && !checkpointNotified) {
			checkpointNotified = true;
			pi.appendEntry("zanshin-checkpoint-notified", { notified: true });
			ctx.ui.notify(
				"Zanshin: uncommitted changes since last checkpoint — run /checkpoint",
				"warning",
			);

			// Also check whether a project BRIEF exists for active work.
			// If not, surface a nudge alongside the checkpoint reminder.
			const cpDir = resolveCheckpointDir(ctx.cwd);
			const hasBrief = existsSync(join(cpDir, "BRIEF.md"));
			if (!hasBrief) {
				ctx.ui.notify(
					"Zanshin: no project brief found — run /brief to create one",
					"info",
				);
			}
		}
	});

	// ── Session shutdown: warn if work is in flight without a checkpoint ───────

	pi.on("session_shutdown", async (event, ctx) => {
		if (event.reason !== "quit") return;
		if (changesSinceCheckpoint === 0) return;

		const cpDir = resolveCheckpointDir(ctx.cwd);
		const hasCheckpoint = existsSync(join(cpDir, "whats-next.md"));
		if (!hasCheckpoint) {
			ctx.ui.notify(
				"Zanshin: uncommitted changes with no checkpoint — run /checkpoint next session",
				"warning",
			);
		}
	});

	// ── /spar ─────────────────────────────────────────────────────────────────

	pi.registerCommand("spar", {
		description: "Adversarial review — steel-man arguments against the current approach",
		handler: async (args, ctx) => {
			const target =
				args?.trim() || "the current approach or most recent decision";
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply Zanshin spar discipline to: ${target}.\n\n` +
					`Generate 3–5 arguments against it. For each use this structure:\n\n` +
					`**N. [Argument title]**\n` +
					`Type: Structural | Presentation | Scope | Evidence | Consistency\n` +
					`The argument: [steel-manned — strongest version, not a strawman]\n` +
					`Why it matters: [what breaks or weakens if this is valid — concrete]\n` +
					`Strength: Strong | Moderate | Weak — [one sentence]\n\n` +
					`Close with a Self-Audit:\n\n` +
					`**Self-Audit**\n` +
					`Strongest: [N] — [why this one actually matters]\n` +
					`Weakest: [N] — [why this might be contrarian pattern-matching]\n` +
					`What I might be missing: [blind spots in this review itself]\n\n` +
					`End with: "Where am I right, and where am I pattern-matching into a devil's advocate role?"`,
			);
		},
	});

	// ── /shoshin ──────────────────────────────────────────────────────────────

	pi.registerCommand("shoshin", {
		description: "Surface assumptions before proceeding",
		handler: async (args, ctx) => {
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply Zanshin shoshin. Before proceeding, pause and name what's being assumed:\n\n` +
					`- Is the problem stated correctly, or are we solving the wrong thing?\n` +
					`- Are the constraints real, or inherited from habit or prior context?\n` +
					`- Is the scope appropriate, or has it drifted?\n` +
					`- What would a beginner ask that an expert would skip?\n\n` +
					`Find the one assumption whose examination dissolves the complexity or reframes the problem. ` +
					`State it plainly: "I'm assuming X — is that still true?"`,
			);
		},
	});

	// ── /checkpoint ───────────────────────────────────────────────────────────

	pi.registerCommand("checkpoint", {
		description: "Write a Zanshin checkpoint to project-scoped whats-next.md",
		handler: async (args, ctx) => {
			await ctx.waitForIdle();

			const cpDir = resolveCheckpointDir(ctx.cwd);
			const cpFile = join(cpDir, "whats-next.md");
			const projectName = cpDir === join(ctx.cwd, ".planning")
				? "root"
				: cpDir.split("/").pop() || "root";

			// Capture HEAD now — don't ask the agent to re-query git.
			let gitHead = "unknown";
			try {
				const { stdout } = await pi.exec("bash", [
					"-c",
					"git log -1 --format='%h %s' 2>/dev/null || echo 'no commits yet'",
				]);
				gitHead = stdout.trim();
			} catch {
				gitHead = "no git repo";
			}

			const stackState =
				stack.length > 0
					? stack
							.map((t, i) =>
								i === stack.length - 1
									? `  - [open] ${t}`
									: `  - [bottom] ${t}`,
							)
							.join("\n")
					: "none";

			// Reset the counter immediately so the reminder stops firing.
			changesSinceCheckpoint = 0;
			checkpointNotified = false;
			pi.appendEntry("zanshin-changes", { count: 0 });

			pi.sendUserMessage(
				`Write a Zanshin checkpoint to \`${cpFile}\` ` +
					`(append — don't replace existing content).\n\n` +
					`Format:\n\n` +
					`# Checkpoint — <today's date>\n\n` +
					`**Project:** ${projectName}\n` +
					`**In progress:** [mid-flight item — or "none"]\n` +
					`**Just completed:** [1–3 bullets — or "nothing"]\n` +
					`**Next step:** [or "nothing"]\n` +
					`**Key decision:** [anything re-litigable — or "none"]\n` +
					`**Git:** \`${gitHead}\`\n` +
					`**Stack:** ${stackState}`,
			);
		},
	});

	// ── /push ─────────────────────────────────────────────────────────────────

	pi.registerCommand("push", {
		description: "Push a topic onto the Zanshin stack",
		handler: async (args, ctx) => {
			const topic = args?.trim();
			if (!topic) {
				ctx.ui.notify("Usage: /push <topic name>", "warning");
				return;
			}
			stack.push(topic);
			pi.appendEntry("zanshin-stack", { stack: [...stack] });
			ctx.ui.notify(
				`↓ pushed "${topic}" (stack depth ${stack.length})`,
				"info",
			);
		},
	});

	// ── /pop ──────────────────────────────────────────────────────────────────

	pi.registerCommand("pop", {
		description: "Pop current topic and return to parent",
		handler: async (args, ctx) => {
			if (stack.length === 0) {
				ctx.ui.notify("Stack is empty", "warning");
				return;
			}
			const popped = stack.pop()!;
			pi.appendEntry("zanshin-stack", { stack: [...stack] });
			const parent = stack[stack.length - 1] ?? "root";
			ctx.ui.notify(`↑ resolved "${popped}" — back to "${parent}"`, "info");
		},
	});

	// ── /stack ─────────────────────────────────────────────────────────────────

	pi.registerCommand("stack", {
		description: "Show the current Zanshin stack",
		handler: async (args, ctx) => {
			if (stack.length === 0) {
				ctx.ui.notify("Stack is empty", "info");
				return;
			}
			const lines = stack
				.map((t, i) => {
					const marker = i === stack.length - 1 ? "→" : " ";
					return `${marker} ${i + 1}. ${t}`;
				})
				.join("\n");
			ctx.ui.notify(`Stack (depth ${stack.length}):\n${lines}`, "info");
		},
	});
}
