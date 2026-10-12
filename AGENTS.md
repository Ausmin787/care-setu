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
- "Green" = lint + typecheck + test + unused-code check (knip) + build + browser checks (Playwright with axe): `npm run green` (INVARIANT 26, D-049).

## Review handoff (how Sasanka hands you a review)
Sasanka will hand you a review with:
- **Stage and scope**: which stage, commit range or files.
- **Invariants at risk**: the numbered INVARIANTS most relevant to the change.
- **Questions**: what specifically to check (e.g. "can a client influence the charged amount?",
  "is the webhook idempotent under replay?", "does any path log personal data?").

Report each finding as: `severity (blocking/major/minor) · file:line · what's wrong · concrete
failure scenario · suggested fix`. Separate **verified** findings (you reproduced or traced them)
from **suspected** ones. Don't edit code during a review unless asked. Findings are triaged by
Sasanka/Claude into a D-entry (accepted or rejected with a reason).

## Code navigation (D-055)
Before editing or renaming a symbol: `graphify affected "<symbol>" --depth 4` (callers and transitive impact, file:line) and
`graphify explain "<symbol>"` (definition and importers). Local and AST-only (incl. the SQL migrations); the post-commit hook
rebuilds it, or run `graphify update .`. New clone: `graphify hook install`. Never run the `/graphify` skill's doc, image or
`--update` extraction, which sends content to a model (INVARIANT 9, 36). An answer is evidence: grep when it looks incomplete.

## Backend phase: what you are walking into (D-056)
- **Started 2026-10-12 (D-057).** You author backend, security and money; Claude reviews money and contracts (D-048). Work in
  stages with a check-in after each: B0 independent review of the Blueprint modules (read-only), B1 plan, B2 Foundation.
- **What exists:** `server/` (`contracts/` zod, `db/` Drizzle schema + client, `domain/` queries and quotes, `adapters/`
  email and payments, `config/env.ts`, `rate-limit.ts`), `drizzle/` migrations, `app/api/v1/queries` and `payments`.
- **Everything is gated off in production** by `content/site.config.json` flags read through `enquiryOpen()`,
  `paymentsOpen()`, `partnerEnquiryOpen()` in `lib/content.ts` (INVARIANTS 28, 29, 31). In development they are always open,
  so a test must stub `NODE_ENV`. A flag flips only through a new D-entry. Pay runs on a dev-only fixture of sample quotes.
- **Still open, never answered by a default:** the payment gateway and the system design (Sasanka, 2026-10-11), hosting,
  database and email provider (Q1), domain (Q2), LLP/KYC (Q5), quote and refund policy (Q8), retention and grievance
  officer (Q13), legal reviewer (Q14), partner form recipient (Q16). The Admin auth library (Better Auth or Auth.js, TRD
  section 1) needs its own D-entry.
- **Known risk:** `clientKey()` in `server/rate-limit.ts` trusts `x-nf-client-connection-ip`; verify on the real host
  before the enquiry or payments go live (D-049). Link records by internal ids only (INVARIANT 35).
- **Dependencies:** `npm audit --omit=dev` (2026-10-11) shows 3 high: `next` 16.3.6 (fixed in 16.4.0, non-major),
  `sharp`, `source-map-js`. Not fixed yet; a framework bump is its own PR and release.
- **Tools:** use context7 for current vendor and library docs (INVARIANT 24), `gh` for pull requests (the GitHub MCP
  package is deprecated), `npm run green` before any PR.

## Review pipeline (D-045)
The repo is public and every change reaches `main` by pull request. CI and CodeRabbit (`.coderabbit.yaml`, which
reads this file and `CLAUDE.md`) review each PR. As the author: work on a branch; read every CodeRabbit comment as
evidence, not truth; fix it or answer it with a reason; stop after 3 fix attempts and ask; report the findings to
Sasanka. Codex reviews Claude's changes and, once the
backend phase starts, authors backend, security and money work that Claude reviews (D-048). Only Sasanka merges, and a merge is a release. Never commit
secrets or owner-confidential documents.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
