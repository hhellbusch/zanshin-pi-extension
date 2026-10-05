/**
 * Resume contract: comparison fields, and project choice that ignores BRIEF mtime.
 * Run: node --experimental-strip-types --test scripts/resume-contract.test.ts
 */
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdirSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
	anyProjectWhatsNext,
	checkpointUserMessage,
	formatResumeGitState,
	hasPlanningScope,
	parseGitResume,
	resolveCheckpointArg,
	resolvePlanningProject,
	resolveShoshinArg,
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
	const skillPath = "/opt/zanshin/skills/checkpoint/SKILL.md";
	const message = checkpointUserMessage({
		cpFile: "/repo/.planning/alpha/whats-next.md",
		projectName: "alpha",
		gitState,
		commitSubject: "save state",
		stackState: "none",
		skillPath,
	});
	assert.match(message, /feature\/old @ abc1234 · recorded 2026-10-01T12:00:00Z/);
	assert.match(message, /append -- don't replace/);
	assert.match(message, /\/opt\/zanshin\/skills\/checkpoint\/SKILL.md/);
	assert.equal(message.includes("mtime"), false);
});

test("checkpoint and shoshin accept a directory that has no brief", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "beta", 9_000);
	mkdirSync(join(root, ".planning", "alpha"));
	const chosen = resolveCheckpointArg(root, "alpha");
	assert.equal(chosen.status, "chosen");
	if (chosen.status !== "chosen") return;
	assert.equal(chosen.name, "alpha");
});

test("a whats-next path selects that project, not the newer brief", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "alpha", 1_000);
	brief(root, "beta", 9_000);
	const chosen = resolveCheckpointArg(root, ".planning/alpha/whats-next.md");
	assert.equal(chosen.status, "chosen");
	if (chosen.status !== "chosen") return;
	assert.equal(chosen.name, "alpha");
});

test("prose is framing, not a project name", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "alpha", 1_000);
	assert.deepEqual(resolveCheckpointArg(root, "the auth plan"), { status: "framing" });
	assert.deepEqual(resolveShoshinArg(root, "the auth plan"), { status: "framing" });
});

test("a file under .planning is not a project", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	mkdirSync(join(root, ".planning"));
	writeFileSync(join(root, ".planning", "notes.txt"), "not a directory\n");
	assert.equal(resolveCheckpointArg(root, "notes.txt").status, "missing");
	assert.equal(resolveShoshinArg(root, "notes.txt").status, "framing");
	assert.equal(resolvePlanningProject(root, "notes.txt").status, "missing");
});

test("dotdot does not select a directory outside .planning", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	mkdirSync(join(root, ".planning"));
	mkdirSync(join(root, "outside"));
	const escaped = resolveCheckpointArg(root, "../outside");
	assert.equal(escaped.status, "missing");
	assert.equal(resolvePlanningProject(root, "../outside").status, "missing");
	assert.equal(resolveShoshinArg(root, "../outside").status, "missing");
});

test("a symlink that leaves .planning is not a project", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	const outside = mkdtempSync(join(tmpdir(), "zanshin-out-"));
	mkdirSync(join(root, ".planning"));
	symlinkSync(outside, join(root, ".planning", "linked"));
	assert.equal(resolveCheckpointArg(root, "linked").status, "missing");
});

test("shoshin treats an unknown one-word topic as framing", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	brief(root, "alpha", 1_000);
	assert.deepEqual(resolveShoshinArg(root, "auth"), { status: "framing" });
	assert.equal(resolveCheckpointArg(root, "auth").status, "missing");
});

test("a handoff without BRIEF.md is visible at startup", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-plan-"));
	mkdirSync(join(root, ".planning", "nobrief"), { recursive: true });
	writeFileSync(join(root, ".planning", "nobrief", "whats-next.md"), "# handoff\n");
	assert.equal(anyProjectWhatsNext(root), true);
	assert.equal(hasPlanningScope(root), true);
	const chosen = resolveCheckpointArg(root, "nobrief");
	assert.equal(chosen.status, "chosen");
});

test("a detached checkout records HEAD as detached and keeps the hash", () => {
	const root = mkdtempSync(join(tmpdir(), "zanshin-git-"));
	const git = (args: string[]) =>
		execFileSync("git", args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
	git(["init", "-b", "main"]);
	git(["config", "user.email", "test@example.com"]);
	git(["config", "user.name", "zanshin-test"]);
	writeFileSync(join(root, "a.txt"), "a\n");
	git(["add", "a.txt"]);
	git(["commit", "-m", "first subject"]);
	git(["checkout", "--detach"]);
	const stdout = execFileSync(
		"bash",
		[
			"-c",
			"printf '%s\\0%s\\0%s' \"$(git branch --show-current)\" \"$(git rev-parse --short HEAD)\" \"$(git log -1 --format=%s)\"",
		],
		{ cwd: root, encoding: "utf8" },
	);
	const parsed = parseGitResume(stdout);
	assert.equal(parsed.branch, "detached");
	assert.match(parsed.hash, /^[0-9a-f]+$/);
	assert.equal(parsed.subject, "first subject");
});

test("detached HEAD keeps hash and subject in their fields", () => {
	const parsed = parseGitResume("\0abc1234\0commit subject");
	assert.deepEqual(parsed, {
		branch: "detached",
		hash: "abc1234",
		subject: "commit subject",
	});
	const onBranch = parseGitResume("feature/auth\0def5678\0save state");
	assert.equal(onBranch.branch, "feature/auth");
	assert.equal(onBranch.hash, "def5678");
});

test("later shoshin compares recorded fields and reports drift before mutate", () => {
	const recorded = { branch: "feature/old", hash: "abc1234" };
	const now = { branch: "feature/new", hash: "def5678" };
	const drift = resumeDrift(recorded, now);
	assert.deepEqual(drift, ["branch", "hash"]);
	const proceed = drift.length === 0;
	assert.equal(proceed, false);
});
