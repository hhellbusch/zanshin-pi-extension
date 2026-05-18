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
 * Blocks the commit and embeds the full staged diff + a three-point checklist
 * directly in the block reason. The agent reads the diff in the tool result,
 * confirms the checklist, and retries. On retry the flag is set → commit lands.
 *
 * Critically: no sendUserMessage is used. The review happens entirely in the
 * agent's tool-result space — no human-visible turn is created, so there is no
 * stale-replay noise for the operator to deal with.
 *
 * The flag resets after each successful commit so every commit cycle requires
 * its own review pass.
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

const GIT_DIFF_CACHED_RE = /\bgit\s+diff\s+--cached\b/;

// Matches git commit only as a real shell command, not inside string literals,
// heredocs, or echo statements. Strategy: split the command on pipeline
// operators (&&, ||, ;, |) to isolate individual stages, then check whether
// any stage *starts with* a git-commit invocation.
//
// Alternation order in the split regex matters: || must come before | so that
// logical-or is consumed before single-pipe.
const GIT_COMMIT_STAGE_RE = /^git(?:\s+-C\s+\S+)?\s+commit\b/;
const NOT_A_COMMAND_RE = /^(?:echo|printf|cat\s|#|python\d*\s|node\s|bash\s+-c)/;

function containsGitCommit(command: string): boolean {
	const stages = command
		.split(/&&|\|\||;|\|/)
		.map((s) => s.trim())
		.filter(Boolean);
	return stages.some(
		(stage) =>
			GIT_COMMIT_STAGE_RE.test(stage) && !NOT_A_COMMAND_RE.test(stage),
	);
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
	// In-memory flag: has the model reviewed staged content since the last commit?
	// Resets to false at session start (fresh state each session).
	// Resets to false after each successful git commit.
	// Set to true when the model runs `git diff --cached` (which /review does).
	// reviewedDiffHash stores a hash of the diff at time of presentation so the
	// guard can detect if staged content changed between presentation and retry.
	let stagedReviewed = false;
	let reviewedDiffHash = "";

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

		// Reset after a successful commit — next commit cycle needs its own review.
		// This only fires on successful bash results; if a commit was blocked,
		// no tool_result fires, so the diff-hash check in Gate 2 catches changes.
		if (containsGitCommit(command)) {
			stagedReviewed = false;
			reviewedDiffHash = "";
		}
	});

	// ── Pre-commit gates ──────────────────────────────────────────────────────

	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		if (!containsGitCommit(command)) return;

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

		// ── Gate 2: Pre-commit review ───────────────────────────────────────────
		// The guard already fetched the diff for Gate 1. Embed it directly in
		// the sendUserMessage so the agent HAS to engage with the content —
		// not just run a command and immediately retry. Mark stagedReviewed
		// immediately since the diff is now in the conversation.
		const diffHash = diff.length > 0 ? Buffer.from(diff.slice(0, 500)).toString("base64") : "";
		if (!stagedReviewed || reviewedDiffHash !== diffHash) {
			stagedReviewed = true;
			reviewedDiffHash = diffHash;

			const diffBlock = diff.trim()
				? `\`\`\`diff\n${diff.trim()}\n\`\`\``
				: "(no staged changes — nothing to commit)";

			return {
				block: true,
				reason:
					"commit-guard: review the staged diff before committing.\n\n" +
					`${diffBlock}\n\n` +
					"Before retrying the commit, confirm:\n" +
					"1. The changes match the intended commit message\n" +
					"2. No debug code, temp hacks, or accidental file inclusions\n" +
					"3. No credentials or sensitive values\n\n" +
					"If everything looks correct, retry the commit.",
			};
		}

	});
}
