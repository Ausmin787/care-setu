# Decision Log

Append-only. Newest at the bottom. Format: `## D-NNN · YYYY-MM-DD · Title`, then the decision,
then **Why:**, **Rejected:**, and where work was done, **Verified:** / **Not verified:** / **Files:**.

**Rules, enforced by `.claude/hooks/context-head.mjs --check` and `.claude/hooks/docs-check.mjs`:**
1. Numbering is dense: never skip a number, never reuse one.
2. `docs/STATUS.md`'s `Decision head:` is updated to the new number in the same edit.
3. A supersession is declared **in the heading**, and says how much: "superseded by D-0NN" vs
   "partially supersedes D-0NN items 1–2".
4. Every entry has **Why:** and **Rejected:**. An entry that records work also has **Verified:**
   and **Not verified:**. Claiming coverage you don't have is the one unrecoverable error.

Sources for D-001..D-016: the kickoff brief (`Downloads/Caresetu_Website_Brief_and_Kickoff.docx`,
21 Sep 2026), the founders' vision deck (`Downloads/CARE SETU VISION DOCS (2).pdf`, 40 pages),
and Sasanka's answers in the 2026-09-23 planning session.

---

## D-001 · 2026-09-23 · Phase 1 is the website only
Phase 1 builds a multi-page marketing + transactional website. The patient/family app and the
provider app are explicit future scope. Architecture choices (API layer, auth, schema) must not
need to be thrown away when those apps are built.
**Why:** The brief says so explicitly ("no urgent need to build an app right now").
**Rejected:** Starting a React Native/Flutter app now (the deck's tech-stack page lists them; that
page is aspirational, not a Phase 1 instruction).

## D-002 · 2026-09-23 · Vendor-neutral, local-first until the owners choose hosting
The owners will choose hosting and database; until then:
- Code lives in a **private GitHub repo under Sasanka's account (Ausmin787)**, transferable later.
- Data access goes through **Drizzle ORM over plain Postgres**. Dev uses **PGlite** (in-process
  Postgres, no Docker; this machine has no Docker). Any Postgres host (Supabase, Neon, RDS, other)
  can be dropped in by changing `DATABASE_URL`.
- Schema changes ship only as **migration files** (`drizzle-kit generate` → review → migrate).
  Direct `push` is blocked by settings and `bash-guards.mjs`.
- **Nothing is hosted** until the owners decide. Demos run locally or by screen-share.
- **Vercel Hobby is never used**, not even for a preview: its terms forbid commercial use (the
  lesson from Hungry Anna D-006 → D-009).
**Why:** The owners haven't decided, and Sasanka can't commit them. Vendor-specific features
(Supabase Auth/RLS as the only access control) would force a rewrite if they choose differently.
**Rejected:** Supabase-first dev project (lock-in before the owners choose); installing Docker +
local Supabase (heavy on Windows Home, still lock-in).

## D-003 · 2026-09-23 · Payments: sandbox now, live only after LLP + KYC; gateway not locked
Payment gateways (Razorpay, Cashfree, PhonePe PG) need KYC against a registered business PAN and
bank account, and the LLP isn't formed. The Payments flow and its transaction record are built
against a gateway **sandbox**, behind a `PaymentProvider` adapter. Razorpay is the first sandbox
adapter because the brief leans that way, but the choice is **not locked**. Fees and terms are
compared before go-live.
**Why:** It lets the full flow be built and tested now without pretending the business can take
money yet. The Hungry Anna lesson (D-004 → D-011) was that a default gateway locked in early got
undone.
**Rejected:** Locking Razorpay now; UPI-intent + manual mark-paid (no automatic confirmation);
deferring the Payments page entirely.

## D-004 · 2026-09-23 · Pay against a quote
The team assesses a need (usually by phone) and issues a **quote with a reference**. The patient
opens Payments (by link or by entering the reference) and pays the **server-side** amount on that
quote. The client never sends a price. The payment record links to the quote and, through it, to
the originating query.
**Why:** The deck publishes no prices, and home-care pricing depends on assessment. A
server-owned amount can't be tampered with.
**Rejected:** Public fixed-price packages (no confirmed prices exist); a free-amount field (open
to tampering and error).

## D-005 · 2026-09-23 · Provider payouts are manual back-office in Phase 1; split never hardcoded
There are no provider logins in Phase 1. `/admin` shows each transaction and the team pays providers
manually. The schema records the provider on a quote and a **configurable** platform-share value.
The draft ₹1,600 / ₹400 on ₹2,000 (≈80/20) split is **provisional and unconfirmed in writing**. It
never appears as a constant in code, copy or tests.
**Why:** It answers the brief's [CONFIRM], and the split is a business decision still with the
founders and their CA.
**Rejected:** A provider payout view in Phase 1 (adds auth, roles and a provider data model before
the split is even agreed).

## D-006 · 2026-09-23 · Team access: /admin + email alert, on a versioned API layer
Staff see queries and transactions in a minimal, login-protected `/admin`, and receive an email
alert for each new query. The site talks to its own server through a versioned `/api/v1` layer
with zod-validated contracts, so the future apps can reuse it. Email goes through a transport
adapter; dev uses a console transport.
**Why:** Records must reach the team (brief), and payments need somewhere to be reviewed. The API
layer keeps logic out of page components (brief: "a clean API layer").
**Rejected:** Email only (no place to review payments); admin only (queries could sit unseen).

## D-007 · 2026-09-23 · Claims evidence register
Every factual claim that could appear on the site (statistic, certification, compliance status,
partner or hospital name/logo, testimonial, "trusted by N", phone, email, address, domain, and
every photo) is registered in `docs/CLAIMS.md` with its evidence and status. Only `approved` rows
may ship. A test (added at scaffold) fails the build when copy contains an unregistered or
non-approved claim.
The deck currently contains, **none of which may ship without evidence**: ISO 9001/27001, "HIPAA
compliant/ISO 27001 aligned", "Clinical Establishments Act compliant", "Data protection
compliant", logos of AIIMS/Apollo/Fortis/Medanta/Max/BLK-Max/Sir Ganga Ram/CK Birla/Venkateshwar/
Jaypee/Global/Kokilaben (the deck itself labels them "proposed" or "examples"), "Trusted by
thousands of families", market stats (2.2 Cr+, 70%+, 40–60%, 10 Cr+), placeholder
`+91 123 456 7890`, `www.caresetu.com`/`hello@`/`partnerships@caresetu.com` (domain ownership
unverified), and AI-generated staff photos (uniforms with the logo; they must never be presented as
real staff).
**Why:** A health site's product is trust. A false certification or partner claim is a legal and
reputational risk for the founders, and a site that can't back its claims loses the trust it's
selling. Honesty rules: Blueprint §12, Hungry Anna D-062.
**Rejected:** Using the deck as approved copy; allowing unsourced stats.

## D-008 · 2026-09-23 · English at launch, i18n-ready
Phase 1 ships in English. All copy lives in message files and routes are locale-capable, so Hindi
and other languages (the deck lists 8) can be added without a rebuild. Translations must be
written or reviewed by a person. Raw machine translation never ships on a health site.
**Why:** Language-based care is a core promise in the deck, but no reviewed translations exist yet.
**Rejected:** English + Hindi at launch (no reviewed Hindi copy); English-only with hardcoded strings.

## D-009 · 2026-09-23 · Design direction is researched, sample-grounded, and Sasanka's pick
Claude researches in depth (Frontend Master Blueprint §1.5/§1.6/§3), builds a sample ledger, and
offers 2–3 sample-grounded directions with previews. Sasanka picks. The Refero MCP is **not
connected**. That is stated, not worked around. Sasanka may add samples at any point.
**Why:** Blueprint §19: design built from the agent's own taste was rejected as bland. Samples
are the brief.
**Rejected:** Waiting for owner-supplied samples before starting; buying Refero Pro first.

## D-010 · 2026-09-23 · Jev: private project; patient data never goes to any third-party AI
Care Setu is added to the Jev router's private paths and keywords
(`~/.claude/hooks/jev-skill-router.config.json`), so only public words leave the machine and
direct Jev calls ask first. **Patient/visitor personal data (queries, contact details, payment
records) is never sent to Jev or any other third-party AI service.** Jev is used only on dev
artifacts: classifying review findings, checking copy against the claims register, ranking files.
**Why:** Health-adjacent personal data under DPDP 2023, plus confidential founder business detail.
**Rejected:** Keeping the project public to Jev; using Jev in the product to auto-triage patient
queries (would send patient data to a third party without a consent basis).

## D-011 · 2026-09-23 · No fixed deadline; stage gates set the pace
There is no committed launch date for the website. The deck's "operations start Nov 2026, Delhi
NCR" is context, not a website deadline. Work proceeds stage by stage with a check-in after each.
**Why:** Sasanka's answer. The brief's working style is deliberate stages.
**Rejected:** Planning backwards from November 2026.

## D-012 · 2026-09-23 · Legal pages: Claude drafts, a lawyer/CA signs off before live
Claude drafts Privacy Policy/DPDP notice, Terms of Use, and Refund & Cancellation policy (the pages
payment gateways require for KYC). Each draft carries a visible **"DRAFT, not legal advice,
pending professional review"** marker and a list of uncertain points. None goes live until the
owners' lawyer or CA signs off (recorded as a D-entry).
**Why:** DPDP obligations and payment-KYC pages are needed before Contact and Payments go live,
and nobody on the team is a lawyer.
**Rejected:** Owner-supplied text only (none exists yet); placeholder stubs (would stall KYC).

## D-013 · 2026-09-23 · Page inventory beyond the brief's five
In addition to Home, Services, About, Contact and Payments, Phase 1 includes:
- per-service detail pages (`/services/<slug>`), using the deck's per-service copy, subject to D-007
- Partner with us (enquiries from hospitals, doctors and professionals)
- a configurable promotions banner. Any discount maths is server-side on the quote and waits for
  owner rules (OWNER-QUESTIONS Q9)
- FAQ, answered only from confirmed owner facts
- the legal pages from D-012
**Why:** The deck already has per-service content and a partnership model. The banner comes from
the brief's growth idea.
**Rejected:** Keeping to exactly five pages (loses SEO and the partner channel the deck relies on).

## D-014 · 2026-09-23 · Logo: hand-constructed SVG from the supplied JPEG, owner-confirmed
The canonical mark is the one Sasanka supplied (`brand/logo-source-whatsapp-2026-09-14.jpeg`,
500×500 JPEG): a lime rounded square holding a four-arm cross (white, olive, blue pills) with a
heart in a white centre, the "CARE SETU" wordmark and the tagline "CONNECTING CARE. EMPOWERING
LIVES." It is rebuilt as a **hand-constructed SVG** (geometry, not auto-trace). Colours sampled
from the JPEG, **approximate** because of compression: lime `#99CC3F`, olive `#6D9620`, blue
`#0F8FCC`, wordmark ≈`#0E8CB5`, tagline `#363636`. The reconstruction and hexes become canonical
only after the owners confirm them (Blueprint §15.1 rule 6). The deck's other variants (solid
square cross, serif "CareSetu") are not used.
**Why:** The mark must stay clean at any zoom, and a JPEG can't. Auto-tracing a compressed JPEG
reproduces the compression artifacts.
**Rejected:** Auto-trace (potrace or similar); using the deck's other logo variants.

## D-015 · 2026-09-23 · Git commit and push always need Sasanka's explicit permission
No commit, push, repository creation or deployment happens without Sasanka's explicit go-ahead
for that specific action. Enforced by the `ask` list in `.claude/settings.json` plus the
pre-commit secret gate in `bash-guards.mjs`.
**Why:** Standing rule across all of Sasanka's projects (Hungry Anna D-008, Blueprint §12).
**Rejected:** Auto-commit at stage ends.

## D-016 · 2026-09-23 · Governance: the Hungry Anna system, version 2
Adopted from Hungry Anna and upgraded with lessons from Hungry Anna, customer-churn,
loan-default and RFM:
- **Tiered read contract** (context-head): STATUS + INVARIANTS imported, decision index injected
  at SessionStart, with a mechanical integrity verdict (~5k tokens instead of reading everything,
  HA D-056).
- **`docs-check.mjs`** adds what HA lacked: STATUS size cap (HA's grew to 17 KB against a 15-line
  cap), mandatory Why/Rejected fields, invariant and owner-answer citations that must resolve.
- **Hooks ported with HA D-035 hardening**: schema-push block, pre-commit secret and env-file gate
  (adds gateway key patterns), checker-config protection, post-edit lint/typecheck (skips until
  scaffold).
- **One canonical home per fact** (Docs map in README), doc-sync on every change, `--wrap`
  close-out.
- **Evidence over assertion**: agent reports are evidence, not truth (HA D-017/D-021).
  Platform and legal claims are checked against current primary sources with a citation
  (HA D-049/D-050).
- **Open owner questions are never defaulted** (HA D-022). They live in `docs/OWNER-QUESTIONS.md`.
- The 10 agent-engineering practices (loop, stop conditions, context, tools, memory, orchestration,
  guardrails, evals, human-in-the-loop, observability) are mapped to mechanisms in
  `docs/AGENT-OPS.md`.
- The Frontend Master Blueprint governs all UI work. Codex is the second-opinion reviewer via
  `AGENTS.md`.
**Why:** The Hungry Anna system worked. Its failures (stale STATUS, oversized decision log,
defaulted owner questions, false "done" claims) are now checked mechanically instead of by promise.
**Rejected:** Importing ruflo/claude-flow agent rosters (HA D-026/D-043: noise); spec-kit
(`docs/plans/` fills that role, as in HA); reading every doc at session start (HA D-056).
**Verified:** see D-017.

## D-017 · 2026-09-23 · Stage 0 foundation installed and verified
Stage 0 files exist as planned: `CLAUDE.md`, `AGENTS.md`, `README.md` (Docs map), `.gitignore`,
`.env.example` (names only), `.claude/settings.json` (allow/deny/ask + hooks), four hooks
(`context-head.mjs`, an unmodified copy of the skill script; `bash-guards.mjs`; `protect-config.mjs`;
`post-edit-check.mjs`) plus the new `docs-check.mjs`, three path-scoped rules, and docs: STATUS,
INVARIANTS (26 + Open list), DECISIONS, OWNER-QUESTIONS (Q1–Q16; Q16 "Partner with us" was added
beyond the plan's Q1–Q15), CLAIMS (C-001..C-023), PRD, ARCHITECTURE, TRD, ROADMAP, COMPLIANCE,
AGENT-OPS, BRAND, LOG, `plans/`. Local git repo on `main`, **nothing committed** (D-015).

Three deviations from the Hungry Anna originals, all found during verification (HA's own hooks were
not touched):
1. `post-edit-check.mjs` skips cleanly before the scaffold (no eslint/tsc yet).
2. It **skips files outside the project** instead of reporting a blocking error. The HA version
   errors on every scratchpad write; that's noise, not safety, because outside paths are never linted.
3. `bash-guards.mjs` now matches the schema-push **subcommand directly after the tool** (flags
   skipped, every occurrence checked). The HA logic matched `push` anywhere after the tool, so it
   blocked legitimate chains (`drizzle-kit generate && git push`) and even this session's own
   doc-writing command, whose text merely mentioned both words. **Known residual gap:** a flag
   that takes a separate value (`supabase db -p x push`) slips past the hook. The settings `deny`
   list still covers the plain forms, and migrations-as-files remains the rule (INVARIANT 14).

Outside the repo (approved in planning, D-010): the Jev router config lists `Downloads\Care Setu`
and the keywords `care setu`/`caresetu`/`care-setu`/`care_setu` as private. Memory gained
`project_care_setu.md` + an index line, and `project_tool_stack.md` names Care Setu as a private project.
**Why:** Records what Stage 0 actually delivered and how it was proven, as the plan's verify gate requires.
**Rejected:** Forking `context-head.mjs` to add the STATUS cap (it would drift from the global
skill; a separate `docs-check.mjs` wraps it instead); removing the pre-commit scan's broad
`git … commit` detection (a false trigger there only costs a harmless scan).
**Verified:**
- `context-head.mjs --check` → exit 0; `docs-check.mjs` → exit 0.
- Break tests on a temp copy, each exit 1 as intended: falsified `Decision head`; a D-entry missing
  **Why:**; an invariant citing a non-existent D-099; STATUS padded to 19 lines (cap 15); Q16 marked
  ANSWERED with no D-entry. The real repo stays exit 0.
- Hook suite, 19/19 pass: schema push blocked in five forms (plain, quoted tokens, flag in between,
  drizzle-kit, second occurrence in a chain); `drizzle-kit generate`, a generate-then-git chain and
  text merely mentioning the words allowed; a staged `.env.local` + Razorpay live key blocked;
  `console.log` in `server/` blocked; clean commit and `.env.example` allowed; eslint/tsconfig edits
  blocked, app file allowed; post-edit skips pre-scaffold, markdown and outside paths.
- Live in-session proof: the guard (pre-fix) blocked two of the agent's own commands.
- Jev `isPrivate()`: Care Setu root and subfolder → "path", keyword elsewhere → "keyword", Hungry
  Anna control → "path", unrelated → null.
**Not verified:** the status-line lock icon was not observed on screen; the lint/typecheck branch of
`post-edit-check.mjs` can't run until Stage 3 installs eslint and typescript; the `ask` permission
prompts were not exercised (no commit or push was attempted); COMPLIANCE.md rows come from general
knowledge, not primary sources (each is marked for lawyer/CA verification).
**Files:** everything listed above; `~/.claude/hooks/jev-skill-router.config.json`;
`~/.claude/projects/C--Users-Sasanka/memory/{project_care_setu.md, MEMORY.md, project_tool_stack.md}`.
