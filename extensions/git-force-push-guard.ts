/**
 * git-force-push-guard.ts
 *
 * Intercepts git push commands that attempt force-pushes to main/develop
 * and requires explicit user confirmation before proceeding.
 *
 * Force-pushes rewrite history that other sessions (and paude harvest cycles)
 * depend on. They break the repo as truth anchor — a fresh session fetching
 * from origin will silently discard commits it hasn't seen.
 *
 * Covered:
 *   - git push --force
 *   - git push -f
 *   - git push --force-with-lease
 *   - git push --force-with-lease=<refspec>
 *   - git push -f --follow-tags (or any combo with -f/--force)
 *
 * Not blocked:
 *   - Force-pushing to non-protected branches (feature, experiment, etc.)
 *   - Pull --rebase (safe, standard practice)
 *   - Force-push to origin from a branch (the branch itself, not main)
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { askGuard, blockReason } from "../lib/guard-ui.js";

/** Patterns that indicate a force-push to main. */
const FORCE_PUSH_PATTERNS: RegExp[] = [
	/\bgit\s+push\b[^|&;\n]*\b--force\b/,
	/\bgit\s+push\b[^|&;\n]*\b-f\b/,
];

/** Protected branches that force-push is especially dangerous for. */
const PROTECTED_BRANCHES: RegExp[] = [
	/\bmain\b/,
	/\bmaster\b/,
	/\bdevelop\b/,
	/\brelease\b/,
];

function detectForcePush(command: string): string | null {
	// Check for force-push patterns
	const hasForce = FORCE_PUSH_PATTERNS.some((p) => p.test(command));
	if (!hasForce) return null;

	// Check for protected branch targets
	const hasProtectedBranch = PROTECTED_BRANCHES.some((p) => p.test(command));
	if (hasProtectedBranch) {
		return "force-push to protected branch (main/master/develop/release)";
	}

	// If force-push but not clearly targeting main, flag but with lower severity
	return "force-push (may rewrite shared history)";
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		const match = detectForcePush(command);
		if (!match) return;

		const preview =
			command.length > 120 ? `${command.slice(0, 120)}…` : command;

		const result = await askGuard(pi, ctx, {
			title: `git-force-push-guard: ${match}`,
			body: `This command rewrites shared history:\n\n  ${preview}\n\nThis can break cross-session state for other users or harvest cycles.`,
		});

		if (!result.proceed) {
			return {
				block: true,
				reason: blockReason(
					"git-force-push-guard",
					"user declined",
					result.feedback,
				),
			};
		}
	});
}
