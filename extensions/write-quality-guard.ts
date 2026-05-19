/**
 * write-quality-guard.ts
 *
 * Notifies at write-time when quality conventions are missing from new files.
 * Catches issues at the moment of creation -- before they accumulate and get
 * caught in batch at commit time.
 *
 * Checks:
 *
 *   1. AI disclosure footer -- every new file under docs/ (excluding READMEs)
 *      must include the standard footer linking to AI-DISCLOSURE.md.
 *      Catches the "wrote three sections, forgot the footer" pattern.
 *
 *   2. Shell strict mode -- every new .sh / .bash file must include
 *      `set -euo pipefail`. Silent failures from missing strict mode are
 *      hard to debug after the fact.
 *
 * Both checks fire as notifications -- they don't block the write. The model
 * sees the notification and can fix the issue in the next turn before moving
 * on, or acknowledge and move on deliberately.
 *
 * Only fires on `write` (new file creation or full overwrite), not on `edit`
 * (targeted patches). Edit-time checking requires reading the full file
 * state and is handled by the /review skill.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

/**
 * Matches files under docs/ at any depth that end in .md,
 * excluding README.md files (which don't carry AI disclosure footers).
 */
function isDocsMarkdown(filePath: string): boolean {
	return /\bdocs\/.+\.md$/.test(filePath) && !filePath.endsWith("README.md");
}

function isShellScript(filePath: string): boolean {
	return /\.(sh|bash)$/.test(filePath);
}

/**
 * The disclosure footer always links to AI-DISCLOSURE.md.
 * That's a more stable signal than matching the prose text, which varies
 * between "created with AI assistance" and "reviewed by the author".
 */
function hasDisclosureFooter(content: string): boolean {
	return /AI-DISCLOSURE\.md/i.test(content);
}

/**
 * Check for bash strict mode. Accepts common variants:
 *   set -euo pipefail          (canonical)
 *   set -eu -o pipefail        (split form)
 *   set -e; set -u; ...        (separate statements)
 * At minimum, -e must be present. Notify if the content doesn't have it.
 */
function hasStrictMode(content: string): boolean {
	return /\bset\b[^\n]*-[a-z]*e/.test(content);
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("write", event)) return;

		const { path: filePath, content } = event.input;
		if (!filePath || !content) return;

		// - AI disclosure footer -
		if (isDocsMarkdown(filePath) && !hasDisclosureFooter(content)) {
			ctx.ui.notify(
				`write-quality: missing AI disclosure footer\n\n` +
					`  ${filePath}\n\n` +
					`Add the standard footer before committing:\n` +
					`  *This document was created with AI assistance (Cursor) and has not been fully ` +
					`reviewed by the author. See [AI-DISCLOSURE.md](...) for how to interpret AI-generated ` +
					`content in this workspace.*\n\n` +
					`Adjust the relative path to AI-DISCLOSURE.md based on file depth.`,
				"warning",
			);
		}

		// - Shell strict mode -
		if (isShellScript(filePath) && !hasStrictMode(content)) {
			ctx.ui.notify(
				`write-quality: missing shell strict mode\n\n` +
					`  ${filePath}\n\n` +
					`Add to the top of the script (after the shebang):\n` +
					`  set -euo pipefail\n\n` +
					`Without it, errors in pipelines and unset variables fail silently.`,
				"warning",
			);
		}
	});
}
