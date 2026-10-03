# Care Setu: service detail template `/services/<slug>` (heavy page): research, options and build plan

**Status:** picked 2026-10-03 (D-043): A, development only, who + included + steps. Built the same day. Captures: `refs/care-setu/service-detail/` (gitignored).

## Context
D-013 put per-service pages in Phase 1 "using the deck's per-service copy, subject to D-007"; D-036 left keep-or-drop
open; Sasanka asked to build the template on 2026-10-03 (keep, recorded in the D-entry). Eight pages, one per deck card
(D-031): nurse, gda, procedures, icu, doctor, physiotherapy, lab-samples, equipment (rent, buy, sell back + the six
items). The site is now public on Netlify staging and every push to `main` is a release (D-042).

**Content (founders' deck, rendered with PyMuPDF and read at full size this session):** each service page in the deck
(p.11 Home Nursing, p.12 Attendants & Senior Care, p.13 ICU, p.14 Physiotherapy, p.18 Doctor, p.20 Diagnostics, p.21
Equipment) carries a tagline, a two-sentence intro, "Who is it for?" (five situations), "What does it include?"
(8-10 items), "Key benefits", "How it works" (5-6 steps) and a commitment line. Procedures has no deck page (p.10 card
#5 and p.11's list only). Not launch services (D-024), so no pages: p.15 post-surgery, p.16 palliative, p.17 maternity,
p.19 elderly care, p.20 vaccination and medicines.
**Honesty filter (INVARIANTS 15, 16, 18):** situations, inclusions and the service-specific steps become new CLAIMS rows,
`pending`, dev only via `shown()`. Dropped: every "Key benefits" list (outcome claims: "better recovery", "lower risk of
infections", "cost-effective"); "trained and verified" (C-015); "24x7" (C-016); the app in "We stay connected" (D-001);
"hospital-level"/"hospital-grade" (C-021-style quality claims); the deck's people photos (C-014). The steps are rewritten
onto our real route (call, a coordinator calls back within 2 hours, plan and quote before you pay, care starts).
**Production today would show only approved facts:** name + plain description (C-033), who comes, the still-life
(C-087/C-073), the route (C-024, C-025, C-031), area (C-032), contacts (C-028/C-029). Assets: the existing still-lifes.

## Difference Test (§1.2): previous FAQ (D-041)
Value and type are locked (D-027: parchment + ink, Petrona + Anek). Differs on 5 axes: **layout** (a card that becomes
the page, an inset that grows to full bleed, then an editorial index vs a thread beside a sticky card), **signature
motion** (a cross-route shared-element morph + an inset dolly vs a reply bubble), **chroma** (the service's line tint is
the hero field vs a lime dot), **ornament** (the still-life carries the page vs bubbles), **instrument** (the live call
status at the first stop of this service's own route vs the WhatsApp header).

## Slop pre-check (§0.1)
The genre service page (deck p.11 itself, Portea, Care24): photo hero + "Who is it for" icon row + included/benefits
two-column cards + 5-step icon strip + trust band. Mobbin "who is it for" results are the same card grid (Acctual,
Mora). Refused: icon-tile rows, benefit cards, a stats band, a 1-2-3 strip with arrows, Aceternity's Expandable Card /
Sticky Scroll Reveal look (instantly recognisable), fade-up on every block. Repeats checked: Home's vertical trip, the
Services deck pin, Contact's route card, FAQ's sticky ink card, Partner's folders.

## Sample ledger (§1.5): research this session
| Sample | Feeds | Taken | Changed + why | Tool |
|---|---|---|---|---|
| GetLayers **Aerra** (template preview, 16-frame sheet) | page skeleton | one product as a detail page: headline over an inset image that grows to full bleed; "About" paragraph; two facts with icons + the action; "Who this is for" numbered situations; "Come and see it" close | the product is a service: inset = the deck card's tinted panel; facts = who comes / line / quote first; situations as a numbered serif index, not cards; close = Talk to us | ffmpeg frame sheet |
| GetLayers **House** (frame sheet) | hero type | the name split to the image's corners while the image changes | the service name's words hold three corners of the growing still-life | ffmpeg frame sheet |
| Cue Kit **Cell-to-Card Calendar Expansion** (Prompt tab, full spec read) | entry morph | FLIP from the clicked cell's rect to the card, 600ms `cubic-bezier(0.22,1,0.36,1)`, 500ms back, content fades in after 150ms | across routes with React `<ViewTransition>` (Next 16 guide, no config) instead of DOM FLIP; deck card → page hero; Back reverses | page text + MP4 |
| Design Spells **[untitled] morphing transitions** | entry morph | an album card grows into the full player screen; one object, no cut | the deck card grows into the page | MP4 frame sheet |
| Motion.dev **iOS App Store layout** | entry morph | the canonical card → article expansion | reference only (Motion+ source not opened) | page |
| React Bits **Scroll Expand**; Skiper **71 Image reveal** | hero dolly | an inset image expanding with scroll | `clip-path: inset(... round)` driven by a CSS variable (Blueprint trap: never scale a scrubbed element) | catalogue + MP4 |
| Mobbin (logged in) **Superpower** "what's included" | inclusions | items as rows (icon, name, one line), grouped | the list ticks as each row crosses the reading line, beside the sticky still-life | search |
| Unlumen **Stacked Feature Cards** | option B | sticky hero card left, content stack right | option B's sticky service card | description |
| Skiper **23 Minimal Card Expand** (Family wallet) | siblings | the chosen card grows, the rest shrink to a row | "Also in Care at home": sibling tiles that morph into their own page | MP4 frame sheet |
| UI Guideline **Breadcrumbs** | nav | `nav` + ordered list, current item `aria-current="page"` | Services › line › service | page text |
| Supahero **Habito** | option B header | small inset image + giant headline + lede | type-led sheet header | still |
| Founders' deck p.10-21 | all copy | the owners' own per-service lists | claims-gated, pending; benefits, 24x7, verified, app dropped | PyMuPDF render |
Opened, nothing taken: 21st.dev (process/product-detail/who-is-it-for: generic timelines and PDPs), Cue Kit Flex-Grow
Benefits / Diagonal Journal / MotionFlow (card rows or trip-like), Design Spells Dub Pro sneak peek and Apple Wallet,
Skiper 32-34/55/74 (gallery reveals, wrong job), Smooth UI (Animated Stepper, Expandable Cards: vocabulary only), Magic
UI and Kokonut (cards, no job), Aceternity (cliché risk, named above), Curated (16 free, no detail sections), Recent
Health (same thin set), Godly (no search), Pafolios (process write-ups, not detail pages), GetLayers sections (same ten;
Roadmap Ascent read for steps, too close to the trip). Skipped with reasons: Refero (system locked D-027; MCP not
connected); Cult UI, Origin Kit (shader backgrounds, no job); Uiverse (buttons locked); Watermelon (catalogue unverified
last time); Neobrutalism (wrong look); ThreeUI (no 3D job); Jitter/Swishy/Animos (clips, not page motion); Logosystem,
Best Free Fonts, Tabler (no mark/type work; Tabler icons used in the build).

## Options (for the round)
**A · The card opens (recommended, most ambitious).** The deck card becomes the page. Clicking a card's "What's
included" link morphs its tinted panel into this page's hero (shared element, 600ms Cue Kit ease, reverses on Back).
The hero sits on the ink stage like the deck: the inset panel with the still-life, the name's words at its corners;
scrolling grows the still-life to full bleed (clip-path dolly). Then parchment: about + three facts; "Who it's for" as
a numbered serif index; "What's included" beside the sticky still-life, each item ticking as it crosses the reading
line; this service's route as a horizontal strip in its line colour with the live call status at the first stop;
sibling tiles and the next card peeking (both morph into their page); the Talk to us close.
**B · The service sheet.** A sticky ink service card on the left (name, who comes, price slot, ask, live status) and
chapters on the right with a scrollspy (Unlumen Stacked Feature Cards + Habito). Calm and fast, but repeats FAQ's
sticky ink card and Contact's sticky route card.
**C · The unfolded card.** A pinned stage where the card's panels fold open one by one (who, what, how), Cue Kit Paper
Fold. Spectacle; a second pinned scrub beside the Services deck; touch gets a plain stack.

## Motion plan (A)
Signature: the cross-route morph (React `<ViewTransition name="svc-<slug>" share="morph" default="none">` on the deck
card's panel and the hero panel; `::view-transition-group(.morph)` 600ms `cubic-bezier(0.22,1,0.36,1)` with the
via-blur keyframe). Hero dolly: one ScrollTrigger scrub on a CSS variable driving `clip-path: inset()` (GSAP lane:
scroll only). Inclusion ticks: a scrubbed `--p` per row via `ScrollTrigger.batch` (SVG tick drawn with the
`pathLength=1` + `calc(1 - var(--p))` pattern). Route strip: drawn once in view (CSS). Reduced motion: no morph
(`@media` turns the VT animation off), the hero at full bleed, ticks drawn; SSR HTML has no transient class. Risk: the
morph needs the destination rendered in the same commit; our pages are dynamic (D-022 nonce), so prefetch may not pair
and the page then simply enters with no morph. Verified in the build before relying on it; the page stands without it.

## Files (A)
- `content/services.json`: per service `tagline`, `intro`, `forWhom[]`, `includes[]`, `steps[]`, each with a claim id and
  `pending`; `lib/content.ts` helpers + zod; `content/messages/en.json` `serviceDetail` strings.
- `content/site.config.json`: `serviceDetailsLive` (if picked) + `serviceDetailsOpen()`.
- `app/services/[slug]/page.tsx` + `page.module.css` (`generateStaticParams` not used: pages are dynamic, D-022;
  `notFound()` for unknown slugs and, if dev only, in production); `generateMetadata` per service.
- `components/services/detail/*`: `DetailHero`, `ForWhom`, `Includes`, `RouteStrip`, `Siblings`.
- `components/services/ServiceDeck.tsx`: the card link + `<ViewTransition>` on the panel.
- `app/sitemap.ts` + `tests/seo.test.ts` (only if live); `tests/service-detail.test.ts`.
- Docs: D-043, CLAIMS rows (C-088+), STATUS, INVARIANTS (if a flag), DESIGN.md, LOG, Blueprint §14 row.

## Build order
0. D-043 + CLAIMS rows before copy lands. 1. Content + schema + flag (tests first). 2. Static frozen gate: all eight
pages, equipment variant, production fallback. 3. Instrument (status at the route's first stop). 4. Motion: dolly →
ticks → route → morph (riskiest last). 5. Reduced motion. 6. Docs, close-out.

## Verification
Green. Per-step wheel probe of the dolly and ticks (down and up). Morph checked by real clicks deck → page → Back, and
sibling/next; reported unverified on Safari. `npm run audit:devices` on two slugs incl. equipment. impeccable 1280 +
390, Taste pre-flight, Web Interface Guidelines. Production build: the flag's behaviour; no pending text, benefits,
"24x7", "verified", app. Side-by-side vs Aerra and House frames. Fact audit grep.

## Open questions / watch items
Q15 (copy), Q17 (scope rows), Q10 (claim evidence). The morph on dynamic routes (above).
