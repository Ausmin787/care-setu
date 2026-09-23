#!/usr/bin/env node
/**
 * context-head.mjs — portable Tier-0 context head.
 *
 * WHY THIS EXISTS
 * A project's docs grow without bound. The instinct is a rule like "read every doc
 * at session start", but past ~30k tokens that rule backfires: the read gets
 * compacted mid-session and compaction discards exactly the specific detail you
 * read it for. The result is an agent that has "read everything" and still misses
 * the decision that should have made it object.
 *
 * The fix is to notice that SPECS ARE RE-DERIVABLE AND DECISIONS ARE NOT. A schema
 * detail can be grepped the moment it is needed. A decision never seen makes the
 * agent agree to something that was ruled out months ago.
 *
 * So Tier 0 is: the complete DECISION INDEX + the INVARIANTS + a verdict on whether
 * those can be trusted. Everything else is grepped on demand.
 *
 * The verdict is the point. Without it, "I have full context" is a promise. With
 * it, it is a check that fails loudly when the summary docs drift from reality.
 *
 * CONFIG  .claude/context-head.json (all keys optional; these are the defaults)
 *   {
 *     "docsDir": "docs",              // where the docs live ("." for repo root)
 *     "decisionsFile": "DECISIONS.md",
 *     "statusFile": "STATUS.md",      // "" to disable status checks
 *     "invariantsFile": "INVARIANTS.md",
 *     "prefix": "D",                  // "D" -> D-001 ; "ADR" -> ADR-001
 *     "archiveThresholdKB": 200
 *   }
 * With no config file it auto-detects the common layouts.
 *
 * MODES
 *   (no args)      SessionStart brief on stdout. ALWAYS exits 0 — a context hook
 *                  must never be able to block a session.
 *   --check        Verify only; exit 1 on drift. For CI or by hand.
 *   --write-index  Also write <docsDir>/DECISIONS-INDEX.md for humans.
 *   --quiet        Suppress the brief (use with --write-index).
 *
 * Read-only by default. No network. No dependencies. Node >= 18.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const argv = process.argv.slice(2);
const CHECK_ONLY = argv.includes("--check");
const WRITE_INDEX = argv.includes("--write-index");
const QUIET = argv.includes("--quiet");
const WRAP = argv.includes("--wrap");

const DEFAULTS = {
  docsDir: "docs",
  decisionsFile: "DECISIONS.md",
  statusFile: "STATUS.md",
  invariantsFile: "INVARIANTS.md",
  prefix: "D",
  archiveThresholdKB: 200,
};

function done(code) { process.exit(CHECK_ONLY || WRAP ? code : 0); }
function say(msg) { console.log(msg); }

// PowerShell's `Set-Content -Encoding utf8` writes a UTF-8 BOM, and JSON.parse
// rejects it ("Unexpected token '﻿'"). On a Windows box every one of these
// files is liable to have one, so strip it on every read rather than debugging
// the same confusing error later.
const read = (p) => readFileSync(p, "utf8").replace(/^﻿/, "");

// ---------- config ----------
let cfg = { ...DEFAULTS };
const cfgPath = join(ROOT, ".claude", "context-head.json");
if (existsSync(cfgPath)) {
  try { cfg = { ...cfg, ...JSON.parse(read(cfgPath)) }; }
  catch (e) { say(`[context-head] .claude/context-head.json is not valid JSON — using defaults. (${e.message})`); }
}

// ---------- locate the decision log ----------
function resolveDecisions() {
  const explicit = join(ROOT, cfg.docsDir, cfg.decisionsFile);
  if (existsSync(explicit)) return explicit;
  for (const d of ["docs", ".", "doc", "documentation", ".docs"]) {
    for (const f of [cfg.decisionsFile, "DECISIONS.md", "ADR.md", "decisions.md"]) {
      const p = join(ROOT, d, f);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

const decPath = resolveDecisions();
if (!decPath) {
  say(`[context-head] no decision log found (looked for ${cfg.docsDir}/${cfg.decisionsFile}).`);
  say(`[context-head] run the 'context-head' skill to set this project up.`);
  done(1);
}
const DOCS = dirname(decPath);
const stPath = cfg.statusFile ? join(DOCS, cfg.statusFile) : null;

const decRaw = read(decPath);
const stRaw = stPath && existsSync(stPath) ? read(stPath) : null;

// ---------- parse the index ----------
// Tolerant of the common heading shapes:
//   ## D-001 · 2026-07-08 · Title      ## ADR-007: Title
//   ## D-001 — Title                   ## D-001 Title
const P = cfg.prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const HEAD_RE = new RegExp(
  `^##\\s+${P}-(\\d+)\\b\\s*(?:[·\\-—:|]\\s*)?(\\d{4}-\\d{2}-\\d{2}(?:–\\d{2})?)?\\s*(?:[·\\-—:|]\\s*)?(.*)$`
);

const entries = [];
decRaw.split(/\r?\n/).forEach((line, i) => {
  const m = line.match(HEAD_RE);
  if (m) entries.push({ num: Number(m[1]), date: m[2] || "", title: (m[3] || "").trim(), line: i + 1 });
});

if (entries.length === 0) {
  say(`[context-head] no '## ${cfg.prefix}-NNN' headings in ${decPath}. Check "prefix" in .claude/context-head.json.`);
  done(1);
}

const fail = [];
const note = [];
const pad = (n) => `${cfg.prefix}-` + String(n).padStart(3, "0");

const nums = entries.map((e) => e.num);
const head = Math.max(...nums);

// 1. dense + unique numbering — a gap means an entry was lost or never written
const seen = new Set(), dupes = new Set();
for (const n of nums) (seen.has(n) ? dupes : seen).add(n);
if (dupes.size) fail.push(`duplicate decision numbers: ${[...dupes].map(pad).join(", ")}`);
const gaps = [];
for (let i = 1; i <= head; i++) if (!seen.has(i)) gaps.push(i);
if (gaps.length) fail.push(`gaps in numbering: ${gaps.map(pad).join(", ")}`);

// 2. the status file's claimed head must equal the real head.
//    This is the check that matters most: it is what silently rots.
if (stRaw !== null) {
  const claim = stRaw.match(/Decision head:\s*\**\s*[A-Za-z]+-(\d+)/i);
  if (!claim) note.push(`${cfg.statusFile} has no 'Decision head: ${cfg.prefix}-NNN' line — add one so drift becomes detectable.`);
  else if (Number(claim[1]) !== head)
    fail.push(`${cfg.statusFile} claims decision head ${pad(claim[1])} but ${cfg.decisionsFile} ends at ${pad(head)}`);
}

// 3. every supersession / retraction target must exist.
//    Scanned only from the first decision heading onward: the preamble is
//    instructions, and its examples ("superseded by D-0NN") are not references.
//    The trailing \b also rejects placeholders like D-0NN, which would otherwise
//    parse as D-0 and report a phantom dangling reference.
const bodyStart = decRaw.search(HEAD_RE.source ? new RegExp(HEAD_RE.source, "m") : /$^/);
const decBody = bodyStart >= 0 ? decRaw.slice(bodyStart) : decRaw;
for (const r of decBody.matchAll(new RegExp(`supersed\\w*\\s+(?:same-day\\s+)?(?:by\\s+|the\\s+)?${P}-(\\d+)\\b`, "gi"))) {
  const t = Number(r[1]);
  if (!seen.has(t)) fail.push(`a supersession points at ${pad(t)}, which does not exist`);
}

// 4. status must not be older than the newest decision it claims to summarise
const newestDate = entries.map((e) => e.date).filter(Boolean).map((d) => d.slice(0, 10)).sort().pop();
if (stRaw !== null && newestDate) {
  const sd = stRaw.match(/Updated:\s*\**\s*(\d{4}-\d{2}-\d{2})/i);
  if (sd && sd[1] < newestDate) fail.push(`${cfg.statusFile} updated ${sd[1]} but newest decision is dated ${newestDate}`);
}

// 5. growth gauge — says WHEN an archive split is worth doing, not that it is overdue
const kb = Math.round(decRaw.length / 1024);
if (kb > cfg.archiveThresholdKB)
  note.push(`${cfg.decisionsFile} is ${kb} KB, past the ${cfg.archiveThresholdKB} KB threshold — archive WHOLLY superseded bodies (never partial ones).`);

// ---------- index ----------
const indexBody = entries
  .map((e) => `- **${pad(e.num)}**${e.date ? " · " + e.date : ""} · ${e.title}`)
  .join("\n");

if (WRITE_INDEX) {
  writeFileSync(
    join(DOCS, "DECISIONS-INDEX.md"),
    `# Decision Index\n\n_Generated from ${cfg.decisionsFile} by context-head.mjs. Do not edit by hand._\n\n${indexBody}\n`,
    "utf8"
  );
}

// ---------- wrap mode: the close-out audit ----------
// Different question from --check. --check asks "are the docs internally
// consistent?". --wrap asks "did this session's work get written down?" —
// i.e. is the project safe to walk away from and pick up cold next time.
//
// Deliberately run on demand, NOT on a Stop hook: mid-session the status file
// legitimately lags the code, so an automatic per-turn version would cry wolf
// and get ignored — the exact failure this whole system exists to avoid.
if (WRAP) {
  const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");
  const git = (args) => {
    try { return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); }
    catch { return null; }
  };

  // -uall, not the default: plain --porcelain collapses untracked files into
  // their directory ("docs/"), which would hide a brand-new STATUS.md from the
  // touched() match and mis-report the close-out as stale.
  const porcelain = git(["status", "--porcelain", "-uall"]);
  const hasGit = porcelain !== null;
  const changed = hasGit
    ? porcelain.split(/\r?\n/).filter(Boolean).map((l) => l.slice(3).trim().replace(/^"|"$/g, ""))
    : [];

  const isDoc = (f) => f.startsWith(rel(DOCS) + "/") || /(^|\/)(CLAUDE|AGENTS|README)\.md$/i.test(f);
  const statusRel = stPath ? rel(stPath) : null;
  const decRel2 = rel(decPath);
  const invRel2 = rel(join(DOCS, cfg.invariantsFile));

  const touched = (f) => changed.some((c) => c === f);
  const nonDocChanges = changed.filter((f) => !isDoc(f));

  const todo = [];
  say("=== CLOSE-OUT AUDIT ===");
  say("");

  // 1. internal consistency
  if (fail.length) {
    say(`Integrity ........ DRIFT`);
    fail.forEach((f) => say(`                   - ${f}`));
    todo.push("Fix the integrity failures above — next session will not trust these docs.");
  } else {
    say(`Integrity ........ OK (${entries.length} decisions, ${pad(1)}..${pad(head)})`);
  }

  // 2. did the work get written down?
  if (!hasGit) {
    say("Work recorded .... UNKNOWN (not a git repo — cannot tell what changed this session)");
    todo.push(`Manually confirm ${statusRel || cfg.statusFile} reflects the work you just did.`);
  } else if (changed.length === 0) {
    say("Work recorded .... nothing changed in the working tree");
  } else {
    say(`Working tree ..... ${changed.length} changed file(s), ${nonDocChanges.length} outside docs`);
    if (nonDocChanges.length && statusRel && !touched(statusRel)) {
      say(`Status file ...... STALE — code/config changed but ${statusRel} was not updated`);
      todo.push(`Update ${statusRel}: what now exists that did not before, and what the next action is.`);
    } else if (statusRel && touched(statusRel)) {
      say(`Status file ...... updated this session`);
    }
    if (touched(decRel2)) say(`Decision log ..... updated this session`);
  }

  // 3. the judgement the tool cannot make for you
  say("");
  say("--- REQUIRES YOUR JUDGEMENT (a script cannot decide these) ---");
  say(`  * Did anything this session qualify as a DECISION or deviation?`);
  say(`    If yes: append to ${decRel2}, then bump '${cfg.statusFile}: Decision head:' in the same edit.`);
  say(`  * Did any binding constraint change, or did an OPEN question get answered?`);
  say(`    If yes: update ${invRel2} — including moving items out of its 'Open' section.`);
  say(`  * Does project memory still describe the OLD behaviour? Replace it, do not append next to it.`);

  if (hasGit && changed.length) {
    say("");
    say(`--- UNCOMMITTED (${changed.length}) — committing is your call, never automatic ---`);
    changed.slice(0, 20).forEach((f) => say(`  ${f}`));
    if (changed.length > 20) say(`  ... and ${changed.length - 20} more`);
  }

  say("");
  if (todo.length) {
    say("OUTSTANDING before you close the session:");
    todo.forEach((t, i) => say(`  ${i + 1}. ${t}`));
    process.exit(1);
  }
  say("Close-out clean — the next session will pick this up correctly.");
  process.exit(0);
}

// ---------- check mode ----------
if (CHECK_ONLY) {
  const tier0 = Math.round((indexBody.length + (stRaw?.length || 0)) / 4);
  say(`Decisions: ${entries.length} (${pad(1)}..${pad(head)})  Tier-0: ~${tier0} tokens`);
  note.forEach((n) => say(`NOTE  ${n}`));
  if (fail.length) {
    fail.forEach((f) => say(`FAIL  ${f}`));
    say("DRIFT — Tier-0 context is not trustworthy; read the source.");
    process.exit(1);
  }
  say("OK — decision index complete and consistent.");
  process.exit(0);
}

if (QUIET) process.exit(0);

// ---------- SessionStart brief ----------
const invRel = join(DOCS, cfg.invariantsFile).replace(ROOT + "\\", "").replace(ROOT + "/", "").replace(/\\/g, "/");
const decRel = decPath.replace(ROOT + "\\", "").replace(ROOT + "/", "").replace(/\\/g, "/");
const out = [];
out.push("=== TIER-0 CONTEXT HEAD (auto-injected at session start) ===");
out.push("");
if (fail.length) {
  out.push("!! DOC DRIFT DETECTED — do NOT trust the summary docs until this is fixed:");
  fail.forEach((f) => out.push(`   - ${f}`));
  out.push(`   Fix the drift, or read ${decRel} directly this session.`);
} else {
  out.push(`Integrity: OK. ${entries.length} decisions, ${pad(1)}..${pad(head)}, no gaps, all supersession`);
  out.push("references resolve" + (stRaw !== null ? `, and ${cfg.statusFile}'s decision head matches.` : "."));
  out.push("You may rely on this index as a COMPLETE list of decisions taken on this project.");
}
note.forEach((n) => out.push(`Note: ${n}`));
out.push("");
out.push("--- COMPLETE DECISION INDEX (titles carry their own supersession notes) ---");
out.push(indexBody);
out.push("");
out.push("--- HOW TO USE THIS ---");
out.push("This index is COMPLETE for *what was decided*. It is not the reasoning.");
out.push("Before agreeing to anything that touches architecture, data, money, auth or scope:");
out.push("  1. Scan this index for a decision that already covers it.");
out.push(`  2. If one exists, read ONLY that entry: grep -n '^## ${cfg.prefix}-0NN' ${decRel}`);
out.push("  3. If the new request contradicts it, SAY SO BEFORE DOING THE WORK —");
out.push("     the superseding decision gets written first, then the work happens.");
out.push(`Binding constraints: ${invRel}. Do NOT bulk-read the long specs — grep them.`);
out.push("=== END TIER-0 CONTEXT HEAD ===");
say(out.join("\n"));
process.exit(0);
