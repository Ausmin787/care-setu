// PreToolUse hook (Edit|Write). Ported from Hungry Anna (D-026); Care Setu D-016.
// Linter, type-checker and formatter configs are never loosened to silence a finding.
// Fix the code, not the checker. A genuine config change needs Sasanka's explicit approval.
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8").replace(/^﻿/, ""));
const file = input.tool_input?.file_path ?? "";

const PROTECTED = [
  /eslint\.config\.(mjs|cjs|js|ts)$/i,
  /tsconfig(\.[\w-]+)?\.json$/i,
  /\.prettierrc(\.\w+)?$/i,
];

if (PROTECTED.some((re) => re.test(file))) {
  console.error(
    `Config protection (D-016): "${file}" is a checker config. Fix the code instead; ` +
      "if the config itself genuinely must change, Sasanka approves it explicitly first."
  );
  process.exit(2);
}
