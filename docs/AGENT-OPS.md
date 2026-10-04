# Agent operations — how AI agents work on this project

Canonical home for orchestration, guardrails, evals, stop conditions, Jev usage and the Codex
handoff. Each section maps one of the 10 agent-engineering practices to a concrete mechanism
here (D-016).

## 1. The agent loop — think, act, observe, repeat
Every unit of work runs **plan → act → verify → record**:
- *Plan:* state the goal as a checkable condition ("contact form rejects missing consent: test X passes").
- *Act:* the smallest change that meets it (surgical; no speculative features).
- *Observe:* run the real commands and read the output. Don't infer success from the absence of errors.
- *Record:* a D-entry for decisions or deviations, with **Verified:** (commands run and their
  results) and **Not verified:** (what wasn't tested, and why). STATUS updated.

## 2. Loop engineering — stop conditions and iteration caps
| Loop | Cap / stop condition |
|---|---|
| Fixing a failing test/build | 3 attempts on the same failure → stop, report the diagnosis and options |
| Hook fires mid-edit | Fix the cause (usually a split dependent edit) → never disable the hook |
| Design exploration | Stops when the sample ledger is full and the direction is locked (Blueprint §1.6), not at "looks OK" |
| Browser automation | 2–3 failed attempts on one action → stop and ask (retry once for transient permission errors) |
| Research | One source per question (Blueprint §17.0); stop when the question is answered |
| Subagent audits | One pass + adversarial check on blocking findings; no open-ended re-audits |
| Waiting on owners | Never fill an open question with a default (INVARIANT 25); work on unblocked items instead |

## 3. Context engineering — what's in the window is the product
- **Tier 0 (automatic):** `STATUS.md` + `INVARIANTS.md` (imported by CLAUDE.md) + the decision
  index injected at SessionStart by `context-head.mjs`, with an integrity verdict.
- **Tier 1 (targeted):** read only the D-entry a task touches: `grep -n '^## D-0NN' docs/DECISIONS.md`.
- **Tier 2 (search):** grep PRD/TRD/ARCHITECTURE/COMPLIANCE; never open them whole.
- The Frontend Master Blueprint (~1,500 lines) is read **in full** at the start of each UI stage.
  Its §19 taste file and mistake log are mandatory.
- `/compact` with explicit keep-instructions at ~60% context. `/clear` when switching projects.

## 4. Tool design — few sharp tools, strict schemas
- Project scripts: `context-head.mjs` (index + `--check` + `--wrap`), `docs-check.mjs` (doc
  integrity), and at scaffold `npm run lint | typecheck | test | build`, plus a `verify` script that
  runs all four.
- zod schemas at every API boundary, shared between server and clients.
- Adapters with narrow interfaces: `PaymentProvider`, `EmailTransport`, DB via Drizzle.
- Prefer one precise tool over a clever chain. Prefer a skill over recalling an API from memory
  (Blueprint §5.3).

## 5. Memory architecture — what survives a session
| Layer | Holds | Lifetime |
|---|---|---|
| `docs/DECISIONS.md` | every decision, append-only | project |
| `docs/INVARIANTS.md` | binding constraints + open questions | slow-changing |
| `docs/STATUS.md` | current state, ≤15 lines | rewritten each session |
| `docs/LOG.md` | session trace (observability) | append-only |
| Auto-memory (`~/.claude/projects/.../memory/`) | cross-project pointers only (e.g. "Care Setu exists, docs are the truth") | user |
| Obsidian vault | session summaries via `/save-to-brain` | user |
Rule: the repo is the source of truth. Memory points to it and never duplicates its facts.
Replace stale text; never append a contradiction next to it.

## 6. Orchestration — one agent vs a manager and workers
- **The main agent owns judgement:** design direction, token system, motion architecture,
  anything owner-facing, and edits to canonical docs. Money and payment logic stay here until the
  backend phase starts, then move to Codex (D-048).
- **Delegate** broad read-only sweeps (4+ files, e.g. consistency audits, impact searches,
  dependency audits) to `Explore` or other read-only agents, with one narrow mission, an explicit
  file scope, a "done" definition and an exact output format. Audit agents get read-only tools
  (enforced by agent type, not by prompt).
- **Adversarial check:** a blocking finding gets a second, skeptical agent (or a hand check)
  before action (HA D-053: one agent finding was a false positive).
- **Codex** reviews Claude's changes (architecture, security) now, and from the start of the backend phase
  authors backend, security and money work, which Claude reviews (D-048), via `AGENTS.md`.
- No agent rosters or swarms (HA D-026/D-043).

## 7. Guardrails — read, write and execute scoped separately
| Scope | Mechanism |
|---|---|
| Read | `settings.json` denies `.env*`, dumps, backups. `refs/` is gitignored |
| Write | `protect-config.mjs` blocks loosening lint/TS/prettier configs; post-edit lint + typecheck (after scaffold); path-scoped rules in `.claude/rules/` |
| Execute | `bash-guards.mjs` blocks schema push and scans commits (secrets, env files, gateway keys, console.log); `ask` for commit, push, repo create, deploy; deny prod deploy |
| Data | No patient data to Jev or any third-party AI (D-010); synthetic data only in dev |

## 8. Evals — grade the path, not only the answer
- Test suites in TRD §6 (claims, headers, contracts, money, payments, consent, split).
- **Path grading:** each D-entry records the commands actually run and their outcomes, and a
  **Not verified** list. A result without its path is not accepted.
- **Design evals:** impeccable detect (running server, 2 viewports), web-design-guidelines,
  side-by-side vs samples, Blueprint §10 checklist.
- **Jev as a classifier eval (dev artifacts only):** e.g. `jev_check` each sentence of page copy
  against "does this state a fact that needs evidence?", then diff against CLAIMS.md. Act on
  `decision=auto`; review `decision=review` by hand. Jev is calibrated, not infallible.
- **Codex review** as an external eval at Stage 5.

## 9. Human-in-the-loop — gate anything irreversible
Always ask Sasanka first: git commit/push, repo creation or visibility change, any deploy,
switching to live payment keys, publishing legal text, shipping any claim, owner-facing copy,
installing new tools or skills (Blueprint §1.6), edits to global config outside the repo, and
spending money (subscriptions, credits).

## 10. Observability — trace every step, cost and latency
- `docs/LOG.md`: one block per session: date, stage, goal, commands run with pass/fail, files
  touched, cost-bearing actions (paid APIs, subagents launched), and what was left unverified.
- The status line (Jev router) shows model, context %, and the private-mode lock.
- In the product: `audit_log` for staff actions; structured server logs without personal data;
  payment events stored with signature result.

## Jev (TypeSafe System One) — usage and privacy (D-010)
- The project is on the Jev router's private list, so only public words are sent and direct Jev
  calls ask first.
- **Allowed inputs:** code, diffs, docs, copy drafts, test output, review findings.
- **Never:** query records, names, phones, emails, messages, payment records, `.env` content.
- Good uses: route review findings by severity (`jev_score`), check "does this copy claim a fact?"
  (`jev_check`), rank files for a question (`jev_rank`), classify commits or issues (`jev_classify`).
  Batch items about the same evidence in one call. Pass raw evidence, not conclusions.

## Codex handoff
See `AGENTS.md` → "Review handoff". A review request includes: the stage, the diff range, the
invariants most at risk, and the specific questions. Codex findings are evidence: each is
triaged (accept / reject-with-reason) in a D-entry.
