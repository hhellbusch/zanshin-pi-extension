/**
 * Which .planning/<project> a checkpoint or resume check uses.
 * An explicit name wins. One BRIEF.md is unambiguous. Several briefs are not
 * resolved by mtime — the newest brief is not the active project.
 */
import { existsSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

/** Direct child of `.planning/`. No slashes, no `..`, no dotfiles. */
const PROJECT_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

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

export function isSafeProjectName(name: string): boolean {
	return PROJECT_NAME.test(name);
}

/** Real directory that stays a single child of `.planning/`. Files and `..` are rejected. */
export function planningChildDir(cwd: string, name: string): string | null {
	if (!isSafeProjectName(name)) return null;
	const root = resolve(cwd, ".planning");
	const dir = resolve(root, name);
	if (relative(root, dir) !== name) return null;
	try {
		if (!statSync(dir).isDirectory()) return null;
		const realRoot = realpathSync(root);
		const realDir = realpathSync(dir);
		const rel = relative(realRoot, realDir);
		if (rel === "" || rel.startsWith("..") || rel.split(sep).length !== 1) return null;
	} catch {
		return null;
	}
	return dir;
}

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
		const child = planningChildDir(cwd, dir);
		if (child && existsSync(join(child, "BRIEF.md"))) names.push(dir);
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
	const root = join(cwd, ".planning");
	if (existsSync(join(root, "whats-next.md"))) return true;
	let entries: string[] = [];
	try {
		entries = readdirSync(root);
	} catch {
		return false;
	}
	return entries.some((name) => {
		const child = planningChildDir(cwd, name);
		return child !== null && existsSync(join(child, "whats-next.md"));
	});
}

/** explicit project name, or the sole BRIEF. Never the newest mtime. */
export function resolvePlanningProject(cwd: string, explicit?: string): PlanningResolution {
	const name = explicit?.trim();
	const projects = listPlanningProjects(cwd);
	if (name) {
		if (name === "root") {
			return { status: "chosen", dir: resolve(cwd, ".planning"), name: "root" };
		}
		const dir = planningChildDir(cwd, name);
		if (!dir) return { status: "missing", name };
		return { status: "chosen", dir, name };
	}
	if (projects.length === 1) {
		const only = projects[0];
		return { status: "chosen", dir: join(cwd, ".planning", only), name: only };
	}
	if (projects.length > 1) return { status: "ambiguous", projects };
	return { status: "chosen", dir: join(cwd, ".planning"), name: "root" };
}

function namedProject(cwd: string, text: string): PlanningChosen | null {
	if (text === "root") {
		return { status: "chosen", dir: resolve(cwd, ".planning"), name: "root" };
	}
	const fromPath = text.match(/(?:^|\/)\.planning\/([^/\s]+)/);
	const candidate = fromPath ? fromPath[1] : !/[\s/\\]/.test(text) ? text : null;
	if (!candidate) return null;
	const dir = planningChildDir(cwd, candidate);
	if (!dir) return null;
	return { status: "chosen", dir, name: candidate };
}

function pathLike(text: string): boolean {
	return text.includes("/") || text.includes("\\") || text.includes("..") || text.startsWith(".");
}

/**
 * /checkpoint: an unknown name is missing, so nothing is written.
 * A path that is not a direct child of `.planning/` is missing, including `..`.
 */
export function resolveCheckpointArg(cwd: string, raw?: string): PlanningArgResult {
	const text = raw?.trim();
	if (!text) return resolvePlanningProject(cwd);
	const named = namedProject(cwd, text);
	if (named) return named;
	if (pathLike(text) || !/[\s/\\]/.test(text)) {
		const label = text.split(/[/\\]/).filter(Boolean).pop() || text;
		return { status: "missing", name: label };
	}
	return { status: "framing" };
}

/**
 * /shoshin: a known project directory (or a path under it) selects that handoff.
 * Any other argument, including a one-word topic, is framing — not a missing project.
 */
export function resolveShoshinArg(cwd: string, raw?: string): PlanningArgResult {
	const text = raw?.trim();
	if (!text) return resolvePlanningProject(cwd);
	const named = namedProject(cwd, text);
	if (named) return named;
	if (pathLike(text)) {
		const label = text.split(/[/\\]/).filter(Boolean).pop() || text;
		return { status: "missing", name: label };
	}
	return { status: "framing" };
}

/** Empty branch (detached HEAD) must not shift hash and subject left by one field. */
export function parseGitResume(stdout: string): { branch: string; hash: string; subject: string } {
	const parts = stdout.split("\0");
	const branch = (parts[0] ?? "").trim() || "detached";
	const hash = (parts[1] ?? "").trim() || "unknown";
	const subject = parts.slice(2).join("\0").trim() || "no subject";
	return { branch, hash, subject };
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
	skillPath: string;
}): string {
	return (
		`Write a Zanshin checkpoint to \`${opts.cpFile}\` ` +
		`(append -- don't replace existing content). ` +
		`Follow \`${opts.skillPath}\` for the rest of the save.\n\n` +
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
