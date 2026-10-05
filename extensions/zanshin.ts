/**
 * Package layout:
 *   kit/        -- Raw markdown depth. Any tool can read these directly.
 *                 WORKING-STYLE.md is the canonical working discipline doc.
 *   extensions/ -- Pi-only. This file injects the L0 compact prompt +
 *                 absolute kit paths into the Pi system prompt via
 *                 session_start. No changes needed for Copilot users.
 *   skills/     -- AgentSkills standard (SKILL.md per command). Discovered
 *                 natively by Copilot CLI, Claude Code, and Pi. Add with:
 *                 /skills add <path-to-skills-dir>
 *
 * Distilled Zanshin L0 -- always injected. Full markdown ships in this package
 * under ../kit/ (WORKING-STYLE.md, STYLE.md, STYLE.template.md).
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	anyProjectWhatsNext,
	checkpointUserMessage,
	formatResumeGitState,
	hasPlanningScope,
	listPlanningProjects,
	parseGitResume,
	resolveCheckpointArg,
	resolveShoshinArg,
} from "../lib/planning-project.js";

const extensionDir = dirname(fileURLToPath(import.meta.url));
const kitDir = join(extensionDir, "..", "kit");
const docsDir = join(extensionDir, "..", "docs");
const kitWorking = join(kitDir, "WORKING-STYLE.md");
const kitEngineering = join(kitDir, "ENGINEERING-PRINCIPLES.md");
const kitArtifacts = join(kitDir, "AGILE-ARTIFACT-DISCIPLINE.md");
const kitStyle = join(kitDir, "STYLE.md");
const kitTemplate = join(kitDir, "STYLE.template.md");
const codingConventions = join(docsDir, "CODING-CONVENTIONS.md");

const CHECKPOINT_THRESHOLD = 5;

function isoUtcNow(): string {
	return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function kitPathBlock(): string {
	if (!existsSync(kitWorking)) {
		return (
			"**Kit files not found** next to this extension (unexpected after `pi install`). " +
			"Ask the user for the path to `WORKING-STYLE.md` if depth is needed."
		);
	}
	return (
		"**Kit (read when task needs full detail -- not every turn):**\n" +
		`- \`${kitWorking}\` -- full working discipline\n` +
		`- \`${kitEngineering}\` -- engineering principles (DRY, KISS, SRP, YAGNI, CoC, orchestration vs program)\n` +
		`- \`${kitArtifacts}\` -- artifact discipline (JBGE, TAGRI, document late)\n` +
		`- \`${kitStyle}\` -- style defaults\n` +
		`- \`${kitTemplate}\` -- blank style template\n` +
		`- \`${join(kitDir, "DESIGN-PHILOSOPHY.md")}\` -- stance map (CoC, omakase, borrowings)\n` +
		`- \`${join(kitDir, "kihon")}/\` -- fixed forms (\`/kihon <domain>\`)\n` +
		`- \`${codingConventions}\` -- extension source file conventions (ASCII-safe, TypeScript style)`
	);
}

/**
 * Minimal L0 -- just failure modes, available commands, and auto-behaviors.
 * Full discipline lives in kit/WORKING-STYLE.md (read on demand).
 */
const ZANSHIN_L0 = `\
## Zanshin

Three failure modes: (1) **Cross-session statelessness** -- commit decisions to files; use the repo as truth. (2) **Context compaction** -- re-read files before depending on their contents. (3) **Fluent-but-wrong** -- challenge significant outputs; do not fabricate.

**Commands:** \`/spar [target]\` .. \`/shoshin\` .. \`/kaeshi [goal]\` .. \`/yomi [action]\` .. \`/craft [target]\` .. \`/domain-language [term]\` .. \`/kihon <domain>\` .. \`/unslop [target]\` .. \`/checkpoint\` .. \`/push <topic>\` .. \`/pop\` .. \`/stack\`

**Auto-behaviors:** Notifies on session start when an existing project is detected (run \`/shoshin\`). Surfaces a checkpoint reminder after ${CHECKPOINT_THRESHOLD} file writes. Stack state persists across sessions.

**Collaboration:** Shorter over longer. Cut before adding. Ask a sharp question when context is incomplete — don't infer silently. No pleasantries. No filler. **Shoshin posture:** verify framing against source documents; run \`/shoshin\` for deliberate assumption-checking. **Craft posture:** KISS over clever; SRP; DRY on real divergence; prefer one house path over a toggle forest; name glue-vs-program tension in CI/Ansible; on shared defaults/policies name who inherits; run \`/craft\` for deliberate principle review. **Kihon:** fixed forms for easy pitfalls (\`/kihon <domain>\`) — not craft judgment. **Artifact discipline:** JBGE default; TAGRI before expanding docs; document what proved true.`;

export default function (pi: ExtensionAPI) {
	// - State -

	let stack: string[] = [];
	let changesSinceCheckpoint = 0;
	let checkpointNotified = false; // fires once per threshold crossing

	// - Session start: restore state + auto-shoshin notify -

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

		// Guard status footer -- count *-guard.ts files in extensions/ so the
		// indicator stays accurate as guards are added or removed.
		try {
			const guardCount = readdirSync(extensionDir).filter(
				(f) => f.endsWith("-guard.ts") || f.endsWith("-guard.js"),
			).length;
			const label = ctx.ui.theme.fg("dim", `\u{1f6e1} ${guardCount} guards`);
			ctx.ui.setStatus("zanshin-guards", label);
		} catch {
			// Non-fatal -- skip if directory read fails
		}

		if (event.reason === "startup") {
			if (hasPlanningScope(ctx.cwd)) {
				ctx.ui.notify(
					"Zanshin: existing project detected -- run /shoshin (revalidate handoff before mutating)",
					"info",
				);
			}
		}
	});

	// - System prompt: minimal L0 -

	pi.on("before_agent_start", async (event) => {
		const block = `${ZANSHIN_L0}\n\n${kitPathBlock()}`;
		return { systemPrompt: `${event.systemPrompt}\n\n${block}` };
	});

	// - Progressive bookkeeping: track file writes -

	pi.on("tool_result", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") return;
		if (event.isError) return;

		changesSinceCheckpoint++;
		pi.appendEntry("zanshin-changes", { count: changesSinceCheckpoint });

		// Fire once per threshold crossing -- don't spam on every subsequent write.
		if (changesSinceCheckpoint >= CHECKPOINT_THRESHOLD && !checkpointNotified) {
			checkpointNotified = true;
			pi.appendEntry("zanshin-checkpoint-notified", { notified: true });
			ctx.ui.notify(
				"Zanshin: uncommitted changes since last checkpoint -- run /checkpoint",
				"warning",
			);

			const projects = listPlanningProjects(ctx.cwd);
			const hasBrief =
				projects.length > 0 || existsSync(join(ctx.cwd, ".planning", "BRIEF.md"));
			if (!hasBrief) {
				ctx.ui.notify(
					"Zanshin: no project brief found -- run /brief to create one",
					"info",
				);
			}
		}
	});

	// - Session shutdown: warn if work is in flight without a checkpoint -

	pi.on("session_shutdown", async (event, ctx) => {
		if (event.reason !== "quit") return;
		if (changesSinceCheckpoint === 0) return;

		if (!anyProjectWhatsNext(ctx.cwd)) {
			ctx.ui.notify(
				"Zanshin: uncommitted changes with no checkpoint -- run /checkpoint next session",
				"warning",
			);
		}
	});

	// - /spar -

	pi.registerCommand("spar", {
		description: "Adversarial review -- steel-man arguments against the current approach",
		handler: async (args, ctx) => {
			const target =
				args?.trim() || "the current approach or most recent decision";
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply Zanshin spar discipline to: ${target}.\n\n` +
					`Generate 3--5 arguments against it. For each use this structure:\n\n` +
					`**N. [Argument title]**\n` +
					`Type: Structural | Presentation | Scope | Evidence | Consistency\n` +
					`The argument: [steel-manned -- strongest version, not a strawman]\n` +
					`Why it matters: [what breaks or weakens if this is valid -- concrete]\n` +
					`Strength: Strong | Moderate | Weak -- [one sentence]\n\n` +
					`Close with a Self-Audit:\n\n` +
					`**Self-Audit**\n` +
					`Strongest: [N] -- [why this one actually matters]\n` +
					`Weakest: [N] -- [why this might be contrarian pattern-matching]\n` +
					`What I might be missing: [blind spots in this review itself]\n\n` +
					`End with: "Where am I right, and where am I pattern-matching into a devil's advocate role?"`,
			);
		},
	});

	// - /shoshin -

	pi.registerCommand("shoshin", {
		description: "Surface assumptions collaboratively before proceeding",
		handler: async (args, ctx) => {
			const shoshinSkill = join(extensionDir, "..", "skills", "shoshin", "SKILL.md");
			const target = args?.trim();
			await ctx.waitForIdle();
			const resolved = resolveShoshinArg(ctx.cwd, target);
			let projectNote: string;
			if (resolved.status === "framing") {
				projectNote =
					`Target: ${target}\n\n` +
					"If this is a pure framing ask, skip resume revalidation. " +
					"If the session may mutate, name the project (`/shoshin <project>`) before treating a handoff as current.";
			} else if (resolved.status === "ambiguous") {
				projectNote =
					`No project argument. Briefs exist for: ${resolved.projects.join(", ")}. ` +
					"Do not revalidate a handoff. Do not prefer the newest BRIEF.md. " +
					"Ask which project before declaring any handoff current.";
			} else if (resolved.status === "missing") {
				projectNote = `Project "${resolved.name}" is not a directory under .planning/. Ask for a project name.`;
			} else {
				projectNote =
					`Project: ${resolved.name}. Revalidate \`${join(resolved.dir, "whats-next.md")}\` before mutating. ` +
					"A named project stays selected when another brief is newer.";
			}
			pi.sendUserMessage(
				`Apply shoshin. Read and follow \`${shoshinSkill}\` in full.\n\n${projectNote}`,
			);
		},
	});

	// - /kaeshi -

	pi.registerCommand("kaeshi", {
		description: "Inversion -- what would guarantee failure?",
		handler: async (args, ctx) => {
			const skill = join(extensionDir, "..", "skills", "kaeshi", "SKILL.md");
			const target = args?.trim();
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply kaeshi (inversion). Read and follow \`${skill}\` in full.\n\n` +
					(target
						? `Target / goal: ${target}`
						: "Target: the current goal, plan, or most recent decision."),
			);
		},
	});

	// - /yomi -

	pi.registerCommand("yomi", {
		description: "Second-order -- and then what?",
		handler: async (args, ctx) => {
			const skill = join(extensionDir, "..", "skills", "yomi", "SKILL.md");
			const target = args?.trim();
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply yomi (second-order / reading ahead). Read and follow \`${skill}\` in full.\n\n` +
					(target
						? `Action / change: ${target}`
						: "Target: the action or change under discussion."),
			);
		},
	});

	// - /craft -

	pi.registerCommand("craft", {
		description: "Apply engineering principles (incl. CoC, orchestration vs program)",
		handler: async (args, ctx) => {
			const craftSkill = join(extensionDir, "..", "skills", "craft", "SKILL.md");
			const target = args?.trim();
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply craft (engineering principles). Read and follow \`${craftSkill}\` in full.\n\n` +
					(target
						? `Target: ${target}`
						: "Target: pending git diff, or the code/design under discussion."),
			);
		},
	});

	// - /domain-language -

	pi.registerCommand("domain-language", {
		description: "Audit domain terms -- evidence only, do not redefine",
		handler: async (args, ctx) => {
			const skill = join(extensionDir, "..", "skills", "domain-language", "SKILL.md");
			const target = args?.trim();
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply domain-language audit. Read and follow \`${skill}\` in full.\n\n` +
					(target
						? `Term or path: ${target}`
						: "Ask which established term to audit."),
			);
		},
	});

	// - /kihon -

	pi.registerCommand("kihon", {
		description: "Basics / fixed forms -- easy pitfalls and quality signals",
		handler: async (args, ctx) => {
			const skill = join(extensionDir, "..", "skills", "kihon", "SKILL.md");
			const target = args?.trim();
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply kihon (basics / fixed forms). Read and follow \`${skill}\` in full.\n\n` +
					(target
						? `Arguments: ${target}`
						: "Ask which domain if unclear (shell, secrets, git, k8s, …). See kit/kihon/README.md."),
			);
		},
	});

	// - /unslop -

	pi.registerCommand("unslop", {
		description: "Cut AI tells from a draft",
		handler: async (args, ctx) => {
			const unslopSkill = join(extensionDir, "..", "skills", "unslop", "SKILL.md");
			const target = args?.trim();
			await ctx.waitForIdle();
			pi.sendUserMessage(
				`Apply unslop. Read and follow \`${unslopSkill}\` in full.\n\n` +
					(target
						? `Target: ${target}`
						: "Target: the most recent draft in conversation, or ask which file."),
			);
		},
	});

	// - /checkpoint -

	pi.registerCommand("checkpoint", {
		description: "Write a Zanshin checkpoint to project-scoped whats-next.md",
		handler: async (args, ctx) => {
			await ctx.waitForIdle();

			const resolved = resolveCheckpointArg(ctx.cwd, args?.trim());
			if (resolved.status === "framing") {
				pi.sendUserMessage(
					"Name a project: `/checkpoint <project>`. Do not write a handoff from a prose target.",
				);
				return;
			}
			if (resolved.status === "ambiguous") {
				pi.sendUserMessage(
					`More than one project has a BRIEF.md (${resolved.projects.join(", ")}). ` +
						"Pass `/checkpoint <project>`. Do not write a handoff, and do not pick the newest brief.",
				);
				return;
			}
			if (resolved.status === "missing") {
				pi.sendUserMessage(
					`No .planning/${resolved.name}/. Name a project directory under .planning/.`,
				);
				return;
			}

			const cpFile = join(resolved.dir, "whats-next.md");
			const checkpointSkill = join(extensionDir, "..", "skills", "checkpoint", "SKILL.md");
			let branch = "unknown";
			let hash = "unknown";
			let subject = "no git repo";
			try {
				const { stdout } = await pi.exec("bash", [
					"-c",
					"printf '%s\\0%s\\0%s' \"$(git branch --show-current)\" \"$(git rev-parse --short HEAD)\" \"$(git log -1 --format=%s)\"",
				]);
				const parsed = parseGitResume(stdout);
				branch = parsed.branch;
				hash = parsed.hash;
				subject = parsed.subject;
			} catch {
				subject = "no git repo";
			}
			const gitState = formatResumeGitState(branch, hash, isoUtcNow());

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

			changesSinceCheckpoint = 0;
			checkpointNotified = false;
			pi.appendEntry("zanshin-changes", { count: 0 });

			pi.sendUserMessage(
				checkpointUserMessage({
					cpFile,
					projectName: resolved.name,
					gitState,
					commitSubject: subject,
					stackState,
					skillPath: checkpointSkill,
				}),
			);
		},
	});

	// - /push -

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
				` v pushed "${topic}" (stack depth ${stack.length})`,
				"info",
			);
		},
	});

	// - /pop -

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
			ctx.ui.notify(` ^ resolved "${popped}" -- back to "${parent}"`, "info");
		},
	});

	// - /stack -

	pi.registerCommand("stack", {
		description: "Show the current Zanshin stack",
		handler: async (args, ctx) => {
			if (stack.length === 0) {
				ctx.ui.notify("Stack is empty", "info");
				return;
			}
			const lines = stack
				.map((t, i) => {
					const marker = i === stack.length - 1 ? "->" : " ";
					return `${marker} ${i + 1}. ${t}`;
				})
				.join("\n");
			ctx.ui.notify(`Stack (depth ${stack.length}):\n${lines}`, "info");
		},
	});
}
