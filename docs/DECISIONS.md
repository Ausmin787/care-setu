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

## D-014 · 2026-09-23 · Logo: hand-constructed SVG from the supplied JPEG, owner-confirmed *(colour values partially superseded by D-018; the approach stands)*
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

## D-018 · 2026-09-23 · Logo rebuilt as vector and verified against the source *(partially supersedes D-014: colour values only)*
The supplied logo is rebuilt as `brand/logo.svg` (lockup, text as outlines), `logo-mark.svg`
(tile) and `logo-mono.svg` (a one-colour knockout **proposal**, not in the source). All three come
from the reproducible generator `brand/build_logo.py`. `brand/verify_logo.py` re-checks them
against the JPEG. Measured construction: two identical round-capped plus crosses (60-unit bars,
80-unit reach), a white one behind offset 38 units left, and a coloured one in front with an olive
heart in the white centre square. Full detail in `docs/BRAND.md`.
**Colour values (supersede D-014's single-pixel samples):** lime `#9BCC3C` (was `#99CC3F`), olive
`#6D9620`, blue `#0F8FCC`, wordmark `#138AB2` (was ≈`#0E8CB5`; a genuinely darker teal than the
arms, exact value uncertain), tagline `#363636` (approximate). These are medians of eroded region
interiors. Still provisional until the owners confirm (Q4).
**Fonts:** wordmark most likely Open Sans Bold, +0.02 em. Tagline Open Sans, +0.288 em, weight
assumed Regular. Open Sans is bundled in `brand/fonts/` under SIL OFL 1.1 with its licence.
**Interpretation choices** (flagged for Q4): crosses clipped to the tile; text centred on the tile
axis; heart centred on the front cross.
**Size floor:** full mark ≥ 24 px. A 16 px favicon needs a simplified variant, which is left to the owners.
Also added `.gitattributes` (LF line endings; the first commit warned of CRLF conversion).
**Why:** D-014 asked for a clean vector that doesn't break when zoomed. Measuring from the pixels,
rather than eyeballing, is what makes "faithful" checkable.
**Rejected:** auto-trace (reproduces JPEG artifacts); Segoe UI or Arial for the wordmark (lower
fit); keeping the source's off-centre text and the white cross spilling past the tile (flagged, not
silently kept); an in-house 16 px favicon simplification (a design decision for the owners).
**Verified:** headless-Chrome render on the source's 500×500 frame vs the JPEG, colour-class
agreement on interior pixels. Mark 100.00%, heart 100.00%, wordmark 99.88%, tagline 100.00%
(mean abs RGB error 5.1 / 9.1 / 19.4 / 13.8). The 400% side-by-side and difference image were
inspected by eye; only anti-aliasing outlines remain. The mark was rendered at 16/20/24/32/48/64/512
px on light and dark grounds; the lockup and mono were rendered on light and dark.
**Two errors caught by looking, not by the numbers:** (1) the first heart was drawn with its tangent
points swapped (two dots on a stalk), yet scored 98% "olive agreement" because the heart is a tiny
share of olive pixels. A dedicated heart region now guards it. (2) The first tagline fit (width-only)
drifted letter by letter. A least-squares fit of all 31 letter centres (RMS 0.30 px) replaced it.
**Not verified:** exact brand hexes and fonts (source is a 500 px JPEG; owners, Q4); print output
(no CMYK or physical test); `logo-mono.svg` is untested with owners and is a proposal; SVG rendering
was checked in Chrome only (not Safari/Firefox).
**Files:** `brand/{build_logo.py, verify_logo.py, logo.svg, logo-mark.svg, logo-mono.svg, fonts/}`,
`docs/BRAND.md`, `.gitattributes`.

## D-019 · 2026-09-23 · Code-graph memory (gbrain): deferred to Stage 3/4, code only, as a measured trial
Sasanka raised using a code-graph/brain tool (gbrain, Graphify-style) so the agent forgets less as the
project grows. Decision:
- **Not now.** There are zero code files, only ~20 docs. Same finding as Hungry Anna D-056 (324 docs
  vs 26 code files), where Graphify's free AST half barely applied.
- **Scope when adopted: code navigation only** (callers, definitions, change impact). Decisions and
  constraints stay with context-head + INVARIANTS, which give a *checked, complete* list at every
  session start. Semantic search can only return "probably relevant" and can silently miss the
  decision that should block a change.
- **Trigger:** after the Stage 3 scaffold and the first Stage 4 pages exist.
- **Adoption gate, all required:**
  (1) confirm where gbrain computes embeddings. If content leaves the machine, it needs Sasanka's
      explicit approval (the project is private, D-010).
  (2) The brain is derived from the repo automatically and never hand-edited; repo docs stay the
      source of truth. This avoids the doc drift seen in churn, loan and RFM.
  (3) A measured trial: ~10 code questions with known answers, answered with and without gbrain.
      Keep it only if it clearly wins, and record the numbers in a D-entry either way.
- State found 2026-09-23: gbrain v0.42.65 installed on this machine with a local PGLite engine,
  4 pages, never synced; v0.52.2 available. The embedding provider was **not** checked.
**Why:** The two kinds of forgetting need different tools: a verified index for decisions, a graph
for code structure. Only the second is a gap, and it opens only once code exists.
**Rejected:** Indexing now (nothing to graph; token cost on docs); using the brain for decisions
(replaces a completeness guarantee with a probabilistic search); rejecting it outright (it does
cover a real gap once the codebase grows).

## D-020 · 2026-09-25 · Design direction locked: "Setu Lines"; Anek type family; derived action blue
Stage 2 research ran in Claude in Chrome (D-009) across home-care sites (Portea, Care24, Elder,
Pristyn Care), the NHS digital service manual, Mobbin, Refero, Recent, Cue Kit, Design Spells and
Google Fonts. Sasanka picked **A · Setu Lines** from three sample-grounded options (the recommended one):
- **Direction:** hospital-to-home drawn as a transit/wayfinding network. The logo's arm colours
  (lime, olive, blue) are service *lines*, Hospital and Home are stations. Swiss grid / diagram
  archetype on a white ground with ink type. Colours appear only on lines, stations and badges.
  Full plan, sample ledger and tokens: `docs/plans/stage-2-design.md`; system: `DESIGN.md`.
- **Flows (apply to every page):** enquiry = one question per page in Elder's order with NHS rules
  (why-we-ask hint, "not sure", back link, left "Continue", "Question n of 6", check answers,
  confirmation with reference and next steps, no invented SLA); an emergency interruption ("Home care
  is not emergency care. Call 112"); pay page = summary list + one Pay button, result only from the
  verified webhook (D-003/D-004).
- **Type:** Anek Latin + Anek Devanagari (Ek Type, OFL, Google Fonts), one voice for English now and
  Hindi later (D-008). This is a recorded exception to Blueprint §6.5 (Best Free Fonts has no
  Devanagari face), approved by Sasanka.
- **Action colour:** `#0D7CB1`, the brand blue ×0.87, because white on the brand blue `#0F8FCC` is only
  3.61:1 (AA needs 4.5). Lime on white is 1.89:1, so lime lines are always ink-cased and never carry
  meaning alone. All provisional until the owners confirm hexes (Q4).
- **Signature motion (built in Stage 4):** "line isolate": the chosen service line lights end to end
  while the others ghost. Draw-on is deliberately not the signature (Hungry Anna /visit used it).
**Why:** It's the only option native to the subject ("setu" = bridge; Delhi NCR's metro grammar; the
logo's cross already reads as crossing lines). It needs no photography (C-014), and it differs from the
last ledger project on 6 of 7 axes.
**Rejected:** B "Care sheet" (only 4/7 axes; repeats Hungry Anna's printed/stamped idiom); C "Asked and
answered" (the genre-accepted editorial look); the health genre cliché of cream + serif + pill
(Refero Alden/Ease/Hims); a Best Free Fonts Latin face with a separate Devanagari face later.
**Verified:** contrast of every token pair computed (ink/canvas 16.78, muted 7.22, action 4.63,
ink/lime 8.87); Anek's width axis loads at 75 (headless Chrome render of the comp at 1440px); NHS
button values read from the published `nhsuk-frontend` CSS; static comp published for review
(https://claude.ai/artifact/83S7EtQCudvEKQoNaYyK3v).
**Reviewed:** `impeccable detect` (1440 + 390, 10 findings) and the Taste pre-flight check; every finding has a
recorded decision in `docs/plans/stage-2-design.md` (fixes land in Stage 4; the comp stays as sent to owners).
**Not verified:** a true 360/390px screenshot (mobile styles written; headless Chrome can't go below ~500px); Refero MCP not connected (free site used); Mobbin Health sites/Flows Pro-locked; the
`image-to-code` skill's image-generation step was not run (structure was extracted from captures);
Chrome dropped twice mid-session. Owner copy, service set (Q6), hours (Q12) are all still open.

## D-021 · 2026-09-26 · Trust hero with an illustrated care scene; build starts (partially supersedes D-020: hero, signature motion, colour-only-on-lines)
Sasanka reviewed the Stage 2 comp and rejected its hero: the Hospital-to-Home metro diagram was
"looking bad", "very confusing", and "horrible" on mobile. He asked for a hero that earns **trust**
(not techy, not flashy), checked against Supahero, and for the build to begin on localhost with motion,
without further static comps. He picked from two AskUserQuestion options (the recommended one each time):
- **Hero = illustrated care scene** (Supahero Spectrum.Life layout; Airbnb Homes reassurances; Wise
  headline weight). Left: headline, a lede of ≤20 words, one "Talk to us" action, three reassurance lines,
  the emergency note. Right: a 4:5 rounded panel holding an **AI-generated illustration** (ChatGPT image,
  run by Sasanka): a carer and an elderly man at home. It is drawn, never photoreal, shows no real person and
  wears no logo, so it isn't presented as real staff (INVARIANT 16; CLAIMS C-027). The metro network
  diagram is removed from the hero.
- **Reassurances only from recorded facts:** quote before payment (D-004, C-024), a callback from the
  team (D-006 / PRD F1, C-025), Delhi NCR (PRD, C-026). "One coordinator for everything" was dropped
  because nothing evidences it yet.
- **Signature motion = "live trip"** on How it works: a position marker travels the Transit-style spine
  on scroll and each station turns from upcoming to passed. It replaces "line isolate" as the signature;
  line isolate stays as a small state on the services index.
- **Colour rule relaxed once:** the brand line colours may appear as small accents inside the one hero
  illustration. Everywhere else, D-020's rule holds.
- **Light mode only** for now (Taste finding 13 waived): the lockup is light-ground only and Q4 is open.
  The tokens go through the semantic layer, so a dark theme is a variable swap later.
- **Build scope:** Stage 3 scaffold (lean) + the Home page, then a check-in (D-011). Drizzle/PGlite,
  `/api/v1`, auth and CI move to the Contact page, the first page that needs them.
- **Owner review:** the owners review the running Home page instead of the comp. Sasanka (tech lead)
  authorised going ahead; all hero copy is draft until the owners approve it.
Kept from D-020: Anek type, the action blue `#0D7CB1`, NHS button physics, the enquiry flow, line badges,
How it works as a Transit trip, the services index, the partner band, the footer legend.
**Why:** For a family arranging care after a hospital stay, trust comes from seeing people and hearing plainly
what happens next, not from a network metaphor they have to decode. Every health hero studied on Supahero
carries trust through a human scene. We have no photos and may not fake them, so a clearly drawn scene is the honest
equivalent. The comp's diagram also failed Blueprint §1.5: the trip section didn't match its sample.
**Rejected:** "Question-first, no image" (reads as a form, not a care brand); "Scene + question" (too tight at
720px and on mobile); a photoreal AI image (INVARIANT 16); a hand-drawn SVG scene (weak at human figures);
keeping draw-on as the signature (repeats Hungry Anna D-083).
**Built as (deviation from the plan, recorded):** the hero entrance is CSS, not anime.js. The words are
server-rendered in masks and rise from the first paint (Smooth UI "word cut staircase"), then the "at home"
underline draws and the panel opens. JS would paint the headline, hide it on hydration, and reveal it again,
and §9.2 bans motion that delays reading. The live trip is GSAP ScrollTrigger (scrub, desktop) with
per-row ScrollTriggers on touch; no pin.
**Verified (2026-09-26, Playwright at real viewports on the dev server):** green (lint, typecheck, 28 tests,
build); 0px horizontal overflow at 360/390/768/1024/1440; hero CTA above the fold at 360×780 (377px),
390×844 (386px) and 1440×720 (449px, whole hero ends at 689px); the trip matches the Transit sample's
geometry (side-by-sides in `refs/build-sbs/`); live-trip states step correctly through the scroll
(1110000 → 1111110 → 1111111); reduced motion *emulated* (no animation, no live mode, full route); 0 transient
attributes in the server HTML; console clean; `impeccable detect` clean at 1280 and 1440, with one finding
at 390 (the wordmark `#138AB2` is 4.0:1, waived as a logotype under WCAG 1.4.3); Taste pre-flight (one fail
fixed: the footer "Contact" became "Talk to us"); the web-interface-guidelines audit (skip link, touch-action,
and per-frame layout reads fixed); tab path with visible focus; heading outline; the fact audit of every
route's HTML is clean; security headers served.
**Illustration (same day):** Sasanka generated two ChatGPT variants and left the pick to Claude. Kept
`03_33_16`: quiet upper-left wall and figures in the lower two-thirds, so it crops cleanly to about 1:1 at
1440×720 and to 4:3 on mobile (checked by screenshot, faces in frame); calmer and flatter than `03_33_29`,
whose higher heads and foreground blur would clip on mobile. The alternate is kept in `refs/illustrations/`.
**Not verified:** a real phone or Safari (Chromium only); `impeccable init`/PRODUCT.md (deferred to the
next session); owner approval of any copy or of the illustration.

## D-022 · 2026-09-26 · Strict CSP by per-request nonce; every page renders dynamically
TRD §4 asks for `script-src 'self'` with no inline allowance. Next.js 16 injects inline scripts, so the
only strict option (bundled guide `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`)
is a nonce generated per request in `proxy.ts` with `'strict-dynamic'`. Consequence: **all pages render
dynamically** (no static optimisation, no ISR, no PPR). `style-src` keeps `'unsafe-inline'` because
`next/image` `fill` and style attributes need it. Dev adds `'unsafe-eval'` (React debugging); production never
does. The policy lives in `lib/security.ts`, used by `proxy.ts` and `next.config.ts`, and asserted by
`tests/security-headers.test.ts`.
**Why:** The site takes health enquiries and payments (TRD §4, D-010). A marketing site this small loses
little from dynamic rendering, and it keeps one strict policy on every page instead of a weaker one on some.
**Rejected:** `'unsafe-inline'` scripts (defeats the CSP); experimental SRI hash mode (experimental, and it
doesn't cover inline scripts); a nonce on only the Contact/Pay routes (two policies to reason about).

## D-023 · 2026-09-26 · Web wordmark in Unbounded; ink footer with a moving "care setu" wordmark (partially supersedes D-020/D-021: wordmark face, colour-only-on-lines, one moving signature)
Sasanka found the nav "CARE SETU" generic and asked for a distinct face, plus Spectrum.Life's footer: a huge
wordmark filled with a slowly moving, grainy gradient. Both requests contradicted recorded rules. The conflict was
named before building, and Sasanka chose from AskUserQuestion options:
- **Web wordmark = Unbounded 800** (OFL, Google Fonts via `next/font`, self-hosted): uppercase "CARE SETU" in the
  nav lockup (Sasanka's follow-up the same day; 20px, +0.01em, 16px on mobile, measured to fit at 381px), lowercase
  "care setu" in the footer. It replaces Open Sans 700 on the website only: `brand/` logo files are untouched, and
  the logo's own fonts stay an open owner question (Q4). **Provisional until the owners confirm.** Sasanka picked
  this over the recommended Anek Latin width 125 and over Parkinsans (comparison sheet rendered in headless Chrome).
- **Footer on ink, with the wordmark filling its width.** Inside the letters, the logo's line colours (action blue →
  brand blue → lime → a pale core) drift through a domain-warped field with film grain. Spectrum's mechanics were
  read from its source (PIXI displacement filter over a grainy texture, map scale on a 9 s yoyo, masked by a
  wordmark SVG). Ours is a small hand-written WebGL shader with the text drawn into a mask texture: no PIXI, no
  textures fetched. It runs only while on screen, draws one still frame under reduced motion, and falls back to a
  static CSS gradient clipped to the text (no JS or no WebGL). It is decorative and `aria-hidden`.
- **Rules relaxed:** the line colours may also fill this one footer wordmark (D-021 allowed only the hero
  illustration); the footer becomes a second ink block. The "live trip" stays the signature motion; the footer
  drift is ambient, off-screen it doesn't run.
**Why:** The nav name was the logo file's generic face, and the footer gave the brand no closing moment. Spectrum's
footer is a trust-brand reference already in the ledger (the D-021 hero came from it). Taking its mechanics but
recolouring to our lines keeps it ours: Spectrum's violet palette was declined because it is their brand and
purple-to-blue is a Blueprint §0.1 slop tell.
**Rejected:** Anek Latin width 125 (recommended; keeps one family); Parkinsans; Spectrum's purple; blue-only
gradient; PIXI.js (a ~450 KB dependency for one effect); a CSS-only blob drift (can't warp like the displacement map).
**Built as:** `components/motion/FooterWordmark.tsx` (+ module CSS), `components/site/Footer.*`, nav wordmark in
`components/site/Nav.*`, font in `app/layout.tsx`. The effect creates its own canvas per mount: React StrictMode's
double mount otherwise handed the second mount the context the first cleanup had lost (caught in dev).
**Verified (2026-09-26):** green (lint, typecheck, tests, build); nav wordmark computes to Unbounded in Chrome;
headless Chrome (SwiftShader WebGL) at 1440 and 520: the wordmark spans the column, frames 10 s apart differ
(drift confirmed), no horizontal overflow at 1440; server HTML has the text fallback and 0 `data-live`.
**Not verified:** reduced motion *emulated* (Playwright MCP not connected this session; structural only: the loop
is gated on `prefers-reduced-motion`); a real phone/Safari or a true 360/390 px render; GPU cost on a low-end
Android; `impeccable detect` and the Taste pre-flight on the new footer; owner approval of the wordmark face (Q4).

## D-024 · 2026-09-26 · Owner answers: contact details, response time, service area, launch services, a fourth founder *(phone and email superseded by D-035)*
The owners answered through Sasanka (2026-09-26) and pointed to their own prototype site
(`care-setu.netlify.app`, read in Chrome the same day) for the service list. Sasanka confirmed each reading in an
AskUserQuestion round:
- **Contact (Q3):** phone and WhatsApp **+91 84489 12820** (their site says "Call or WhatsApp"); email
  **care.setu.1@gmail.com**; office **4B Grover Chamber, Karol Bagh, Delhi 110005** (as given: "4b Grover chamber
  karolbagh 110005"; only capitalisation and the city name, which the PIN code fixes, were added).
- **Response time (Q12, partly):** "We call back within 2 hours, every day 7 AM – 10 PM". The 2 hours is the
  owner's answer; the hours come from their site. A 2-hour promise outside those hours would be untrue, so the two
  always appear together. Who receives the alert email is still open.
- **Service area (Q7):** Noida and Delhi ("More cities coming soon" on their site). Replaces "Delhi NCR" in copy.
- **Launch services (Q6):** the eight on their site: Nurse at Home, GDA (attendant) at Home, Doctor at Home,
  Physiotherapy, Lab Sample Collection, ICU Care at Home, Nursing Procedures, Medical Equipment (rent, buy,
  buyback). The Q6 note's regulated items (e-pharmacy, vaccination, teleconsultation, EMI) are not among them.
- **Founders:** their site lists **Saurabh Chauhan** (a doctor) as a founder, alongside Vishwanath Pratap Singh;
  Ayush Srivastava and Aashish Singh as before. Recorded in the docs; nothing about founders ships until C-021.
**Not carried over from their site:** "10+ partner hospitals", "2 cities / 8 services" stat chips, "verified &
trained", "background-checked", "sourced from multiple hospitals", "transparent pricing / no hidden charges",
"hospital-grade equipment". Each is a claim with no evidence yet (D-007, Q10); they stay off until they have it.
**Why:** These are owner-supplied facts, which the claims register accepts as evidence when recorded as a D-entry.
**Rejected:** showing "within 2 hours" without the hours; keeping "Delhi NCR"; holding ICU care and doctor visits
back as "coming soon" (Sasanka took the owner's list as the launch list).
**Watch:** lab sample collection normally runs through a licensed lab; ICU care at home needs trained
critical-care staff and equipment on call. Worth confirming with the owners before go-live, but not a gate.

## D-025 · 2026-09-26 · Services page: the "line catalogue"; eight services grouped into three lines
Sasanka picked the structure in two AskUserQuestion rounds. The first offered three of seven structures dealt by
`impeccable concept-seed` (build-your-list, line map, first days home); he picked the line map, then asked whether
the tool-list sites had been checked for how companies show many services without a mess. They had not; the
research ran next (Mobbin sections "services" / "home care" / "treatments", Recent Health filter, Superpower) and
the second round confirmed the merged structure:
- **Grouping (Apollo Home Care's split by kind of need):** Line 01 Care at home (lime): Nurse at Home, GDA at
  Home, Nursing procedures, ICU care at home. Line 02 Visits and tests (blue): Doctor at Home, Physiotherapy, Lab
  sample collection. Line 03 Equipment (olive): Rent, Buy, Sell back. The lines stop being one service each;
  Home's services index, the trip's care leg and the footer legend now show the three lines.
- **Page (Superpower "What we test", measured at 1280px):** a sticky left rail (~260px) with the three lines and
  their counts; per line a heading (badge, name, count) over quiet rows `service | who comes | +` that open to one
  plain sentence, "Talk to us" and a small grey note. Our twist: each line's rows hang on its coloured spine with
  station discs (the Home trip's language). Rows are native `<details>`: no JS, all closed by default.
- **Hero:** title, the area, the callback promise with its hours (C-031), the phone, one "Talk to us", the
  emergency note. No separate "how it works" section (Home's trip already has it; Sasanka dislikes repeated sections).
- **Copy:** the owners' one line per service, with quality words removed ("trained", "experienced", "accurate",
  "safely", "fair price", "partner hospitals") until they have evidence (C-015, Q10). Draft until the owners approve.
**Why:** Eight services in one flat grid is the genre's default (both owner-supplied sites use it) and reads as a
wall. Grouping into three lines keeps the logo's line system meaningful, and the catalogue pattern keeps every
detail one tap away without showing it all at once.
**Rejected:** build-your-list (dealt as the lead; a tick list that can't yet submit anywhere); first days home (its
order would be invented); the plain line map (loses the rail and the quiet rows); Apollo/owner-site card grids with
icon medallions and pill buttons (Blueprint §19.3); split by stays/visits/equipment.
**Built as:** `app/services/page.tsx` + `page.module.css` (server component, native `<details>`), data in
`content/services.json` `catalogue` (typed `lines` in `lib/content.ts`), copy in `en.json` `servicesPage`.
**Reviewed:** `impeccable detect` at 1440 and 390: no findings from this page (the footer wordmark's CSS gradient
fallback, kept per D-023; the nav logotype at 4.0:1, waived per D-021). Taste pre-flight: three fails fixed (the
en-dash in "7 AM – 10 PM" became "to"; "Ask about X" became "Talk to us about X", one label per intent; line badges
moved beside the headings instead of above them as eyebrows). Waived: five hero elements (the emergency note and the
callback promise are required, D-020/D-024), light mode only (D-021), the ink footer (D-023).
**Verified (2026-09-26):** green (lint, typecheck, 29 tests, build); headless Chrome at 1280/1440 and 520 (spine,
discs, rail, rows, the two-column head, mobile stacking); an opened row in Chrome (the disc fills, the sentence, the
link, the note); sticky rail sits 32px under the nav; no horizontal overflow at 1280; the side-by-side with
Superpower in `refs/services/`; fact audit of `/` and `/services` HTML (owner facts present; no quality claims,
"Delhi NCR", 24x7 or dashes).
**Not verified:** a true 360/390px render (headless floor ~500px; Playwright MCP not connected); a real phone or
Safari; the web-design-guidelines audit; owner approval of the grouping names and the copy (Q15).

## D-026 · 2026-09-27 · Owner review round 1: "Setu Lines" look rejected; direction reopened; owner-taste loop (partially supersedes D-020/D-021/D-023/D-025: look, hero, light-only, Services structure)
The owner reviewed Home and Services on localhost (through Sasanka, 2026-09-27):
- **Rejected:** the overall look ("generic light background, simple blue buttons, like a normal Indian healthcare
  site") and the Services page's design and structure (D-025). Services is to be redone, with animation.
- **Liked:** the Home "From the ward to your door" trip and its live-trip animation (D-021), and the ink footer's
  big moving "care setu" wordmark (D-023).
- **Reference:** the hero of myhealthprac.com. Read with Playwright the same day (Claude in Chrome not connected):
  one muted, looping, inline 5.4 s video at 1280×720 (file named `topaz_hero`, so likely AI-upscaled), warm dark
  grade, a two-line headline in a large grotesk at left, three icon feature lines, black/white pill buttons with a
  round arrow; the rest of their page is warm greige and sand, full-bleed photos, wide spacing.
- **Mandate:** the owner told Sasanka to do it "his way" after this review. Sasanka chose to build the new direction,
  then take it back to the owner, with every agree/disagree recorded in `docs/OWNER-TASTE.md` and analysed there, so
  later pages start from sources aimed at the owner's taste rather than guesses.
**Decided:**
- The "Setu Lines" look (D-020: light mode, one blue control, Anek, colour only on lines; D-021: illustrated hero,
  light only) is **no longer binding**. The new direction is set by a Blueprint §13 plan and locked in its own
  D-entry before code.
- **Kept, re-skinned to the new direction:** the ward-to-door trip and its live-trip motion (how it works stays),
  and the footer wordmark's moving fill (the mechanics stay; the gradient is re-toned).
- **Home hero = a looping, muted background video** in the spirit of the reference, not a copy of it. Sasanka
  generates the clip with Gemini (Veo) from Claude's prompt. It is anonymous mood footage: never captioned or implied
  as our staff, patients or premises (Invariant 16); its provenance goes in `CLAIMS.md`. The plain reassurances
  (callback promise with hours, area, phone, emergency note) stay in the hero (D-024).
- **Order:** direction plan → Home hero → re-skin trip and footer → Services redesign with animation.
- Still binding: Unbounded wordmark provisional (D-023, Q4), CSP (D-022), claims rules (D-007), owner facts (D-024).
**Why:** The owner is the client and rejected the look, not the facts. His three likes (cinematic footage, story
motion, a bold moving brand moment) point one way: premium and emotional over template-clinical. Recording each
round turns taste into evidence instead of re-guessing it per page.
**Rejected:** re-skinning Setu Lines with darker colours (the owner rejected the feel, not the palette only);
copying myhealthprac's eye (their motif says diagnostics; ours is home care); stock footage first (few Indian
subjects; Sasanka can generate); redoing Services before the new look exists.
**Hero clip (added the same day):** Pexels 7522351 (hands on a white bed) was rejected: high-key white against the
warm dark direction, reads as illness, and it comes from a widely reused stock shoot. A sweep of Pexels (16 queries),
Mixkit and Supahero/Recent/Biograph found no free clip that is Indian, at home, warm and loopable. Sasanka generated
one in Gemini (Veo) instead (C-034). Gemini's visible ✦ mark (48px at x 1136–1184, y 576–624 of 1280×720) is removed by
cropping to 1280×560, not by an eraser tool; SynthID stays. Google's help page offers watermark-off only to AI Ultra
users in India and its policy bans passing AI content off as human-made (§4.5); Claude recommended a footer line
"Some scenes on this site are AI-generated", and **Sasanka declined it**. The clip is never presented as real (Invariant
16). ffmpeg 9.0.2 installed with winget, with Sasanka's permission, for the crop and encode.

## D-027 · 2026-09-27 · Direction locked: "Warm Room" (supersedes D-020's look and D-021's hero; partially supersedes D-023: footer stops, D-025: Services structure)
Sasanka picked Warm Room from three sample-grounded options (AskUserQuestion with previews; Night Room and Greige
Clinic rejected), then approved the Blueprint §13 plan (`~/.claude/plans/go-ahead-serialized-creek.md`).
- **Look:** a warm parchment page (Function Health's range, #FBF6EE / #F3ECE1), warm near-black ink, a sand block
  (#D8C7AE); rules from Refero Alveos One (achromatic value family, near-black actions, 25/100px radius, no shadows;
  extract in `refs/warm-room/`). Ink bands (`data-mode="ink"`) for the trip and the footer.
- **The logo's colours stay the only chroma** (Sasanka: people remember the logo as green, blue and white; the warm
  palette must not overshadow it or its meaning). No honey/terracotta accent. Line colours stay on trip spines,
  discs and badges; the footer wordmark drifts through the logo's blue, green and white. The owner reviews this in
  round 2; if he dislikes it, the lines re-tone warm (new D-entry).
- **Buttons:** ink pills (cream on dark) with a round disc and a filled Tabler arrow; the logo blue appears only in
  the disc and focus details, never as a filled button (the owner disliked "simple blue buttons").
- **Type:** display **Petrona** (OFL, variable, light 300 with italics), picked by Sasanka from a headless-Chrome
  sheet setting Petrona / Labrada / Faustina in the real hero over the video frame (Labrada wrapped to 3 lines;
  Faustina sturdier but less refined). Anek Latin body at normal width (keeps Devanagari, D-008), Unbounded
  wordmark (D-023).
- **Home hero:** the Gemini loop (C-034) full-bleed with a warm dark scrim at left, existing hero copy, a fact row,
  a live "taking calls now" status computed from the D-024 hours, the emergency note, and a pause button (WCAG
  2.2.2); poster only under reduced motion. Nav becomes a solid cream floating bar (keeps the logo on a light ground).
- **Kept mechanics:** the live trip (D-021) and the footer shader (D-023), re-skinned only.
- **Services (Stage B):** three hairline columns (one per line) with native `<details>` rows and a line-draw on
  scroll; the sticky rail goes. Built after the Home check-in.
**Why:** The owner's three likes (cinematic footage, story motion, a bold moving brand moment) and his reference
(myhealthprac: greige, black pills, sand block, footage) point to warm and premium; Function shows the same shot
(a face at right in warm light) carried by a parchment page, which suits older readers better than a dark page.
**Rejected:** Night Room (heavy to read for older visitors; needs photography everywhere); Greige Clinic (closest
to myhealthprac, so it risks reading as a copy); a honey accent (would compete with the logo's colours);
frosted-glass nav (slop tell; the logo lockup needs a light ground).
**Stage A built (2026-09-27, Home):** Petrona via `next/font`; semantic tokens re-pointed in `app/globals.css` plus a
`[data-mode="ink"]` block (hero, trip, footer); `.btn` is an ink pill with the logo-blue arrow disc. Hero rewritten
(`Hero.tsx`, new `HeroVideo.tsx`: server renders paused on the poster, client plays only without reduced motion,
pause/play button; new `CallStatus.tsx` + `lib/hours.ts`: live status from `site.config.json` hours, which now holds
7 AM to 10 PM from D-024 instead of `null`). Nav is a solid cream floating bar; the hero slides under it. Trip on
ink (disc and marker read `--c-canvas`); service index re-skinned; partner band on sand; footer in ink mode, wordmark
stops blue, blue, green, white. `proxy.ts` skips `video/`. The footer shader's parser now expands 3-digit hex: the
CSS minifier had turned `#ffffff` into `#fff`, which drew a wrong, saturated blue (caught on screenshot).
Deviation from the plan: the nav stays a floating bar everywhere instead of going flush after the hero (no
IntersectionObserver; one state is simpler and reads fine).
**Verified:** green (lint, typecheck, 37 tests incl. 6 new IST boundary tests for the call status, build);
Playwright at 1440x900 and 390x844 (hero, trip on ink, sand band, footer; no horizontal overflow); the video plays
(webm), pauses and resumes from the button; reduced motion emulated: paused on the poster, "Play" label, server HTML
has 0 `data-live`, no autoplay, no clock text; hero contrast sampled from real frames (headline >= 4.4:1 at its worst
pixel after the scrim was strengthened from a measured 2.6:1; lede 10:1; fact row 7.5:1); `impeccable detect` at
1280/1440/1024/390: video-underlay contrast clean after the fix; kept with reasons: italic serif display (the one
italic phrase, from the approved preview), cream page (the chosen direction), cyan fallback gradient (D-023 waiver),
nav logotype 3.7:1 (WCAG 1.4.3 logotype exemption). Taste pre-flight: zero em/en dashes; waived where the Blueprint
and D-027 win: warm cream + espresso palette (Taste bans it as the premium-consumer default; here it is the approved
direction and the chroma is the logo's blue and green, not brass), ink bands between light sections (theme lock),
light only (no dark mode, D-021), hero carries the status line, fact row and emergency note (required facts and the
instrument), partner roles as three hairline columns (pre-existing; watch).
**Not verified:** a real phone or Safari; 360px and 768px renders (only 390 and 1024+ checked); the footer shader on
a low-end Android GPU; `web-design-guidelines` audit; the side-by-side against myhealthprac and Function (captured
separately, not composited); `DESIGN.md` still describes Setu Lines (regenerate after the Stage A check-in).

## D-028 · 2026-09-27 · Nav: full-width, transparent over the hero then solid; warm-toned logo in the nav only (partially supersedes D-027: floating nav bar, logo colours in the nav)
Sasanka rejected the floating cream bar and asked for a nav like Biograph's or myhealthprac's, and for the nav's logo
colours (the mark's green, blue, olive and white, and the blue web wordmark) to be re-toned warm to suit the page,
**in the nav only**; the footer wordmark keeps the logo's colours. This overrides Invariant 20 (the canonical logo's
colours) and D-027 (logo colours as the only chroma) for the nav, at Sasanka's explicit instruction.
- **Samples (measured in Chrome 2026-09-27):** myhealthprac: fixed, transparent, 68px, light 11.5px links over the
  footage, class swaps per section. Biograph: over its dark hero a dark bar with white links; after scrolling a solid
  white full-width bar with dark links and a dark pill.
- **Built as:** a full-width sticky bar (72px), solid parchment with a hairline and ink text everywhere. On a page
  whose first section carries `data-nav-over` (Home), a CSS scroll-driven animation (`animation-timeline:
  scroll(root)`, range 0 to 140px) starts it transparent with cream text over the footage and turns it solid as the
  page scrolls. No JavaScript; browsers without scroll timelines get the solid bar.
- **Warm logo:** `LogoMark tone="warm"` swaps the fills for a warm tonal set (sand tile, parchment cross, walnut and
  caramel pieces); the nav wordmark follows the text colour. `brand/` files and the footer are untouched.
**Why:** the floating bar read as a separate object over the footage; both samples let the hero run edge to edge and
only solidify the bar once the reader moves on. The warm mark keeps the logo's shape (recognition) while the page's
one colour moment stays the footer wordmark.
**Rejected:** the floating bar (D-027); a JS IntersectionObserver toggle (a flash of the solid bar before hydration,
and more code); a mono cream-only logo (loses the mark's structure on parchment).
**Revised the same day (Sasanka's review):** (1) the nav logo goes back to the **original colours** (green, blue,
olive, white; the warm tone is removed and `LogoMark` restored) with "CARE SETU" in white; (2) the page you are on is
marked (`aria-current="page"` from `usePathname` in a small client `NavLinks`; a 3px underline in the logo's green,
an olive edge in the mobile sheet); (3) "Talk to us" in the nav was reported unreadable. It could not be reproduced
(Playwright at every scroll position, hover, both pages; installed Chrome headless), so the fragile part was removed:
the keyframes no longer flip colour tokens mid-scroll. The bar now runs in ink mode everywhere (white wordmark,
cream pill with ink text) and only its fill fades in over the hero; solid, it is an ink bar (Biograph's dark header)
rather than parchment, which white text requires.
**Verified:** green (lint, typecheck, 38 tests, build); Playwright 1440: /services shows the ink bar, "Services"
underlined, pill cream 245,238,227 with ink 28,24,20 text; Home at 0/70/300px scroll keeps the same pill colours while
the bar goes transparent → ink. **Not verified:** the original invisible-label state (never reproduced; ask for a
screenshot if it recurs); real phone/Safari.

## D-029 · 2026-09-28 · The owner's sample site: a safe subset as pending content, prices built but off, D-024 contacts stand
The owner sent `care-setu-sample.vercel.app` as "all the information" to fill the site (Home looked empty). Read on
2026-09-28 (WebFetch: `/`, `/services`, `/equipment`, `/about`, `/hospitals`, `/contact`). It reads as an AI-built
mock rather than owner facts: it contradicts itself (contact page `+91 98765 43210`, 8 AM – 8 PM; elsewhere
`1800-CARE-SETU`, "24x7"), names a leadership team that is not the founders on record (D-024), and carries outcome
statistics a pre-launch company cannot have. Sasanka chose in one AskUserQuestion round (2026-09-28):
- **Content: the safe subset, as pending.** What each service covers (scope lists), the equipment range, "flexible
  engagements", the line "Treatment begins in a hospital. Healing continues at home." (unattributed) and the founding
  observation for About go into the content files, each tied to a `pending` row (C-035..C-044). **Pending content
  renders in development only**, with a visible "awaiting owner" tag, so the owner can review a filled page on
  localhost; a production build shows approved content only (`shown()` in `lib/content.ts`, enforced by
  `tests/claims.test.ts`). Approving a row in CLAIMS.md and dropping the item's `pending` flag is what ships it.
- **Prices: built, switched off.** The sample's prices are stored in integer paise per service and equipment item
  (C-045..C-057, pending) behind `showPrices: false` in `content/site.config.json`. Q8 (payment policy) stays open;
  payment is still only ever made against a quote (D-004), so a price is a "from" guide, never a checkout amount.
- **Contacts, area, response time: D-024 stands.** +91 84489 12820, care.setu.1@gmail.com, Noida and Delhi, "We call
  back within 2 hours, every day 7 AM to 10 PM". The sample's 1800 number, `caresetu.in`, Gurugram and Faridabad,
  "120-minute dispatch" and "Pvt. Ltd." go to the owner as questions (Q17..Q19), not into copy.
**Why:** the owner's intent (a fuller site) is served without publishing anything the business cannot back
(INVARIANT 15, 18). A dev-only render lets the owner see and correct the fill before anything is approved, instead of
reviewing a spreadsheet.
**Rejected:** (never ship; rows C-058, C-059, C-061..C-063, C-066, C-070) the named testimonials (Vikram Malhotra, Ritu Khurana,
"Sister Priya"); "4.92 / 5 across 2,400+ home care transitions"; the leadership team (Dr. Ananya Sen, Sister Mary
Kutty, Dr. Arvind Sehgal); hospital integrations (Max, Fortis, Apollo, Medanta, Artemis, Manipal, "42+ hospital
consortia"); outcome metrics (42% fewer readmissions, ALOS −1.8 days, 99.4% SLA, "42 mins" transfer); DISHA/HIPAA
compliance; login, iOS/Android apps, WhatsApp bot, live vitals portal and daily telemetry (D-001, they don't exist);
the placeholder `+91 98765 43210`. Also rejected: taking the whole sample as fact (it overrides D-024 with
self-contradicting details); structure-only with no content (the owner asked for the content).
**Not decided here:** Home and Services layouts (Stage 1 and 2 of the 2026-09-28 plan, each with its own D-entry).

## D-030 · 2026-09-28 · Home after the trip: Colonnade services, an equipment reel, one drawn line to the footer; logo colours as fields (partially supersedes D-027: where the logo colours may appear; D-025: Home's one-open services index and the partner cards)
The owner loved the hero, the trip and the footer and nothing else (D-026). Blueprint §1.7 (new today) requires each
section to name a cross-domain reference, a signature interaction and why it isn't a card row. Research 2026-09-28
in Chrome, captured to `refs/care-setu/` (preview MP4s + 8/12-frame sheets): GetLayers `/sections` (Colonnade, Cards
Cascade, Cards Almanac, Roadmap Ascent, Showcase Equator, Carousel Spotlight, Slider Spectra); the Awwwards animation
collection (Service Totem/Scrib3, Index/The Line, Akaru homepage, Work hover/Inkfish, Emmpo hover, Monogrid, RXK
kinetic, 3 more); Skiper UI Scroll Effects (16 card stack, 19 stroke follows scroll, 31 text scroll). Mobbin was not
used this round (Home has no transactional flow; the enquiry flow is unchanged). Sasanka picked, in one
AskUserQuestion round, the recommended option on all four questions:
- **Services = Colonnade** (GetLayers Colonnade: columns on warm paper; the active column's grain field slides up,
  headline swaps). Three columns, one per line (D-025). Our twist: the field is the footer's drifting grain in that
  line's logo colour, built in **CSS** (layered gradients moved by `transform` + an SVG-noise grain), because the
  footer already holds the page's one WebGL context (Blueprint §10). Equal columns; the field moves, widths don't
  (no layout animation, §9.4). Hover, focus or tap activates; the first line is active at rest; no-JS shows all three.
- **Equipment = horizontal reel** (Akaru homepage): desktop pins the section and scrubs six tall panels sideways,
  each ending in an olive caption block; touch gets a native scroll-snap strip (§9.4: no pinned horizontal scroll on
  touch). Items are C-041 (pending), so **the reel renders in development only** until the owners confirm (D-029).
  Image slots have fixed ratios; the images are still-lifes Sasanka generates (objects and rooms, never staff or
  patients, INVARIANT 16), each logged in CLAIMS before it ships.
- **The trip's line continues** (Skiper 19): from the trip's spine a lime line, ink-cased like the trip, draws itself
  with scroll down a rail in the left gutter, stopping at a station disc beside each section heading, and ends at a
  terminus above the footer. Built as one SVG segment per section (a single page-wide overlay would drift against the
  pinned reel). Desktop only (the phone gutter can't hold a 20px cased line); reduced motion and no-JS get the
  finished line.
- **Imagery:** still-lifes generated by Sasanka from Claude's prompts; type-led slots until they exist.
Claude's calls (Sasanka left the rest of the page to the method): **the promises become one statement** that inks
word by word with scroll (Skiper 31; the trip's ghost → full physics), built only from approved claims (C-024, C-025,
C-031, C-032), with the live call status inline as the instrument; **the partner band becomes an editorial index**
(Awwwards "Index"): three large role rows on the sand block, where hover slides the row's line colour in behind
the text and the arrow disc enters.
**Chroma (supersedes the D-027 clause):** the logo's colours stay the only chroma, but may now also appear as the
Colonnade's grain fields, the equipment caption blocks and the drawn line. Nothing else gains colour.
**Why:** each section now has the kind of idea the three loved sections have (motion that tells something), taken
from outside the health genre, while the palette, type and the trip's line language keep the page one piece.
**Rejected:** Card cascade (a second pinned section right after the trip felt scroll-heavy; kept as the Services-page
candidate), editorial index for services (calmest, least "wow" for a feel-first owner), stacked notes and no
equipment section, no spine, type-led only and more Gemini loops (weight); a WebGL field per column (second context);
widening columns (layout animation); Roadmap Ascent (it counts numbers we don't have).
**Revised the same day (Sasanka: the line "just appears and disappears"):** measured per 60px wheel step, each segment jumped 0 -> 1. Cause: the path was normalised with pathLength="1" and the dash offset tweened 1 -> 0; GSAP auto-rounds px CSS values, so it snapped. Also each segment was mapped to its own section range, so the tip was never where the reader was. Rebuilt: real path length (getTotalLength) with a y -> length lookup; one standalone ScrollTrigger (onUpdate) sets the tip at 65% of the viewport, the line the trip's marker rides, eased by gsap.quickTo; a faint route shows ahead; stations ink as the tip passes; the pinned reel no longer animates the line (the tip holds while pinned). **Verified:** CDP wheel probe, 120px steps down and back up: tip at 585/900px on every step, continuous hand-over between segments, holds during the pin, retraces on scroll up; green. **Not verified:** trackpad inertia feel, real Safari.
**Images in (same day):** Sasanka's six ChatGPT still-lifes (C-073, illustration only; checked at full size for text and brand marks, none) fill the reel via next/image (WebP, 58-138 KB each; alt text must start with "Illustration", enforced by the schema). With photos in, the full-strength olive caption shouted and the ragged caption heights broke the image edge: captions are now one fixed height and a 40% tint of the logo olive in parchment (still the logo colour, Akaru's muted blocks). **Rejected:** full olive (fought the warm photos); a grain overlay on the photos.

## D-031 · 2026-09-28 · Services page: a pinned stacked deck on an ink band, an equipment price sheet with hover images, seven more still-lifes (supersedes D-025's page structure; partially supersedes D-027: a third ink band)
The owner rejected the D-025 line catalogue (D-026) and asked for animation on Services. Research 2026-09-28 under
Blueprint §1.7, previews read frame by frame into `refs/care-setu/`: GetLayers `/sections` (all 10, new: Mirror Hall,
Slider Slipstream, Carousel Under The Radar), six more Awwwards animation items (Malvah case index, The Branch team,
Ottografie nav, NOD, media page, page transition), 14 Skiper UI previews (6, 16, 17, 23, 24, 35, 53, 60, 74, 79, 80,
96, 103, 104) and four Cue Kit components with their written specs (Stacked Deck Scroll Reveal, Collapsing Cards
Accordion, Split Panel FAQ, Scrollspy Line). Sasanka picked the recommended option on all four questions:
- **Services = stacked deck** (Cue Kit "Stacked Deck Scroll Reveal", replicated to its spec: cards 42px apart, each
  4.5% smaller behind, scaled from the top edge; cards rise into the stack, then the front card flies out
  `y: -115vh, rotate: -25deg, scale: .94` while the rest step forward; scrubbed, `ease: none`; text | image 50/50)
  plus GetLayers Cards Cascade's chapter counter (big number, "/ 08", a vertical rail and a vertical label). Eight
  cards, one per launch service (D-024); the equipment line is one card holding rent, buy and sell back. Each card is a
  40% tint of its line's logo colour (as the reel captions, D-030) with the name, who comes, the owners' sentence, the
  scope and price slots (pending, dev only, D-029), the ask and the quote note (C-024). Our twists: the rail is the
  three line colours in proportion, with the current line named; the deck shows at most four cards deep; 20px radii
  (Warm Room) instead of the sample's 2px. Desktop, fine pointer and motion allowed pin and scrub it; everything else
  gets the cards as a plain stack (a CSS sticky pile where the viewport is tall enough). Keyboard focus inside the
  deck scrolls to the pin position that brings that card to the front.
- **Stage = ink band** (as the sample): a third ink band after the trip and footer. **Supersedes INVARIANT 27's
  "ink bands for the trip and footer"** for this one page.
- **Imagery:** seven more still-lifes generated by Sasanka (objects and rooms only, same style as C-073; prompts in
  `docs/ASSET-PROMPTS.md`); the equipment card reuses a C-073 image. Type-led slots until they arrive.
- **Equipment = price sheet with hover images** (Awwwards Malvah case index + Inkfish work hover): after the deck,
  the six items as rows (number, item, what it is, rent or buy, ask); on a fine pointer, hovering a row floats that
  item's still-life beside the cursor; touch shows a thumbnail in the row. Amounts appear only
  when `showPrices` is on (D-029). The items are C-041 (pending), so the sheet renders in development only.
- **Claude's calls:** a type-led opener (title, lede, the two ways to reach us, the emergency note) with the three
  lines as jump links into the deck; a closing "not sure which you need" band on sand with the live call status (the
  instrument, reused from Home). No drawn line on this page (it is Home's continuation of the trip). Nothing repeats a
  Home section.
**Why:** each service gets the screen to itself, in order, like the trip's legs, and the page moves the way the owner
asked for, from a written spec rather than an approximation. The ink band makes the tinted cards the page's colour
event while the logo colours stay the only chroma.
**Rejected:** the moving index (Skiper 24: strong, but its tinted ground repeats Home's Colonnade idea); the split
panel (Cue Kit: click-driven and calm, the least ambitious); type-led cards only (less warm than the still-lifes);
the six equipment items inside the rent card only (no way to compare them); a parchment stage; the Cue Kit
Collapsing Cards Accordion on this page (Sasanka likes it; its images would repeat Home's reel, so it is kept for
About, four founders, when consented photos exist; its `flex` transition is a layout animation and gets rebuilt
with transforms). Also rejected: Lenis (the sample's smooth scroll; native scroll keeps ScrollTrigger and the rest
of the site as they are).
**Verified (2026-09-28):** green (lint, typecheck, 50 tests, build). Per-step CDP probe, 120px wheel ticks down and back
up at 1280x800 and 1366x657: cards rise while the band scrolls in, the pin holds, each tick flies the front card a
steady ~300px (-25deg, .94) while the rest step 12px forward, the rail number changes at each card's midpoint, the
dot moves ~6.75px per tick, and scrolling up retraces the same values. Fixed from the probe: the rail dot jumped 49px
between cards 7 and 8 (the vertical line name resized the track; the label row is now fixed); card text overflowed at
800px tall (the quote note moved to the deck header, once; the equipment card lost its item list, which the sheet
shows); text of the cards behind bled below their edges (cards clip). Real Tab-key pass: each card's link brings its
card to the front, visible and on top (elementFromPoint). The opener's line links land on cards 01, 05 and 08. Hover
on the sheet: the row inverts and its still-life follows the cursor. 390x844: plain card list, image first, no
overflow; reduced motion at 1280: the sticky pile. Prod build on :3100 (killed by PID): no pending content, prices or
sample fabrications; D-024 phone, call hours and the quote note present; the "Still-life to come" label is dev-only.
impeccable 1280 + 390: waivers only (the stage clipping its flying cards, the visually hidden table header on phones,
the footer wordmark gradient, Warm Room cream); fixed: long uppercase card labels (now sentence case). Taste
pre-flight: en-dash ranges, a tag overlaid on the hover image and two labels for one intent, fixed. Web Interface
Guidelines: per-frame layout read cached, balanced heading wraps.
**Not verified:** a real phone or Safari; trackpad inertia over the pin; 768 and 1024 visually; a screen reader; the
owner's review. Copy changes (lede, deck title, closing band) await owner approval (Q15).
**Revised the same day (device audit; Sasanka saw "no animation" on his 1280x537 laptop window, 1920x1080 at 150%):**
the deck was gated at min-height 600px. It now runs from 480px and scales to the room under the nav (--fit; cards keep a
design height of 440px, 480px under 1200px wide); under 600px tall the section heading is for screen readers only and
the cards stack 14px apart, so text stays ~16px at 537. The same audit fixed two Home defects (D-030): the pinned reel
had a hard 680px min-height (ran off short screens; it now scales to the room the same way, design height 440px, a
one-line heading under 680px tall) and the hero's pause control sat under the text layer at every desktop size (the
layer's empty box now ignores the pointer). **Verified:** `scripts/device-audit.mjs` (npm run audit:devices), 10 pages x
9 devices (scaled laptops 1280x537/1093x490/1366x657/1536x730, 1920x961, iPad both ways and two phones with touch):
no overflow, no pinned element taller than the screen, every visible control hittable, scroll never sticks (one-step
hits on a reel panel mid-slide only). Effective text at 1280x537: deck 15.9px, reel 16.4px; at 1093x490: 13.1 and 14.6.
**Not verified:** real iPad/Android hardware and Safari; 1093x490 text is small but legible.


## D-032 · 2026-09-29 · About page: the founder's question and letter, an inline-image manifesto, a pinned values odometer, collapsing founder cards; content from the founders' deck as pending
The brief's next page is About (order Landing, Services, About, Contact, Payments). Content comes from the **founders'
vision deck** (pp. 3, 4, 6, 7, 8), not the sample site: Shiva's letter, vision, mission, the four values, the promise,
and the co-founders' bios and photos. It is owner-written, so it is carried in the owners' words (cut only, never
added to, Blueprint #31), as **pending** rows (C-021, C-043, C-074..C-078) that render in development only (D-029). Removed
while carrying: the deck's statistics (2.2 Cr+, 70%+, 40-60%, 10 Cr+: no evidence, C-008..C-011) and, in the Trust
value, "verified professionals, hospital partnerships" (claims, C-006/C-015). The deck's belief line is the same as
C-043, which now has an owner source. Production shows the tagline (C-022), the service area and the actions only.
Research 2026-09-29 (Blueprint §1.6/§1.7; plan and ledger in `docs/plans/stage-3-about.md`): all 52 GetLayers
templates frame by frame (Marcus Vane, Artist, Kimi, Halden, Northwall, Ridgeline, Codescan, Dantora), 8 new Cue Kit
components, Mobbin (founder, our story), Pafolios, Unlumen Animate Digits, Smooth UI Inline Testimonials, Design Spells
(Abode, Dub.co), Kokonut Card Flip, 21st.dev, UI Guideline, Curated, Godly. Sasanka picked the recommended option on
all four questions (2026-09-29):
- **Story = question, then letter** (Marcus Vane + Artist): Shiva's question as the H1 with the three situations he
  saw; then his letter beside a sticky portrait, the four "I want..." wishes ticking in on logo-colour discs.
- **Vision = manifesto with inline images** (Halden): one sentence with three image capsules that open with scroll;
  the mission follows with the six partner groups as inline words that open their one-line role (Smooth UI Inline
  Testimonials spec: one open, click toggles, focus opens, Escape returns focus).
- **Values = pinned odometer** (Northwall + Unlumen Animate Digits + Abode card flip) on the sand block: 01 Care to
  04 Home; only the changing digit rolls, direction-aware; a still-life card turns between values.
- **Founders = Collapsing Cards Accordion** (Cue Kit, kept for this in D-031), rebuilt with transforms; photos share
  one warm monochrome treatment on the card's logo-colour tint. Dr Saurabh's card is type-only until a photo and bio
  exist.
Claude's calls: close on the deck's line "Because sometimes, the best support we can give a family is simply to be
there." with the actions and the live call status; no new ink band (the values sit on the sand block).
**Why:** the owners wrote this story themselves; each section gets its own mechanic from outside the health genre,
and none repeats a Home or Services section.
**Rejected:** chapter timeline (Kimi: its rail and marker echo Home's trip line); burn-through band (Cue Kit: dark,
one idea); split vision/mission boxes (calm, no idea); step accordion and marquee for the values (calmer; the marquee
is typographic only); a portrait row (The Branch: the genre average); the sample site's founding text (C-044, an AI
mock's wording, superseded by the founders' own letter).
**Built (2026-09-29):** `content/about.json` + `lib/about.ts` (zod; every block pending); Opener (word-mask entrance,
the three situations), Letter (sticky portrait, serif letter, Ticks), Manifesto (Capsules + Groups), Values (Odometer),
Founders (FounderCards), a close on parchment with the call status. Founder photos are cropped into gitignored
`refs/care-setu/founders/` and served by `app/dev/founders/[file]` in development only (404 in production); a test
fails if a founder photo ever lands in `public/`. Photos share one treatment (warm monochrome multiplied onto
parchment) with the logo colour as a block beside them: lime multiplied onto skin read as illness and was dropped.
The accordion's `flex` is rebuilt as full-width cards placed by translateX with a clip window (paint only); the
mission's cards sit inside the text under their word (a native top-layer popover did not follow its word on scroll in
headless Chrome, and following needed a scroll listener, which Taste bans).
**Verified:** green (lint, typecheck, 67 tests, build). CDP wheel probe at 1440x900, 120px ticks: capsules open
continuously (0.12 -> 1 over ~1000px), wishes tick as rows pass 70%, the values stage pins and steps 0 -> 3 every 540px
with the right card faces; a 60ms-after-step frame shows the half-turn in progress, the changing digit rolling and the
text resolving from blur (the "0" stays). Real mouse: founder cards open on hover in both directions; the mission
card opens on click, stays pinned and follows its word through three wheel ticks. Real Tab pass: every mission word
opens its card on focus, founder cards open on focus, every focused element on screen and not under the nav. Device
audit (9 sizes incl. 1280x537, 1093x490, iPads and phones with touch): no overflow, nothing pinned taller than the
screen, every control hittable, no stuck scroll. 1280x537: the stage fits (card ends at 515/537, text ~24px). 390x844:
plain list, groups one per line, founder cards stacked open. Prod build on :3100 (stopped by PID): none of the pending
text, no photo reference, no deck statistic; photo route 404; the fallback H1, tagline, phone, call hours and
emergency note present. impeccable 1280 + 390: waived: italic serif / oversized H1 (Warm Room hero language, as Home
and Services), cream palette, footer wordmark gradient, the founder row clipping its own cards, one long-line reading
from the visually hidden values list; fixed: leading on 20-28px reading text raised to 1.3. Taste pre-flight: fixed 9
eyebrows -> 2 (the rest are sentence-case labels), three split headers stacked, the `01 / 04` card pagination
removed, a scroll listener removed, italic descender room on the closing line; kept with reasons: Petrona and the
Warm Room palette (D-027), the three-line manifesto H1, vertical names on narrow cards (the sample's mechanic). Web
Interface Guidelines: straight apostrophes curled.
**Not verified:** Escape closing a mission card (implemented, not driven); a real phone, iPad or Safari; trackpad
inertia over the pinned stage; a screen reader; the owners' review of any of the content (Q20).

## D-033 · 2026-09-30 · Contact: the data layer (Drizzle + PGlite, migration 0001, POST /api/v1/queries, consent, CI), a one-question enquiry with a live route card, a call card, and a draft privacy notice; the enquiry runs in development until sign-off
The brief's next page after About (approved by Sasanka 2026-09-29). Plan: `~/.claude/plans/now-what-is-our-vivid-wall.md`
(session) and `docs/plans/stage-4-contact.md` (Blueprint §13, sample ledger). `DESIGN.md` was regenerated first from the
shipped Warm Room build (it still described Setu Lines; impeccable grades against it).
- **Data layer (D-002, D-006, locks TRD §1):** Drizzle ORM 0.45 (stable, not the v1 RC the docs now show) over PGlite 0.5
  in development (`.pglite/`, gitignored, migrated on first use) and `pg` when `DATABASE_URL` is set (migrated by
  `drizzle-kit migrate` at deploy, never `push`). Migration `drizzle/0000_queries_consents.sql` (reviewed): `queries`
  (reference, patient_location, service_slug, area, message, name, phone, email, status, source_page) and `consents`
  (query_id, notice_version, purpose, granted_at). **Deviation from TRD §2:** no IP or user-agent hash on consents
  (data minimisation; an unsalted IPv4 hash is reversible). `serverExternalPackages: ["@electric-sql/pglite"]`.
- **API:** `POST /api/v1/queries` (zod strict contract in `server/contracts/queries.ts`, shared with the form): JSON only,
  8 KB cap, 5 requests per 10 minutes per address in memory (the address is never stored or logged and is dropped when
  its window passes), honeypot, 422 with field names only, 201 `{ reference }`, `no-store`. The query and its consent
  are written in one transaction (INVARIANT 12); the team alert goes through `EmailTransport` after the commit, and the
  only transport is `console`, which logs the internal id and nothing else (INVARIANT 11). Production requires
  `DATABASE_URL`, a real transport (Q1) and `EMAIL_TEAM_INBOX` (Q12), and refuses to start the query path otherwise.
  References: 10 characters without 0/O/1/I/L. CI: `.github/workflows/ci.yml` (lint, typecheck, test, build; no
  remote yet, pushing needs permission).
- **Enquiry (INVARIANT 27; Sasanka's picks, recommended on all):** five questions in Elder's order: where the patient is
  now (hospital / home / not sure), which service (grouped by line, "not sure yet", pre-selected from a service card's
  `?service=`), area (Noida / Delhi / somewhere else, stating the limit), what's needed, who to call; then check answers
  with Change links, unticked consent linking to the notice, "Send my details", and a GOV.UK confirmation (reference,
  what happens next with C-031 and the live status, the phone). **Your route:** a sticky ink card beside the questions
  (21st.dev Appointment Intake Match's live card, drawn with the trip's spine and stations); each answer inks its
  station, the chosen service's disc takes its line colour, the route reaches Home on send; phones get a thin track.
  Steps slide 72px with an 8px blur, reversed going back (Unlumen Questionnaire spec), in CSS. The step lives in the URL
  (Back/Forward work); focus moves to each question's heading and to the NHS error summary; the browser warns before
  leaving with unsent answers. Errors use ink, bold and the warning icon, never red (INVARIANT 27: no other chroma).
- **Opener:** "Talk to us." beside an ink call card (GetLayers Ridgeline): the number in display type, Call and WhatsApp,
  live status, C-031, the emergency note; email (now in `site.config.json`, C-029) and office on a sand line; no map.
  The nav's "Talk to us" pill now marks /contact as the current page (Blueprint #36).
- **Privacy notice (D-012):** `/privacy` drafted against the DPDP Act 2023 (ss. 5, 6, 11-14) and DPDP Rules 2025
  (rules 3, 9, 14; Gazette 14 Nov 2025, downloaded from MeitY; rules 3 and 5-16 commence eighteen months later): an
  itemised list of exactly what the form collects, the purpose, who sees it, rights, contact; retention, the grievance
  officer, providers and the legal name stated as not yet set. Visible "DRAFT, not legal advice, pending professional
  review" marker, version `2026-09-29-draft-1` (`lib/privacy.ts`; the API accepts only the current version), and
  points for the reviewer.
- **Production gate:** `enquiryLive: false` in `site.config.json`. Until a D-entry records the notice sign-off (Q14) and
  the alert recipient (Q12), production shows the call card, email and office only and the API answers 404.
**Why:** the family's two real ways in (call now, or leave details for a callback) are both on the page, the form asks
one thing at a time in the order a coordinator needs it, and nothing is stored without consent against a notice that
describes only what the code does. The route card turns the loved trip into the family's own progress without
pinning or repeating another page's section.
**Rejected:** answers card and plain NHS column (calmer, less brand); number as the H1 (the call and the enquiry compete);
the pressed seal (implies a certification; stamping echoes Hungry Anna); auto-advance on a tap (Elder does it; arrow keys
on a radio group must not submit); a map embed (loads a third party for every visitor); Motion/GSAP for the form
(CSS is enough, §9.1); red errors (new chroma); draft answers in localStorage (personal data kept in the browser);
IP/UA hashes on consents; Drizzle v1 RC.
**Verified (2026-09-30):** green (lint, typecheck, 92 tests incl. 23 new: contract, consent atomicity on an in-memory
PGlite with a forced consent failure rolling the query back, alert failure logging only the id, rate limit, reference
alphabet; build). API by hand: 201, 422 (consent, phone, unknown key, honeypot), 415, 400, sixth request 429, `no-store`.
Stored row read back from a copy of `.pglite/`: consent row with the notice version, one migration applied. Playwright,
real clicks and keys: the full flow at 1280x800 (empty Continue focuses the summary, focus moves to each heading,
physiotherapy pre-selected, 201 and the confirmation focused, Back after sending keeps the confirmation); radio group is
one tab stop, arrows select, Enter continues, Shift+Tab reaches Back; every step at 360x740 and 1093x490 with long
inputs: no overflow, nothing blocked. Device audit (9 sizes) on /contact and /privacy: clean. Opener at 1280x537 ends at
464px. Reduced motion emulated: final state at 50ms, transitions instant; server HTML has no animation attributes. Slide
sampled every 60ms: 72px -> 0 and blur 8 -> 0 over ~450ms, reversed going back. impeccable 1280 + 390: /contact only the
standing waivers (cream page, footer wordmark gradient); /privacy fixed (uppercase marker, line length). Web Interface
Guidelines: input names, loading ellipsis, curly apostrophes, leave warning, balanced headings fixed; errors focus the
summary (GOV.UK) by design. Taste pre-flight: radius rule unified and documented, one copy line made honest. Production
build on :3100 (stopped by PID): enquiry, pending tags and banned strings absent; contact facts present; `/privacy`
carries the marker; API 404. Side-by-side: `refs/build-sbs/contact-vs-ridgeline.png`.
**Not verified:** the dev server's own console output for personal data (it was started outside this session; covered
by a test and the code, not observed live); a real phone, iPad or Safari; a screen reader; a real email send (no provider,
Q1); the rate limit behind a real proxy (which header to trust depends on the host, Q1); the owners' review of the
questions and copy (Q15).

## D-034 · 2026-09-30 · About polish: ink founder cards, the mission as a bridge on an ink panel, capsules opened by a clip window, founder photos re-cut (partially supersedes D-032: the founder cards' look, the mission's layout, "no ink on About"; D-027: where ink may appear)
Sasanka's review of About: the founder cards move well but look "way too simple and bland" next to Cue Kit's, which
look premium with or without a hover; the mission section is too simple; the vision capsules render in low quality
while scrolling; the founder photos should be sharper. Research 2026-09-30 (Blueprint 1.6, #43; ledger and the
opened/skipped list in `docs/plans/2026-09-30-about-polish.md`): Cue Kit (live preview + 15 others), React Bits,
Aceternity, Unlumen, Smooth UI, Cult UI, Magic UI, Kokonut, Skiper, 21st.dev, all 52 GetLayers templates re-read, Mobbin,
Pafolios, Design Spells, Curated, Godly, Recent, Awwwards, Motion.dev, UI Guideline. Three founder skins were rendered
as a local comp (`refs/care-setu/build/about-options/`); Sasanka picked the recommended option on all three questions:
- **Founders = "Ink gallery"** (Cue Kit's own recipe; structure and motion unchanged): ink cards; each portrait a warm
  mono print (multiplied onto sand, with grain) filling the card's height, dimmed under an ink scrim while narrow and
  clearing as the card opens; index and a logo-colour disc at the top; the name in cream over the scrim; open, the
  print fades into the ink, where the name, role and bio sit in cream under a ghost numeral.
- **Mission = "The bridge"** (GetLayers Relay's canvas, drawn in our lines): an ink panel; the six groups are stations
  whose lines, in the logo's colours, merge into one line that reaches "One platform"; a group's role shows beside the
  diagram on hover, focus or tap; the lines draw with scroll. The founders' words are unchanged.
- **Photos = classical clean-up only**, re-cut from the deck's native pixels (Shiva 184x245, Ayush 126x168, Aashish
  814x1086). No AI upscale: it would invent detail on a real person's face (INVARIANT 16) and send unconsented photos
  to an outside service. True HD waits for the founders' originals (Q20).
- **Capsules:** opened by a clip window on a full-size pill, never by scaling it.
Ink on About: D-032 kept About without ink. These are ink **cards and one ink panel** inside parchment sections (as
Contact's two ink cards, D-033), not a band; INVARIANT 27 and `DESIGN.md` now say so.
**Why:** the look Sasanka pointed at is image-led and dark; ink is the system's own depth (DESIGN.md 6 allows value,
hairlines and grain, not shadows), and it lets soft, mismatched headshots read as one set of prints. The mission's
meaning is six parts becoming one connection, so the section shows exactly that, and every role is reachable without
a popover.
**Rejected:** names-only strips (Skiper 35: elegant, but no image at rest); paper "gallery prints" (GetLayers Artist:
still light and quiet); six always-open rows on sand (a relative of Home's partner index); six segments closing into a
bar (the same idea with less to look at); holographic, glass or glow cards and hub-and-spoke beams (break DESIGN.md 6
and are known tells); AI upscaling (above).
**Built (2026-09-30):** `FounderCards.tsx` + `Founders.module.css` (ink cards, sand-multiplied print with grain and scrim,
index disc, ghost numeral, initials that shrink and lift in a narrow card); `Bridge.tsx` (stations as disclosure buttons,
the merge SVG at 200 x 336 drawn 1:1 above 1200px and narrowed to 140px below, the part in one slot beside the drawing,
a ruled list below 960px); `Manifesto.tsx`/`.module.css` (ink panel, stacked header); `Groups.tsx` removed (replaced);
`LogoMark` takes an `id` so its clip path stays unique when the mark appears twice. Capsules: `--open` drives a clip
window on a full-size pill and its tint (2px ring intact at every width); the icon fades up by translate; force3D off.
Photos re-cut in `refs/care-setu/founders/` (gitignored; the earlier files kept as `*-v1-before-enhance.webp`).
**Verified:** green (lint, typecheck, 92 tests, build). Capsule cause measured with CDP LayerTree: during the scrub each
capsule had its own compositor layer ("Trivial3DTransform" from GSAP's translate3d) plus overlap layers; after the fix
no capsule or icon carries a scale at any step, down or up (per-step log). Founders at 1440x900, 1280x537 and 390x844:
hover opens each card (real CDP mouse); the no-photo card's initials clear its name. Bridge: real mouse hover opens a
part and leaving closes it; a click pins it; Escape closes and keeps focus on the station; Tab opens each station in
turn. Scroll drawing probed in 80px wheel steps at 1280x537, down and up: the six lines draw in order, then the trunk,
and reverse. Device audit, 9 sizes on /about: no overflow, nothing blocked, no stuck scroll. impeccable 1280 + 390: the
standing D-032 waivers (italic/oversized H1, display leading, cream page, footer gradient, the rows clipping their own
cards); fixed: the sentence's ghost floor raised (0.5 -> 0.62) after a low-contrast reading, a stroke-width transition
removed (the detector reads it as layout). Taste pre-flight: the split mission header stacked, the "/ 04" pagination
and a second decorative dot removed; kept with reasons: Petrona and the Warm Room palette (D-027), ink panels on a light
page (this entry), light-only (DESIGN.md).
**Not verified:** the capsule pixelation itself: headless Chrome's screenshots wait for full raster, so the old fault never
showed there, and the Chrome extension tab went to the background (no rAF); the fix is proven structurally, and
Sasanka's laptop is the real test. Also not verified: a real phone, iPad or Safari; a screen reader on the bridge;
the Web Interface Guidelines skill (checked by hand: focus rings, 48px+ targets, aria-expanded/controls, decoration
aria-hidden); the owners' review (Q20).

## D-035 · 2026-10-01 · New contact phone and email from the owners (partially supersedes D-024: phone and email only)
The owners sent their latest contact details through Sasanka (2026-10-01): phone **+91 78600 42009** and email
**caresetuhealth@gmail.com**. Sasanka confirmed the new number is also the WhatsApp number (AskUserQuestion), so it
replaces +91 84489 12820 for calls and WhatsApp alike. The office address, the 2-hour callback and the 7 AM – 10 PM
hours from D-024 are unchanged. Q19 is answered for the phone and email only; its area, response-time and entity parts
stay open.
**Built:** `content/site.config.json` (`phone`, `email`), the one source every page reads (Nav, Home, Services, About,
Contact, Privacy, the enquiry's call links, Footer); CLAIMS C-028/C-029; PRODUCT.md; the format example in
`lib/content.ts`.
**Why:** owner-supplied facts are evidence for the claims register when recorded as a D-entry (as D-024).
**Rejected:** keeping the old number for WhatsApp (Sasanka: the new number covers both); showing both numbers.
**Verified:** green (see LOG 2026-10-01).
**Not verified:** that the number reaches the owners or that wa.me opens a chat with it (not dialled); owner review.

## D-036 · 2026-10-01 · Payments: the full flow is built front-end first and runs in development only
Sasanka asked for the remaining pages "to show only, no backend connected", content replaceable later. A pay page
with a working-looking Pay button and no gateway would break INVARIANT 18 (no control that doesn't work) and D-004
(pay only against a server-side quote; status only from a verified callback). Sasanka chose (AskUserQuestion,
2026-10-01) the full flow, development only:
- Every screen is designed and built now: enter a reference, the quote summary, the pay step, and each result
  (paid, failed, pending, expired, not found, already paid).
- In development it runs on **sample quotes** (one per state) from a dev-only fixture behind `getQuote(reference)` in
  `lib/quotes.ts`, each screen tagged "sample, no money moves". The pay step in development is a labelled sample step,
  not a gateway.
- Production keeps the flow off: `paymentsLive: false` in `content/site.config.json`, read through `paymentsOpen()`
  (the `enquiryOpen()` pattern, D-033). `/pay` then shows a call-your-coordinator card; no amount, no Pay button, no
  sample data.
- The client only ever sends the reference; amounts are integer paise read server-side (INVARIANTS 4, 5).
- The backend (quotes table and migration, the `PaymentProvider` adapter with the Razorpay sandbox, the signed and
  idempotent webhook) plugs in behind `getQuote` and the pay step later, without a redesign (D-003 unchanged).
Per-service detail pages (D-013) were raised in the same round; Sasanka chose to decide later, so they stay in scope
and unscheduled.
**Why:** the owners can review the real payment experience on localhost now, the design is not blocked on the LLP,
KYC or Q8, and nothing in production pretends the business can take money.
**Rejected:** an explainer page only (the flow screens would be designed later anyway, and owners can't review
them); building the sandbox backend in the same stage (most tokens, and Sasanka wants frontend pages first).
**Picked (2026-10-01):** after research across the tool list (ledger and the opened/skipped list in
`docs/plans/stage-4-payments.md`) and a rendered comp of three skins (`refs/care-setu/build/pay-options/`), Sasanka
chose the recommended option on both questions: **A · the printed receipt** (an ink payment card beside the quote as an
editorial split; its screen shows the server's checks, then "Waiting for the bank", then a parchment receipt prints out
of its slot, Cue Kit Thermal Cut Invoice's timings) and **grouped boxes** for the reference (Bencho one-time-code).
Rejected in that round: B, a ledger that ticks beside Ridgeline's steps (calmer, less to remember); C, a flight-status
bar (repeats the trip and route idea of Home and Contact).
**Built (2026-10-01):** `paymentsLive` + `paymentsOpen()`; `server/contracts/payments.ts` (quote reference = "QT" + 8
characters from the phone-safe alphabet, now in `server/contracts/enums.ts`; `PayInput` takes the reference only;
`PayResult`); `server/domain/quotes.ts` (six dev-only samples, one per state; an open quote past its date reads as
expired); `server/adapters/payments` (`PaymentProvider` + the dev sample bank); `POST /api/v1/payments`; `/pay`
(reference field, Ridgeline's four steps, the sample list in dev; the call card in production); `/pay/[reference]`
(noindex; not found, open, paid, expired, withdrawn); `components/pay/PayCard.tsx` (ready, waiting, printing, paid,
failed, pending; focus moves to the status when Pay is pressed; print via the browser) and `ReferenceField.tsx`;
`formatIst` in `lib/hours.ts`; `tests/pay.test.ts`. The comp's paper shadow was dropped for a hairline (DESIGN.md 6).
**Verified:** green (lint, typecheck, 115 tests, build). Headless Chrome over CDP, real mouse click: waiting holds
~1.4s, printing 2.0s, then paid; the paper's transform steps -399, -329, -258, -141, 0 px and the rows land 260ms
apart; same at 390x844; reduced motion emulated: the full receipt within 0.6s, no travel. Real Tab and Enter: the tab
path reaches Pay; Enter moves focus to "Waiting for the bank", then "Paid". Declined and pending samples show their
screens. Server states: expired, withdrawn, already paid (receipt printed), not found; all quote pages noindex. Field:
too short and a "0" both show the error with aria-invalid; "qt 4k7m 9p2x" typed or pasted reads as 4K7M9P2X.
Device audit, 9 sizes x 4 routes: no overflow after shrinking the boxes at 360. impeccable 1280 + 390: only the standing
waivers (cream page, the one italic phrase, the footer wordmark gradient). Production (`next start`): /pay shows the
call card with no amount, sample, field or Pay button; /pay/<ref> redirects to /pay; the API returns 404; no sample
reference in `.next/static`.
**Not verified:** a real phone, iPad or Safari; a screen reader; the printed receipt on paper (print CSS checked
structurally only); Taste and the Web Interface Guidelines were run by hand (curly apostrophes and the focus loss were
found and fixed this way); the owners' review of the copy (Q15). Any real payment: nothing is wired (D-003).

## D-037 · 2026-10-02 · Light pages: the 404, the promotions banner (off) and search discovery (closed until live)
Sasanka's direction for the rest of Phase 1: finish the whole front end with drafted or sample content first; owner
answers (Q17..Q20) and the generated still-lifes are swapped in afterwards, in one pass, so they are not a blocker now.
Three light pages built this session:
- **404** (`app/not-found.tsx`): "We can’t find that page." with a "Where were you headed?" spine in the trip's grammar
  (a hollow dashed "You are here", then Home, Services, About and Talk to us, each taking a line colour as the spine
  draws to it, CSS only), the live call status with the number, and the emergency note. It links only to built pages.
  Partner, FAQ and the legal drafts stay off it until they ship.
- **Promotions banner** (D-013): `PromoBanner` above the nav, a slim sand strip that is one link. It renders only when
  `promotion` in `site.config.json` is non-null; it stays `null` until the owners set the rules (Q9). It shows the
  owners' words and never computes a discount (that is server-side on the quote, D-004).
- **`/robots.txt` and `/sitemap.xml`**: indexable only when `APP_ENV=production` and `APP_BASE_URL` is an https URL
  (`lib/seo.ts`). Otherwise robots disallows everything and the sitemap is empty, so localhost, the review tunnel and any
  staging copy are never indexed, and no domain is written in code (Q2 is open). When live: allow `/`, disallow `/api/`,
  `/pay`, `/dev`, and list Home, Services, About, Contact. The legal drafts and the unbuilt Partner and FAQ are left out
  until signed off or built.
**Why:** all three are small and need no owner answer; making indexing depend on the environment means going live can't
leak a draft or a tunnel, and the banner can be switched on by editing one config value.
**Rejected:** a fixed `Allow: /` robots file (it would let the review tunnel be indexed); a hard-coded domain in the
sitemap (Q2); a dismissible or sticky banner (more code and state for a strip nobody has asked to be dismissible).
**Verified:** green (lint, typecheck, tests incl. `tests/seo.test.ts`, build). Headless Playwright on localhost: the 404
returns status 404 at 1280x800 and 390x844 with no horizontal overflow, 80px rows; reduced motion emulated shows the
finished line and coloured discs outright; the banner, switched on temporarily with sample text, sits above the Home hero
at 390px and was switched back to `null`; `/robots.txt` and `/sitemap.xml` return the closed form in development.
Device audit on /nope, 9 sizes (scaled laptops, desktop, iPad both ways, 390 and 360 phones): no overflow, every control
hittable, no sticking.
**Not verified:** the live (open) robots and sitemap output beyond the unit test; the banner on pages other than Home;
a real phone, Safari or a screen reader; owner review.

## D-038 · 2026-10-02 · Partner page: the re-deal (one bento morphed by audience), a sticky five-check file, a short partner form in development only
The next heavy page (D-013, STATUS). Plan: `~/.claude/plans/now-our-next-heavy-peaceful-cray.md` (session) and
`docs/plans/stage-5-partner.md` (Blueprint §13, sample ledger, opened/skipped tools). Content is the founders' deck
p.24A (hospitals), 24B (doctors) and 25 (professionals, the five checks), read at full size; every block is pending
(C-080..C-084) and renders in development only (D-029). Sasanka picked the recommended option on all three questions:
- **The re-deal** (Cue Kit Morphing Bento Product Showcase, Prompt-tab spec): an "I'm a…" switch (Hospital · Doctor or
  clinic · Care professional, ARIA tabs, `?for=` in the URL, deep-linked from Home's partner rows) re-deals one
  five-card bento and swaps the headline in the owners' words; the chosen audience's line colour (lime, blue, olive,
  as on Home's partner band) runs through the indicator, the stack highlight and the cards' accents. Card one walks a
  highlight down a stack once on entering view. The swap is a direction-aware slide with blur, CSS only. Not taken
  from the spec: 3D tilt, cursor spotlight, magnetic buttons, shadows, parallax (DESIGN.md 6; known tells).
- **How we check** (Cue Kit Sticky Cascade): the five checks as folder tabs that stack with CSS `position: sticky`.
- **Partner form, front end only:** one short page (kind, organisation, name, phone, email, message, consent), checked
  in the browser against the zod contract `server/contracts/partners.ts` (shaped to TRD's `partner_enquiries`), then a
  confirmation marked "sample, nothing was sent or stored". No table, no API (STATUS: Partner API is backend-later).
  `partnerEnquiryLive: false`: production shows the phone and email only (Q16 open; INVARIANT 31).
- **Instrument:** "Visits in Noida and Delhi" (C-032) beside the live call status.
- **Left out (C-085):** the deck's referral money ("incentive-based earnings" for doctors, a revenue share for hospitals
  and "referring doctors"): Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations 2002
  cl. 6.4.1 forbids a physician any "gift, gratuity, commission or bonus in consideration of or return for the
  referring, recommending or procuring of any patient" (nmc.org.in Ethics-Regulations-2002.pdf; the NMC 2023
  regulations, which also ban referral commissions, were notified 2 Aug 2023 and held in abeyance). Also left out:
  digital integration with hospital systems, tele-consult and the doctor app (they don't exist, D-001), hospital names
  (C-006), certifications (C-001..C-005). Asked as Q21. The claims test now bans "incentive", "revenue share" and
  "commission" in copy.
**Why:** three different visitors each see their own deal at once in one layout, the page carries real motion with a
job (the owner's taste), and nothing offers what the business can't lawfully or actually do yet.
**Rejected:** B, a before/after divider (close to About's six lines merging into one); C, three pinned acts (everyone
scrolls past the other two audiences; repeats the Services deck); the data layer now (backend-later); one question per
page (repeats Contact); a hospital logo wall, a stats band and three photo cards (the genre average, Honor; C-006/C-014).
**Built (2026-10-02):** `content/partner.json` + `lib/partner.ts` (zod, one audience per kind in the switch's order,
each block with its claim); `server/contracts/partners.ts` (`PartnerInput`, `parsePartnerKind`; the phone rule is now
exported from `queries.ts`; `PARTNER_KINDS` in `enums.ts`); `partnerEnquiryLive` + `partnerEnquiryOpen()`;
`components/partner/Switchboard.tsx` (switch, headline swap, bento; the stack card is Cue Kit's tray inside an ink
frame), `Stack.tsx` (cumulative walk, once, 550ms a step), `CheckFile.tsx` (sticky folders with a ghost numeral),
`PartnerForm.tsx` (no network request), `audience.ts` (the shared choice); `app/partner/page.tsx` replaces the stub;
Home's partner rows link to `/partner?for=<kind>`; `/partner` joins the sitemap; `tests/partner.test.ts`.
**Verified:** green (lint, typecheck, 137 tests, build). Playwright at 1280x800, sampled every 60ms after a click: card
contents slide 28px to 0 and fade in over ~420ms, 45ms apart; the indicator travels 222px in ~500ms; the stack inks
0 to 8 over ~4.4s and stops (only when on screen); arrow keys and Home move and select with focus; `?for=` is
replaced, and a deep link renders that audience on the server. First view at 1280x537: the stack walks on scroll-in;
the frame deal arms only when the bento starts below the fold (phones), so nothing visible is hidden. Reduced motion
emulated: instant swaps, a full stack; server HTML has no transient attributes. Form: an empty send focuses the error
summary (name, phone, message, consent), links focus their fields, the kind follows the switch until picked, a valid
send focuses the sample confirmation, and no POST is made. Device audit (9 sizes) on `/partner` and
`/partner?for=professional`: no overflow, every control hittable, no sticking. impeccable 1280 + 390: fixed muted text
on sand (4.3:1); kept: the italic phrase, cream page and footer gradient (standing waivers), and 1.08-1.1 leading on
28px+ display text (inverse law, Blueprint 6.1). Production (`next start`): the switch with Home's approved role lines,
the area, the phone and email; no pending text, form, sample line, "incentive", "revenue", "commission", ISO or
hospital name; no deck text in `.next/static`. Side-by-side: `refs/build-sbs/partner-vs-morphing-bento.png`.
**Not verified:** a real phone, iPad or Safari; a screen reader on the tabs; the Taste pre-flight and the Web Interface
Guidelines were run by hand, not as skills; the owners' review of the copy (Q15) and answers to Q16 and Q21. Home reel
finding (close-out, Sasanka asked to fix it): the device audit flagged "Ask about motorised bed" at 1280x537 and
1536x730, one step per run. Measured: only when the link's centre (x=19) had slid left of the reel window's clip (x=38),
half hidden behind the thread by design; clickable at every visible position. No product bug: the audit now skips a
control clipped out by an ancestor (scripts/device-audit.mjs), and still flags a visible covered one (an overlay
placed on a tab was caught). Re-run on Home, Services, About and Partner at 9 sizes: clean.

## D-039 · 2026-10-02 · The About and Services still-lifes are placed (C-086, C-087)
Sasanka delivered the fourteen still-lifes planned in D-031 (Services, seven) and D-032 (About, seven) from
`docs/ASSET-PROMPTS.md`; each was viewed in full and matches its prompt (no people, text or brand marks). Eleven are
placed; the three vision capsules were tried and **dropped on Sasanka's review the same day**.
- **Services deck:** one `image` per service (nurse, GDA, procedures, ICU, doctor, physiotherapy, lab samples), 1122 px
  webp in `public/illustrations/services/`; the equipment card keeps the motorised bed (C-073). All eight cards now
  hold a still-life; the type-led slot stays only as the schema's fallback.
- **About values:** the turning card shows the value's still-life (care, trust, healing, home) in place of the icon,
  900 px webp in `public/illustrations/about/`, the ink ring kept on top. The stage image is decorative (`alt=""`,
  aria-hidden parent); the "Illustration: …" alt text stays in the content file.
- **About vision capsules: icons stay** (D-032's look). The still-lifes (tulsi, tea glasses, walking stick) read badly
  at pill size ("not looking good at all"), so they are not used; originals stay in `refs/care-setu/stills/about-5..7`
  and no web copies exist. `Illustration` (lib/content.ts) is exported and required on About's values only.
**Why:** the slots were reserved since D-031/D-032; this fills them without touching any layout or motion.
**Rejected:** still-lifes in the capsules (tried, judged poor at that size by the owner of the page's taste); keeping
icons as a values fallback (the schema requires the image, so it was dead code).
**Verified:** green (lint, typecheck, tests, build). In Chrome on the dev server: the Services deck shows its images.
Device audit on /services and /about at 9 sizes (before the capsule revert, which only restores the earlier markup): clean.
**Not verified:** the Values card mid-turn and the phone strip crop by eye; owner review. No commit.

## D-040 · 2026-10-02 · Launch-day production audit and fixes
The owners will deploy the site today, after a meeting with their tech team (hosting is their call, Q1; Sasanka reviews
the setup afterwards). Before that, a production build was served locally (`next build` + `next start`) and every route
probed and screenshotted. APIs answer `not_available`, `/dev` is closed, robots disallows everything (no `APP_ENV`).
Three problems were found and fixed:
- **Copy that promised what production doesn't do (INVARIANT 18).** Home's route said "Six short questions online"
  (the form has five, and it is off in production) and "You pay online"; Contact said "or leave your details". Now the
  route's first stop reads "Call or WhatsApp us and tell us about the patient" while `enquiryOpen()` is false
  ("Five short questions online…" in development), the pay stop drops "online", and Contact shows `ledeClosed` and
  `metaDescriptionClosed` in production.
- **Unbuilt pages.** FAQ, Terms and Refunds showed visitors "This page is built in Stage 4". `Stub` now calls
  `notFound()` in production, and the footer leaves out links flagged `stub` (drop the flag in the change that builds
  the page).
- **Thin About and Partner pages in production** (their deck content is pending, D-029): kept as they are, on
  Sasanka's call; owner changes come after the deploy.
**Why:** a first-day visitor must not meet a promise the site can't keep or a page that says it isn't built.
**Rejected:** hiding About from the production nav (Sasanka keeps it); deploying as it was.
**Verified:** green (lint, typecheck, 137 tests, build). Production probe: `/faq`, `/terms`, `/refunds` 404; the footer
links only Privacy among the legal pages; the new copy renders; "leave your details" absent from production Contact.
**Not verified:** the device matrix on the production build (copy and links only changed).

## D-041 · 2026-10-02 · FAQ: "The thread", answers only from approved claims, grouped by the family's stage
D-013's FAQ, "answered only from confirmed owner facts". GOV.UK's style guide says "Do not use FAQs… if you write
content by starting with user needs, you will not need to use FAQs", so the questions run in the family's order: Before
you call, Getting in touch, Plan and quote, Paying, At home, For partners. Research 2026-10-02 (tool list): Cue Kit
(Split Panel FAQ and Scrollspy Line Navigation, Prompt specs read), Mobbin (faq / frequently asked questions / health faq:
Serus, Daylight, New Yorker, David, Superpower), Design Spells (Spotify chapters), GetLayers (sections + all 52 template
endings: Artefakt "Need to know", Vexon), Curated (88 FAQ sections, "accordions mostly"), 21st.dev (191; FAQ Chat
Accordion), Unlumen (Motion FAQs Accordion), UI Guideline (accordion spec paywalled; WAI-ARIA APG used), GOV.UK. Not
opened: Pafolios (deploy day). Sasanka picked the recommended option of three (The thread / Need-to-know sheet / Route
index).
- **The thread** (21st.dev FAQ Chat Accordion): each question is the family's sand bubble with a bold two-bar toggle;
  opening it brings Care Setu's reply as an ink bubble indented under it, signed with the mark and name. Several may stay
  open. Physics from Cue Kit's Split Panel: grid-rows 0fr to 1fr over 0.5s `cubic-bezier(0.22, 1, 0.36, 1)`, the
  vertical bar turning 90deg; the reply rises 10px from its tail corner after 120ms. CSS only, and only after the reader's
  first toggle, so hydration never animates.
- **The profile card** (ink, sticky; WhatsApp-business header): the mark, the live call status (`CallStatus`), the 2-hour
  promise (C-031), the stage index (Cue Kit Scrollspy: a band a third of the way down, IntersectionObserver; click =
  1000ms easeInOutQuart; the current stage's disc fills logo green, Spotify's current chapter), Call and WhatsApp. On
  windows under 760px tall it drops the promise and the call row (the nav carries both), under 560px the index title, so
  it fits 1280x537 and 1093x490 without running off; it scrolls inside itself only as a fallback. Under 900px wide it is
  one static ink block with a row of stage chips.
- **The instrument:** every reply has "Ask this on WhatsApp", a `wa.me/<number>?text=` link that pre-fills "Hi Care Setu,
  I have a question: {question}" (WhatsApp Help Center, "How to use click to chat", read 2026-10-02). Only the question
  goes in the URL.
- **Content** (`content/faq.json`, `lib/faq.ts`): 17 items, each citing CLAIMS rows; public ones only approved rows
  (tested). Contact details are filled from config. Gated items answer with closed text while their flow is off (online
  details: "Not yet. Please call or WhatsApp us"; paying: the Pay page's closed text). Dev only, pending: refunds (Q8, no
  answer written), staff checks (C-083), languages (C-020).
- **No-JS / reduced motion:** the server renders every reply open and the toggles hidden; the client collapses them.
  The index is real `#stage-` links. Reduced motion: no transition and no delay (the global rule zeroes durations only).
- The footer links /faq again; `/faq` joins the sitemap (D-037).
**Why:** Care Setu is reached by phone and WhatsApp, so a conversation is the subject's own form; it beats the genre's
centred accordion, and every answer ends in a working way to ask.
**Rejected:** Need-to-know sheet (calm, all visible, but the least idea); Route index (the third page on the route after
Home and Contact; the owner dislikes repeated sections); typing dots or an "online" badge (would fake a live chat);
answering refunds, prices or languages by default (INVARIANT 25).
**Verified:** green (lint, typecheck, 144 tests, build). CDP probe at 1280x537: collapsed after hydration; a click opens
(height 0 to 220px over ~500ms, the bubble fading in from 120ms) and closes; `/faq#q-cost` opens only that item, 184px
from the top; the index follows the wheel both ways; an index click lands the heading 104px down and focuses it; Tab +
Enter toggles. Reduced motion opens instantly. SSR HTML: 0 collapsed items. Device audit at 9 sizes: OK. Production
build: 200; pending items absent; closed answers shown; no ₹, %, 24x7, domain or "verified". impeccable at 1280 and 390:
cyan gradient and cream page are site-wide (same on Contact; the footer shader and Warm Room); content-hidden-at-rest,
heading-rhythm (h3s are accordion headers, their content collapsed) and column-overflow (the short column is the sticky
card) are by design. Taste pre-flight: the sender label made sentence case, one "Call" label, scrollspy moved off a raw
scroll listener; dark mode waived (light-only Warm Room). Vercel guidelines: translate="no" on the brand, text-wrap,
overflow-wrap, link hover fixed.
**Not verified:** real Safari and devices; trackpad feel of the eased scroll; owner review. Founder copy approval (Q15).

## D-042 · 2026-10-03 · The owners' Netlify staging deploy is recorded; Q1 stays open (partially supersedes D-002: "nothing is hosted until the owners choose")
On 2026-10-02 the owners' tech team deployed the site to Netlify without a D-entry first. Read on 2026-10-03 in the Netlify
dashboard (Chrome) and by probing the live URL. Facts: project `caresetu-app-staging`, `caresetu-app-staging.netlify.app`,
visibility "Public", framework Next.js, deploys from the private repo `Ausmin787/care-setu` branch `main` with **auto
publishing on** (every push or merged PR to `main` goes live in about a minute), no custom domain, no `netlify.toml`.
The tech team works through GitHub: PR #1 (`test-branch-1`, a one-line README commit by Divyak Pratap Singh, merged
2026-10-02) is what Netlify built (`main@a1ea98a`). Probe of the live site: per-request CSP and security headers present
(D-022); `/robots.txt` disallows everything and the sitemap is empty (D-037); `/dev`, `/admin`, `/terms`, unbuilt service
slugs 404; `POST /api/v1/queries` answers 404 `not_available`; `/pay` renders the closed card; the Home hero renders
(D-040). So INVARIANTS 28, 29, 30 and 31 hold in production.
This is **staging**, not launch: the owners said domain and hosting are "for later" and wanted the site public meanwhile.
- **What it changes.** Anything pushed to `main` is public within a minute. D-015 (commit and push need Sasanka's explicit
  permission) is now also the release gate. Work that is not ready goes on a branch; Netlify builds branches as deploy
  previews only if the owners enable them (not checked).
- **What it doesn't change.** Q1 (production host, database, email provider, budget, account ownership), Q2 (domain), the
  enquiry/pay/partner flags and the claims register all stay as they were. No default answers any of them (INVARIANT 25).
**Why:** a decision made outside the process still has to be written down, or the docs say "no hosting" while the site is
live (stale docs are bugs).
**Rejected:** objecting to a public staging deploy (the owners decided; Sasanka asked that it not be re-litigated);
treating this as the answer to Q1; changing `main` protections or Netlify settings from here.
**Verified:** the Netlify overview and deploys pages (read-only), response headers, `robots.txt`, `sitemap.xml`, status
codes for 9 paths, the Home hero in Chrome, `git log origin/main`.
**Not verified:** environment-variable names (the browser tool was denied that page; values must never be read anyway);
whether `APP_ENV`/`APP_BASE_URL` are set (robots output implies production without an https base URL); whether Netlify's
free plan allows commercial use and what happens past its 300-credit limit (the pricing page did not say; check the terms
before launch); who owns the Netlify and GitHub accounts; whether deploy previews or branch deploys are on; the device
matrix on the live URL.

## D-043 · 2026-10-03 · Service detail pages: "the card opens", development only, the deck's who / includes / steps as pending
D-013's per-service pages are kept (Sasanka asked for the template on 2026-10-03; D-036 had left keep-or-drop open).
Research and the sample ledger: `docs/plans/stage-4-service-detail.md` (GetLayers Aerra and House, Cue Kit Cell-to-Card,
Design Spells [untitled] morph, Motion.dev App Store layout, React Bits Scroll Expand, Skiper 23, Superpower via Mobbin,
Unlumen Stacked Feature Cards, UI Guideline breadcrumbs; opened and skipped tools listed there). Sasanka picked the
recommended option on all three questions:
- **Design A, "the card opens".** `/services/<slug>`, eight pages, one per deck card (nurse, gda, procedures, icu,
  doctor, physiotherapy, lab-samples, equipment). Each deck card's still-life panel and the page's hero panel share a
  React `<ViewTransition>` name, so clicking "What's included" morphs the card into the page (600ms
  `cubic-bezier(0.22, 1, 0.36, 1)`, Cue Kit's FLIP timing; Back reverses). The hero is an ink stage like the deck: the
  service's tinted panel with its still-life, the name's words at its corners (House); scrolling opens the still-life to
  full bleed (Aerra; `clip-path` driven by a CSS variable, Blueprint trap #860). Then parchment: about + facts, "Who
  it's for" as a numbered serif index, "What's included" ticking beside the sticky still-life (the mechanic of About's
  wishes, `Ticks`, D-032, given a new job: the kit), this service's route as a horizontal strip in its line colour with
  the live call status at the first stop, the other services in the line as tiles that morph into their page (Skiper
  23), the next line's first service, and the Talk to us close (pre-selects the service on `/contact`, D-033).
- **Development only:** new `serviceDetailsLive: false` (the `enquiryLive`/`paymentsLive`/`partnerEnquiryLive`
  pattern). Production 404s every `/services/<slug>`, the deck cards carry no link there and the sitemap omits them,
  until a D-entry turns it on. With only approved rows a public page would repeat its deck card (D-040's thin-page
  problem).
- **Content: the deck's who it's for, what's included and the service-specific steps** (p.11-14, 18, 20, 21), as
  pending rows C-088..C-095, shown in development only. Left out: every "Key benefits" list (outcome claims), "24x7"
  (C-016), "trained and verified" (C-015), "hospital-level/-grade", the app in "We stay connected" (D-001), EMI (C-019),
  taglines and intros (marketing promises; the owners' approved one-line description, C-033, carries the about).
  Nursing procedures and lab samples have no full deck page, so their pages are short; the owners can supply more
  (Q17). The deck's post-surgery, palliative, maternity, elderly-care and vaccination/medicine pages get no page: not
  launch services (D-024). The route's shared stops are approved copy (C-024, C-025, C-028, C-031).
**Why:** the deck card is the page's promise in brief; opening it keeps the visitor's place and gives each service the
room the deck has no space for, from the owners' own lists, without shipping anything unconfirmed.
**Rejected:** B, the service sheet (a sticky ink card beside chapters: repeats FAQ's and Contact's sticky cards); C, the
unfolded card (a second pinned scrub beside the Services deck); live in production with the approved subset (eight
thin public pages); the benefits as pending (medical outcome claims with no evidence, Q10); the sample-site scope only
(drops who it's for and the steps).
**Built (2026-10-03):** `app/services/[slug]/page.tsx`, `components/services/Detail.{tsx,module.css}`,
`components/motion/Dolly.tsx`, `lib/services.ts`, the `detail` blocks in `content/services.json`, `serviceDetail`
messages, `serviceDetailsLive` + `serviceDetailsOpen()`, the deck card's "What's included" link and shared element, the
nav marking Services as the current section on its subpages (`aria-current="true"`), the view-transition rules in
`globals.css`, `tests/service-detail.test.ts`. Two calls made in the build: the name sits on the ink above the panel,
not on the image's corners as the comp showed (cream type over the light still-lifes can't hold AA contrast); tiles
arriving on the next page carry their own class (`share="tile"`, not animated) so only the clicked card or tile morphs
(with `share="none"` the clicked tile's own morph was cancelled too, tested).
**Verified:** green (lint, typecheck, 155 tests, build). Headless Chrome over CDP, 1280x800: deck card → nurse page
morphs (`::view-transition-group(svc-nurse)` with old and new snapshots; frames at 120/280/450ms show the still-life
growing into the hero, blurred mid-flight); nurse → GDA tile morphs into the hero with the other tiles still. Device
audit (9 sizes) on nurse, equipment, procedures, lab-samples, icu and `/services`: no overflow, nothing covered, scroll
never sticks. Wheel frames at 1422x597, 1280x537 and 390x844 (dolly opens to full bleed, ticks, route, tiles, close;
fixed: crumbs baseline, sticky labels overlapping on phones, route line past the last stop, the equipment page's facts).
Production build on :3100 (killed by PID): `/services/nurse|equipment|gda` 404, no detail link or "What's included" on
`/services`, sitemap empty. SSR HTML carries no `data-live`, `data-ticked` or `--open` (reduced motion and no-JS get the
resting page). impeccable 1280 + 390: tight-leading on the Petrona display rows (index eased to 1.22; the rest kept,
Blueprint 6.1), the footer gradient and Warm Room cream (standing waivers). Taste pre-flight and the Web Interface
Guidelines: heading balance and a hover state added; sentence case kept.
**Not verified:** the morph in Safari and Firefox (Chromium only; without support the page simply swaps); Back-button
morph; a real phone; screen reader; reduced motion emulated (checked structurally). In a background tab Chrome aborts
the transition with an `InvalidStateError` in the console; navigation still completes. Owner review and copy (Q15, Q17).

## D-044 · 2026-10-03 · Owner answers: service scopes confirmed, area all of India, equipment generic until confirmed (partially supersedes D-024: the service area; D-029: the equipment availability text)
The owners answered most of Q17 and parts of Q10, Q19 and Q20 on 2026-10-03, relayed by Sasanka (text kept in this
session's transcript; summarised here). Recorded as evidence in CLAIMS.md:
- **(a) Service scopes, confirmed:** nursing (IV infusion, post-operative dressing, catheter and tracheostomy care,
  C-035), GDA (companionship, memory-care support, mobility supervision, assisted bathing, health records; 12- and
  24-hour options, C-036), ICU at home (ventilator, patient monitor, syringe pumps, C-037: "multi-channel monitor" is
  now "patient monitor", their word), doctors (general physicians and geriatricians, C-038: the sample's "check-ups,
  treatment reviews, new symptoms" were not confirmed and are removed), physiotherapy (orthopaedic, neurological,
  cardiopulmonary, C-039), lab (CBC, LFT, KFT, HbA1c, C-040). All approved. Prices stay off (Q18 unanswered).
- **(b) Equipment: not confirmed.** The inventory and whether each item is for rent, sale or both await the owners, and
  "do not publish any unconfirmed equipment availability". C-041, C-051..C-057 and C-095 stay pending, and the live
  equipment wording from their earlier site (rent hospital beds, concentrators, wheelchairs and monitors; buy; sell
  back: part of C-033) becomes pending too (C-099). **Production shows a generic line instead** (Sasanka's pick):
  "Medical equipment for care at home. Tell us what you need and we confirm what's available." (C-098), in the
  Services deck, the FAQ and wherever the equipment ways appeared.
- **(c) Qualifications and checks, confirmed:** nurses GNM or B.Sc, physiotherapists BPT or MPT; credentials and
  documents verified before onboarding or assignment (C-096, approved). The sample's "100% verified", Aadhaar and
  fitness checks (rest of C-071) and the deck's other four checks (C-083) stay unconfirmed. Not placed on a page yet.
- **(d) NABL:** never claimed until a lab partner and a valid certificate are provided (C-060 stays pending).
- **(e) Brand line approved** ("Treatment begins in a hospital. Healing continues at home.", C-043; the kicker above Home's "how we work"; its hard-coded pending tag now follows the row). The founding story
  may be used once Care Setu approves the final text, so it stays pending (C-044, C-074).
- **(f) Reviews:** none until genuine and with written consent; the named sample reviews and the 4.92 rating never
  ship (C-058, C-059 stay rejected).
- **Service area: all of India.** The owner asked for "pan India… not only NCR"; Sasanka confirmed it means Care Setu
  serves patients anywhere in India today. **Supersedes D-024's "Noida and Delhi"** (C-032 superseded by C-097, "across
  India"). Every area line changes (Home fact row and how-we-work, Services lede, Partner chip, FAQ, meta
  descriptions). The office address (C-030) and the callback promise (C-031) are unchanged. The enquiry's area step
  keeps its stored values (noida, delhi, other; migration 0000) and only its copy changes; a city field would be a
  schema change (a migration), left as a follow-up.
**Why:** owner answers are the evidence the claims register waits for (D-007); approving exactly what they confirmed,
and no more, ships the confirmed scopes and keeps the unconfirmed equipment off the public site.
**Rejected:** approving the whole sample rows (the doctor row carried unconfirmed items); leaving the live equipment
text up (contradicts answer b); hiding equipment entirely (Sasanka's pick was the generic line); "Noida and Delhi,
growing across India" (Sasanka confirmed all of India today); changing the enquiry's stored area values now (a
migration for a development-only form).
**Verified:** green (lint, typecheck, 155 tests, build). Production build on :3100 (stopped by PID): no "Noida and
Delhi" on `/`, `/services`, `/faq`, `/partner`, `/about`; "across India" present on each; no equipment item or
rent/buy wording, the summary line instead; the confirmed scopes render (IV infusion, patient monitor, GPs and
geriatricians, cardiopulmonary, HbA1c) and "treatment reviews" and "multi-channel" do not; Home shows the brand line
with no pending tag; detail pages still 404. Device audit on the production build (1280x537, 1093x490, 768x1024,
390x844) for `/`, `/services`, `/faq`: OK.
**Not verified:** the owners seeing the new wording before it ships (Q15 still has no named approver; these lines are
their own answers, applied as given).

## D-045 · 2026-10-04 · Repo made public; every change goes by pull request, reviewed by CodeRabbit (partially supersedes D-002: "private GitHub repo")
Sasanka asked for CodeRabbit as an independent second reviewer (Claude reviewing its own work shares its blind spots).
CodeRabbit is free only on public repositories, so `care-setu` (`dip-alert-app` was already public)
was made public on 2026-10-04 with Sasanka's explicit instruction, after a full-history pattern scan found
no secrets (`.env.example` is the only env file ever tracked). **`hungry-anna` was also made public that day and returned
to private the same day:** its INVARIANT 12 forbids it (the owner's FSSAI certificate, phone numbers, address and
conversation record are tracked), and that file had not been read first. It gets the local CLI review instead (the Free
plan covers CLI reviews). Lesson: read the target repo's invariants and sweep for owner data before any visibility change.
- **Pipeline:** work on a branch, open a pull request, CI ("green", D-033) and CodeRabbit run, the author triages every
  CodeRabbit comment as evidence (fix, or answer with a reason; fix loops capped at 3, as AGENT-OPS), Codex is an optional
  third opinion on money, webhook and auth changes (`AGENTS.md` → "Review handoff"), **Sasanka merges**. A merge to `main`
  is a release (Netlify, D-042), so it needs his permission like a push (D-015).
- **`.coderabbit.yaml`** carries the invariants as per-path review instructions and reads `CLAUDE.md`, `AGENTS.md` and
  `docs/INVARIANTS.md` as guidelines. It restates them; they win on any disagreement.
- **The GitHub App is limited to three repos** (`care-setu`, `dip-alert-app` and the now-private `hungry-anna`), checked in GitHub's installed
  apps page; the private `Cognest-app` and `hungry-anna-inventory` are not reachable by it.
- **Now public:** all of `docs/` (open owner questions, the claims register, contact details already on the site) and the
  full history. Owner-confidential documents (the vision PDF, the brief) must never be committed.
- **Standing rule (Sasanka, 2026-10-04):** every change, however small, goes through a pull request. CodeRabbit's findings
  are reported to him with what was fixed and what was rejected and why.
**Why:** an independent reviewer catches what the author's own model repeats; the free tier needs a public repo; the
invariants are mechanical enough that a second reader can enforce them on every pull request.
**Rejected:** keeping `hungry-anna` public (its own INVARIANT 12); staying private for `care-setu` (the free plan there is PR summaries only); the paid Essentials plan ($24 per developer per
month, by Sasanka's choice of free); Claude-only review; installing CodeRabbit on all repos (it first came in that way and
was narrowed the same day); putting Sasanka's global instructions into CodeRabbit (private context on a third-party service).
**Verified:** CodeRabbit's pricing, open-source and plans pages state public repos are free (open-source plan with Team
features); `gh repo list` shows `care-setu` and `dip-alert-app` public and `hungry-anna` private; `care-setu`'s history scanned with secret and key patterns, clean; the
installed-app page lists exactly three repos with "Only select repositories"; `.coderabbit.yaml` validates against
CodeRabbit's published `schema.v2.json`, and a deliberately wrong document is rejected by the same check.
**Not verified:** that CodeRabbit comments on a pull request here (this branch's PR is the first test); the open-source
rate limits (the plans page table did not render) and whether Dashboard and Reports are excluded for open-source (a
knowledge-base article from October 2025 says so); that the free offer persists; the scan was by pattern, not a dedicated
scanner; the owners being told the repo is public (Sasanka decided; not raised in-session).

## D-046 · 2026-10-04 · UX ethics for a health service: no fear or shame, no manufactured urgency, a neutral way out (adds INVARIANT 34; builds on D-012, D-033; supersedes nothing)
Sasanka approved this overlay on 2026-10-04 after the UX Master Blueprint was written (`~/.claude/UX-MASTER-BLUEPRINT.md`; it keeps
project rules out of the portable file and defers them to each repo). It states what Care Setu's pages must never do to a person,
because the people arriving are often anxious about someone they love:
- **No fear- or shame-based copy,** anywhere (no scare lines, no guilt on a declined offer).
- **No manufactured urgency or scarcity.** Only limits that really exist (service hours, the callback window, D-024) are stated, and
  they come from `content/` config, never typed into a component.
- **Declining is one neutral tap.** The call card is always an alternative wherever a form asks for details (D-033).
- **An emergency note** stays wherever someone may be in crisis (as the enquiry has, D-033).
- **Money screens** show every cost early and confirm instantly and plainly, with amounts only from the server quote (INVARIANT 4, unchanged).
- **Consent** stays unticked and versioned (INVARIANT 12, unchanged).
Every UI plan also owes the blueprint's UX intent block and its eight-question dark-pattern audit before sign-off.
**Why:** an independent, written line lets a request that crosses it be objected to before it is built, like the other invariants; the
rules restate and extend INVARIANTS 4, 12, 15 and 18 and D-033, so they conflict with no existing decision.
**Rejected:** applying the growth.design case-study patterns as written (practitioner heuristics, not verified, and copying an example
is the failure the blueprint now forbids); leaving the overlay as a blueprint note only (it would bind nothing in this repo);
one blanket "psychology to raise conversion" rule (it points the wrong way for a health service).
**Verified:** the overlay's rules were checked against INVARIANTS 4, 12, 15, 18 and D-033/D-024 and contradict none; `docs-check` run.
**Not verified:** that any built page complies. No audit of Home, Services, About, Contact, Pay, Partner, FAQ or the 404 has been run
against it. The psychology behind the rules is `[HEURISTIC]` in the blueprint, not checked against primary sources, and no real-user
test exists. Follow-up: audit the built pages against INVARIANT 34 and the dark-pattern audit.

## D-047 · 2026-10-04 · Pay confirms at once and the receipt prints after; the enquiry's privacy line is softened (partially supersedes D-036: the stage timing; applies INVARIANT 34)
The audit of the built pages against INVARIANT 34 (run the same day) found two things. Sasanka chose Option A for the first and to soften the second.
- **Pay:** D-036 held the bank stage for at least 1.4s even when the answer was already there, then showed "Printing your receipt" for 2.0s before
  "Paid". That put a fixed delay between an accepted payment and its confirmation. Now the status says **Paid** the moment the result arrives, and the
  receipt feeds out as a flourish nothing waits on (the 2.0s hum, the stepped feed and the rows landing are unchanged; reduced motion is unchanged). No
  artificial hold remains. The "printing" stage and its message are removed.
- **Enquiry:** the line under "What does the patient need?" said "Only the Care Setu team reads this." That claim had no approved CLAIMS row, and the draft
  privacy notice itself says the email and hosting providers are not chosen yet. It now reads "The Care Setu team who arrange care will read this. Please
  share only what the care needs.", the notice's own "Who sees it" wording. The owners still approve copy under Q15.
**Why:** a confirmation that is held back to look busy is the "delay added to seem busy" the UX blueprint forbids and INVARIANT 34 ("confirm instantly")
rules out; a trust claim nobody has checked is the "would it be true if checked" test failing (INVARIANTS 15 and 18).
**Rejected:** keeping the staged print as an exception to INVARIANT 34 (Option B); a short anti-flash floor on the bank stage (nothing needs it, and the
blueprint's own test is "is the wait real"); getting owner evidence for "only" (it cannot be true while providers are unchosen).
**Verified:** see the LOG entry for this date: `npm run green` and a browser probe of the sample flow.
**Not verified:** a real phone, iPad or Safari; a screen reader on the new order of announcements; real gateway latency (sample quotes only); the owners
approving the softened line (Q15 has no named approver).

## D-048 · 2026-10-04 · Codex owns backend, security and money logic once the backend phase starts; authors never review their own work (partially supersedes D-016 / AGENT-OPS §6: the main agent owns money and payment logic; AGENTS.md: Codex as an optional third opinion)
Sasanka set this split on 2026-10-04 while building a shared engineering process for Care Setu and Hungry Anna:
- **Now:** nobody reviews their own change. Codex reviews Claude's changes (architecture, security, money), Claude reviews Codex's,
  and CodeRabbit reviews every pull request (D-045). Findings are reported to Sasanka as fixed or rejected, with the reason.
  Until the backend phase starts, backend, security and money code stay with Claude, as in D-016.
- **From the start of the backend phase** (pay wiring, the Partner API, Admin; Stage 5 in STATUS "Then"; the day it starts is
  Sasanka's call and is recorded in STATUS): Codex authors backend, security and money and payment logic (INVARIANTS 4..8, 28, 29),
  working to its Backend Master Blueprint, which is a draft until reviewed and never overrides an invariant or a decision.
- **Claude** keeps the frontend, UI and UX (INVARIANT 34), owner-facing text and edits to the canonical docs.
- **Unchanged:** Sasanka merges and a merge is a release (INVARIANTS 22, 23, 33). The client never sends a price and money is
  integer paise (INVARIANTS 4, 5). Phase 1 stays the website only (INVARIANT 1). No dev-only flag changes.
**Why:** an author's own review repeats the author's blind spots, and money and security code deserves a different author and a
second reviewer. The ownership change waits for the backend phase because the existing data layer and API were built and reviewed
under D-016 and nothing is gained by moving them mid-build.
**Rejected:** one agent owning and reviewing everything; Codex as only an optional third opinion (the previous setup); moving
ownership today (no backend work is in flight); letting either agent merge.
**Verified:** the passages this replaces were read: CLAUDE.md "Delegation", AGENT-OPS §6 and AGENTS.md "Review pipeline". They are
edited in this same change.
**Not verified:** that Codex's output meets this bar, since it has not authored backend code for this project; that the Backend
Master Blueprint is sound (draft, unreviewed); how the two agents' commits will be sequenced day to day. Hungry Anna is a separate
project and needs its own entry; none is made here.

## D-049 · 2026-10-05 · Agentic-engineering hardening: browser and accessibility checks in "green", an unused-code check, a trusted rate-limit address, an identity rule for the backend, an agent runbook, and anime.js dropped (extends INVARIANT 26 and CLAUDE.md rule 7; partially supersedes D-021: "anime.js + GSAP")
Sasanka asked for the gaps found when Andrej Karpathy's talk "From Vibe Coding to Agentic Engineering" was read against the repo
(captions via yt-dlp, 2026-10-05; the talk is a lead, not a source: every item below stands on evidence in this repo). Six changes:
1. **"Green" now also means `npm run unused` (knip) and `npm run test:e2e` (Playwright + axe).** Two projects: `prod` runs the built site
   (every built page loads, no console errors, no WCAG 2.1 A/AA axe violations; Terms, Refunds, `/dev` and `/services/<slug>` 404; both APIs
   closed; robots disallows) and `dev` runs `next dev` (the enquiry end to end with consent unticked and required, the queries API's refusals,
   Pay, the Partner form sending nothing, a service detail page, all under axe). CI runs both after the build.
2. **The rate limiter keys on a trusted address.** `clientKey()` in `server/rate-limit.ts` takes `x-nf-client-connection-ip`, else the
   **last** `x-forwarded-for` value, else one shared key. Before, the first forwarded value was used, which a client can write. A browser-level
   test proves a spoofed header buys no fresh allowance. Revisit when hosting is chosen (Q1).
3. **knip** flags unused files, exports and dependencies; four unused exports it found were un-exported.
4. **INVARIANT 35** (new): records are linked by internal ids, never matched by email, phone or name. Written before the backend phase so
   Codex's work (D-048) starts under it.
5. **`docs/AGENT-RUNBOOK.md`**: setup, verify, release and handover steps as instructions an agent can follow.
6. **`animejs` removed from this project only.** It was never imported: D-021 built the hero entrance in CSS, and every later page plan chose
   CSS or GSAP. The global skill and Hungry Anna are untouched; reinstalling is one command if a page needs text-splitting or SVG draw.
**Why:** verifiability is what lets agents move fast without lowering the bar; the only browser check was a manual audit, so nothing in CI
would catch a broken form or an inaccessible page, and the rate limit could be walked around with one header.
**Rejected:** loosening any checker to pass (the two decorative-text exclusions are narrow, named in `e2e/axe.ts` and justified there, and every
other element is still checked); changing the faint decorative numerals and ghost words to pass axe (a look decision under D-031/D-038, not a
test's to make); a copy-paste detector (jscpd) in the gate (report-only noise, no failing signal); `llms.txt` (INVARIANT 30 keeps the site out
of search); putting the manual device audit in CI (it drives a Windows Chrome path and 9 viewport sizes; it stays a pre-release check).
**Verified:** `npm run lint`, `typecheck`, `unused`, `npm test`, and `npx playwright test` (20 browser tests, both projects, before D-050 added the phone-size pass; 28 after) passed locally on
Windows with Chrome; the spoofed-header test fails against the old key. Netlify's behaviour is from Netlify staff answers on
answers.netlify.com (they say `x-nf-client-connection-ip` is the supported header and `x-forwarded-for` is not parsed): a forum, not
primary documentation, and the primary docs page for functions does not mention headers.
**Verified later the same day:** the same 20 tests pass in CI mode (`CI=1`, bundled Chromium, retries on) after raising the dev project's limit to 90 s
(one enquiry run timed out at 30 s on first compile); the `dev` flows pass on WebKit (Safari's engine) three runs running, and on emulated iPhone 13 and
Pixel 7; the axe helper now re-looks for up to 1.5 s so a colour caught mid-transition is not reported. Netlify: the primary docs (functions `context.ip`,
headers, rewrites) do not mention `x-nf-client-connection-ip` at all, so that header rests on Netlify staff answers only.
**Not verified:** GitHub CI itself (needs a push, which needs Sasanka's permission); a screen reader and a real device; the `prod` project on WebKit
(Safari applies the production CSP's `upgrade-insecure-requests` to http://localhost, so every asset fails there; a deployed https URL is the way to test it);
that Netlify really sends `x-nf-client-connection-ip` to a Next.js route and overwrites a client-sent copy (needs a deploy; until then, on any host that does not overwrite it, a client could set it and choose its own rate-limit key; an automated security review of the commit flagged this header trust too); the rate limit is still per server instance (Q1).
**Found, then fixed in D-050:** on a phone-size window (Pixel 7) the Home statement's unread words measured 1.83:1 (D-050 raises them to 3.85:1).
**Found, not changed:** `npm audit`'s `braces` advisory has no patched release (3.0.3 is latest) and the only offered fix is a breaking downgrade of
`eslint-config-next`; it is dev tooling.

## D-050 · 2026-10-05 · The Home statement's unread words stay readable: ghost colour 28% to 55% ink (partially supersedes D-030: the ghost value of the ink-in reveal; adds nothing else)
Found by the phone-size axe pass in D-049: the statement's not-yet-inked words measured 1.83:1 on parchment (the CSS comment claimed 2.4:1, which was
also wrong), below the 3:1 WCAG asks of large text, and they stay that dim for anyone who stops scrolling mid-statement. Sasanka asked for it fixed.
The ghost is now `color-mix(in srgb, var(--c-ink) 55%, var(--c-canvas))`: 3.85:1 against the page, 4.25:1 against the inked word, which is 16.4:1, so the
words still visibly darken as they are read. The reveal itself (order, trigger, timing, reduced-motion fallback) is unchanged; one CSS value and its comment.
The blueprint's own physics (§9.3: "content stays readable the whole way") and the About manifesto (never below about 7:1) already hold this line.
**Why:** unread text that cannot be read at rest is the transient state becoming a permanent one on a phone, and an unaffordable one for low-vision readers.
**Rejected:** 60% (4.5:1, but only 3.6:1 to the inked word, so the reveal nearly disappears); 40% (2.5:1, still below 3:1); an opacity ramp (alpha
stacking, the trap in the blueprint); leaving it and excluding it from axe (hides a real defect).
**Verified / Not verified:** see the LOG entry for this date.

## D-051 · 2026-10-05 · Override: Sasanka may make a ChatGPT-edited portrait of Dr Saurabh Chauhan from his own photo; nothing ships until consent and provenance are recorded (partially overrides D-034 "no AI on real faces" for this one portrait; INVARIANTS 15 and 16 keep binding the shipping)
Sasanka supplied a casual selfie of Dr Saurabh (a temple, a crowd, snow) and asked for a ChatGPT prompt that makes it a professional portrait matching the other founders, after Claude objected
(D-034: AI upscaling "would invent detail on a real person's face"; INVARIANT 16: photos need recorded provenance and consent; the deck has no photo of Dr Saurabh, C-021). He chose to go ahead.
- **Allowed now:** a prompt, written to preserve his likeness (edit, never "a similar person"), Sasanka running it in ChatGPT, and Claude reviewing the result for likeness drift and artefacts.
- **Not allowed until a later D-entry:** the image entering the repo's `public/` or a page. Claim **C-100** must be `approved`: Dr Saurabh has seen the result, agrees it is him, and consents
  to its web use and to his photo going through a third-party AI. His card shows the portrait in development only, like the other three founders (the whole founders block is `pending` and hidden in a production build, C-021, D-032); production shows nothing of it until then. The founder-photo test that fails if a photo lands in `public/` stays.
- **Unchanged:** D-034 stands for the other founders (classical clean-up only); no other real face goes through AI without its own entry. No white coat, stethoscope or title is added to the image
  (his qualifications are owner-pending, C-096 and the deck). INVARIANT 9 is not touched (this is a founder's own photo, not patient or visitor data).
**Why:** the owner-side need is a professional portrait like the three others; a selfie with strangers in the frame cannot ship, and the owners' deck has no photo of him.
**Rejected:** shipping an AI-edited face on Sasanka's say-so alone (a person's likeness and consent are his to give); a classical clean-up of this selfie (low resolution, wide-angle, strangers behind him);
a fresh photo shoot (recommended, and still the best result; Sasanka chose the prompt route).
**Done the same day:** Sasanka ran the prompt and picked one result (`Professional Indian Business Headshot.png`, 1086x1448). Claude reviewed it on sight (plain backdrop, no strangers or temple, navy blazer and white shirt, moustache, stubble and hair consistent with the selfie, no visible artefacts), resized it with a plain Lanczos downscale (no AI) to 900x1200 WebP, and saved both in the gitignored `refs/care-setu/founders/` (`saurabh-chatgpt.png`, `saurabh.webp`). `content/about.json` points his card at the dev-only route like the other three (the whole founders block is dev only, `pending`, C-021), so production still shows nothing; C-100 stays `pending`.
**Verified:** the three founder photos were viewed to set the prompt; `about` and `claims` tests pass; on `next dev` at 1440 wide his card renders in the same warm monochrome treatment and opens like the others (captured and viewed). **Not verified:** likeness (only Dr Saurabh or someone who knows him can say; Claude compared to one selfie); that Dr Saurabh consents (asked of him, not yet answered); the card at phone width.
