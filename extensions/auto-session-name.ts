/**
 * auto-session-name.ts
 *
 * Auto-names sessions from the opening prompt, with a manual override.
 *
 * When a session starts, examines the first user message and derives a
 * short name (up to 30 chars) that appears in the session selector.
 * Works for any provider — the name is set via pi.setSessionName(), not
 * tied to any model call.
 *
 * Naming heuristic:
 *   - Extract the core action/subject from the first message
 *   - Ignore boilerplate ("help me with", "can you", etc.)
 *   - Fall back to the first non-stopword noun phrase
 *   - Cap at 30 chars for the session selector display
 *
 * Manual override: /session-name <new name> to change it at any point.
 *
 * Heuristic is simple on purpose — the goal is "not meaningless default"
 * not "perfect title". A session named "fix: parse auth token" is good
 * enough; the user can always rename.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Boilerplate phrases to strip from the beginning of a prompt
const PREFIX_PATTERNS = [
	/^(?:help\s+me\s+(?:with|by)|can\s+you\s+(?:help|do|fix|build|write)|i\s+need\s+help\s+with|i\s+need\s+to\s+|can\s+you\s+help\s+me\s+with)\s+/i,
	/^(?:please\s+)?(?:can|could|would)\s+you\s+(?:please\s+)?/i,
	/^(?:i\s+want\s+to|i\s+want\s+you\s+to|i'd\s+like\s+to|i'd\s+like\s+you\s+to)\s+/i,
	/^(?:ok|okay|alright|great|sure|perfect)\s*,?\s*/i,
	/^(?:hey|hi|hello|yo)\s*,?\s*/i,
];

function trimPrefix(text: string): string {
	let result = text.trim();
	for (const pattern of PREFIX_PATTERNS) {
		result = result.replace(pattern, "");
	}
	return result.trim();
}

function toSessionName(raw: string, maxLen = 30): string {
	const trimmed = trimPrefix(raw);
	if (!trimmed) return "Untitled session";

	// Take the first sentence (up to period, exclamation, question mark, or newline)
	let core = trimmed.match(/[^.!?]+[.!?]/)?.[0]?.trim();
	if (!core) {
		// No sentence terminator — take first line
		core = trimmed.split(/\n/)[0]?.trim() ?? trimmed;
	}

	// Stop at colons and semicolons too (usually intro text)
	const colonIdx = core.indexOf(":");
	if (colonIdx > 0 && colonIdx < core.length - 5) {
		core = core.substring(0, colonIdx).trim();
	}
	const semiIdx = core.indexOf(";");
	if (semiIdx > 0 && semiIdx < core.length - 5) {
		core = core.substring(0, semiIdx).trim();
	}

	// Take first 3–5 content words (strip articles, prepositions, conjunctions)
	const stopWords = new Set([
		"a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
		"of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
		"being", "have", "has", "had", "do", "does", "did", "will", "would",
		"could", "should", "may", "might", "this", "that", "these", "those",
		"i", "me", "my", "we", "our", "you", "your", "it", "its", "they",
		"them", "their", "so", "if", "then", "than", "about", "up", "out",
		"just", "now", "here", "there", "when", "where", "how", "why",
	]);

	const words = core.match(/[a-zA-Z0-9_]+/g)?.filter((w) => !stopWords.has(w.toLowerCase())) ?? [];
	if (words.length === 0) return core.length > maxLen ? core.slice(0, maxLen - 1) : core;

	// Take first 3 words (or fewer if short)
	const selected = words.slice(0, Math.min(3, words.length));
	let name = selected.join(" ").replace(/_/g, " ");

	// If still over the limit, truncate to the last complete word
	if (name.length > maxLen) {
		name = name.slice(0, maxLen);
		const lastSpace = name.lastIndexOf(" ");
		if (lastSpace > 5) {
			name = name.slice(0, lastSpace);
		}
	}

	return name;
}

// Track whether we've already set a session name (first prompt only)
let nameSet = false;

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (event, ctx) => {
		// Reset name-set state for new sessions
		if (event.reason === "startup") {
			nameSet = false;
		}
	});

	pi.on("before_agent_start", async (event, ctx) => {
		// Only name on the very first prompt of a session
		if (nameSet) return;

		const prompt = event.prompt ?? "";
		const name = toSessionName(prompt);
		pi.setSessionName(name);
		nameSet = true;

		return {
			message: {
				customType: "auto-session-name",
				content: `Session named: ${name}`,
				display: true,
			},
		};
	});

	// Manual override command
	pi.registerCommand("session-name", {
		description: "Set or show session name (usage: /session-name [name])",
		handler: async (args, ctx) => {
			const name = args.trim();
			if (name) {
				pi.setSessionName(name);
				ctx.ui.notify(`Session named: ${name}`, "info");
			} else {
				const current = pi.getSessionName();
				ctx.ui.notify(current ? `Session: ${current}` : "No session name set", "info");
			}
		},
	});
}
