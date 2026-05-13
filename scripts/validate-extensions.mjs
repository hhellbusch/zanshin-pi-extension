/**
 * validate-extensions.mjs
 *
 * Simulates Pi's extension loading pipeline using the same jiti compiler
 * Pi uses at runtime. For each .ts file in extensions/:
 *
 *   1. Compiles the file via jiti
 *   2. Checks the default export is a function (Pi's exact validation)
 *   3. Reports pass/fail with the same error message Pi would show
 *
 * Also checks that lib/ files are NOT in the extensions/ directory
 * (utility modules that leaked into extensions/ cause the exact failure
 * mode that prompted writing this script).
 *
 * Usage:
 *   node scripts/validate-extensions.mjs
 *
 * Returns exit code 0 on success, 1 if any extension fails.
 *
 * Note: this uses jiti from Pi's own node_modules so the compilation
 * environment matches Pi exactly.
 */

import { readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const extensionsDir = join(repoRoot, "extensions");

// ── Locate jiti (same version Pi uses) ───────────────────────────────────────

const PI_MODULE = "/usr/local/lib/node_modules/@earendil-works/pi-coding-agent";
const JITI_PATH = join(PI_MODULE, "node_modules/jiti/lib/jiti.cjs");

if (!existsSync(JITI_PATH)) {
  console.error(`\n  ⚠️  Pi not found at ${PI_MODULE}`);
  console.error("     Run this script inside a Pi container or install Pi globally.\n");
  process.exit(1);
}

const { createJiti } = await import(JITI_PATH);

// Replicate Pi's jiti config (no module cache, same as loader.ts)
const jiti = createJiti(import.meta.url, { moduleCache: false });

// ── Discover extension files ──────────────────────────────────────────────────

const files = readdirSync(extensionsDir)
  .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
  .sort();

if (files.length === 0) {
  console.error("No extension files found in extensions/");
  process.exit(1);
}

// ── Validate each extension ───────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

console.log(`\nValidating ${files.length} extension(s) in extensions/\n`);

for (const file of files) {
  const filePath = join(extensionsDir, file);

  try {
    // Pi imports with { default: true } which extracts the default export
    const mod = await jiti.import(filePath, { default: true });

    if (typeof mod !== "function") {
      const detail = mod === undefined
        ? "no default export"
        : `default export is ${typeof mod}, not a function`;
      console.error(`  ❌  ${file}  —  ${detail}`);
      failures.push({ file, reason: detail });
      failed++;
    } else {
      console.log(`  ✅  ${file}`);
      passed++;
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    // Truncate long error messages (stack traces from compilation failures)
    const short = reason.split("\n")[0].slice(0, 120);
    console.error(`  ❌  ${file}  —  ${short}`);
    failures.push({ file, reason: short });
    failed++;
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n  ${passed} passed  /  ${failed} failed\n`);

if (failures.length > 0) {
  console.error("Failures:");
  for (const { file, reason } of failures) {
    console.error(`  ${file}: ${reason}`);
  }
  console.error(
    "\nFix the above before pushing — Pi will report these same errors on /reload.\n"
  );
  process.exit(1);
}
