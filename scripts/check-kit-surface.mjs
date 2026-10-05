/**
 * check-kit-surface.mjs
 *
 * Deterministic surface audit.
 *
 * Core (Codex / Cursor / any skills host): skill frontmatter, kit links,
 * plugin manifests, README skill index.
 *
 * Pi adapter (subset): L0, registerCommand, and the Pi command tables match
 * each other. A skill with no Pi command is legal. push/pop/stack are Pi-only.
 *
 * Not an LLM eval — see kit/evals/README.md.
 *
 * Usage: node scripts/check-kit-surface.mjs
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/** Pi runtime only — no SKILL.md */
const PI_ONLY = new Set(["push", "pop", "stack"]);
const PLUGIN_MANIFESTS = [
  "plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
];

const errors = [];

function fail(msg) {
  errors.push(msg);
}

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    fail(`missing file: ${rel}`);
    return "";
  }
  return readFileSync(p, "utf8");
}

function skillDirs() {
  const dir = join(root, "skills");
  return readdirSync(dir)
    .filter((name) => {
      const p = join(dir, name);
      return statSync(p).isDirectory() && existsSync(join(p, "SKILL.md"));
    })
    .sort();
}

function parseFrontmatterName(md, skill) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    fail(`skills/${skill}/SKILL.md: no YAML frontmatter`);
    return null;
  }
  const name = m[1].match(/^name:\s*(.+)$/m);
  if (!name) {
    fail(`skills/${skill}/SKILL.md: no name: in frontmatter`);
    return null;
  }
  if (!/^description:\s*/m.test(m[1])) {
    fail(`skills/${skill}/SKILL.md: no description: in frontmatter`);
  }
  return name[1].trim();
}

function registeredCommands(src) {
  const names = [];
  const re = /pi\.registerCommand\(\s*"([a-z0-9-]+)"/g;
  let m;
  while ((m = re.exec(src))) names.push(m[1]);
  return names;
}

function l0Commands(src) {
  const line = src.match(/\*\*Commands:\*\*[^\n]+/);
  const text = line ? line[0] : "";
  const names = [];
  const re = /\\?`\/([a-z][a-z0-9-]*)/g;
  let m;
  while ((m = re.exec(text))) names.push(m[1]);
  return names;
}

function slashList(md) {
  const line = md.split("\n").find((l) => l.includes("| Slash commands |"));
  if (!line) return [];
  const names = [];
  const re = /`\/([a-z][a-z0-9-]*)/g;
  let m;
  while ((m = re.exec(line))) names.push(m[1]);
  return names;
}

function readmeCommandTable(md) {
  const names = [];
  const re = /^\| `\/([a-z][a-z0-9-]*)/gm;
  let m;
  while ((m = re.exec(md))) names.push(m[1]);
  return names;
}

function readmeSkillTable(md) {
  const idx = md.indexOf("## Skills");
  const slice = idx >= 0 ? md.slice(idx, idx + 2500) : md;
  const names = [];
  const re = /^\| `([a-z][a-z0-9-]*)` \|/gm;
  let m;
  while ((m = re.exec(slice))) names.push(m[1]);
  return names;
}

function kitRefsInSkill(md, skill) {
  const re = /(?:`|\()(\.\.\/\.\.\/kit\/[a-zA-Z0-9_./-]+)/g;
  const files = [];
  let m;
  while ((m = re.exec(md))) {
    const rel = m[1];
    if (rel.includes("<")) continue;
    files.push(rel);
  }
  const skillDir = join(root, "skills", skill);
  for (const rel of files) {
    const resolved = resolve(skillDir, rel);
    if (!existsSync(resolved)) {
      fail(`skills/${skill}: broken kit path ${rel}`);
    }
  }
}

function setEq(a, b, labelA, labelB) {
  const A = new Set(a);
  const B = new Set(b);
  for (const x of A) {
    if (!B.has(x)) fail(`${labelA} has "${x}" missing from ${labelB}`);
  }
  for (const x of B) {
    if (!A.has(x)) fail(`${labelB} has "${x}" missing from ${labelA}`);
  }
}

const skills = skillDirs();
const ext = read("extensions/zanshin.ts");
const registered = registeredCommands(ext);
const l0 = l0Commands(ext);
const ws = slashList(read("kit/WORKING-STYLE.md"));
const readmeCmds = readmeCommandTable(read("README.md"));
const readmeSkills = readmeSkillTable(read("README.md"));

if (registered.length === 0) fail("no pi.registerCommand(...) found in extensions/zanshin.ts");
if (l0.length === 0) fail("could not parse L0 **Commands:** list in extensions/zanshin.ts");

for (const skill of skills) {
  const md = read(`skills/${skill}/SKILL.md`);
  const name = parseFrontmatterName(md, skill);
  if (name && name !== skill) {
    fail(`skills/${skill}: frontmatter name "${name}" != directory`);
  }
  kitRefsInSkill(md, skill);
}

for (const cmd of registered) {
  if (PI_ONLY.has(cmd)) continue;
  if (!skills.includes(cmd)) {
    fail(`registerCommand("${cmd}") has no skills/${cmd}/SKILL.md`);
  }
}

setEq(skills, readmeSkills, "skills/", "README Skills table");

setEq(registered, l0, "Pi registerCommand", "Pi L0 Commands");
setEq(registered, ws, "Pi registerCommand", "WORKING-STYLE slash-commands row");
setEq(registered, readmeCmds, "Pi registerCommand", "README Pi command table");

for (const f of PLUGIN_MANIFESTS) {
  const raw = read(f);
  if (!raw) continue;
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    fail(`${f}: invalid JSON`);
    continue;
  }
  const skillsField = json.skills;
  if (typeof skillsField !== "string") {
    fail(`${f}: missing skills path`);
    continue;
  }
  const skillsPath = join(root, skillsField.replace(/^\.\//, ""));
  if (!existsSync(skillsPath)) fail(`${f}: skills path does not exist (${skillsField})`);
}

const kitIndex = read("kit/README.md");
if (/Plan:\s*Rails/.test(kitIndex)) {
  fail("kit/README.md still calls DESIGN-PHILOSOPHY a plan");
}

const skillsWithoutPi = skills.filter((name) => !registered.includes(name));

console.log("Kit surface");
console.log(`  skills:          ${skills.join(", ")}`);
console.log(`  no Pi command:   ${skillsWithoutPi.join(", ") || "(none)"}`);
console.log(`  Pi commands:     ${registered.join(", ")}`);
console.log(`  L0:              ${l0.join(", ")}`);
console.log(`  PI_ONLY:         ${[...PI_ONLY].join(", ")}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ❌  ${e}`);
  console.error("\nFix surface drift before pushing.\n");
  process.exit(1);
}

console.log("\n  surface ok\n");
