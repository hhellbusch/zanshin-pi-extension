/**
 * guard-ui.ts
 *
 * Shared interaction utility for guard extensions.
 *
 * Provides askGuard() — a consistent dialog pattern that replaces bare
 * ctx.ui.confirm() calls across risky-ops-guard, process-guard,
 * git-force-push-guard, url-commit-guard, relative-link-guard, and
 * commit-guard.
 *
 * Two key additions over a plain confirm:
 *
 *   "Proceed — add context"  (yes, and)
 *     User can annotate what they want the model to do additionally.
 *     The feedback is injected as a user message so the model sees it
 *     immediately after the tool result. Useful for: "yes delete it,
 *     and update the README to remove references."
 *
 *   "Cancel — explain why"  (no, with feedback)
 *     User can explain why they're cancelling. The feedback appears in
 *     the block reason so the model understands intent and can adjust.
 *     Useful for: "wrong target — that's src/, not build/."
 *
 * This turns guard interruptions into a two-way communication channel
 * rather than a dead-end yes/no gate.
 */
import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";

export interface GuardDecision {
	/** Whether to allow the intercepted action to proceed. */
	proceed: boolean;
	/** Free-text feedback provided by the user, if any. */
	feedback?: string;
}

export interface AskGuardOptions {
	/** Short title shown at the top of the dialog (guard name + what triggered it). */
	title: string;
	/** Body text describing the flagged action and why it was intercepted. */
	body: string;
	/**
	 * What to do when there is no UI (non-interactive / headless mode).
	 * Default: "block" — safest default for destructive operations.
	 * Use "allow" for guards where blocking without UI would be too disruptive.
	 */
	nonInteractiveDefault?: "block" | "allow";
	/**
	 * Whether to offer "Proceed — add context" (yes, and).
	 * Default: true. Set false for guards where yes+context doesn't
	 * make semantic sense (e.g. commit-guard review enforcement, where
	 * the question is about process compliance, not side effects).
	 */
	enableYesAnd?: boolean;
}

/**
 * Show a guard dialog and return the user's decision.
 *
 * If the user chooses "Proceed — add context", their feedback is injected
 * as a user message via pi.sendUserMessage() before this function returns,
 * so the model will see it in the next turn.
 *
 * If the user chooses "Cancel — explain why", their feedback is returned
 * in GuardDecision.feedback for the caller to include in the block reason.
 */
export async function askGuard(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	opts: AskGuardOptions,
): Promise<GuardDecision> {
	const {
		title,
		body,
		nonInteractiveDefault = "block",
		enableYesAnd = true,
	} = opts;

	// No UI — apply the configured default immediately
	if (!ctx.hasUI) {
		return { proceed: nonInteractiveDefault === "allow" };
	}

	const options = enableYesAnd
		? [
				"Proceed",
				"Proceed — add context",
				"Cancel",
				"Cancel — explain why",
			]
		: ["Proceed", "Cancel", "Cancel — explain why"];

	const choice = await ctx.ui.select(`${title}\n\n${body}`, options);

	// Escape or null → treat as cancel
	if (!choice || choice === "Cancel") {
		return { proceed: false };
	}

	if (choice === "Proceed") {
		return { proceed: true };
	}

	if (choice === "Proceed — add context") {
		const feedback = await ctx.ui.input(
			"Add context for the model:",
			"e.g. also update the README after deleting this",
		);
		if (feedback?.trim()) {
			// Inject as a user message — the model sees it after the tool result
			pi.sendUserMessage(
				`[User context on last action]: ${feedback.trim()}`,
			);
		}
		return { proceed: true, feedback: feedback?.trim() || undefined };
	}

	// "Cancel — explain why"
	const feedback = await ctx.ui.input(
		"Why are you cancelling?",
		"e.g. wrong target — should be build/ not src/",
	);
	return { proceed: false, feedback: feedback?.trim() || undefined };
}

/**
 * Build a block reason string that includes optional user feedback.
 * Keeps block reason formatting consistent across all guards.
 */
/**
 * No-op default export — required by Pi's extension loader, which loads
 * every .ts file in extensions/ as an extension. This file is a shared
 * utility module; its behavior is provided via named exports consumed by
 * the individual guard extensions.
 */
export default function (_pi: ExtensionAPI) {
	// utility module — no extension behavior
}

export function blockReason(
	guardName: string,
	reason: string,
	feedback?: string,
): string {
	const base = `${guardName}: ${reason}`;
	if (!feedback) return base;
	return `${base}\n\nUser feedback: ${feedback}`;
}
