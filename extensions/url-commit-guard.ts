/**
 * url-commit-guard.ts
 *
 * Before git commit: scans staged markdown files for newly added URLs,
 * fetches each to verify it resolves, and warns (with confirmation required)
 * if any are broken.
 *
 * Motivation: LLMs fabricate plausible-looking URLs. The fluency of the output
 * is no indication that the URL is real. Catching hallucinated or stale links
 * before they enter the commit history is cheaper than finding them later.
 *
 * URL categorization:
 *   ✅  HTTP 200–399   — verified, commit proceeds silently
 *   ❌  HTTP 404 / 410 — broken link; user must confirm before commit proceeds
 *   ⚠️  curl error /
 *       HTTP 000       — unverifiable (proxy block, timeout, no egress route);
 *                        warns but does not block — limited egress is expected
 *                        in paude containers
 *   ⚠️  HTTP 403/5xx  — ambiguous (real 403 vs proxy block); treated as
 *                        unverifiable, not broken
 *
 * Scope:
 *   - Only staged content is checked (git diff --cached)
 *   - Only new lines (diff + prefix) are scanned — unchanged URLs in
 *     modified files are not re-checked
 *   - Only .md files are scanned
 *   - URLs found in diff file headers (+++ lines) are skipped
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { askGuard, blockReason } from "../lib/guard-ui.js";

/** Matches any bash command that includes `git commit`. */
const GIT_COMMIT_RE = /\bgit\s+commit\b/;

/** Loose URL pattern — we trim trailing punctuation after matching. */
const URL_RE = /https?:\/\/[^\s\)\>\"\'\`\]\[]+/g;

/**
 * Strip trailing characters that are valid markdown syntax but not
 * part of a URL (e.g. closing paren after a link, trailing period).
 */
function cleanUrl(raw: string): string {
	return raw.replace(/[.,;:!?)\]>'"]+$/, "");
}

/**
 * Get the unified diff of staged .md files.
 * Returns empty string if no markdown files are staged.
 */
async function getStagedMarkdownDiff(pi: ExtensionAPI): Promise<string> {
	const { stdout: names, code } = await pi.exec("bash", [
		"-c",
		"git diff --cached --name-only | grep '\\.md$' || true",
	]);

	if (code !== 0 || !names.trim()) return "";

	const files = names.trim().split("\n").filter(Boolean);
	const fileArgs = files
		.map((f) => `"${f.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
		.join(" ");

	const { stdout: diff } = await pi.exec("bash", [
		"-c",
		`git diff --cached --unified=0 -- ${fileArgs}`,
	]);

	return diff ?? "";
}

/**
 * Extract URLs from diff output.
 * Only looks at lines that start with `+` but not `+++` (file header).
 * Deduplicates the result.
 */
function extractNewUrls(diff: string): string[] {
	const urls = new Set<string>();

	for (const line of diff.split("\n")) {
		if (!line.startsWith("+") || line.startsWith("+++")) continue;

		const matches = line.match(URL_RE) ?? [];
		for (const raw of matches) {
			const url = cleanUrl(raw);
			if (url.startsWith("http") && url.length > 10) {
				urls.add(url);
			}
		}
	}

	return [...urls];
}

type UrlResult =
	| { status: "ok"; httpCode: number }
	| { status: "broken"; httpCode: number }
	| { status: "unverifiable"; reason: string };

/**
 * Fetch a URL via curl and classify the result.
 * Follows redirects. 8 second timeout.
 * Runs through the system proxy (https_proxy env var) automatically.
 */
async function checkUrl(pi: ExtensionAPI, url: string): Promise<UrlResult> {
	const escaped = url.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	const { stdout, code } = await pi.exec(
		"bash",
		["-c", `curl -s -L --max-time 8 -o /dev/null -w "%{http_code}" "${escaped}"`],
		{ timeout: 12000 },
	);

	if (code !== 0) {
		return { status: "unverifiable", reason: `curl exited ${code}` };
	}

	const httpCode = parseInt(stdout.trim(), 10);

	if (isNaN(httpCode) || httpCode === 0) {
		// CONNECT-level failure: proxy block or no route to host
		return {
			status: "unverifiable",
			reason: "connection failed (proxy block or no egress route)",
		};
	}

	if (httpCode >= 200 && httpCode < 400) {
		return { status: "ok", httpCode };
	}

	if (httpCode === 404 || httpCode === 410) {
		return { status: "broken", httpCode };
	}

	// 403 (real or proxy), 5xx, other — ambiguous, don't block
	return { status: "unverifiable", reason: `HTTP ${httpCode}` };
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		if (!GIT_COMMIT_RE.test(command)) return;

		// ── Gather staged markdown diff ───────────────────────────────────────
		const diff = await getStagedMarkdownDiff(pi);
		if (!diff) return;

		const urls = extractNewUrls(diff);
		if (urls.length === 0) return;

		ctx.ui.notify(
			`url-commit-guard: checking ${urls.length} URL(s) in staged markdown…`,
			"info",
		);

		// ── Check all URLs in parallel ─────────────────────────────────────────
		const checks = await Promise.all(
			urls.map(async (url) => ({ url, result: await checkUrl(pi, url) })),
		);

		const ok = checks.filter((c) => c.result.status === "ok");
		const broken = checks.filter((c) => c.result.status === "broken");
		const unverifiable = checks.filter(
			(c) => c.result.status === "unverifiable",
		);

		// ── Build report ───────────────────────────────────────────────────────
		const lines: string[] = [];
		for (const { url, result } of ok) {
			lines.push(
				`  ✅  ${url}  (${(result as { status: "ok"; httpCode: number }).httpCode})`,
			);
		}
		for (const { url, result } of unverifiable) {
			lines.push(
				`  ⚠️   ${url}  — ${(result as { status: "unverifiable"; reason: string }).reason}`,
			);
		}
		for (const { url, result } of broken) {
			lines.push(
				`  ❌  ${url}  (${(result as { status: "broken"; httpCode: number }).httpCode})`,
			);
		}

		const summary = `${ok.length} verified  /  ${broken.length} broken  /  ${unverifiable.length} unverifiable\n\n${lines.join("\n")}`;

		// ── All clear ──────────────────────────────────────────────────────────
		if (broken.length === 0 && unverifiable.length === 0) {
			ctx.ui.notify(
				`url-commit-guard: all ${ok.length} URL(s) verified ✅`,
				"info",
			);
			return;
		}

		// ── Broken URLs — require explicit confirmation ─────────────────────────
		if (broken.length > 0) {
			const result = await askGuard(pi, ctx, {
				title: `url-commit-guard: ${broken.length} broken URL(s)`,
				body: `${summary}\n\nBroken URLs are likely hallucinated or stale. Proceed only if you are certain they are correct.`,
				nonInteractiveDefault: "block",
				enableYesAnd: false,
			});

			if (!result.proceed) {
				// Build a detailed block reason the model can act on directly
				const brokenList = broken
					.map(
						({ url, result: r }) =>
							`  ❌ ${(r as { httpCode: number }).httpCode}  ${url}`,
					)
					.join("\n");

				const has404 = broken.some(
					({ result: r }) =>
						(r as { httpCode: number }).httpCode === 404,
				);
				const guidance404 = has404
					? "\nFor 404s: verify the path actually exists — browse the repository or site rather than guessing the URL structure."
					: "";

				return {
					block: true,
					reason: blockReason(
						"url-commit-guard",
						`broken URLs in staged markdown:\n${brokenList}${guidance404}\nAfter fixing: re-run \`git add\` on the affected file before retrying the commit.`,
						result.feedback,
					),
				};
			}

			return; // user confirmed — allow commit
		}

		// ── Only unverifiable — warn but allow ─────────────────────────────────
		// These are typically proxy blocks or timeouts, not hallucinations.
		ctx.ui.notify(
			`url-commit-guard: ${unverifiable.length} URL(s) could not be verified — review manually\n\n${summary}`,
			"warning",
		);
	});
}
