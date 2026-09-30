# Care Setu: About polish (founder cards, mission, capsules, photos): plan

**Status: built (D-034).** Sasanka picked F1, M1 and the classical photo clean-up (2026-09-30). The capsule
fix and the photo clean-up are done (they needed no design decision).

## Context
Sasanka's review of About (2026-09-30), four asks:
1. **Founder cards**: the collapsing motion is right (Cue Kit), the look is "way too simple and bland". Keep the
   structure and the animation; change only the design, so the cards look premium with or without a hover, as Cue
   Kit's do. Suggest designs.
2. **Founder photos**: sharpen them so they look HD.
3. **Mission section**: too simple; add depth and attractiveness that match what the section means.
4. **Vision capsules**: the pills and icons render in low quality while scrolling and only turn sharp later.

Constraints that bind: Warm Room (INVARIANT 27: parchment, ink, the logo's colours as the only chroma); `DESIGN.md`
section 6 is flat (no shadows, glass or blur; depth comes from value, hairlines and the grain fields); the founders'
words are cut only, never added to (Blueprint #31); the photos are dev-only and unconsented for the web (C-021, Q20);
AI imagery is never presented as a real person (INVARIANT 16).
**Assets, measured this session:** the deck holds Shiva's face at **184 x 245 px** (the file on the page was a 3.3x
upscale), Ayush's at **126 x 168 px**, Aashish's at 814 x 1086 px. No photo for Dr Saurabh.

## Difference Test (section 1.2)
Same project and system. The binding test is "no section repeats another page's idea": the founders row keeps its own
mechanic; the mission must not become Home's trip spine, Home's Colonnade fields, Home's partner index or Contact's
route card.

## Slop pre-check (section 0.1)
- A team grid of portrait cards (21st.dev, Dantora, Mobbin's Sunday): not proposed; the accordion stays.
- Holographic or glass profile cards (React Bits Profile Card, Aceternity comet/glare): refused, they break section 6.
- Hub-and-spoke "integrations" beams (Magic UI Animated Beam, orbiting circles): a known tell. If the mission takes
  the many-into-one idea, it is drawn as solid brand lines that merge, with no glow and no orbit.
- A six-card feature grid for the mission (every bento in the registries): refused.
- Face slices cut by a colour band (today's narrow cards): fixed in every option.

## Sample ledger (section 1.5)
| Sample | Feeds | Taken | Changed + why | Tool |
|---|---|---|---|---|
| Cue Kit Collapsing Cards Accordion (live preview + source in refs) | Founders F1 | full-height image per card, dimmed at rest and clearing when open, top and bottom scrims, index top-left, vertical name over the scrim, 10px gaps | ink cards; the portrait is a warm mono print (multiplied onto sand) with grain; the logo colour is one disc; the print fades into the ink where the words sit | live page in Chrome, source file |
| Skiper 35 "Hover expand" | Founders F2 | one dark panel ruled into strips, names running up the strips as the resting texture, photo only in the open strip | Petrona names, a matted print, index with the line disc | headless capture |
| React Bits Chroma Grid | Founders F2/F1 detail | a mono portrait inset with a mat inside a dark card, the person's colour as a small edge accent | no glow or gradient border (section 6) | headless capture |
| GetLayers Artist | Founders F3 | mono prints in plain frames with a ruled caption | paper cards, a bar of the line colour, a big serif numeral | frame sheet (52 templates re-read) |
| GetLayers Relay (hero canvas) | Mission M1 | a dark canvas where separate nodes are joined by lines into one run | six groups as stations, lines in the logo colours merging into one; drawn on scroll | preview frames |
| Smooth UI SVG Draw On Scroll | Mission M1 motion | a path drawn by scroll | real `getTotalLength()` (Blueprint trap: never pathLength=1 with GSAP) | page text + capture |
| Lumora "What we do best" + Unlumen Pinned List | Mission M2 | full rows: name, one line, a disc; the active row inverts | on a sand panel, all six roles visible without a click | frame sheet, capture |
| Lumora word pills + Cue Kit Segmented Progress | Mission M3 | separate segments that read as one bar | six tinted segments close their gaps on scroll into one bar | frame sheet |
Genre check only: Dantora doctors row, Mobbin "team" (Savor, Sunday).

**Tools opened this round:** Cue Kit (50 components, 15 previews), React Bits (15), Aceternity (13), Unlumen (10),
Smooth UI (9), Cult UI (10), Magic UI (7), Kokonut (3), Skiper (6 + the full list), 21st.dev (team, profile, card,
features), GetLayers (sections page + all 52 template sheets re-read for these two problems), Mobbin (team, logged
in), Pafolios, Design Spells, Curated, Godly, Recent (health), Awwwards (team, animation collection), Motion.dev,
UI Guideline (card), Origin Kit, Watermelon.
**Skipped, with reasons:** Uiverse (Cloudflare blocked the headless browser), Refero (MCP not connected; the styles
search returned nothing headless, and the system is already locked), Supahero (heroes only), Neobrutalism and ThreeUI
(wrong register: hard shadows, 3D), Jitter/Swishy/Animos (video tools), Logosystem and Best Free Fonts (no mark or
face is changing), context7 and Playwright MCP (down this session).

## Options (rendered: `refs/care-setu/build/about-options/index.html`, gitignored)
**Founders** (structure and motion unchanged in all three)
- **F1 Ink gallery (recommended):** ink cards; each portrait a dimmed warm print that clears as its card opens;
  index and line disc at the top; the name in cream over the scrim; open, the print fades into ink and the words sit
  on it with a ghost numeral. Adds ink to About, which D-032 had kept off: recorded in the next D-entry.
- **F2 Names on ink:** one ink panel ruled into strips; at rest only the names, in Petrona, no face is ever cropped;
  the open strip shows a matted print.
- **F3 Gallery prints:** paper cards, matted prints, a bar of the logo colour, a big numeral. Stays light.
**Mission**
- **M1 The bridge (recommended):** an ink panel; the six groups as stations whose lines merge into one that reaches
  "One platform"; a group's role shows beside the diagram on hover, focus or tap; lines draw with scroll.
- **M2 Six plates:** a sand panel; six full rows with the role always visible; the active row inverts to ink.
- **M3 Six into one:** six tinted segments that close into one bar as the section scrolls in.
**Photos:** cleaned classically (done). True HD needs the founders' original files (Q20) or an AI upscale, which
invents facial detail on a real person: Sasanka's call.

## Motion plan
No new library. Founders: the existing CSS transitions; added states ride the same `--on` variable (scrim opacity,
print fade, numeral). Mission M1: one scrubbed GSAP timeline drawing the merge (tweening real path lengths), CSS for
the hover state; static and complete under reduced motion and on touch. Banned list: no fade-up, no scale-only hover.

## Files
`components/about/Founders.module.css`, `FounderCards.tsx` (index, numeral, scrim markup), `Manifesto.tsx`,
`Manifesto.module.css`, `Groups.tsx` (or a new `Bridge.tsx` for M1), `content/messages/en.json` (labels only),
`DESIGN.md`, `docs/DECISIONS.md` (D-034), `STATUS.md`, `INVARIANTS.md` (27, if ink is added), `docs/LOG.md`.

## Build order
1. Static (frozen gate) at 1440 and 1280x537. 2. States and motion. 3. Reduced motion and touch. 4. Reviewers
(impeccable at two viewports, Taste pre-flight, guidelines). 5. Device matrix (`npm run audit:devices`). 6. Docs.

## Verification
Green; per-step scroll probe for anything scrubbed; real mouse and Tab passes on the cards and the mission; contrast
of cream on ink and ink on tints measured; production build shows none of the pending content.

## Open / watch
- The capsule pixelation could not be reproduced in headless Chrome (its screenshots wait for full raster), so the
  fix is verified structurally (nothing is scaled any more); Sasanka's laptop is the real check.
- Originals of the founder photos (Q20) remain the only honest route to HD.
