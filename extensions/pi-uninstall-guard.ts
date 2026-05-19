/**
 * pi-uninstall-guard.ts
 *
 * HARD-BLOCKS `pi uninstall` commands. No confirm dialog, no exceptions.
 *
 * Uninstalling a Pi extension silently breaks guards, commands, and system
 * prompt content. The agent depends on these extensions to function -- removing
 * one can break the agent's own ability to prevent the break.
 *
 * Why this is a hard block (not confirm):
 * - The agent is the one running the command. Asking it to "confirm" a
 *   destructive action it doesn't fully understand is unreliable.
 * - After uninstall, the extension stops firing immediately. Guards stop
 *   working, commands disappear, system prompt content vanishes.
 * - There is ZERO legitimate reason for the agent to run `pi uninstall`.
 *   If a guard is broken in the runtime, the fix is always: push to remote,
 *   pull into cache, operator `/reload`.
 *
 * If the operator wants to uninstall, they do it themselves.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	isBashToolResult,
	isToolCallEventType,
} from "@earendil-works/pi-coding-agent";

// Matches `pi uninstall <something>` as a real shell command
const PI_UNINSTALL_RE =
	/^(?:pi\s+uninstall\s+)(.+)/i;

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		const uninstallMatch = PI_UNINSTALL_RE.exec(command.trim());
		if (!uninstallMatch) return;

		const target = uninstallMatch[1].trim();

		return {
			block: true,
			reason: "pi uninstall is hard-blocked. The operator must uninstall manually. " +
				"If a guard extension is broken in the runtime, the fix is: " +
				"push to remote -> pull into cache -> operator /reload. " +
				"Do not attempt to fix a stale runtime by uninstalling/reinstalling.",
		};
	});
}
