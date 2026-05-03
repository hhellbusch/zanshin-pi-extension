import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Distilled Zanshin L0 — always injected. Full markdown ships in this package
 * under ../kit/ (WORKING-STYLE.md, STYLE.md, STYLE.template.md).
 */
const extensionDir = dirname(fileURLToPath(import.meta.url));
const kitDir = join(extensionDir, "..", "kit");
const kitWorking = join(kitDir, "WORKING-STYLE.md");
const kitStyle = join(kitDir, "STYLE.md");
const kitTemplate = join(kitDir, "STYLE.template.md");

function kitPathBlock(): string {
	if (!existsSync(kitWorking)) {
		return (
			"**Depth on demand:** Bundled kit files were not found next to this extension " +
			"(unexpected after a normal `pi install`). Ask the user for a path to `WORKING-STYLE.md` if needed."
		);
	}
	return (
		"**Depth on demand — bundled kit (absolute paths on this machine):**\n" +
		`- \`${kitWorking}\` — full working discipline\n` +
		`- \`${kitStyle}\` — style defaults\n` +
		`- \`${kitTemplate}\` — blank style template\n` +
		"Read these when the task needs templates, triggers, or full review rules — not every turn."
	);
}

const ZANSHIN_L0_COMPACT = `
## Zanshin L0 (extension — compact posture)

Three failure modes to defend against: (1) **Cross-session statelessness** — decisions die unless committed to files; use the repo as truth. (2) **Context compaction** — mid-session, memory of file contents may be wrong; **re-read** before a decision depends on a file. (3) **Fluent-but-wrong** — challenge significant outputs; do not fabricate URLs, quotes, or review frontmatter.

**Collaboration:** Prefer shorter over longer. Cut before adding. If context is incomplete, ask one sharp question instead of a long draft. Do not echo the user's phrasing as the answer.

**Practices (how they fire):** **Spar** — user invokes ("spar this"). **Shoshin** — user invokes or at scope shifts. **Progressive bookkeeping** — you surface checkpoints after substantive commits and before risky ops. **Stack** — user names depth; you offer return-to-parent when a branch resolves. **Verification** — user prompts on load-bearing claims. **Review discipline** — treat new/edited public docs as needing accuracy and voice fit.
`.trim();

export default function (pi: ExtensionAPI) {
	pi.on("before_agent_start", async (event) => {
		const block = `${ZANSHIN_L0_COMPACT}\n\n${kitPathBlock()}`;
		return {
			systemPrompt: `${event.systemPrompt}\n\n${block}`,
		};
	});
}
