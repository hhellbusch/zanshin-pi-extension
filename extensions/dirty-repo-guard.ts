/**
 * dirty-repo-guard.ts
 *
 * Prevents session changes (new session, resume, fork, clone) when there
 * are uncommitted git changes. Ensures work is committed before switching
 * context -- avoids losing code state to a fresh session that can't see
 * the working tree.
 *
 * Covers:
 *   - /new (new session)
 *   - /resume (switch to another session)
 *   - /fork (fork from a point)
 *   - /clone (clone at a point)
 *
 * Not blocked:
 *   - Regular tool calls and commits within the same session
 *   - /reload (session replacement)
 *   - Non-git repos (passes through)
 */
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

async function checkDirtyRepo(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	action: string,
): Promise<{ cancel: boolean } | undefined> {
	// Check for uncommitted changes
	const { stdout, code } = await pi.exec("git", ["status", "--porcelain"]);

	if (code !== 0) {
		// Not a git repo, allow the action
		return;
	}

	const hasChanges = stdout.trim().length > 0;
	if (!hasChanges) {
		return;
	}

	if (!ctx.hasUI) {
		// Non-interactive mode: block by default
		return { cancel: true };
	}

	// Count changed files for the message
	const changedFiles = stdout.trim().split("\n").filter(Boolean).length;

	const choice = await ctx.ui.select(
		`${changedFiles} uncommitted file(s). ${action} anyway?`,
		[
			"Yes, proceed anyway",
			"No, commit first",
			"No, stash first",
		],
	);

	if (choice === "No, commit first") {
		return { cancel: true };
	}

	if (choice === "No, stash first") {
		const { stdout: stashStdout, code: stashCode } = await pi.exec(
			"git",
			["stash", "push", "-m", "dirty-repo-guard"],
		);
		if (stashCode === 0) {
			ctx.ui.notify(`Stashed ${changedFiles} file(s). Proceeding with ${action}.`, "info");
			return { cancel: false };
		}
		ctx.ui.notify("Stash failed -- commit manually.", "error");
		return { cancel: true };
	}

	//// "Yes, proceed anyway" -- allow the action
	return;
}

export default function (pi: ExtensionAPI) {
	pi.on("session_before_switch", async (event, ctx) => {
		const action = event.reason === "new" ? "start a new session" : "switch session";
		return checkDirtyRepo(pi, ctx, action);
	});

	pi.on("session_before_fork", async (_event, ctx) => {
		return checkDirtyRepo(pi, ctx, "fork");
	});
}
