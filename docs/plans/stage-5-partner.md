# Care Setu: Partner with us (Stage 5, heavy page): research, picks and build plan

**Status:** picked 2026-10-02 (D-038). Session plan copied below; the ledger is the evidence for D-038. Captures: `refs/care-setu/partner/` (gitignored).


## Context
D-013 put "Partner with us" in Phase 1 (enquiries from hospitals, doctors and professionals); STATUS names it the next
heavy page. Today `/partner` is a `Stub`; Home's sand partner band (D-030) already links its three role rows there.
The page has three different visitors (a hospital discharge desk, a doctor or clinic, a nurse/attendant/therapist) who
each need to see *their* deal fast, then leave details. Owner taste (OWNER-TASTE.md): premium, cinematic, big confident
type, motion that tells a story; never the "normal Indian healthcare site" (stats band, three photo cards, logo wall).

**Constraints (from the record):**
- **Q16 is open** (is a partner form wanted at launch, who receives it): the form runs in **development only**
  behind a new `partnerEnquiryLive: false` (the `enquiryLive`/`paymentsLive` pattern, INVARIANT 18/25). Production
  shows the approved phone and email (C-028/C-029) only. STATUS already puts "Partner API" in backend-later.
- **Content = founders' deck p.24A (hospitals), 24B (doctors), 25 (professionals + "5 step check")**, read at full size
  this session. All of it is owners' intent → new CLAIMS rows, `pending`, development only via `shown()` (D-029/D-032).
- **Left out, with reasons:** hospital names/logos (C-006 rejected); people photos (C-014); ISO/CEA/"Data Protection
  Compliant" badges (C-001/002/004/005); "digital integration with hospital systems", tele-consult, the doctor
  dashboard app (don't exist, D-001, like C-070); **"incentive-based earnings" for doctors and "revenue sharing… for
  referring doctors"**: IMC (Professional Conduct, Etiquette and Ethics) Regulations 2002 cl. 6.4.1 forbids a physician
  to "give, solicit, or receive… any gift, gratuity, commission or bonus in consideration of… the referring… of any
  patient" (nmc.org.in Ethics-Regulations-2002.pdf; the 2023 NMC regulations that also ban referral commissions were
  notified 2 Aug 2023 and then held in abeyance). New owner question Q21 asks the owners and their legal reviewer
  (Q14); nothing about money for referrers ships. The revenue split stays configuration (INVARIANT 8).
- Assets: none needed. No photos; type, line colours and ink/sand surfaces carry it.

## Difference Test (§1.2) — previous: Pay (D-036)
Value and type are locked by D-027 (parchment + ink, Petrona + Anek). Differs on 5 axes: **layout** (a morphing bento
switched by audience vs an editorial split), **signature motion** (one layout re-dealt per audience vs a receipt
printing), **chroma use** (the chosen audience's line colour runs through the switch, the stack highlight and the file
tabs vs lime on one dot), **ornament** (folder tabs + grain vs paper feed), **instrument** (service area + live status
for partners vs server checks).

## Slop pre-check (§0.1)
Bento tells (3D tilt, cursor spotlight, glow, drop shadows, uniform icon tiles) — refused: DESIGN.md 6 is flat, and the
bento's job is the morph. Stats band and "trusted by" (Honor, the genre average) — no numbers exist. Three role cards
(Home already has the role index) — replaced by the switch. Hospital logo wall (C-006). Smiling-staff stock (C-014).
"Why partner? 1-2-3" dark band (Kajabi) — content order only. Confetti/big tick on send. Fade-up on everything.
Repeating Home's trip, Contact's route, About's bridge or the Services deck — checked per section below.

## Sample ledger (§1.5) — research this session
| Sample | Feeds | Taken | Changed + why | Tool |
|---|---|---|---|---|
| Cue Kit **Morphing Bento Product Showcase** (Prompt tab, full spec read) | opener + bento | "Turn X / into Y" serif headline whose 2nd half swaps; segmented toggle with a sliding indicator (width+translateX, 500ms cubic-bezier(.65,0,.35,1)); a 5-card bento (7-col grid, spans 2×2/2/3/2/3, 280px rows) whose content morphs per use case **without changing layout**; card 1's highlight walking down a stack (1.8s); config-driven swap engine; "dealt" entrance vectors | Petrona light/italic, ink/parchment/sand cards, 20px radius, **no tilt, spotlight, magnet or shadow** (DESIGN.md 6); highlight in the audience's line colour; swap = direction-aware 24px slide + blur instead of a flat fade; plays once in view (≤5s, WCAG 2.2.2) | Chrome page text + MP4 frame sheet |
| Cue Kit **Sticky Cascade Services & Timeline** | "how we check" | file-folder tab cards stacking as you scroll, each tab label left visible | a professional's file: five tabs = the deck's five checks; CSS `position: sticky` only (no pin, unlike the Services deck); sand folders on parchment | MP4 frame sheet |
| Design Spells: Uber "How many seats?" | switch behaviour | the choice changes the scene above it instantly | the choice re-deals the bento and recolours the line | MP4 frame sheet |
| Unlumen Smart Animate Text; Smooth UI per-word-crossfade | headline swap | only the changed words move (blur-slide) | CSS keyframes keyed by audience, 70ms stagger | page text |
| Mobbin (logged in): Kajabi, Maze, Webflow, Zendesk partner sections | section checklist | why → ways to partner → apply | the cliché to beat; order only | search |
| Honor (honorcare.com, genre) | cliché check | stats band, centred copy, three photo cards | the average to beat; nothing taken | Chrome |
| Founders' deck p.24A/24B/25 | all copy | the owners' own lists | claims-gated, pending; referral money and non-existent tech removed | PyMuPDF render |
Opened, nothing taken: GetLayers sections (same ten; Cards Almanac and Roadmap Ascent re-read: index-card stack too close
to the Services deck, rolling numbers would be invented), Godly (no search/sector filter), 21st.dev tabs (generic),
Skiper (Canvas crowd, Team showcase: wrong tone), Smooth UI (vocabulary only), Unlumen side-by-side slide (kept as
option B), Design Spells Netflix profile picker (video missing), Figma mode toggle, Lost Post postcard.
Skipped with reasons: Refero MCP (not connected; system locked D-027); Aceternity/Magic UI/Origin Kit (cliché risk, no
job here); React Bits (anime.js lane, §9.1); Neobrutalism (wrong look); ThreeUI (no 3D job); Jitter/Swishy/Animos
(clips, not page motion); Logosystem, Best Free Fonts (no mark or type work); Recent/Curated (thin for this last time,
not re-opened: a gap, stated); Pafolios (no partner-programme case study found earlier, not re-searched: a gap);
Awwwards collection (not re-searched this session: a gap).

## Sasanka's picks (AskUserQuestion, 2026-10-02) — all three recommended
**A · The re-deal**; form **front end only** (zod contract + labelled sample confirmation in dev, no table, no API;
the Partner API stays backend-later per STATUS); **one short page** form. Rejected: B before/after slider (close to
About's six-lines-into-one), C three pinned acts (everyone scrolls past others' content; repeats the Services deck);
full data layer now; one question per page (repeats Contact).

## Structure (option A, picked)
Archetype: type-led opener → morphing bento → sticky file → short form. Not Pay's split.
1. **Opener (parchment):** kicker "Partner with us"; H1 morphs per audience ("Turn a discharge / *into care that
   carries on at home.*" · "Turn a referral / *into instructions followed at home.*" · "Turn your skills / *into home
   visits near you.*" — drafts, Q15); the **switch** "I'm a… Hospital · Doctor or clinic · Care professional" (ARIA
   tabs controlling the bento; `?for=` in the URL via `history.replaceState`; Home's partner rows deep-link to it).
   **Instrument (§8.3):** a small chip "Visits in Noida and Delhi" (C-032, approved) + the live call status
   (`CallStatus`), true and specific to people asking "will I get work / can you cover my patients".
2. **Bento (5 cards, re-dealt per audience):** ① tall ink "What we take on" — a stack of the eight launch services
   (approved names, D-024) with the highlight walking once in the audience's line colour; ② "What you hand us"
   (discharge summary + one call / your instructions / your registration and experience); ③ "What you get" (deck
   benefits, pending); ④ wide ink "How it starts" (three steps ending at the form; who calls back stays open, Q16);
   ⑤ "Who we're looking for" (professionals: the deck's roles; hospitals/doctors: the patients we take on). Production
   without approved rows: the switch + Home's approved role lines + the contact card.
3. **"How we check everyone who goes into a home"** (pending, deck p.25, C-015/C-071): five sticky folder tabs —
   Documents · Background · Clinical assessment · Supervised first visits · Ongoing review. Shown to all three
   audiences (it's what a hospital and a doctor need to trust). Dev only until the owners describe the real process.
4. **Enquiry (dev only):** one short page form — kind (pre-set from the switch, changeable), organisation (hidden
   for professionals), name, phone, email (optional), message, unticked consent; NHS error summary (focus moves to it);
   client-side parse with the shared zod contract; on success a confirmation tagged "Sample: nothing was sent or
   stored" with what will happen once live. No network request. The consent wording links `/privacy`; the privacy
   draft does not yet describe partner data, so extending it is a precondition recorded for going live (with Q16),
   never a dev blocker. Production: the phone + email card (approved C-028/C-029), no form.

## Motion plan
Signature: **the re-deal** — choosing an audience slides the indicator, morphs only the changed headline words, and
re-deals the five cards with a 40ms stagger, direction-aware (left/right by audience order). All CSS + a small client
component (no GSAP needed; §9.1 lane: CSS). First view: cards dealt in from small vectors (≤40px, ≤4°) once.
Stack highlight walks once on entering view (5 × 1s), never loops. Folder tabs: CSS sticky. Reduced motion: transient
states in JS-added classes; swaps are instant; the stack shows its final state; SSR HTML has no transient class.

## Files
- `content/partner.json` + `lib/partner.ts` — per-audience content, zod-checked, each block with its CLAIMS id + `pending`.
- `content/messages/en.json` `partnerPage` — UI strings; `content/site.config.json` + `lib/content.ts`:
  `partnerEnquiryLive: false`, `partnerEnquiryOpen()`.
- `app/partner/page.tsx` + `page.module.css` — replaces the stub; reads `?for=`.
- `components/partner/Switchboard.tsx` (+ `.module.css`) — switch, headline morph, bento (client).
- `components/partner/CheckFile.tsx` (+ `.module.css`) — the five folder tabs (server).
- `components/partner/PartnerForm.tsx` (+ `.module.css`) — dev-only form, field/error patterns matched to
  `components/contact/Enquiry.tsx`; `server/contracts/partners.ts` (zod `PartnerInput`: kind enum, orgName nullable,
  contactName, phone, email nullable, message, consent literal true, noticeVersion, website honeypot) reusing the
  existing phone rule by exporting `phone` from `server/contracts/queries.ts` (export + import in one edit, #9);
  shaped to TRD's `partner_enquiries` so the later API plugs in without a redesign.
- `components/home/PartnerBand.tsx` — rows link to `/partner?for=<slug>`.
- `app/sitemap.ts` (+ `tests/seo.test.ts`) — add `/partner` (D-037 said "until built").
- `tests/partner.test.ts` — content schema, contract, the `?for=` parser, production gate.
- Docs: D-038, INVARIANT 31 (partner form dev only), STATUS, CLAIMS rows (C-080+), OWNER-QUESTIONS Q21, DESIGN.md,
  LOG, `docs/plans/stage-5-partner.md` (this ledger), Blueprint §14 ledger row.

## Build order
0. Save this plan + ledger as `docs/plans/stage-5-partner.md`; copy the frame sheets from the session scratchpad into
   `refs/care-setu/partner/` (gitignored). Write D-038 + CLAIMS rows + Q21 **before** the copy lands in pages.
1. Content + schema + config flag + contract (tests first). 2. **Static frozen gate**: opener, bento for all three
audiences, file, form, production fallback; device matrix on statics. 3. Instrument (chip + status). 4. Motion: switch
indicator → headline morph → re-deal → stack walk → entrance. 5. Reduced-motion pass. 6. Docs and close-out.

## Verification
Green = lint + typecheck + test + build. Playwright/CDP: switch by click, arrow keys (tabs pattern), `?for=` deep link
from Home, Back/Forward; per-step probe of the re-deal (60ms samples); stack walk stops after one pass; reduced motion
emulated. `npm run audit:devices` (9 sizes) on `/partner`. impeccable 1280 + 390; Taste pre-flight; Web Interface
Guidelines. Production build (`next start`): no form, no pending text, no "incentive", "revenue", "commission", hospital
names, ISO; phone and email present; sitemap lists `/partner`. Side-by-side vs Cue Kit frames. Fact audit grep.

## Open questions / watch items
Q16 (form + recipient), new Q21 (referral money, who handles partnerships), Q15 (copy), Q14 (legal). Sticky folders
vs the Services deck (different mechanic and look; watch the owner's "same section twice" dislike).
