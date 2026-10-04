# AGENTS.md — for Codex and any other coding agent

This mirrors the binding rules in `CLAUDE.md` for agents that don't read it. **If the two ever
disagree, `CLAUDE.md` wins**, and the disagreement is a doc bug to report.

## Project
Care Setu: a home-healthcare startup in Delhi NCR. Phase 1 = marketing + transactional website
(Next.js, TypeScript, Tailwind v4, Drizzle over Postgres; PGlite in dev). Apps are future scope.

## Before you do anything
1. Read `docs/STATUS.md` and `docs/INVARIANTS.md` in full (short by design).
2. Run `node .claude/hooks/context-head.mjs` for the decision index and integrity verdict. If it
   reports FAIL, don't trust the summaries. Read `docs/DECISIONS.md` directly.
3. Read only the decisions your task touches (`grep -n '^## D-0NN' docs/DECISIONS.md`).
4. The Docs map in `README.md` says where each fact lives. Grep long specs; don't bulk-read them.

## Binding rules (short form; the invariants are authoritative)
- Contradicting a decision or invariant → object and propose an override. Don't silently deviate.
- No commits, pushes or deploys without Sasanka's explicit permission.
- Never read, print or commit secrets (`.env*`).
- The client never sends a price; money is integer paise; payment status only from signature-verified gateway events.
- zod at every API boundary; Drizzle/parameterized SQL only; migrations as files only.
- No personal data in logs or to any third-party AI.
- Nothing factual in copy without an `approved` row in `docs/CLAIMS.md`.
- Open owner questions (`docs/OWNER-QUESTIONS.md`) are never answered by a default.
- "Green" = lint + typecheck + test + build.

## Review handoff (Codex as second-opinion reviewer)
Sasanka will hand you a review with:
- **Stage and scope**: which stage, commit range or files.
- **Invariants at risk**: the numbered INVARIANTS most relevant to the change.
- **Questions**: what specifically to check (e.g. "can a client influence the charged amount?",
  "is the webhook idempotent under replay?", "does any path log personal data?").

Report each finding as: `severity (blocking/major/minor) · file:line · what's wrong · concrete
failure scenario · suggested fix`. Separate **verified** findings (you reproduced or traced them)
from **suspected** ones. Don't edit code during a review unless asked. Findings are triaged by
Sasanka/Claude into a D-entry (accepted or rejected with a reason).

## Review pipeline (D-045)
The repo is public and every change reaches `main` by pull request. CI and CodeRabbit (`.coderabbit.yaml`, which
reads this file and `CLAUDE.md`) review each PR. As the author: work on a branch; read every CodeRabbit comment as
evidence, not truth; fix it or answer it with a reason; stop after 3 fix attempts and ask; report the findings to
Sasanka. Codex is an optional third
opinion for money, webhook and auth changes (see above). Only Sasanka merges, and a merge is a release. Never commit
secrets or owner-confidential documents.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
