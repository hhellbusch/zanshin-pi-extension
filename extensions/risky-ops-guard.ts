/**
 * risky-ops-guard.ts
 *
 * Intercepts bash tool calls that contain destructive file-system operations
 * and requires explicit user confirmation before proceeding.
 *
 * Covered:
 *   - rm -rf / rm -fr / rm -r -f / rm --recursive --force (any target)
 *   - rm -r (recursive without force — still destructive)
 *   - chmod -R (recursive permission change)
 *   - chmod 777 / chmod 666 (world-writable grants)
 *   - shred (secure file erasure)
 *   - dd writing to a block device (dd of=/dev/...)
 *   - mkfs (filesystem formatting)
 *   - truncate -s 0 (zero out a file)
 *
 * Not covered (intentionally left to the operator):
 *   - Plain `rm <file>` — single-file removal, low blast radius.
 *   - `> file` shell redirects — too noisy to intercept at this layer.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { askGuard, blockReason } from "../lib/guard-ui.js";

interface RiskyPattern {
	pattern: RegExp;
	label: string;
}

const RISKY_PATTERNS: RiskyPattern[] = [
	{
		// rm -rf, rm -fr, rm -r -f, rm --recursive --force, rm -rf -- <path>, etc.
		pattern: /\brm\b(?=\s)(?:[^|&;\n]*?\s)(?:-[^\s]*f[^\s]*r[^\s]*|-[^\s]*r[^\s]*f[^\s]*|--recursive\b[^|&;\n]*--force\b|--force\b[^|&;\n]*--recursive\b)/,
		label: "rm -rf (recursive force delete)",
	},
	{
		// rm -r without -f is still destructive
		pattern: /\brm\s+(?:-[^\s]*r[^\s]*\s|--recursive\b)/,
		label: "rm -r (recursive delete)",
	},
	{
		// chmod -R (any recursive permission change)
		pattern: /\bchmod\s+(?:-[^\s]*R[^\s]*\s|--recursive\b)/,
		label: "chmod -R (recursive permission change)",
	},
	{
		// chmod where the "other" (last) octal digit has write bit set: 2,3,6,7
		// Matches 3-digit (755) and 4-digit (0755) modes.
		pattern: /\bchmod\s+(?:[0-7])?[0-7][0-7][2367]\b/,
		label: "chmod world-writable (other write bit set)",
	},
	{
		pattern: /\bshred\b/,
		label: "shred (secure erase)",
	},
	{
		// dd writing to a block device
		pattern: /\bdd\b(?=\s)[^|&;\n]*\bof=\/dev\//,
		label: "dd writing to block device",
	},
	{
		pattern: /\bmkfs\b/,
		label: "mkfs (filesystem format)",
	},
	{
		// truncate -s 0 <file>
		pattern: /\btruncate\b(?=\s)[^|&;\n]*\s-s\s+0\b/,
		label: "truncate -s 0 (zero out file)",
	},
];

function detectRiskyOp(command: string): string | null {
	for (const { pattern, label } of RISKY_PATTERNS) {
		if (pattern.test(command)) {
			return label;
		}
	}
	return null;
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		const match = detectRiskyOp(command);
		if (!match) return;

		const preview =
			command.length > 120 ? `${command.slice(0, 120)}…` : command;

		const result = await askGuard(pi, ctx, {
			title: `risky-ops-guard: ${match}`,
			body: `This command may cause irreversible data loss:\n\n  ${preview}`,
		});

		if (!result.proceed) {
			return {
				block: true,
				reason: blockReason(
					"risky-ops-guard",
					`user declined (${match})`,
					result.feedback,
				),
			};
		}
	});
}
