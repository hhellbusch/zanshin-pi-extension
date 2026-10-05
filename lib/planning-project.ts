/**
 * Which .planning/<project> a checkpoint or resume check uses.
 * An explicit name wins. One BRIEF.md is unambiguous. Several briefs are not
 * resolved by mtime — the newest brief is not the active project.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export type PlanningChosen = {
	status: "chosen";
	dir: string;
	name: string;
};

export type PlanningAmbiguous = {
	status: "ambiguous";
	projects: string[];
};

export type PlanningMissing = {
	status: "missing";
	name: string;
};

export type PlanningResolution = PlanningChosen | PlanningAmbiguous | PlanningMissing;

export type PlanningFraming = { status: "framing" };

export type PlanningArgResult = PlanningResolution | PlanningFraming;

export function listPlanningProjects(cwd: string): string[] {
	const root = join(cwd, ".planning");
	if (!existsSync(root)) return [];
	let entries: string[] = [];
	try {
		entries = readdirSync(root);
	} catch {
		return [];
	}
	const names: string[] = [];
	for (const dir of entries) {
		if (existsSync(join(root, dir, "BRIEF.md"))) names.push(dir);
	}
	names.sort();
	return names;
}

export function hasPlanningScope(cwd: string): boolean {
	if (existsSync(join(cwd, "BRIEF.md"))) return true;
	if (existsSync(join(cwd, ".planning", "BRIEF.md"))) return true;
	if (anyProjectWhatsNext(cwd)) return true;
	return listPlanningProjects(cwd).length > 0;
}

export function anyProjectWhatsNext(cwd: string): boolean {
	if (existsSync(join(cwd, ".planning", "whats-next.md"))) return true;
	return listPlanningProjects(cwd).some((name) =>
		existsSync(join(cwd, ".planning", name, "whats-next.md")),
	);
}

/** explicit project name, or the sole BRIEF. Never the newest mtime. */
export function resolvePlanningProject(cwd: string, explicit?: string): PlanningResolution {
	const name = explicit?.trim();
	const projects = listPlanningProjects(cwd);
	if (name) {
		if (name === "root") {
			return { status: "chosen", dir: join(cwd, ".planning"), name: "root" };
		}
		const dir = join(cwd, ".planning", name);
		if (!existsSync(dir)) return { status: "missing", name };
		return { status: "chosen", dir, name };
	}
	if (projects.length === 1) {
		const only = projects[0];
		return { status: "chosen", dir: join(cwd, ".planning", only), name: only };
	}
	if (projects.length > 1) return { status: "ambiguous", projects };
	return { status: "chosen", dir: join(cwd, ".planning"), name: "root" };
}

/**
 * Shared by /checkpoint and /shoshin.
 * A directory under .planning/ is a project even when its BRIEF.md is absent or older.
 * A path containing `.planning/<name>/` names that project. Prose is framing, not a project.
 */
export function resolvePlanningArg(cwd: string, raw?: string): PlanningArgResult {
	const text = raw?.trim();
	if (!text) return resolvePlanningProject(cwd);
	if (text === "root") return resolvePlanningProject(cwd, "root");
	if (existsSync(join(cwd, ".planning", text))) return resolvePlanningProject(cwd, text);
	const fromPath = text.match(/(?:^|\/)\.planning\/([^/\s]+)/);
	if (fromPath) return resolvePlanningProject(cwd, fromPath[1]);
	if (!/[\s/]/.test(text)) return resolvePlanningProject(cwd, text);
	return { status: "framing" };
}

/** Comparison line both save paths must record. ISO time is UTC. */
export function formatResumeGitState(branch: string, hash: string, iso: string): string {
	return `${branch} @ ${hash} · recorded ${iso}`;
}

export function resumeDrift(
	recorded: { branch: string; hash: string },
	now: { branch: string; hash: string },
): string[] {
	const drift: string[] = [];
	if (recorded.branch !== now.branch) drift.push("branch");
	if (recorded.hash !== now.hash) drift.push("hash");
	return drift;
}

export function checkpointUserMessage(opts: {
	cpFile: string;
	projectName: string;
	gitState: string;
	commitSubject: string;
	stackState: string;
}): string {
	return (
		`Write a Zanshin checkpoint to \`${opts.cpFile}\` ` +
		`(append -- don't replace existing content). ` +
		`Follow \`skills/checkpoint/SKILL.md\` for the rest of the save.\n\n` +
		`Comparison fields are mandatory. Copy this Git state line exactly:\n\n` +
		`**Git state:** \`${opts.gitState}\` — ${opts.commitSubject}\n\n` +
		`Format:\n\n` +
		`# Checkpoint -- <today's date>\n\n` +
		`**Project:** ${opts.projectName}\n` +
		`**In progress:** [mid-flight item -- or "none"]\n` +
		`**Just completed:** [1--3 bullets -- or "nothing"]\n` +
		`**Next step:** [or "nothing"]\n` +
		`**Key decision:** [anything re-litigable -- or "none"]\n` +
		`**Git state:** \`${opts.gitState}\` — ${opts.commitSubject}\n` +
		`**Stack:** ${opts.stackState}`
	);
}
