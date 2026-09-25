# Care Setu — Stage 2 design plan: "Setu Lines"

**Status:** direction picked by Sasanka 2026-09-25 (D-020). Brand values provisional until Q4.
**Template:** Frontend Master Blueprint §13. Research log: Stage 2 session (LOG 2026-09-25).
Captures live in `refs/` (gitignored, never shipped).

## Context
A worried family, often remote, has to trust Care Setu enough to ask for help within one visit.
The site explains the hospital-to-home bridge, takes a consented enquiry, and takes payment against a
staff-issued quote. Constraints: **no photography** (C-014), so the page is type- and diagram-led
with fixed-ratio photo slots for later. Elderly readers need body text ≥ 20px and a phone number
always in view. Hindi later (D-008), so the type family has a Devanagari companion. No prices on the site (D-004),
no unapproved claims (D-007), the lockup is for light grounds only (BRAND.md).

## Difference Test (§1.2)
Previous project: Hungry Anna "Order chit" (light cream · single gold · Anton + Figtree · card system ·
no big motion · the order token). Setu Lines differs on **6 of 7**:
chroma (three signal lines vs single gold) · type (humanist signage Anek vs poster-condensed Anton) ·
archetype (Swiss grid / diagram vs card system) · signature motion (line isolate vs none) ·
ornament (drawn network lines vs none) · chrome (journey map + "Lines open" vs order token).
Value does **not** differ (both light-dominant), deliberately: the lockup needs a light ground.

## Slop pre-check (§0.1)
| Could fall into | Avoided by |
|---|---|
| Centred max-w hero column (rejected §19.3) | Hero is a full-width diagram; text starts at the left grid line |
| Health cliché: cream + serif + pill (Alden, Ease, Hims) | White + ink + signal lines, humanist signage sans, 4px sign-plate radius |
| Stat chips / "trusted by" / hospital logos | Illegal under D-007 anyway; the only "number" is the computed "Lines open" state |
| Three-card feature row | Services are *lines* in a numbered index, not cards |
| Fade-up on every section | One signature (line isolate); everything else is static or a state change |
| Stock doctor photo hero | No photos exist; the diagram is the image |
| Thin arrows / thin line art (§19.3) | Lines are ≥ 8px, filled Tabler arrows, bold station discs |

## Per-sample extraction (image-to-code analysis rules applied to captures; no images generated)
**Elder** (`refs/elder/get-started-q1-nav.jpg`, 1568w frame): floating white nav bar ~76px tall, inset
~30px, radius ~24px. Nav labels ~17px medium. Phone number 17px in brand blue, with "Lines are open" 13px grey
stacked under it and an 8px green dot at the number's top-right. The question sits in a full-width white panel
(1px border, radius ~20px): heading 26px bold, 2 lines, centred; question 20px regular. Options are
~528×72px, 2px border, 18px medium, 12px gap, ⓘ 22px outside the right edge.
**NHS question/confirmation/button** (`refs/nhs/`): confirmation order = H1 panel ("done" statement +
reference) → one line of what happened → H2 details → summary list (term/definition rows) → feedback
link. Button (exact, from `nhsuk-frontend` CSS): radius 4px, 2px transparent border, padding
.875rem 1rem, min-height 3.5rem desktop / 2.75rem mobile, width 100% on mobile, 600 weight ~19px,
`box-shadow: 0 4px 0 <darker shade>`, `:active { top: 4px; box-shadow: none }`, `::before` extends the
hit area 6px below over the shadow, focus = yellow fill + ink text + ink bottom bar.
**Transit trip view** (`refs/designspells-transit-trip/`): vertical spine ~22px wide, fully rounded,
line-coloured; stations are ~12px white discs inset in the spine; stop name 17px bold left, time 17px
bold right; collapsed "1 stop before…" 14px with chevron; walking link = column of 6px dots at 8px
gaps with an icon and "2 minutes" 20px bold + 14px sub; line badge = roundel + name chip (radius 6);
direction row = filled arrow-in-circle + 22px bold.
**Delhi Metro network map** (`refs/delhi-metro-map/`, CC-BY-SA, reference only): 0°/45°/90° only,
rounded 45° bends, parallel lines share corridors at even spacing, interchange = white disc with an
ink ring ≈ 1.6× line width, station = short perpendicular tick, off-map continuation = arrow,
legend box bottom-left listing every line by colour.
**Care24 partner band** (`refs/care24/`): full-bleed dark band, ~64px top padding, 48px bold headline
(a question) left, action right on the same baseline, three equal tiles below (gap ~28px).
**V–A–C Sreda** (`refs/refero/vac-sreda-tailwind-v4.css`): type-as-structure, nodes linked by
connectors, borderless/shadowless; scale caption 13 · body 20 · sub 24 · heading 48/0.8 · display 80/0.8;
spacing 5/10/20/26/48/50.
**Cue Kit split panel** (spec read in full): row grid `40px 1fr 22px`, one open at a time,
closed rows at 30% opacity, `grid-template-rows 0fr→1fr` 0.5s `cubic-bezier(.22,1,.36,1)`, +/− from
one rotating bar, synced panel changes only on open.

## Sample ledger (§1.5)
| Sample | Section it feeds | What is taken | What is changed + why | Tool |
|---|---|---|---|---|
| Delhi Metro map (Commons) | Home hero diagram, footer legend | Angle grammar, corridor spacing, interchange disc, station tick, off-edge arrow, legend panel | Only 3 lines (the logo's arm colours), 2 terminal stations (Hospital, Home); ink casing on lime (1.89:1 on white fails 3:1) | Chrome capture + zoom analysis |
| V–A–C Sreda (Refero) | Page grid, hero composition | Nodes connected by lines as the layout; type scale; borderless system | Connectors become thick signal lines, not dotted hairlines (§19.1 bold); body leading 1.5 not 1.2 (elderly, §6.1) | Refero Tailwind v4 tab |
| Uber (Refero) | Hero action | The hero *is* the first question | "Where is the patient now?" with 2 answers + "not sure"; pickup→destination becomes hospital→home | Refero spec |
| Transit trip view (Design Spells #332) | How it works; mobile hero; service-detail "how it works" | Vertical spine, inset station discs, collapsed stops, dotted "handover" link, line badge | No times or durations (none are known: Q12); badge = mini logo cross, not a roundel | Chrome capture |
| Elder get-started | Nav, enquiry F1 | Phone + "Lines open" stack with status dot; one question per screen; full-width options with ⓘ; "why we ask" line; question order | Left-aligned (not centred); sign-plate options (4px radius, 2px ink border) not pills; contact asked last | Chrome capture + step-through |
| NHS service manual | Enquiry rules, confirmation, pay result, buttons | 1 question/page, "Not sure", back link, "Continue" left, "Question n of 6", confirmation order, button physics + hit-area | Action colour = derived brand blue `#0D7CB1`; shadow = ink-blue; focus yellow kept (tested pattern) | get_page_text + nhsuk-frontend CSS |
| Portea /nursing | Service detail skeleton | Situations → included → what to expect → how to book → FAQ | "When families call us for this" only from owner-confirmed facts; no ratings/"since" badges | JS heading extraction |
| Care24 | Partner band | Full-bleed dark band, question headline, action right, 3 role tiles | Ink band; "Join the network": hospitals, doctors, care professionals; English only at launch (D-008) | Chrome capture |
| Cue Kit split panel | /services index | One-open numbered accordion, synced panel, grid-rows height transition | Panel shows who it's for + what's included + the line colour, not images; index number = line number | Cue Kit Prompt tab |
| Cue Kit thermal invoice | /pay summary | Row order: item → subtotal → total → reference → method | Rejected the receipt/scissors metaphor (repeats HA chit); plain NHS summary list | Chrome capture |
| Basis Theory (Refero) | Promotions strip (D-013) | Lime used only for the full-width announcement strip | Strip text ink on lime (8.87:1); hidden when no promotion is configured | Refero spec |
| Brainfish / Alden (Refero) | Colour discipline | Colour rationed to action; blue as a highlighter on chosen words | Highlighter = wordmark blue underline bar on one phrase per page | Refero spec |
| Luffu (Mobbin) | Service detail "situations" | Family worries written as questions | Used as copy structure only, not as a floating-portrait hero (no photos) | Mobbin section |
| Anek Latin/Devanagari (Google Fonts) | All type | One humanist signage family, variable weight + width | Exception to §6.5 (Best Free Fonts has no Devanagari), approved 2026-09-25 | Google Fonts specimen |
**Dropped, with reason:** Transit app home (playful/gamified, off-register) · Godly (no search, video
feed timed out) · Planpoint (generic) · Razorpay marketing page (not the payer's view).

## Direction — extracted, not invented
Sources: V–A–C Sreda (structure), Delhi Metro map (grammar), Basis Theory + Brainfish (colour rationing),
NHS (components and flows). The obvious hit (Alden, "Built for Home Healthcare") was rejected as the genre cliché.

Token block (draft; brand hexes provisional, Q4):
```css
@theme {
  /* signal lines: the logo's arm colours (BRAND.md, D-018) */
  --color-line-lime: #9BCC3C;   /* graphics only, always ink-cased on white */
  --color-line-olive: #6D9620;
  --color-line-blue: #0F8FCC;
  --color-action: #0D7CB1;      /* brand blue x0.87: 4.63:1 with white */
  --color-action-deep: #0A5A80; /* button shadow */
  --color-ink: #14201A;         /* tinted black */
  --color-muted: #4E5A52;       /* 7.22:1 on white */
  --color-deep: #F3F6EF;        /* alternate surface */
  --color-hair: #C9D1C7;        /* decorative rules only */
  --color-focus: #FFD84A;       /* NHS focus pattern */
  --font-sans: "Anek Latin", "Anek Devanagari", system-ui, sans-serif;
  --text-caption: 14px;  --text-body: 20px;  --text-sub: 24px;
  --text-heading: 48px;  --text-display: clamp(56px, min(9vw, 14vh), 112px);
}
```
Semantic layer: `--c-canvas #FFF · --c-deep · --c-surface #FFF · --c-line hair · --c-muted · --c-ink ·
--c-accent action · --c-heat focus`, plus the ink-band mode (partner band, footer) re-pointing canvas to
ink and text to white.
Rules that ship with it: the three line colours appear **only** on lines, stations and service badges,
never as text or fill panels. Contrast comes from value (ink on white). Blue action is the only
coloured control. Radius 4px on buttons/options/inputs, 0 on bands; one shadow type (the button's hard bottom
bar); lines ≥ 8px desktop / 6px mobile. Inverse law: display 0.9 / −0.02em, body 1.5 / 0, caption
1.25 / +0.06em uppercase. Measure 60ch body.
Fonts: Anek Latin (display at the narrow end of the width axis, ExtraBold; body at normal width, Regular/Medium),
OFL via Google Fonts; Anek Devanagari for the later Hindi locale. **Width-axis range to be measured at
scaffold, not assumed.**

## Structure
Archetype: Swiss grid / diagram (§5.2 #2). Not the last project's (card system).
**Home, in order:**
1. Promotions strip (only when configured, D-013).
2. Nav: mark + wordmark · Services · How it works · Partner · phone + "Lines open" stack · "Talk to us".
3. Hero: the network. HOSPITAL ● and HOME ● as terminal stations joined by the trunk; service lines branch
   off it. Headline at the left grid line; the first question ("Where is the patient now?") as two sign-plate
   buttons + "Emergency? Call 112".
4. How it works: the Transit-style vertical trip: In hospital ● → we call you back ··· → care plan + quote ●
   → care line runs ━ → at home ●. No times.
5. Service lines: numbered index (Cue Kit mechanic), each row wearing its line colour; the panel shows who it's
   for and what's included, then "Ask about this".
6. Partner band (ink): "Join the network" with 3 role tiles.
7. Footer as the map legend: every line and page listed like a metro legend; legal name when known (Q5).
**Enquiry F1** (see the Stage 2 plan flow): 1 question/page, "Question n of 6", sign-plate options, Continue
left, back link, check answers, confirmation with reference. **Pay F2:** NHS summary list + one "Pay"
button; result only from the verified webhook.
**The instrument (§8.3):** the network itself, with the hospital-to-home journey as the page's spine, plus
"Lines open", computed from the owners' published hours (config, hidden until Q3/Q12). Only this subject
has a discharge-to-home route; the status is true or absent, never faked.

## Motion plan (§9)
Signature: **line isolate**. Choosing or hovering a service (hero answer, index row, badge) lights that
line end to end at full chroma while the others drop to a 20% ghost and their station ticks thin.
It's a state change with meaning (this is *your* route), not decoration.
| Technique | Library | Job here |
|---|---|---|
| Line isolate (stroke opacity/width swap on SVG groups) | CSS transitions on classes, anime.js for the sequence | Shows the family which route their answer puts them on |
| Station resolve (tick → disc) | anime.js `svg` | Marks each "how it works" stop as the reader reaches it |
| Scroll as timeline (the trip spine fills as you read) | GSAP ScrollTrigger scrub, desktop only | "How it works" reads as one journey |
| Accordion height | CSS `grid-rows` (Cue Kit) | Services index |
| Button press | CSS (NHS physics) | Tactile, tested |
Banned-list compliance: no fade-up sections, no scale-on-hover, no decorative loops. Reduced motion:
the isolate still happens instantly (it carries meaning); the scrub resolves to the filled pose; ghost
states live in JS-added classes (§9.5). Motion is built in Stage 4 with the `animejs-v4` and
`gsap-scrolltrigger` skills invoked, not recalled.

## Files
Stage 3 decides the tree. Stage 2 outputs: this file, `DESIGN.md`, the static comp artifact, D-020.

## Build order
1. Scaffold (Stage 3) 2. Static frozen gate per page (Stage 4) 3. Chrome ("Lines open", legend) 4. Motion,
riskiest last (scrub) 5. Reduced-motion pass.

## Verification
§10 checklist. Fact audit: grep served HTML for `caresetu.com`, `+91`, `123 456`, `ISO`, `HIPAA`,
`trusted by`, hospital names, `%` and `lakh`: all must be absent unless `approved` in CLAIMS. Contrast
table above re-run with owner hexes when Q4 lands. `impeccable detect` at 1280 and 390.

## Open questions / watch items
- Q3/Q12 gate "Lines open" and the phone/WhatsApp; Q6 decides which lines exist; Q7 the area list.
- Anek's width-axis range and how the narrow end renders at display size: measure at scaffold.
- Line colours are the logo's; if Q4 changes the hexes, the whole contrast table re-runs.
- The line-isolate is new physics for this blueprint; build the static state first and prove it reads
  without motion.

## Review findings on comp v1 (2026-09-25) — fix in Stage 4, the comp stays as sent to owners
Sources: `impeccable detect` (URL scan of the served comp, 1440×800 and 390×844: identical 10 findings, exit 2)
and the `design-taste-frontend` pre-flight check (run by hand against the comp; dials set for this brief to
VARIANCE 5 · MOTION 4 · DENSITY 4: trust-first health, but bold per §19.1).
| # | Source · rule | Finding | Decision for the build |
|---|---|---|---|
| 1 | impeccable · ai-color-palette | The "home" highlighter is a blue `linear-gradient` band | **Fix:** `text-decoration` underline in wordmark blue (thickness .12em, offset .08em), no gradient |
| 2 | impeccable · tight-leading | 14px captions at 1.25 wrap to 2 lines | **Fix:** captions stay one line; any caption that can wrap gets 1.4 |
| 3 | impeccable · all-caps-body | 62-char uppercase caption ("Question 1 of 6 · separate enquiry page…") | **Fix:** the real page says only "Question 1 of 6", sentence case |
| 4 | impeccable · side-tab ×3 | Partner role tiles use a 6px coloured top border | **Fix:** replace with the line badge (ink-cased swatch + line name) above each tile heading |
| 5 | impeccable · kicker-above-heading ×2 + taste · eyebrow count (4 > ceil(7/3)) | "How it works" and "Service lines" kickers | **Fix:** drop both; headings stand alone. Keep only "Question n of 6" (NHS) |
| 6 | impeccable · side-tab | Selected radio = 8px inset stripe on the left | **Fix:** selected = 4px ink border + `--c-deep` fill + filled ring; no stripe |
| 7 | impeccable · repeating-stripes (advisory) | Dotted "coordinator calls you back" segment drawn with a repeating gradient | **Keep, rebuild:** it carries meaning (Transit grammar: a handover, not yet on a care line). Draw it as an SVG round-cap dashed stroke, add `impeccable-disable repeating-stripes-gradient: handover link, not decoration` |
| 8 | taste · hero subtext ≤ 20 words | Lede is 32 words | **Fix:** "Tell us where the patient is now. A coordinator calls you back with one care plan and one quote." (19) |
| 9 | taste · split-header ban | Lede floated right of the headline (my own fix pass created it) | **Fix:** stack lede under the headline; height is recovered by #8 |
| 10 | taste · no duplicate CTA intent | "Talk to us", "Start here", "Contact", "Ask about home nursing" all mean contact | **Fix:** one label, "Talk to us", everywhere; service pages preselect the service silently |
| 11 | taste · nav height ≤ 80px | Nav is ~92px | **Fix:** padding 12px, 48px button → ≤ 72px |
| 12 | taste · middle-dot rationing | 10 visible "·" (mostly comp annotations) | **Fix:** max one per line in real copy |
| 13 | taste · dark mode mandatory | DESIGN.md is light-only (the lockup is light-ground only) | **Open, decide at Stage 3:** a dark theme needs a light-text lockup (not made) and `logo-mono.svg` approval (Q4). Not silently skipped |
| 14 | taste · real images mandatory | No photos | **Waived:** Blueprint §15 + D-007 forbid stock/AI photos presented as real. Fixed-ratio photo slots reserved for owner photos |
| 15 | taste · no hand-rolled SVG | The network diagram is hand-drawn SVG | **Waived:** it is the §8.3 instrument, drawn from the domain (§8.2). Icons stay Tabler |
| 16 | taste · Motion (`motion/react`) default | Plan uses anime.js + GSAP | **Waived:** Blueprint §9.1 library lanes win |
| 17 | taste · fonts via `next/font` | Comp links Google Fonts | **Agree:** self-host Anek via `next/font` at scaffold |
| 18 | taste · page theme lock | Partner band inverts to ink | **Keep:** one deliberate inversion (allowed once) |
Passed: 0 em/en dashes · one accent colour · one radius system (4px) · button + form contrast AA · no CTA wraps ·
nav on one line · answer plates visible above the fold at 1440×900 · no stats, logos, scroll cues or version labels ·
"LINE 01…" kept (they name lines, like metro line numbers; not section numbering).
**Not verified:** a true 390px render (the detector's 390 scan ran; no screenshot below ~500px in headless Chrome).
