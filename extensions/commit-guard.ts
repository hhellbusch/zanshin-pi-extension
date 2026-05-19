/**
 * commit-guard.ts
 *
 * Four pre-commit gates that fire automatically on every `git commit` bash call.
 * Together they close the loop between "model writes files" and "model commits
 * without review" — without requiring the user to remember any commands.
 *
 * ── Gate 0: Compound command check ────────────────────────────────────────────
 * Blocks `git add && git commit` to prevent empty diff check.
 *
 * ── Gate 1: Secrets scan ──────────────────────────────────────────────────────
 * Hard-blocks credentials in staged content. No confirm dialog.
 *
 * ── Gate 2: Scope & convention warnings ───────────────────────────────────────
 * Flags multi-task commits, type mismatches, and large changes. Non-blocking.
 *
 * ── Gate 3: Review loop enforcement ───────────────────────────────────────────
 * First commit attempt: shows the diff and pauses for review.
 * Subsequent attempts with the same diff: auto-pass (loop-break heuristic).
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
				const preview = line.length > 60 ? `${line.slice(0, 60)}…` : line;
				hits.push({ label, line: preview });
				break;
			}
		}
	}

	return hits;
}

// ── Diff analysis ──────────────────────────────────────────────────────────────

interface DiffStats {
	fileCount: number;
	linesAdded: number;
	linesDeleted: number;
	deletedFiles: string[];
	renamedFiles: string[];
}

function analyzeDiff(diff: string): DiffStats {
	const fileCountMatch = diff.match(/^\+{3} /gm);
	const fileCount = fileCountMatch ? fileCountMatch.length : 0;

	const linesAdded = (diff.match(/^\+[^+]/gm) || []).length;
	const linesDeleted = (diff.match(/^-[^-]/gm) || []).length;

	// Detect deleted files: +++ line followed by +++ /dev/null
	const deletedFiles: string[] = [];
	const renamedFiles: string[] = [];
	const lines = diff.split("\n");

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].match(/^\+\+\+ \/dev\/null$/)) {
			// Deleted file: look for --- a/<name> in previous lines
			for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
				const m = lines[j].match(/^--- a\/(.+)$/);
				if (m) {
					deletedFiles.push(m[1]);
					break;
				}
			}
		}
		// Detect renames: diff --git with renames
		const renameMatch = lines[i].match(/^diff --git a\/(.+) b\/(.+)$/);
		if (renameMatch) {
			const oldName = renameMatch[1];
			const newName = renameMatch[2];
			if (oldName !== newName) {
				renamedFiles.push(`${oldName} → ${newName}`);
			}
		}
	}

	return { fileCount, linesAdded, linesDeleted, deletedFiles, renamedFiles };
}

// ── Commit message analysis ────────────────────────────────────────────────────

/**
 * Extract commit message type from the bash command.
 * Handles: git commit -m "fix: foo", git commit -m "fix: foo" --amend, etc.
 */
function extractCommitType(command: string): string | null {
	// Match -m or -F option, or message after commit
	const msgMatch = command.match(/(?:-m\s+["']?|["'])(.+?)(?:["']?\s*$|\s+--)/);
	if (!msgMatch) return null;

	const msg = msgMatch[1].trim();
	const typeMatch = msg.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):/);
	if (typeMatch) return typeMatch[1];

	// Non-conventional message (no type prefix)
	return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
	// Tracks how many times each diff hash has been blocked this session.
	// First block: show the diff and instruct an immediate retry.
	// Subsequent blocks of the same hash: auto-pass (loop-break heuristic).
	// Cleared when a commit lands successfully so the next commit gets a fresh review.
	const blockedDiffHashes = new Map<string, number>();

	// ── Clear state on successful commit ─────────────────────────────────────

	pi.on("tool_result", async (event) => {
		if (!isBashToolResult(event)) return;
		if (event.isError) return;

		const command =
			(event.input as { command?: string }).command ?? "";

		if (containsGitCommit(command)) {
			blockedDiffHashes.clear();
		}
	});

	// ── Pre-commit gates ──────────────────────────────────────────────────────

	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		if (!containsGitCommit(command)) return;

		// ── Gate 0: Compound command check ────────────────────────────────────
		const GIT_ADD_RE = /\bgit\s+add\b/;
		if (GIT_ADD_RE.test(command)) {
			return {
				block: true,
				reason:
					"commit-guard: split git add and git commit into separate calls.\n\n" +
					"The guard runs before your command executes, so when git add and " +
					"git commit are combined, the staged diff is empty at check time.\n\n" +
					"Run git add first, then git commit as a separate call.",
			};
		}

		// ── Gate 1: Secrets scan ──────────────────────────────────────────────
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
					`commit-guard: potential credentials detected in staged content.\n\n` +
					`${hitLines}\n\n` +
					`Remove the credential from the staged file before committing. ` +
					`If this is a false positive (e.g. a docs example or placeholder), ` +
					`use a clearly fake value (e.g. "your-password-here") or add an inline ` +
					`comment explaining it is not a real credential.`,
			};
		}

		// ── Gate 2: Scope & convention warnings (non-blocking) ────────────────
		const stats = analyzeDiff(diff);
		const commitType = extractCommitType(command);
		const warnings: string[] = [];
		let suggestReview = false;

		// Scope: multi-task commit (5+ files or >200 lines)
		if (stats.fileCount >= 5 || stats.linesAdded + stats.linesDeleted > 200) {
			warnings.push(`Multi-task scope detected: ${stats.fileCount} file(s), ${stats.linesAdded} additions, ${stats.linesDeleted} deletions. Verify this is a single logical change.`);
			suggestReview = true;
		}

		// Convention: type mismatch with scope
		if (commitType === "fix" && (stats.linesAdded > 50 || stats.fileCount > 2)) {
			warnings.push(`fix: commit covers ${stats.fileCount} file(s) and ${stats.linesAdded} additions — fix commits should be narrow. Consider refactor: or feat: instead.`);
		}
		if (commitType === "refactor" && stats.deletedFiles.length > 0) {
			warnings.push(`refactor: commit deletes ${stats.deletedFiles.length} file(s). Consider documenting what breaks before committing.`);
		}
		if (commitType === "docs" && (stats.fileCount > 1 || stats.linesAdded > 100)) {
			warnings.push(`docs: commit is large (${stats.linesAdded} additions). Consider a single focused documentation change per commit.`);
		}

		// Deletion/rename detection
		if (stats.deletedFiles.length > 0) {
			warnings.push(`Deletion: ${stats.deletedFiles.join(", ")} removed. Verify nothing references the removed file(s).`);
		}
		if (stats.renamedFiles.length > 0) {
			warnings.push(`Rename: ${stats.renamedFiles.join(", ")}. Verify cross-references and imports are updated.`);
		}

		// Non-conventional message
		if (!commitType) {
			warnings.push("Commit message has no conventional type prefix (e.g. `feat:`, `fix:`, `refactor:`). Consider using conventional commits for clarity.");
		}

		// ── Gate 3: Review loop enforcement ───────────────────────────────────
		const diffHash = diff.length > 0 ? Buffer.from(diff.slice(0, 500)).toString("base64") : "";
		const blockCount = blockedDiffHashes.get(diffHash) ?? 0;

		if (blockCount === 0) {
			// First time seeing this diff — show it and pause for review.
			blockedDiffHashes.set(diffHash, 1);

			const diffBlock = diff.trim()
				? `\`\`\`diff\n${diff.trim()}\n\`\`\``
				: "(no staged changes — nothing to commit)";

			return {
				block: true,
				reason:
					"commit-guard: review the staged diff before committing.\n\n" +
					`${diffBlock}\n\n` +
					"Confirm:\n" +
					"1. The changes match the intended commit message\n" +
					"2. No debug code, temp hacks, or accidental file inclusions\n" +
					"3. No credentials or sensitive values\n" +
					(stats.deletedFiles.length > 0 ? `4. ${stats.deletedFiles.length} file(s) deleted — verify nothing else references them\n` : "") +
					(stats.linesAdded + stats.linesDeleted > 200 ? `5. ${stats.linesAdded} additions across ${stats.fileCount} file(s) — verify this is a single logical change\n` : "") +
					"\nIf the diff looks correct, immediately retry `git commit` — do not re-read files or re-plan.",
			};
		}

		// Second+ attempt with the same diff — auto-pass (loop-break).
		// The diff was already presented; blocking again would only cause a loop.
		blockedDiffHashes.set(diffHash, blockCount + 1);

		// ── Surface any warnings before the commit lands ──────────────────────
		if (warnings.length > 0) {
			return {
				block: false,
				reason:
					"commit-guard: diff already reviewed ✅ — warnings for awareness:\n\n" +
					warnings.map((w, i) => `${i + 1}. ${w}`).join("\n") +
					(suggestReview ? "\n\nLarge change — consider running `/review` for thorough checking." : ""),
			};
		}

	});
}
