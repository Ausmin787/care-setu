# DESIGN.md — Care Setu · "Setu Lines"

Decided in D-020; hero, illustration and signature motion revised in D-021; web wordmark and footer in D-023. Reasoning and ledgers:
`docs/plans/stage-2-design.md` (direction), `docs/plans/2026-09-26-home-build.md` (the built Home).
**Brand hexes are provisional until the owners confirm them (Q4).** When they change, re-run the contrast table.

## 1. Theme & atmosphere
Hospital-to-home drawn as a transit network. White ground, ink type, and three signal lines taken from the logo's
cross. It reads calm, civic and certain, like good wayfinding signage, never like a wellness brochure.
Light mode only (D-021: the lockup is for light grounds, Q4 open); one ink band mode for the partner block.
The Home hero carries one drawn care scene (D-021): illustrated, never photoreal, no real person, no logo.

## 2. Colour roles
| Token | Hex | Job | Rule |
|---|---|---|---|
| `--c-canvas` | #FFFFFF | page ground | |
| `--c-deep` | #F3F6EF | alternate section ground | lime-tinted neutral |
| `--c-ink` | #14201A | all text, casings, borders | 16.78:1 on canvas |
| `--c-muted` | #4E5A52 | secondary text | 7.22:1 on canvas |
| `--c-line` | #C9D1C7 | decorative hairlines only | never for meaning |
| `--c-accent` | #0D7CB1 | the only coloured control (primary button) | brand blue ×0.87, 4.63:1 with white |
| `--c-accent-deep` | #0A5A80 | primary button's hard bottom shadow | |
| `--c-heat` | #FFD84A | focus state fill (NHS pattern) | ink text on it, 12.13:1 |
| `--line-lime` | #9BCC3C | Line 01 + promotions strip | graphics only; always ink-cased on white (1.89:1) |
| `--line-blue` | #0F8FCC | Line 02 | graphics / large text only (3.61:1) |
| `--line-olive` | #6D9620 | Line 03 | graphics / large text only (3.48:1) |
| `--wordmark` | #138AB2 | nav wordmark + the one highlighted phrase per page | |
Line colours never fill panels or set body text, except as small accents inside the one hero illustration
(D-021) and inside the footer wordmark (D-023). Contrast comes from value (ink on white), not hue.

## 3. Typography
- Family: **Anek Latin** (Anek Devanagari for Hindi, D-008), OFL, Google Fonts. Web wordmark only (nav + footer): **Unbounded 800**: nav uppercase "CARE SETU" 20px +0.01em (16px mobile); footer lowercase "care setu" -0.04em (D-023, provisional until Q4; `brand/` logo files keep Open Sans).
- Display: ExtraBold 800, width 75, `line-height .9`, `letter-spacing -.02em`, `clamp(52px, min(8.4vw, 13vh), 112px)`.
- Section heads: 800, width 80, 36–56px, `line-height .95`.
- Body: 400–600 at 20px, `line-height 1.5`, measure ≤ 60ch. Hint/secondary 19px muted.
- Caption: 14px, 600, uppercase, `+.06em`, muted. Nothing smaller than 14px (elderly readers).
- Numbers that align (line numbers, amounts): `tabular-nums`.

## 4. Component stylings
- **Primary button** (NHS physics): `#0D7CB1`, white 600 19px, radius 4px, min-height 56px (48px small),
  `box-shadow: 0 4px 0 #0A5A80`, `:active { top:4px; box-shadow:none }`, `::before` extends the hit area over the
  shadow; full width on mobile; one primary per page; sentence-case labels ("Continue", "Confirm and send", "Pay").
- **Option plate** (answers, choices): white, 2px ink border, radius 4px, 72px tall, 21px 600 label left, ink tile
  right holding a filled Tabler `circle-arrow-right`.
- **Radio plate** (enquiry): 64px, 2px ink border, 26px ink ring; selected = inset 8px line-blue bar on the left.
- **Line badge**: 2px ink border, radius 4px, 14px ink-cased colour square + 16px bold line name.
- **Stations**: white capsule/disc with an 8px ink ring; interchange = white disc, ink ring ≈ 1.6× line width.
- **Trip** (how it works; Transit trip view, measured): legs, each one continuous rounded 28px spine (24px mobile)
  headed by a line badge + direction row; 12px white station discs inset; the callback link between legs is
  6px round-cap dots at a 14px pitch with a filled icon and a bold label; the care leg is the service line colour,
  ink-cased. Integer line boxes (28px) keep spine pieces seamless.
- **Services index** (Home): one row per line (D-025), rows `56px 14px 1fr 22px`; closed rows muted; one open at a time;
  +/− from one bar; synced panel lists the line's services and links to `/services#<line>`.
- **Line catalogue** (Services, D-025; Superpower "What we test", measured): sticky 260px rail of lines with counts;
  per line an h2 + grey count with the line badge beside it; column heads `Service | Who comes`; 64px `<details>` rows
  hung on a 12px ink-cased spine with 22px white station discs (4px ink ring, filled with the line colour when open);
  an open row = one sentence, "Talk to us about <service>", a 16px muted note. Mobile: rail wraps, `who` drops under the name.
- **Emergency note**: filled Tabler `alert-triangle` + "Emergency? Call 112." with a 6px ink rule on the left.
- **Hero** (Supahero Spectrum.Life + Airbnb Homes): left: display headline (2 lines, one underlined phrase), lede
  ≤ 20 words, one "Talk to us", three reassurances (40px ink tile + filled Tabler icon + 20px 600 line), the
  emergency note. Right: the illustration panel, 4:5, radius 12px (the only non-4px radius, images only),
  height-capped on short screens; 4:3 under the action on mobile.
- Icons: Tabler **filled**, one size per context, never thin text arrows.

## 5. Layout principles
Swiss grid with a `clamp(16px, 4vw, 56px)` gutter. Content starts at the left grid line; no centred hero column.
Services order: two-column head (title + lede | promise, "Talk to us", phone, emergency note) → the line catalogue.
Home order: promo strip (when configured) → nav (phone + "Lines open" only when configured) → illustrated hero →
how it works (trip) → service lines index → partner band (ink) → footer (ink): the network legend, links, then the
full-width "care setu" wordmark and the legal line.
Diagrams use only 0°/45°/90° with rounded bends; parallel lines share corridors at even spacing.

## 6. Depth & elevation
Flat. One shadow type in the whole system: the primary button's hard bottom bar. Separation comes from 2px ink
rules and the ink bands, never blur shadows, glass or gradients. The one gradient is inside the footer wordmark (D-023).

## 7. Do's and don'ts
Do: ink-case every lime mark · show pending owner facts as visibly pending · keep one primary action per view ·
say what happens next after every submission.
Don't: stat chips, "trusted by", hospital logos, ratings (D-007) · pill buttons or mono micro-labels (§19.3) ·
stock-photo heroes · fade-up on every section · colour as the only carrier of meaning · prices on the site (D-004).

## 8. Responsive behaviour
≤ 900px: one column; nav links collapse; the horizontal network becomes the vertical trip (Hospital at the top, three
cased lanes, Home at the bottom); answer plates and buttons go full width. Input text ≥ 16px (iOS zoom).
Motion (D-021): hero words rise from masks, then the underline draws and the panel opens (CSS, from first paint).
Signature "live trip": a marker rides the trip spine on scroll (GSAP scrub, desktop); rows turn ghost → full as
it passes; touch fills rows as they enter, no marker. Line isolate on the services index. Footer wordmark (D-023):
the line colours drift slowly through the letters with grain (WebGL, only while on screen; after Spectrum.Life).
All absent under reduced motion, where the finished state (one still frame) is the default.

## 9. Agent prompt guide
"Setu Lines: a white page where hospital-to-home is drawn as a metro network in the logo's lime, blue and olive.
Ink text in Anek Latin; condensed ExtraBold display; 20px body. Colour lives only on lines, stations and badges;
the one coloured control is #0D7CB1 with a hard 4px bottom shadow. Swiss grid, left-aligned, no photos, no stats."
