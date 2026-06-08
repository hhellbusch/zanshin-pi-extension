/**
 * secrets-guard.ts
 *
 * Pre-commit gate: scans staged content for credentials and blocks
 * the commit if any are found.
 *
 * This is the only remaining gate. Compound-command blocking, scope
 * warnings, and the review loop were removed because:
 *
 *   - Compound check defeated by guard's own pre-run `git add -A`
 *   - Scope/convention warnings add noise on every commit
 *   - Review loop impossible to satisfy (diff always empty when checked)
 *
 * The secrets scan has clear, reliable value — it prevents credential
 * leaks that the L0 prompt's instructions can't catch.
 *
 * Detection heuristic: runs on every `git commit` bash call.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	isBashToolResult,
	isToolCallEventType,
} from "@earendil-works/pi-coding-agent";

// -- Secrets detection ---------------------------------------------------------

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
	// PEM private keys
	{
		pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
		label: "private key (PEM block)",
	},
	// GitHub PAT format: ghp_ followed by 36 alphanumeric chars
	{
		pattern: /ghp_[a-zA-Z0-9]{36}/,
		label: "GitHub personal access token (ghp_...)",
	},
	// OpenAI API key format
	{
		pattern: /sk-[a-zA-Z0-9]{32,}/,
		label: "OpenAI API key (sk-...)",
	},
	// Slack bot token
	{
		pattern: /xoxb-[0-9]+-[0-9]+-[a-zA-Z0-9]+/,
		label: "Slack bot token (xoxb-...)",
	},
	// AWS access key IDs are 20 uppercase alphanumeric chars starting with AKIA
	{
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
		if (!line.startsWith("+") || line.startsWith("+++")) continue;

		for (const { pattern, label } of SECRETS_PATTERNS) {
			if (pattern.test(line)) {
				const preview = line.length > 60 ? `${line.slice(0, 60)}...` : line;
				hits.push({ label, line: preview });
				break;
			}
		}
	}

	return hits;
}

function containsGitCommit(command: string): boolean {
	const GIT_COMMIT_RE = /^git(?:\s+-C\s+\S+)?\s+commit\b/;
	const NOT_A_COMMAND_RE = /^(?:echo|printf|cat\s|#|python\d*\s|node\s|bash\s+-c)/;

	const stages = command
		.split(/&&|\|\||;|\|/)
		.map((s) => s.trim())
		.filter(Boolean);
	return stages.some(
		(stage) =>
			GIT_COMMIT_RE.test(stage) && !NOT_A_COMMAND_RE.test(stage),
	);
}

// -- Main export ---------------------------------------------------------------

export default function (pi: ExtensionAPI) {
	// -- Pre-commit: secrets scan ----------------------------------------------

	// Stateless now — removed the blockedDiffHashes state (review loop).

	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		if (!containsGitCommit(command)) return;

		const { stdout: diff } = await pi.exec("bash", [
			"-c",
			"git diff --cached --unified=0 || true",
		]);

		if (!diff.trim()) return;

		const hits = scanForSecrets(diff);
		if (hits.length > 0) {
			const hitLines = hits
				.map((h) => `  ❌  [${h.label}]  ${h.line}`)
				.join("\n");

			return {
				block: true,
				reason:
					`secrets-guard: potential credentials detected in staged content.\n\n` +
					`${hitLines}\n\n` +
					`Remove the credential from the staged file before committing. ` +
					`If this is a false positive (e.g. a docs example or placeholder), ` +
					`use a clearly fake value (e.g. "your-password-here") or add an inline ` +
					`comment explaining it is not a real credential.`,
			};
		}
	});
}
