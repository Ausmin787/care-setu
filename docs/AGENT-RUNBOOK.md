# Agent runbook — setup, verify, release, handover

Written to be pasted to an agent (D-049). Each block says what to do and where the human decides. Binding rules stay in
`docs/INVARIANTS.md`; this file only sequences work. If a step here contradicts an invariant or a decision, the invariant wins: say so.

## 1. Set up a machine
Node 24, no Docker. From the repo root:
1. `npm install`, then `npm run dev` (http://localhost:3000). The database is the in-process PGlite in `.pglite/`; nothing to provision (D-002).
2. Never create, read or print `.env.local`. If a value is needed, give Sasanka the command to run himself (INVARIANT 13).

## 2. Verify a change ("green", INVARIANT 26)
Run `npm run green`: lint, typecheck, unit tests, `knip` (unused code), `next build`, then Playwright with axe against the build (`prod`)
and `next dev` (`dev`). Locally the browser is the installed Chrome; CI installs Chromium.
- A failing axe check is a real finding. Fix the page, or if the text is pure decoration add it to `e2e/axe.ts` with the reason. Never widen a rule.
- Stop after 3 attempts on the same failure and report (AGENT-OPS §2).
- The 9-size device audit stays manual and is run before a release: start `npm run dev`, then `npm run audit:devices`.

## 3. Ship a change (INVARIANTS 22, 23, 33)
1. Branch from `main`; never commit to `main`.
2. Write the D-entry first if a decision or invariant changes; update STATUS, INVARIANTS, LOG; run `node .claude/hooks/docs-check.mjs`.
3. **Stop and ask Sasanka** before `git commit`, `git push`, opening a PR or any deploy. Each needs his explicit permission, every time.
4. After the PR is open: read every CodeRabbit comment as evidence, fix or answer it (3 fix loops at most) and report fixed and rejected to Sasanka.
5. Sasanka merges. A merge to `main` publishes the Netlify staging site, so a merge is a release.

## 4. Hosting and handover (owners' decision, Q1)
Today: the owners' tech team runs a public Netlify staging site that publishes every push to `main` (D-042). Production host, database
and email provider are not chosen; do not choose them. When they are, the server needs these values, set by the owners in their host's
secret store: `DATABASE_URL`, `EMAIL_TRANSPORT`, `EMAIL_TEAM_INBOX` (Q12), and `APP_BASE_URL` (an https address; without it the site hides
from search, INVARIANT 30). `server/config/env.ts` fails loudly when a production value is missing. Before any go-live, review the
setup with Sasanka and record it as a D-entry, and set the rate-limit address header for that host (`server/rate-limit.ts`).

## 5. Add a page or feature
Read the decision it touches (`grep -n '^## D-0NN' docs/DECISIONS.md`), the UI blueprint if it is UI work, and plan before code. Build behind its
dev-only flag when an owner question is open (INVARIANTS 25, 28..32). Add a browser test for the flow to `e2e/dev/` and, if the page is public,
its path to `built` in `e2e/prod/pages.spec.ts`.
