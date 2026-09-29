# DESIGN.md — Care Setu · "Warm Room"

Derived from the shipped build (2026-09-29): tokens in `app/globals.css`, fonts in `app/layout.tsx`, pages Home, Services
and About. Decided in D-027 (direction), D-028 (nav), D-030 (Home after the trip), D-031 (Services), D-032 (About); the
owner's taste evidence is `docs/OWNER-TASTE.md`. It replaces the "Setu Lines" system (D-020), which the owner rejected
(D-026). **Brand hexes are provisional until the owners confirm them (Q4).**

## 1. Theme & atmosphere
A warm room: parchment pages, warm near-black ink, and ink bands where the page wants weight (the hero, the trip, the
Services deck, the footer). Premium and calm, cinematic where it moves, never clinical white with blue buttons (the
"normal Indian healthcare website" the owner rejected). Motion tells something: the hospital-to-home trip, a deck
dealt one service at a time, a line that follows the reader. Light mode only (the lockup is for light grounds, Q4).
The Home hero is a looping AI mood video (C-034) with a pause control, never presented as our staff, patients or
premises (INVARIANT 16).

## 2. Colour roles
Components read the semantic layer only; `[data-mode="ink"]` re-points the same variables for ink bands.
| Semantic | Parchment mode | Ink mode | Job |
|---|---|---|---|
| `--c-canvas` | parchment #FBF6EE | ink #1C1814 | page ground |
| `--c-deep` | parchment-deep #F3ECE1 | ink | alternate ground |
| `--c-surface` | parchment | ink-soft #3A322A | raised panels |
| `--c-sand` | sand #D8C7AE | — | the sand block (Home promise/partners, Services close, About values) |
| `--c-line` | hair #E3D9CA | ink-hair #4A4038 | decorative rules only |
| `--c-muted` | #5F564C | cream-muted #CBC1B3 | secondary text |
| `--c-ink` | ink #1C1814 | cream #F5EEE3 | text, rules, borders |
| `--c-accent` | ink | cream | pill buttons (the action is value, not hue) |
| `--c-heat` | focus #FFD84A | focus | focus fill, ink text on it |

**The logo's colours are the only chroma** (D-027, Sasanka: people remember the logo as green, blue and white):
lime #9BCC3C, blue #0F8FCC, olive #6D9620; `--color-action` #0D7CB1 appears only in the button's arrow disc and small
details; wordmark blue #138AB2. They may appear only as: trip spines, discs and badges; the footer wordmark drift;
Home's Colonnade grain fields, the reel's caption blocks (40% tint in parchment) and the drawn line (D-030); the
Services deck's tinted cards (40%) and rail (D-031); About's card and capsule tints and the blocks beside portraits
(D-032); the nav's current-page underline (green) and the nav logo in its own colours (D-028). Nothing else gains
colour: no honey, terracotta or brass accent. Lime is ink-cased on light grounds (1.8:1 on parchment).

## 3. Typography
- **Display: Petrona** (OFL, variable, roman + italic), light: `.t-display` 300, `line-height .94`, `-.02em`;
  `.t-head` 350, `clamp(36px, 5vw, 58px)`, `line-height .98`, `-.018em`. One italic phrase per page at most.
- **Body: Anek Latin** (OFL; Anek Devanagari for Hindi later, D-008) at normal width, 20px, `line-height 1.5`,
  measure ≤ 60ch; 20–28px reading text at `line-height 1.3`. Labels sentence case; nothing under 14px.
- **Wordmark only: Unbounded 800** (D-023): nav uppercase "CARE SETU" in white; footer lowercase "care setu".
  `brand/` logo files keep Open Sans (Q4).
- Numbers that compare (chapter counters, odometer, prices): `tabular-nums`. Curly apostrophes.

## 4. Component stylings
- **Pill button `.btn`** (myhealthprac): ink pill (cream on ink bands), 700 18px label, min-height 56px (48px `.sm`),
  radius 100px, with a 40px round disc (Tabler filled `circle-arrow-right`) in the logo blue that nudges 3px on
  hover. The logo blue is **never** a filled button (the owner disliked "simple blue buttons"). Focus: yellow fill,
  ink text, 3px ink outline.
- **Nav** (D-028): full-width sticky 72px ink bar; over Home's hero it starts transparent and fills to ink on scroll
  (CSS `animation-timeline: scroll(root)`, 0–140px, no colour-token flips); logo in its original colours, white
  wordmark, cream "Talk to us" pill, current page underlined 3px in the logo green (`aria-current`).
- **Emergency note `.sos`**: filled Tabler `alert-triangle`, bold "Emergency? Call 112.", 4px rule on the left.
- **Live call status** (the instrument, Blueprint §8.3): a dot + "taking calls now" / closed, computed client-side
  in Asia/Kolkata from the published hours (D-024, C-031); renders nothing on the server.
- **Trip** (Home, Transit trip view measured): continuous rounded spines per leg on ink, inset discs, line badges,
  a dotted callback link; a marker rides the spine on scroll.
- **Cards**: 20px radius (Alveos One's 25 tightened), no shadow; the Services deck cards are 40% tints of their line
  colour with text | image 50/50.
- **Radius rule (one system):** pills 100px (buttons) · cards and ink panels 20px · form controls and boxes 16px (answer
  plates, text inputs, the error summary) · tags 4px (pending, DRAFT).
- **Forms** (Contact, D-033): GOV.UK question pages, one question per page; answer plates with a 2px muted border,
  ink-filled when chosen (a chosen service shows its line colour in the dot); inputs with a yellow focus ring and an
  ink edge; errors in ink with the warning icon and a left rule, never red (the logo's colours are the only chroma).
- **Still-lifes** (C-073 and later): ChatGPT illustrations of objects and rooms, never people; alt text starts with
  "Illustration"; fixed-ratio slots so late images cause no shift.
- **Pending mark `.pending`**: a dashed uppercase 12px tag on owner-unconfirmed content, development only (D-029).
- Icons: Tabler **filled**, never thin text arrows.

## 5. Layout principles
Full-width sections with a `clamp(16px, 4vw, 56px)` gutter; content starts at the left edge, no centred hero column.
Bands alternate parchment / ink / sand; a section never repeats another page's idea.
- **Home:** video hero (ink) with a fact row, status and emergency note → the live trip (ink) → Colonnade (three
  line columns with grain fields) → pinned equipment reel (dev only) → ink statement → partner index on sand →
  footer (ink). The trip's line continues down the left gutter to a terminus above the footer (desktop).
- **Services:** type-led opener with line jump links → pinned stacked deck on an ink band with a chapter rail →
  equipment price sheet with hover images (dev only) → "not sure which you need" close on sand.
- **About:** founder's question → letter beside a sticky portrait → inline-image manifesto + mission words that open
  cards → pinned values odometer on sand → collapsing founder cards → close with the status. All pending (Q20).
- **Footer:** ink, links, the full-width drifting "care setu" wordmark, the legal line.

## 6. Depth & elevation
Flat. No shadows, no glass, no blur. Separation comes from value (ink bands, the sand block) and hairlines. The one
gradient lives inside the footer wordmark (WebGL, the page's single context).

## 7. Do's and don'ts
Do: keep the logo's colours recognisable and never outshone · mark owner-unconfirmed content as pending (dev only) ·
say what happens next after every action · one italic phrase per page · measure a sample and replicate its behaviour
before adding a twist.
Don't: stat chips, "trusted by", hospital logos, ratings (D-007) · a blue filled button · a floating nav bar ·
fade-up on every section · colour as the only carrier of meaning · a second WebGL context · pinned horizontal scroll on
touch · AI people presented as real.

## 8. Responsive behaviour
Pinned or scroll-driven sections scale to the room under the nav (`--fit`) and switch off only below ~480px tall,
never at 600 (the owner's laptop window is 1280x537); verified with `npm run audit:devices` (scaled laptops, iPads,
phones). On touch and under reduced motion: no pins or scrubs; the deck becomes a plain stack, the reel a scroll-snap
strip, the odometer a list, the founder cards stacked open. Inputs ≥ 16px. Hit targets ≥ 44px on touch.
**Motion by page:** Home: CSS word-mask hero entrance, video loop with pause (WCAG 2.2.2), live-trip marker (GSAP scrub),
Colonnade field slide, reel scrub, word-by-word ink statement, line following the reader at 65% of the viewport.
Services: the deck (one pixel-measured GSAP timeline: rise, pin, deal). About: capsules opening with scroll, wishes
ticking, the odometer (only the changing digit rolls) with a card half-turn, collapsing cards (transforms + clip).
Footer: slow grain drift in the logo colours. Reduced motion: every finished state is the default.

## 9. Agent prompt guide
"Warm Room: a parchment page with warm near-black ink and ink bands for weight. Petrona light display, Anek body at
20px, Unbounded only for the wordmark. The logo's lime, blue and olive are the only colour: lines, tints and fields,
never a filled button. Ink pill buttons with a round logo-blue arrow disc. Flat, no shadows, 20px card radius.
Each section has one idea that moves; pinned stages scale to short windows; reduced motion shows the finished state."
