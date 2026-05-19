/**
 * relative-link-guard.ts
 *
 * Before git commit: scans staged markdown files for newly added relative
 * links and verifies each target path exists on disk.
 *
 * Motivation: LLMs generate relative links based on assumed repository
 * structure that may not match reality. The link looks correct in prose
 * but resolves to nothing -- discovered only when someone follows it.
 * This is distinct from the hallucinated-URL problem (url-commit-guard
 * handles external https:// links); this catches broken internal links.
 *
 * What counts as a relative link:
 *   [text](path/to/file.md)          <- implicit relative (no scheme)
 *   [text](./path/to/file.md)        <- explicit relative
 *   [text](../path/to/file.md)       <- parent traversal
 *   [text](path/to/file.md#section)  <- fragment stripped, file checked
 *
 * Not checked (handled elsewhere or out of scope):
 *   [text](https://example.com)      <- external (url-commit-guard)
 *   [text](#section)                 <- fragment-only, no file target
 *   [text](mailto:foo@example.com)   <- email
 *
 * Scope:
 *   - Only staged content is checked (git diff --cached)
 *   - Only new lines (diff + prefix) are scanned -- pre-existing broken
 *     links in unmodified sections are not re-checked
 *   - Only .md files are scanned
 *   - Files under research\/\*\/sources\/ are skipped -- scraped content
 *     contains web-relative URLs that are relative to the source domain
 *   - Lines inside fenced code blocks (``` or ~~~) are skipped
 *   - Link targets are resolved relative to the file containing them,
 *     against the repo root on disk (working tree includes staged files)
 *
 * Blocking behavior:
 *   - Broken links -> confirm dialog (not a hard block)
 *   - User can proceed if the target will be created in a separate step
 *   - Non-interactive mode: hard block (unresolvable links are unsafe)
 */
import { dirname, resolve } from "node:path";
import { existsSync } from "node:fs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { askGuard, blockReason } from "../lib/guard-ui.js";

const GIT_COMMIT_RE = /\bgit\s+commit\b/;

/**
 * Matches markdown links: [text](target) or [text](target#fragment).
 * Capture group 1 = target (the part inside parens, before any #).
 * Image links ![alt](src) are also captured -- broken image paths matter too.
 */
const LINK_RE = /!?\[[^\]]*\]\(([^)]+)\)/g;

/** Matches fenced code block delimiters (``` or ~~~, any length >= 3). */
const FENCE_RE = /^(`{3,}|~{3,})/;

/** Matches research source directories containing scraped web content. */
const RESEARCH_SOURCES_RE = /^research\/[^/]+\/sources\//;

/**
 * Parse the staged markdown diff into a flat list of relative links,
 * each tagged with the repo-relative file path they came from.
 *
 * Diff format:
 *   diff --git a/path b/path
 *   --- a/path
 *   +++ b/path         <- current file
 *   @@ ... @@
 *   +new line content  <- new line (check links here)
 *    context line      <- skip
 *   -removed line      <- skip
 */
function extractNewRelativeLinks(
	diff: string,
): Array<{ file: string; rawLink: string }> {
	const results: Array<{ file: string; rawLink: string }> = [];
	let currentFile = "";
	let inFence = false;

	for (const line of diff.split("\n")) {
		// Track which file we're in from the +++ header
		if (line.startsWith("+++ b/")) {
			currentFile = line.slice(6).trim();
			inFence = false; // reset fence state at each file boundary
			continue;
		}

		// Only process .md files
		if (!currentFile.endsWith(".md")) continue;

		// Skip research source directories -- scraped content has web-relative
		// URLs (e.g. /en/products, page.html) relative to the source domain.
		if (RESEARCH_SOURCES_RE.test(currentFile)) continue;

		// Track code fence state across ALL diff lines (context, added, removed)
		// so we correctly detect blocks that span pre-existing and new lines.
		// Strip the single-char diff prefix (+/-/space) before testing.
		const lineContent =
			line.length > 0 &&
			(line[0] === "+" || line[0] === "-" || line[0] === " ")
				? line.slice(1)
				: line;
		if (FENCE_RE.test(lineContent)) {
			inFence = !inFence;
		}

		// Only process new lines -- not context, not deletions, not headers
		if (!line.startsWith("+") || line.startsWith("+++")) continue;

		// Skip lines inside fenced code blocks
		if (inFence) continue;

		// Extract all markdown links from this new line
		let match: RegExpExecArray | null;
		LINK_RE.lastIndex = 0;
		while ((match = LINK_RE.exec(line)) !== null) {
			const raw = match[1].trim();

			// Strip fragment (#section) -- we only check the file target
			const withoutFragment = raw.split("#")[0].trim();

			// Skip if nothing remains after stripping fragment (fragment-only link)
			if (!withoutFragment) continue;

			// Skip external links (url-commit-guard handles these)
			if (/^https?:\/\//i.test(withoutFragment)) continue;

			// Skip mailto and other schemes
			if (/^[a-z][a-z0-9+\-.]*:/i.test(withoutFragment)) continue;

			results.push({ file: currentFile, rawLink: withoutFragment });
		}
	}

	return results;
}

interface LinkCheckResult {
	file: string;
	rawLink: string;
	resolvedPath: string;
	exists: boolean;
}

/**
 * Resolve each relative link against its containing file's directory
 * and check whether the target exists in the working tree.
 */
function checkLinks(
	repoRoot: string,
	links: Array<{ file: string; rawLink: string }>,
): LinkCheckResult[] {
	return links.map(({ file, rawLink }) => {
		const fileDir = dirname(resolve(repoRoot, file));
		const resolvedPath = resolve(fileDir, rawLink);
		return {
			file,
			rawLink,
			resolvedPath,
			exists: existsSync(resolvedPath),
		};
	});
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		if (!GIT_COMMIT_RE.test(command)) return;

		// - Get repo root -
		const { stdout: rootRaw, code: rootCode } = await pi.exec("git", [
			"rev-parse",
			"--show-toplevel",
		]);
		if (rootCode !== 0 || !rootRaw.trim()) return;
		const repoRoot = rootRaw.trim();

		// - Get staged markdown diff -
		const { stdout: diff } = await pi.exec("bash", [
			"-c",
			"git diff --cached --unified=0 -- '*.md' || true",
		]);
		if (!diff) return;

		// - Extract and check relative links -
		const links = extractNewRelativeLinks(diff);
		if (links.length === 0) return;

		// Deduplicate by file+link (same link added in multiple hunks)
		const seen = new Set<string>();
		const uniqueLinks = links.filter(({ file, rawLink }) => {
			const key = `${file}::${rawLink}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		const results = checkLinks(repoRoot, uniqueLinks);
		const broken = results.filter((r) => !r.exists);
		const ok = results.filter((r) => r.exists);

		// - All clear -
		if (broken.length === 0) {
			if (ok.length > 0) {
				ctx.ui.notify(
					`relative-link-guard: ${ok.length} relative link(s) verified \u2705`,
					"info",
				);
			}
			return;
		}

		// - Build report -
		const lines: string[] = [];
		for (const r of ok) {
			lines.push(`  \u2705  [${r.file}] -> ${r.rawLink}`);
		}
		for (const r of broken) {
			// Show both the raw link (as written) and the resolved path (what was checked)
			// so the author can see both what was written and where it looked
			const relResolved = r.resolvedPath.startsWith(repoRoot)
				? r.resolvedPath.slice(repoRoot.length + 1)
				: r.resolvedPath;
			lines.push(
				`  \u274c  [${r.file}] -> ${r.rawLink}\n       resolved: ${relResolved}`,
			);
		}

		const summary = [
			`${ok.length} resolved  /  ${broken.length} broken`,
			"",
			lines.join("\n"),
		].join("\n");

		// - Block or confirm -
		const result = await askGuard(pi, ctx, {
			title: `relative-link-guard: ${broken.length} broken relative link(s)`,
			body:
				`${summary}\n\nBroken links will not resolve for readers. ` +
				`Proceed only if the target file will be created in a separate commit.`,
			nonInteractiveDefault: "block",
			enableYesAnd: false,
		});

		if (!result.proceed) {
			return {
				block: true,
				reason: blockReason(
					"relative-link-guard",
					"broken relative link(s) in staged markdown",
					result.feedback,
				),
			};
		}
	});
}
