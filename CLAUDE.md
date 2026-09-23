# Care Setu — website (Phase 1)

Home-healthcare startup, Delhi NCR. Founders: Vishwanath Pratap Singh "Shiva" (founder), Ayush
Srivastava, Aashish Singh. **Sasanka is the tech lead**; the founders are the owners. Phase 1 is a
marketing + transactional website; the apps are future scope (D-001).

@docs/STATUS.md
@docs/INVARIANTS.md

## Read contract (tiered, from Hungry Anna D-056; adopted in D-016)
**Specs are re-derivable; decisions are not.** Reading every doc at session start was measured on
Hungry Anna at ~114k tokens. It got compacted mid-session and decisions were missed. It's replaced by:
- **Tier 0, automatic:** STATUS + INVARIANTS (imported above) + the decision index and integrity
  verdict injected at SessionStart by `.claude/hooks/context-head.mjs`. **If the verdict says
  FAIL, the summary docs can't be trusted. Read the source before building.**
- **Tier 1, targeted:** read only the decision a task touches:
  `grep -n '^## D-0NN' docs/DECISIONS.md`, then read that entry.
- **Tier 2, search:** grep `docs/PRD.md`, `TRD.md`, `ARCHITECTURE.md`, `COMPLIANCE.md`; never
  bulk-read them.
- **UI work:** read `~/.claude/FRONTEND-MASTER-BLUEPRINT.md` in full (including §19, the taste
  file and mistake log) before planning any UI. The plan (its §13 template) is the first
  deliverable, not code.
- Where things live: the **Docs map** in `README.md` (one canonical home per fact).

## Objection rule
If a request contradicts a decision or an invariant, **object before building**: name the
D-entry, state the conflict, and ask for an explicit override. The override is a new D-entry
written first, then the work happens. "I didn't know about that decision" is not an acceptable
explanation. Open owner questions (`docs/OWNER-QUESTIONS.md`) are **never** answered by a default,
even a "harmless" one (HA D-022).

## Trust nothing until confirmed
- Agent and subagent reports are evidence, not truth. Spot-check load-bearing claims by hand.
- Platform, library and legal behaviour: check current primary docs (context7, vendor docs) and
  cite them. Don't rely on memory (HA D-049/D-050).
- The founders' deck is aspiration, not fact: every factual claim goes through `docs/CLAIMS.md` (D-007).
- Report what you didn't test. "Verified structurally, not emulated" is a complete answer.
  Claiming coverage you don't have is the one unrecoverable error.

## Git and permissions
- **git commit, push, repo creation and any deploy require Sasanka's explicit permission** for
  that specific action (D-015). The settings `ask` list and the commit secret gate enforce this.
- Secrets live only in `.env.local` / environment stores. Never read, printed or committed (the
  settings deny `.env*` reads). Never handle Sasanka's API keys; give him the command to run himself.
- Never edit another project's files or hooks. Global config (`~/.claude/**`) only with permission.

## Engineering rules
1. The client never sends a price; amounts come from the server-side quote (D-004).
2. Money is integer paise; never float (D-004).
3. zod at every API boundary; SQL only via Drizzle (D-006).
4. No personal data in logs, analytics or any third-party AI (D-010).
5. Schema changes only as migration files (D-002).
6. The revenue split is configuration, never a literal (D-005).
7. "Green" = lint + typecheck + test + **build** (lint and tsc don't parse CSS).
8. **Edit boundaries:** an import and its usage, or a signature and its callers, go in ONE edit
   (Blueprint §19.5 #9/#14/#19: split edits trip the post-edit hook three times over).
9. Checker configs are never loosened to silence a finding (`protect-config.mjs`).
10. Minimum code that solves the problem. No speculative features, no abstraction for one use.

## Delegation (see docs/AGENT-OPS.md)
Delegate read-only sweeps of 4+ files to Explore/read-only agents with a narrow mission and output
format. Keep design direction, money logic, owner-facing text and canonical-doc edits in the main
thread. Blocking findings get an adversarial second check. Fix loops are capped at 3 attempts.

## Doc sync and close-out
After any change to scope, schema, structure or a decision: update every affected doc and
**replace** stale text (don't append contradictions). Stale docs are bugs.
Session close-out order: decision entry → `STATUS.md` → `INVARIANTS.md` → `docs/LOG.md` → memory
→ run `node .claude/hooks/context-head.mjs --wrap` and `node .claude/hooks/docs-check.mjs`.
Then ask about committing; commits are never automatic.

## Decision hygiene
Heading `## D-NNN · YYYY-MM-DD · Title`, dense numbering, bump STATUS `Decision head:` in the same
edit, supersession (and how much) in the heading, **Why:** + **Rejected:** always, and
**Verified:** + **Not verified:** when work was done. Past 200 KB, archive only wholly superseded
entries.

## Environment
Windows 10, PowerShell 5.1 + Git Bash. No Docker. Node 24. Chrome at
`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`. Prefer Write/Edit over
`Set-Content` for any file a program parses (a UTF-8 BOM breaks `JSON.parse`).
