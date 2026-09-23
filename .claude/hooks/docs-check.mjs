// Project doc-integrity check (Care Setu D-016). Complements context-head.mjs --check,
// which stays an unmodified copy of the global skill script so it can be re-synced.
// Adds the checks Hungry Anna lacked and paid for:
//   1. STATUS.md stays short (HA's grew to 17 KB against a 15-line cap).
//   2. Every D-entry carries **Why:** and **Rejected:**.
//   3. Every numbered INVARIANT cites a D-entry that exists.
//   4. Every OWNER-QUESTIONS entry marked answered cites a D-entry that exists.
// Usage: node .claude/hooks/docs-check.mjs   (exit 0 = clean, 1 = findings)
// Runs context-head.mjs --check first and fails if that fails.
import { existsSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const DOCS = join(ROOT, "docs");
const read = (f) => readFileSync(join(DOCS, f), "utf8").replace(/^﻿/, "");
const STATUS_MAX_LINES = 15;
const STATUS_MAX_BYTES = 4096;

const fail = [];

const head = spawnSync(process.execPath, [join(ROOT, ".claude/hooks/context-head.mjs"), "--check"], {
  shell: false,
  encoding: "utf8",
  env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT },
});
if (head.status !== 0) fail.push(`context-head --check failed:\n${head.stdout}${head.stderr}`);

// 1. STATUS size cap (content lines, HTML comments excluded).
const status = read("STATUS.md").replace(/<!--[\s\S]*?-->/g, "");
const statusLines = status.split("\n").filter((l) => l.trim()).length;
if (statusLines > STATUS_MAX_LINES) fail.push(`STATUS.md has ${statusLines} non-empty lines (cap ${STATUS_MAX_LINES}).`);
const statusBytes = statSync(join(DOCS, "STATUS.md")).size;
if (statusBytes > STATUS_MAX_BYTES) fail.push(`STATUS.md is ${statusBytes} bytes (cap ${STATUS_MAX_BYTES}); move history to DECISIONS.md.`);

// 2. D-entry fields.
const decisions = read("DECISIONS.md");
const entries = decisions.split(/^(?=## D-\d{3} )/m).filter((e) => e.startsWith("## D-"));
const ids = new Set(entries.map((e) => e.match(/^## (D-\d{3})/)[1]));
for (const e of entries) {
  const id = e.match(/^## (D-\d{3})/)[1];
  if (!/\*\*Why:\*\*/.test(e)) fail.push(`${id} has no **Why:** field.`);
  if (!/\*\*Rejected:\*\*/.test(e)) fail.push(`${id} has no **Rejected:** field.`);
}

// 3. Invariant provenance.
const inv = read("INVARIANTS.md").split(/^## Open/m)[0];
for (const line of inv.split("\n")) {
  const m = line.match(/^(\d+)\.\s/);
  if (!m) continue;
  const cites = line.match(/D-\d{3}/g) ?? [];
  if (cites.length === 0) fail.push(`INVARIANT ${m[1]} cites no D-entry.`);
  for (const c of cites) if (!ids.has(c)) fail.push(`INVARIANT ${m[1]} cites ${c}, which does not exist.`);
}

// 4. Owner-question answers point at real decisions.
if (existsSync(join(DOCS, "OWNER-QUESTIONS.md"))) {
  for (const line of read("OWNER-QUESTIONS.md").split("\n")) {
    const q = line.match(/^\|\s*(Q\d+)\s*\|/);
    if (!q || !/\bANSWERED\b/.test(line)) continue;
    const cites = line.match(/D-\d{3}/g) ?? [];
    if (cites.length === 0) fail.push(`${q[1]} is ANSWERED but cites no D-entry.`);
    for (const c of cites) if (!ids.has(c)) fail.push(`${q[1]} cites ${c}, which does not exist.`);
  }
}

if (fail.length) {
  console.log("[docs-check] FAIL\n" + fail.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`[docs-check] OK — ${entries.length} decisions, STATUS ${statusLines} lines / ${statusBytes} B, invariants cited.`);
