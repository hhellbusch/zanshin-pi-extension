/**
 * commit-guard.ts
 *
 * Two pre-commit gates that fire automatically on every `git commit` bash call.
 * Together they close the loop between "model writes files" and "model commits
 * without review" — without requiring the user to remember any commands.
 *
 * ── Gate 1: Secrets scan ──────────────────────────────────────────────────────
 *
 * Scans staged content for credential patterns (passwords, API keys, private
 * keys, tokens) before the commit executes. Hard blocks if any are found — no
 * confirm dialog. Credentials in git history are permanent problems.
 *
 * Only scans new lines in the diff (+ prefix). Skips diff file headers (+++)
 * and context lines. Checks all staged files, not just markdown.
 *
 * ── Gate 2: Review loop enforcement ──────────────────────────────────────────
 *
 * Tracks whether staged content has been reviewed in the current commit cycle.
 * "Reviewed" means: a bash command containing `git diff --cached` completed
 * successfully. This is the command /review runs, so running /review counts.
 *
 * If staged content hasn't been reviewed before a commit:
 *   → Block the commit with a clear reason ("run /review first")
 *   → The model reads the reason, runs /review, and retries the commit
 *   → On retry, the flag is set → commit proceeds
 *
 * The flag resets after each successful commit so every commit cycle requires
 * its own review pass. This makes the review loop automatic — the user doesn't
 * have to remember to run /review; the model handles it when blocked.
 *
 * Non-interactive mode (no UI): both gates still run. The secrets gate always
 * hard-blocks. The review gate also hard-blocks in non-interactive mode (no
 * confirm available — treat unreviewed commits as unsafe).
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	isBashToolResult,
	isToolCallEventType,
} from "@earendil-works/pi-coding-agent";

// ── Secrets detection ──────────────────────────────────────────────────────────

interface SecretsPattern {
	pattern: RegExp;
	label: string;
}

/**
 * Patterns that indicate credential material in staged content.
 * Tuned to minimize false positives in infrastructure and config files.
 * All patterns require a non-trivial value (not placeholder strings like
 * "your-password-here" or empty quotes).
 */
const SECRETS_PATTERNS: SecretsPattern[] = [
	{
		// password: "realvalue" or password=realvalue (8+ chars, not a placeholder)
		pattern: /\bpassword\s*[:=]\s*["']?(?!your[-_]|changeme|placeholder|example)[^\s"'\n]{8,}/i,
		label: "password",
	},
	{
		pattern: /\bapi[_-]?key\s*[:=]\s*["']?(?!your[-_]|changeme|placeholder)[^\s"'\n]{10,}/i,
		label: "API key",
	},
	{
		pattern: /\bsecret[_-]?(?:key|access)\s*[:=]\s*["']?(?!your[-_]|changeme|placeholder)[^\s"'\n]{10,}/i,
		label: "secret key",
	},
	{
		pattern: /\baccess[_-]?token\s*[:=]\s*["']?(?!your[-_]|changeme|placeholder)[^\s"'\n]{10,}/i,
		label: "access token",
	},
	{
		// PEM private keys
		pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
		label: "private key (PEM block)",
	},
	{
		// GitHub PAT format: ghp_ followed by 36 alphanumeric chars
		pattern: /ghp_[a-zA-Z0-9]{36}/,
		label: "GitHub personal access token (ghp_...)",
	},
	{
		// OpenAI API key format
		pattern: /sk-[a-zA-Z0-9]{32,}/,
		label: "OpenAI API key (sk-...)",
	},
	{
		// Slack bot token
		pattern: /xoxb-[0-9]+-[0-9]+-[a-zA-Z0-9]+/,
		label: "Slack bot token (xoxb-...)",
	},
	{
		// AWS access key IDs are 20 uppercase alphanumeric chars starting with AKIA
		pattern: /AKIA[0-9A-Z]{16}/,
		label: "AWS access key ID (AKIA...)",
	},
];

interface SecretsHit {
	label: string;
	line: string;
}

function scanForSecrets(diff: string): SecretsHit[] {
	const hits: SecretsHit[] = [];

	for (const line of diff.split("\n")) {
		// Only scan new content lines — skip context and file headers
		if (!line.startsWith("+") || line.startsWith("+++")) continue;

		for (const { pattern, label } of SECRETS_PATTERNS) {
			if (pattern.test(line)) {
				// Redact the line for display: show first 60 chars
				const preview = line.length > 60 ? `${line.slice(0, 60)}…` : line;
				hits.push({ label, line: preview });
				break; // One label per line is enough
			}
		}
	}

	return hits;
}

// ── Review tracking ───────────────────────────────────────────────────────────

const GIT_COMMIT_RE = /\bgit\s+commit\b/;
const GIT_DIFF_CACHED_RE = /\bgit\s+diff\s+--cached\b/;

// ── Main export ───────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
	// In-memory flag: has the model reviewed staged content since the last commit?
	// Resets to false at session start (fresh state each session).
	// Resets to false after each successful git commit.
	// Set to true when the model runs `git diff --cached` (which /review does).
	let stagedReviewed = false;

	// ── Track review state via tool_result ───────────────────────────────────

	pi.on("tool_result", async (event) => {
		if (!isBashToolResult(event)) return;
		if (event.isError) return;

		const command =
			(event.input as { command?: string }).command ?? "";

		// Mark reviewed when model explicitly inspects staged content
		if (GIT_DIFF_CACHED_RE.test(command)) {
			stagedReviewed = true;
		}

		// Reset after a successful commit — next commit cycle needs its own review
		if (GIT_COMMIT_RE.test(command)) {
			stagedReviewed = false;
		}
	});

	// ── Pre-commit gates ──────────────────────────────────────────────────────

	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		if (!GIT_COMMIT_RE.test(command)) return;

		// ── Gate 1: Secrets scan ─────────────────────────────────────────────
		// Get staged diff for all files (not just markdown — secrets can be anywhere)
		const { stdout: diff } = await pi.exec("bash", [
			"-c",
			"git diff --cached --unified=0 || true",
		]);

		if (diff) {
			const hits = scanForSecrets(diff);
			if (hits.length > 0) {
				const hitLines = hits
					.map((h) => `  ❌  [${h.label}]  ${h.line}`)
					.join("\n");

				// Hard block — no confirm. Credentials in git history are permanent.
				return {
					block: true,
					reason:
						`commit-guard: potential credentials detected in staged content.\n\n` +
						`${hitLines}\n\n` +
						`Remove the credential from the staged file before committing. ` +
						`If this is a false positive (e.g. a docs example or placeholder), ` +
						`use a clearly fake value (e.g. "your-password-here") or add an inline ` +
						`comment explaining it is not a real credential.`,
				};
			}
		}

		// ── Gate 2: Review loop ──────────────────────────────────────────────
		if (!stagedReviewed) {
			const result = await askGuard(pi, ctx, {
				title: "commit-guard: staged changes not yet reviewed",
				body:
					"Run /review to inspect staged changes before committing. " +
					"/review runs `git diff --cached` and surfaces issues. " +
					"After /review completes, the commit will proceed automatically.",
				nonInteractiveDefault: "block",
				enableYesAnd: false,
			});

			if (!result.proceed) {
				return {
					block: true,
					reason: blockReason(
						"commit-guard",
						"run /review to inspect staged changes, then retry the commit",
						result.feedback,
					),
				};
			}

			// User explicitly chose to proceed without review — allow but notify
			ctx.ui.notify(
				"commit-guard: proceeding without review (user override)",
				"warning",
			);
		}
	});
}
