// Verify all extension files are ASCII-safe for the edit tool.
// Run with: npx tsc --noEmit

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionsDir = join(__dirname, "..", "extensions");

function checkAscii(): [string, number][] {
	const results: [string, number][] = [];
	const files = readdirSync(extensionsDir).filter((f) => f.endsWith(".ts"));

	for (const file of files) {
		const content = readFileSync(join(extensionsDir, file), "utf-8");
		let bad = 0;
		for (let i = 0; i < content.length; i++) {
			if (content.charCodeAt(i) > 127) bad++;
		}
		if (bad > 0) {
			results.push([file, bad]);
		}
	}
	return results;
}

export default checkAscii;
