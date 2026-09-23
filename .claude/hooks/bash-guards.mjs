// PreToolUse hook (Bash). Ported from Hungry Anna (D-007/D-026, hardened in HA D-035).
// Care Setu: D-002, D-015, D-016.
// 1. Block schema pushes that bypass migration files (`supabase db push`, `drizzle-kit push`).
//    Schema changes ship only as reviewed migration files.
// 2. Before `git commit`: block staged env files, scan staged changes for secrets and
//    payment-gateway keys, and flag console.log left in app code.
// Tokenises the command instead of matching raw text, so quoting (`"db" "push"`) and
// `git -C . commit` cannot slip past (HA D-035).
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const input = JSON.parse(readFileSync(0, "utf8").replace(/^﻿/, ""));
const command = input.tool_input?.command ?? "";
const tokens = (command.match(/[A-Za-z0-9_.:/\\@-]+/g) ?? []).map((t) => t.toLowerCase());

// Every position where the tool appears; the subcommand words must come right after it
// (flags skipped). Matching `push` anywhere later falsely blocked chains such as
// `drizzle-kit generate && git push` and any command whose text merely mentions both words.
const toolPositions = (re) => tokens.flatMap((t, i) => (re.test(t) ? [i] : []));
const subcommandIs = (re, ...words) =>
  toolPositions(re).some((index) => {
    const args = tokens.slice(index + 1).filter((t) => !t.startsWith("-")).slice(0, words.length);
    return words.every((word, k) => args[k] === word);
  });

const SUPABASE = /(?:^|[\\/])supabase(?:\.cmd|\.exe)?$/;
const DRIZZLE = /(?:^|[\\/])drizzle-kit(?:\.cmd|\.exe)?$/;
if (subcommandIs(SUPABASE, "db", "push") || subcommandIs(DRIZZLE, "push")) {
  console.error(
    "Blocked (D-002/TRD): direct schema push is forbidden. Generate a migration file " +
      "(`drizzle-kit generate`), review it, and apply it with the migrate script."
  );
  process.exit(2);
}

const git = tokens.findIndex((t) => /(?:^|[\\/])git(?:\.cmd|\.exe)?$/.test(t));
if (git < 0 || !tokens.slice(git + 1).includes("commit")) process.exit(0);

const run = (args) =>
  spawnSync("git", args, { shell: false, encoding: "utf8", timeout: 30_000 });

const names = run(["diff", "--cached", "--name-only"]);
const diff = run(["diff", "--cached", "--unified=0"]);
if (names.status !== 0 || diff.status !== 0) {
  console.error(`Pre-commit gate could not inspect staged changes:\n${diff.stdout}${diff.stderr}`);
  process.exit(2);
}

const problems = [];
for (const file of (names.stdout ?? "").split("\n").filter(Boolean)) {
  const base = file.split("/").pop();
  if (/^\.env(\..+)?$/.test(base) && base !== ".env.example") {
    problems.push(`${file}: env file staged (only .env.example may be committed)`);
  }
  if (/^refs\//.test(file)) problems.push(`${file}: refs/ holds third-party captures and is never committed`);
}

const SECRET_PATTERNS = [
  { name: "JWT", re: /eyJ[\w-]{20,}\.eyJ[\w-]{20,}/ },
  { name: "private key block", re: /-----BEGIN [\w ]*PRIVATE KEY-----/ },
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Supabase secret key", re: /\bsb_secret_[A-Za-z0-9_-]+/ },
  { name: "Razorpay live key", re: /\brzp_live_[A-Za-z0-9]{8,}/ },
  { name: "Razorpay test key", re: /\brzp_test_[A-Za-z0-9]{8,}/ },
  { name: "secret-looking assignment", re: /(SECRET|PASSWORD|API_KEY|PRIVATE_KEY|SERVICE_ROLE_KEY|WEBHOOK_SECRET)\w*\s*[=:]\s*['"]?[^\s'"]{8,}/i },
  { name: "connection string with password", re: /postgres(?:ql)?:\/\/[^:\s'"]+:[^@\s'"]+@/ },
  { name: "Resend API key", re: /\bre_[A-Za-z0-9]{16,}_[A-Za-z0-9]{8,}/ },
];

let currentFile = "";
for (const line of (diff.stdout ?? "").split("\n")) {
  if (line.startsWith("+++ b/")) {
    currentFile = line.slice(6);
    continue;
  }
  if (!line.startsWith("+") || line.startsWith("+++")) continue;
  const added = line.slice(1);
  // The hook's own pattern list and the example env file (names only) are exempt.
  const exempt = /^\.claude\/hooks\//.test(currentFile) || currentFile === ".env.example";
  if (!exempt) {
    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(added)) problems.push(`${currentFile}: possible ${name} in staged change`);
    }
  }
  const isAppCode =
    /^(app|lib|src|components|server)\//.test(currentFile) && /\.(ts|tsx|js|jsx|mjs)$/.test(currentFile);
  if (isAppCode && /console\.(log|debug)\(/.test(added)) {
    problems.push(`${currentFile}: console.log/debug left in app code`);
  }
}

if (problems.length > 0) {
  console.error(
    "Pre-commit gate blocked this commit:\n" +
      problems.map((p) => `  - ${p}`).join("\n") +
      "\nRemove the flagged lines (or unstage the file) and retry."
  );
  process.exit(2);
}
