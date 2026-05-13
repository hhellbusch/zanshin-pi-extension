/**
 * process-guard.ts
 *
 * Intercepts bash tool calls that contain process-termination commands and
 * requires explicit user confirmation before proceeding.
 *
 * Covered: pkill, killall, kill -9, kill -SIGKILL, kill -SIGTERM targeting
 * external PIDs, fuser -k, and kill-pipelines built on lsof.
 *
 * Exception: commands that kill a PID or process the agent explicitly started
 * in the same turn are allowed through without confirmation — but detecting
 * that reliably is hard, so the guard asks unless the command is clearly
 * scoped (e.g. `kill $!` after a backgrounded subshell).
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { askGuard, blockReason } from "../lib/guard-ui.js";

/** Patterns that indicate a process-termination command. */
const KILL_PATTERNS: RegExp[] = [
	/\bpkill\b/,
	/\bkillall\b/,
	/\bkill\s+-(?:9|SIGKILL|SIGTERM|SIGHUP|s\s+SIGKILL|s\s+SIGTERM)\b/,
	/\bfuser\s+.*-k\b/,
	// lsof piped into kill (e.g. `lsof -ti:3000 | xargs kill`)
	/\blsof\b.*\|\s*xargs\s+kill\b/,
];

/**
 * Returns the matching pattern description if the command contains a
 * process-termination directive, otherwise null.
 */
function detectKillCommand(command: string): string | null {
	for (const pattern of KILL_PATTERNS) {
		if (pattern.test(command)) {
			return pattern.source;
		}
	}
	return null;
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		const match = detectKillCommand(command);
		if (!match) return;

		const preview =
			command.length > 120 ? `${command.slice(0, 120)}…` : command;

		const result = await askGuard(pi, ctx, {
			title: `process-guard: ${match}`,
			body: `This command will terminate processes:\n\n  ${preview}`,
		});

		if (!result.proceed) {
			return {
				block: true,
				reason: blockReason("process-guard", "user declined", result.feedback),
			};
		}
	});
}
