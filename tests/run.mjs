import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const filter = process.argv[2] || "";

const build = spawnSync(process.execPath, [path.join(root, "scripts", "build.mjs")], { cwd: root, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

const suites = fs
    .readdirSync(here)
    .filter(f => f.endsWith(".test.js") && f.includes(filter))
    .sort();

let failed = 0;
for (const suite of suites) {
    process.stdout.write(`\n${suite}\n`);
    const run = spawnSync(process.execPath, [path.join(here, suite), root], { cwd: root, encoding: "utf8" });
    const lines = `${run.stdout}${run.stderr}`.split("\n").filter(l => /^(PASS|FAIL)\s|passed$/.test(l) || /Error/.test(l));
    for (const line of lines) process.stdout.write(`  ${line}\n`);
    if (run.status !== 0) failed++;
}

process.stdout.write(`\n${suites.length - failed}/${suites.length} suites passed\n`);
process.exit(failed ? 1 : 0);
