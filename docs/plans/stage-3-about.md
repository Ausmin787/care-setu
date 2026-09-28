# Care Setu: About (Stage 3 of the 2026-09-28 plan): build plan

## Context
The brief's page order is Landing, Services, **About**, Contact, Payments, with a check-in after each (INVARIANT 3).
About explains what Care Setu is and why it exists. **Content source: the founders' own vision deck**
(`CARE SETU VISION DOCS (2).pdf`, pp. 3, 4, 6, 7, 8): Shiva's founder letter, vision, mission, four values, the
promise, co-founder bios and photos. Everything from it is **pending** (CLAIMS C-021, C-043, C-074..C-078) and renders in
development only (D-029's `shown()`), so the owners review a filled page on localhost. The deck's market statistics
(2.2 Cr+, 70%+, 40-60%, 10 Cr+) are claims without evidence and stay off. Production shows only approved content:
the tagline (C-022), the service area (C-032) and the contact actions.
**Assets:** Shiva (about 800px inside the deck's circle frame), Aashish (1086px square), Ayush (230px, too small for a
tall card), **no photo or bio for Dr Saurabh Chauhan**. Photos are dev-only until consent (C-021, Q20). Seven new
still-lifes from Sasanka (4 values, 3 manifesto capsules; prompts in `docs/ASSET-PROMPTS.md`); type-led slots until then.

## Difference Test (§1.2)
Same project and same locked system (Warm Room, D-027); the test that binds here is "no section repeats another
page". Home: video hero, trip, Colonnade, reel, ink statement, partner index. Services: opener, stacked deck,
hover sheet, sand band. About adds: a question opener, a sticky letter with ticking wishes, an inline-image manifesto
with inline popover words, a pinned odometer with a turning card, collapsing portrait cards. None repeats.

## Slop pre-check (§0.1)
- Team as four portrait cards in a grid (21st.dev's 119 "team" components are all this) -> collapsing cards, one open.
- Centred founder bio under a round headshot (Headspace, the deck itself) -> no medallion (§19.3), a letter set as a
  letter, portrait as a rectangle beside it.
- Values as a four-icon card row (the deck p.8) -> one pinned stage, one value at a time.
- Vision/mission as two boxes -> one sentence that carries images.
- Fade-up on every block -> each section has its own mechanic; nothing uses a generic reveal.

## Sample ledger (§1.5)
| Sample | Section | Taken | Changed + why | Tool |
|---|---|---|---|---|
| GetLayers Marcus Vane (template) | Opener | a founder page opening on one huge statement, stacked labels | a question, not a name; Petrona light; the three situations as a numbered list under it | preview MP4, 12-frame sheet |
| GetLayers Artist (template) + Mobbin Superr "Our story" + Pafolios V. Zahharov | Letter | a first-person letter in a narrow serif measure beside a portrait; hanging-indent opening line | the portrait sticks while the letter scrolls; wishes tick in on logo-colour discs | MP4 sheet; Mobbin section (logged in); Pafolios screenshot |
| GetLayers Halden (template) | Manifesto | one large sentence with small images set between words | capsules open with scroll (scaleX, space reserved, no layout shift); logo-colour tints until images | MP4 sheet |
| Smooth UI Inline Testimonials (spec read) | Mission | enriched inline words that open a card: one open at a time, click toggles (touch), focus opens (keyboard), Esc returns focus, card clamped to the container, flips above when no room | the six partner groups from the deck, each opening its one-line role; hairline turns the logo blue while open | page text + screenshot |
| GetLayers Northwall (template) | Values | a pinned stage stepping 01 -> 05 with a large number and a card that turns between steps | four values on the sand block; the card is a still-life | MP4 sheet |
| Unlumen Animate Digits (spec) + Design Spells Dub.co | Values number | only the changed digit animates; enters from y 32px, blur, scale .7; direction-aware (up when rising, down when falling) | scroll-driven, both ways; the value name uses the same slide | spec text; MP4 strip |
| Design Spells Abode + Kokonut Card Flip | Values card | rotateY 180 with perspective and hidden backfaces | four images on a two-faced card: the hidden face is swapped before each turn | MP4 strip; docs text |
| Cue Kit Collapsing Cards Accordion (source in refs, D-031) | Founders | active card wide, others narrow with vertical names; image scale 1.04 -> 1; title and link rise in after .15s; cubic-bezier(.2,1,.3,1) .75s | rebuilt with transforms (overlapping full-width cards, translateX), not `flex`; photos in one warm monochrome treatment on the card's logo-colour tint so mismatched backgrounds read as one set | source file + MP4 sheet |
| Pafolios Richard Aboud card | Founders detail | bio text in a colour block beside the photo | the tint block is the card's own line colour | screenshot |
Genre check only: Dantora (health template) doctors row; Headspace founder bio (Mobbin). Both are the average to beat.

**Opened this round and not used:** Godly (feed only; no About/Team category), Curated (Team sections are Pro-gated;
16 free), 21st.dev (the genre average), UI Guideline (Accordion spec "in progress"; Popover generic, Smooth UI's
spec is stricter), Componentry (Annotated Text already used for Hungry Anna's About; redirects).
**Not opened, with reason:** Refero (direction locked, D-027); Aceternity, Magic UI, Origin Kit, Cult UI, ThreeUI
(effects/shaders; the page needs none, one WebGL context is the footer's); Uiverse (buttons locked); Watermelon
(catalogue unverified, §17.2); Jitter/Animos/Swishy (rendered clips, §17.7); Tabler (in use); Best Free Fonts
(type locked); Logosystem (logo done); Supahero/Recent (heroes; this opener is type-only, Recent Health holds ~6 cards).

## Direction
Warm Room unchanged (D-027): parchment, ink text, Petrona display, Anek body, logo colours as the only chroma. The
values stage sits on the **sand block** (no new ink band).

## Flows
About has no transactional step. Its exits: "Talk to us" -> /contact, the phone link, and the emergency note.

## Structure (sections, in order)
1. **Opener**: kicker "About Care Setu"; H1 = Shiva's question (pending; production H1 = the tagline); three
   situations numbered 01-03; the actions row.
2. **Letter**: sticky portrait (left) | the letter (right): pull line, paragraphs, the four wishes on discs,
   "My dream is simple", signed "Vishwanath Pratap Singh (Shiva), Founder".
3. **Vision -> Mission**: the manifesto sentence with three capsules; then the mission line with six inline triggers.
4. **Values**: pinned sand stage, 01 Care -> 04 Home.
5. **Founders**: four collapsing cards.
6. **Close**: "Because sometimes, the best support we can give a family is simply to be there." + actions.
Instrument (§8.3): the live call status stays with the actions (reused component), because About ends in a call.

## Motion plan
Signature: the values odometer (pin + scrub). Others: wishes tick (ScrollTrigger.batch, both directions), capsules
open (scrub per capsule), collapsing cards (CSS transitions on transform, state from React), CSS line entrance on the
opener. Lanes: GSAP for scroll only; no anime.js needed (the digit roll is a transform per scrub step). Desktop pins
gate at 901px wide, 480px tall, fine pointer (the Deck gate), scale to the room. Reduced motion / touch / no-JS:
everything visible in its finished pose (transient states only under a JS-added attribute).

## Build order
1. Content + CLAIMS rows + Q20. 2. Static page (frozen gate). 3. Collapsing cards. 4. Letter wishes, capsules.
5. Odometer (riskiest last). 6. Reduced-motion pass. 7. Verify (§10 + `npm run audit:devices`).

## Verification
Green (lint, typecheck, test, build); per-step wheel probe down and up on the odometer and capsules; device matrix;
keyboard pass through the mission triggers and founder cards; prod build shows no pending text, no photo, no deck
statistic; impeccable at 1280 and 390; Taste pre-flight; Web Interface Guidelines.

## Open / watch
Q20 (photos + consent, Dr Saurabh's bio and photo); Q15 (copy approver); the belief line C-043 now has an owner source.
