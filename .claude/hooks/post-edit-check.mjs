// PostToolUse hook (Edit|Write). Ported from Hungry Anna (D-007, path confinement from HA D-035).
// Lints the changed file and typechecks on TS changes; exit 2 reports the failure back to
// Claude so it fixes the code now. Until the app is scaffolded (no eslint/typescript in
// node_modules) it skips silently. Note: lint and tsc do not parse CSS; only `build` does.
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { isAbsolute, relative, resolve } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8").replace(/^﻿/, ""));
const file = input.tool_input?.file_path ?? "";

if (!/\.(ts|tsx|js|jsx|mjs)$/i.test(file)) process.exit(0);
if (/[\\/]\.claude[\\/]/.test(file)) process.exit(0);

const root = process.cwd();
const absoluteFile = resolve(root, file);
const projectRelative = relative(root, absoluteFile);
// Files outside the project (e.g. the session scratchpad) are never linted. Skip quietly;
// the confinement exists so this hook never runs tools against an outside path (HA D-035).
if (projectRelative.startsWith("..") || isAbsolute(projectRelative)) process.exit(0);

const eslint = resolve(root, "node_modules/eslint/bin/eslint.js");
const tscBin = resolve(root, "node_modules/typescript/bin/tsc");

const run = (script, args) =>
  spawnSync(process.execPath, [script, ...args], { shell: false, encoding: "utf8", timeout: 90_000 });

if (existsSync(eslint)) {
  const lint = run(eslint, ["--no-warn-ignored", absoluteFile]);
  if (lint.status !== 0) {
    console.error(`eslint failed for ${file}:\n${lint.stdout ?? ""}${lint.stderr ?? ""}${lint.error ?? ""}`);
    process.exit(2);
  }
}

if (/\.(ts|tsx)$/i.test(file) && existsSync(tscBin)) {
  const tsc = run(tscBin, ["--noEmit"]);
  if (tsc.status !== 0) {
    console.error(`typecheck failed after editing ${file}:\n${tsc.stdout ?? ""}${tsc.stderr ?? ""}${tsc.error ?? ""}`);
    process.exit(2);
  }
}
