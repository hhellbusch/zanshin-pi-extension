/**
 * Resume contract: comparison fields, and project choice that ignores BRIEF mtime.
 * Run: node --experimental-strip-types --test scripts/resume-contract.test.ts
 */
import assert from "node:assert/strict";
import { mkdirSync, utimesSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
	checkpointUserMessage,
	formatResumeGitState,
	resolvePlanningArg,
	resolvePlanningProject,
	resumeDrift,
} from "../lib/planning-project.ts";

function brief(root: string, project: string, mtimeSec: number) {
	const dir = join(root, ".planning", project);
	mkdirSync(dir, { recursive: true });
	const path = join(dir, "BRIEF.md");
	writeFileSync(path, `# ${project}\n`);
	const when = new Date(mtimeSec * 1000);
	utimesSync(path, when, when);
}

test("explicit older project wins over a newer brief", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "alpha", 1_000);
	brief(root, "beta", 2_000);
	const chosen = resolvePlanningProject(root, "alpha");
	assert.equal(chosen.status, "chosen");
	if (chosen.status !== "chosen") return;
	assert.equal(chosen.name, "alpha");
	assert.ok(chosen.dir.endsWith(`${join(".planning", "alpha")}`));
});

test("no-arg resume with two briefs is ambiguous", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "alpha", 1_000);
	brief(root, "beta", 9_000);
	const chosen = resolvePlanningProject(root);
	assert.deepEqual(chosen, { status: "ambiguous", projects: ["alpha", "beta"] });
});

test("sole brief is chosen", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "alpha", 1_000);
	const chosen = resolvePlanningProject(root);
	assert.equal(chosen.status, "chosen");
	if (chosen.status !== "chosen") return;
	assert.equal(chosen.name, "alpha");
});

test("checkpoint prompt records branch, hash, and ISO time", () => {
	const gitState = formatResumeGitState(
		"feature/old",
		"abc1234",
		"2026-10-01T12:00:00Z",
	);
	const message = checkpointUserMessage({
		cpFile: "/repo/.planning/alpha/whats-next.md",
		projectName: "alpha",
		gitState,
		commitSubject: "save state",
		stackState: "none",
	});
	assert.match(message, /feature\/old @ abc1234 · recorded 2026-10-01T12:00:00Z/);
	assert.match(message, /append -- don't replace/);
	assert.match(message, /skills\/checkpoint\/SKILL.md/);
	assert.equal(message.includes("mtime"), false);
});

test("checkpoint and shoshin accept a directory that has no brief", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "beta", 9_000);
	mkdirSync(join(root, ".planning", "alpha"));
	const chosen = resolvePlanningArg(root, "alpha");
	assert.equal(chosen.status, "chosen");
	if (chosen.status !== "chosen") return;
	assert.equal(chosen.name, "alpha");
});

test("a whats-next path selects that project, not the newer brief", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "alpha", 1_000);
	brief(root, "beta", 9_000);
	const chosen = resolvePlanningArg(root, ".planning/alpha/whats-next.md");
	assert.equal(chosen.status, "chosen");
	if (chosen.status !== "chosen") return;
	assert.equal(chosen.name, "alpha");
});

test("prose is framing, not a project name", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "alpha", 1_000);
	assert.deepEqual(resolvePlanningArg(root, "the auth plan"), { status: "framing" });
});

test("later shoshin compares recorded fields and reports drift before mutate", () => {
	const recorded = { branch: "feature/old", hash: "abc1234" };
	const now = { branch: "feature/new", hash: "def5678" };
	const drift = resumeDrift(recorded, now);
	assert.deepEqual(drift, ["branch", "hash"]);
	const proceed = drift.length === 0;
	assert.equal(proceed, false);
});
