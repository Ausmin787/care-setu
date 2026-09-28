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

## D-024 · 2026-09-26 · Owner answers: contact details, response time, service area, launch services, a fourth founder
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
