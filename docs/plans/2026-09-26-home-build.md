# Care Setu — Home build plan (2026-09-26)

**Status:** approved by Sasanka 2026-09-26 and built (D-021, D-022). Copied from the session plan so it survives the session. The build deviates in one place: the hero entrance is CSS, not anime.js (D-021 "Built as").


## Context
Sasanka reviewed the Stage 2 comp (D-020 "Setu Lines") and asked for three things:
1. **A new hero built for trust.** The metro-map diagram (Hospital ═ 3 lines ═ Home) is confusing and
   breaks on mobile. It goes.
2. **The build starts now:** a real site on localhost, with motion, and no more static mockups.
3. **Sections must actually match their samples.** Example: the comp's "how it works" trip spine looks
   nothing like the Transit sample it cites. The comp has oversized ring discs sticking out of a
   segmented spine, where the sample has one wide rounded spine with small inset discs.

Decided in this session (AskUserQuestion): hero = **illustrated care scene** (Spectrum.Life layout);
**light mode only** for now (closes Taste finding 13 as a waiver).

**Objection check (CLAUDE.md rule), with the override recorded first:**
- INV 27 / D-020 fixes the hero as the network diagram and makes "line isolate" in the hero the signature.
  → **D-021 is written before any code.** It partly supersedes D-020 (the hero composition, the signature
  motion, and the rule that colour appears only on lines, which the illustration relaxes). Kept from D-020:
  Anek type, the action blue, NHS button physics, the enquiry flow, the line badges, and "how it works" as
  a trip.
- INV 3 / D-011 (stages, a check-in after each page): this session covers the **Stage 3 scaffold plus the
  Home page only**, then stops for Sasanka's review. Other pages follow one at a time.
- INV 16 / D-007: the illustration is clearly drawn, never photoreal, shows no real person, and has no
  uniform logos. It gets a new CLAIMS row (C-0xx "hero illustration, AI-generated, depicts no real person")
  and the alt text says it is an illustration.
- INV 25 / Q3: **no phone number is shown** until Q3 is answered. The phone slot renders from config and is
  hidden while it's empty. The hero's secondary action falls back to "Talk to us" only.
- The owners have not yet reviewed the comp. Sasanka, as tech lead, authorises going ahead. The owners
  will review the running Home page instead, and D-021 records that.

## Difference Test (§1.2)
Against the last ledger row (Hungry Anna "Order chit"), the build still differs on chroma, type,
archetype, ornament (drawn trip and badges plus one illustration) and chrome (the trip + "Lines open").
That is 5 of 7. The signature motion changes too (below), so 6 of 7.

## Slop pre-check (§0.1)
| Risk | Avoided by |
|---|---|
| Centred hero column (§19.3) | Two-column split: text on the left grid line, scene panel on the right |
| Stock "smiling nurse" photo | A drawn scene, with bold ink shapes (§19.1 bold, not thin line art, §19.3) |
| Three-card feature row | Reassurances are a 3-line list with filled Tabler icons, not cards |
| Fade-up everywhere | One signature (live trip) plus two quiet one-shot entrances in the hero; nothing else fades |
| Stats / "trusted by" | Forbidden (D-007). Reassurances are process facts only (D-004 quote-first, the coordinator model) |

## Sample ledger (§1.5), this session
| Sample | Feeds | Taken | Changed + why | Tool |
|---|---|---|---|---|
| Supahero **Spectrum.Life** | Hero layout | Headline, then one line, then one action; a large human scene in a rounded panel as the trust carrier | Split left/right instead of stacked, to keep the actions above the fold at 720px; illustration instead of a photo (INV 16) | Chrome capture of the Supahero still; `image-to-code` analysis rules |
| Supahero **Airbnb Homes** | Hero reassurances | 3 short reassurance lines with small icons under the action; "It's easy to…" plain-speech headline | Filled Tabler icons (§19.1); left-aligned list, not a centred row | same |
| Supahero **Wise** | Headline scale | Heavy, confident, tight display type | Anek 800 at width 75, sentence case (calmer for health) | same |
| Design Spells **Transit trip** (`refs/designspells-transit-trip/`) | How it works | **Exact** geometry: one continuous ~22px rounded spine; ~12px white discs *inset*; 17–20px bold stop names tight to the spine; dotted walk link with icon plus bold label; line badge = roundel + chip | Light ground instead of dark; no times (Q12); service colour on the care segment | Re-measure from the capture, then a side-by-side screenshot before showing |
| Cue Kit split panel | Services index | Row grid, one open at a time, `grid-rows 0fr→1fr` | As in the stage-2 ledger | existing spec |
| Care24 partner band | Partner band | Ink band, question headline, action right, 3 tiles | Tiles carry line badges, not coloured top borders (finding 4) | existing capture |
| Elder nav | Nav | Phone + "Lines open" stack | Hidden until Q3/Q12 (config) | existing capture |

## The hero illustration: ChatGPT image (2.5)
I'm not using image-to-code for the hero. A warm, human scene is the one thing hand-built SVG does badly,
so a generated illustration is the better route. **Sasanka runs it and saves the pick to
`public/illustrations/hero-care-scene.png`.** Until it arrives, the build ships a fixed-ratio placeholder
panel (same 4:5 ratio, `--c-deep` fill), so dropping the image in causes no layout shift.

**Attach:** (1) `brand/logo-source-whatsapp-2026-09-14.jpeg` for palette reference only; (2) the Supahero
Spectrum.Life still for composition (I'll save it to `refs/supahero/spectrum-life.webp`); (3) after the
first good result, that result, for every later variation or service illustration (keeps the style consistent).

**Prompt:**
> Editorial flat illustration, portrait 4:5, high resolution. A calm, sunlit living room in a middle-class
> home in Delhi: light terrazzo floor, a window with a simple white iron grille, a potted money plant, a
> wooden side table with a steel water tumbler and a pill organiser. An Indian man around 75, in a kurta and
> a grey sleeveless sweater, sits upright in a cushioned armchair with a walking stick beside him, relaxed and
> dignified. A home-care nurse in her 30s kneels beside him at eye level, checking his blood pressure with an
> upper-arm cuff. She wears plain teal scrubs with no logo or badge. They share a quiet, genuine moment:
> gentle smiles, neither of them looking at the viewer. On the side table a tablet leans upright on a video
> call showing a younger woman (his daughter), small in frame.
> Style: bold, confident flat shapes with solid dark outlines (#14201A) about 3px at 1000px width, no
> gradients, no glow, subtle paper grain. Palette: warm off-white walls (#F3F6EF), ink #14201A, natural skin
> tones, muted clothing. Use the brand colours only as small accents: lime #9BCC3C (a cushion), blue #0F8FCC
> (the tablet case), olive #6D9620 (the plant). Keep the upper-left third quieter (plain wall) so the subject
> sits in the lower two-thirds and centre, which lets it crop safely to 4:3.
> Avoid: any text, logos, watermarks, hospital beds, IV drips, stethoscopes around necks, stock-photo poses,
> exaggerated cartoon faces, thin sketchy lines, purple tones.

Make 3–4 generations, pick one, and send it. I'll convert it to AVIF/WebP through `next/image` and check the
4:3 mobile crop.

## Structure (Home, in order)
1. Promotions strip: hidden (nothing configured, D-013).
2. Nav (≤72px, finding 11): mark + wordmark · Services · How it works · Partner · [phone + "Lines open",
   only when configured] · primary "Talk to us".
3. **Hero (new):** left column: H1 in sentence case, around 8 words (draft: "Care after hospital, at
   home."), a lede of ≤20 words (finding 8), primary "Talk to us" (goes to /contact, a stub for now), a 3-line
   reassurance list (draft: "One coordinator for everything" · "A care plan and quote before you pay" ·
   "Care in your home, across Delhi NCR"), and the emergency note. Right: a 4:5 rounded panel with the
   illustration. ≤900px: one column, with the panel under the lede cropped to 4:3, and the actions above the
   fold at 390×844. **All copy lives in `content/messages/en.json` and is marked draft for owner review.**
   The coordinator line is flagged in CLAIMS as pending owner confirmation.
4. How it works: the Transit trip, rebuilt to the measured sample geometry (ledger row 4).
5. Service lines index (Cue Kit), rows carrying line badges; the Q6 set is shown as "examples" from config.
6. Partner band (ink, Care24).
7. Footer as the network legend.
Review findings 1–12 from `docs/plans/stage-2-design.md` are applied in the build. Finding 13 is waived
(light only).

## Motion plan (§9): skills invoked, not recalled (`animejs-v4`, `gsap-scrolltrigger`, `gsap-react`)
**Signature: "live trip".** In How it works, a position marker (a white disc with an ink ring, like Transit's
live dot) travels down the spine as you scroll, and each station it passes turns from *upcoming* (hollow)
to *passed* (filled, with a tick). It's a state change, not a stroke draw, deliberately unlike Hungry Anna
D-083's draw-on.
| Technique | Library | Job here |
|---|---|---|
| Live trip marker + station state | GSAP ScrollTrigger scrub (desktop, via `matchMedia`); on touch, per-station state from an IntersectionObserver, with no pin | Reads as one journey |
| Headline line-by-line slide (mask reveal, lines not chars) | anime.js `text.split` | Calm one-shot entrance, ~700ms |
| Illustration panel: clip-path inset opens from the bottom | anime.js | One shot, ~800ms, `power3.out`-equivalent |
| Services accordion | CSS `grid-rows` | Cue Kit |
| Service row → line isolate (its badge line at full chroma, the others ghosted) | CSS classes | Kept from D-020, scaled down to the index |
| Button press | CSS (NHS) | — |
Not used: fade-up sections, scale on hover, loops. Reduced motion: transient states live in JS-added
classes, so no-JS and reduced-motion get the finished pose (§9.5). `ScrollTrigger.refresh()` runs after
`document.fonts.ready`.

## Stage 3 scaffold (lean, Rule 10)
- Next.js (App Router, latest) + TS strict + Tailwind v4, scaffolded in a temp sibling and moved in with the
  docs protected (§5.3). ESLint, Vitest. Anek Latin self-hosted via `next/font` (finding 17), and the width
  axis measured on the first render.
- `app/` route stubs for every PRD §5 page (each just a heading, so nav links work), `content/messages/en.json`,
  `lib/config.ts` (zod-validated public config: phone, hours, promo, live service set, all empty or
  placeholder-free by default).
- Security headers in `next.config.ts` + a test. **Claims test (D-007):** Vitest scans the message files and
  built HTML for the banned list (`caresetu.com`, `+91`, `123 456`, `ISO`, `HIPAA`, `trusted by`, hospital
  names, `%`, `lakh`).
- `impeccable init` → PRODUCT.md.
- **Deferred to the Contact page (ROADMAP updated):** Drizzle/PGlite, `/api/v1`, auth, and CI. Nothing on Home
  needs them, and wiring them now is speculative. gbrain trial stays as D-019.
- Key files: `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (the @theme and semantic layer from
  DESIGN.md), `components/home/{Nav,Hero,Trip,ServiceIndex,PartnerBand,Footer}.tsx`,
  `components/motion/{useLiveTrip,useHeroEntrance}.ts`, `components/LineBadge.tsx`, `lib/config.ts`,
  `content/messages/en.json`, `tests/{claims,headers}.test.ts`.
- Dev server: `npm run dev` in the background with its PID captured (mistake #26), at http://localhost:3000.

## Build order
0. D-021 + a CLAIMS row for the illustration, before any code.
1. Scaffold → verify green (lint, typecheck, test, build).
2. Home **static, frozen gate**: every section, with a side-by-side screenshot against its sample (Spectrum.Life,
   Airbnb, Transit, Cue Kit, Care24). Fix until the sample's DNA is visible.
3. Chrome: config-driven phone/"Lines open" (hidden now).
4. Motion: the hero entrance first, then the live trip (riskiest) last. 5. Reduced-motion pass.
6. Drop in the illustration when Sasanka sends it (the placeholder until then).

## Verification (§10)
- Green: lint + typecheck + vitest + `next build`.
- Playwright MCP at 360 / 390 / 768 / 1024 / 1440: screenshots, and `scrollWidth <= clientWidth`; the hero
  actions above the fold at 1440×720 and 390×844.
- `impeccable detect --json http://localhost:3000` at 1280 and `--viewport 390x844`; the `design-taste-frontend`
  pre-flight; the `web-design-guidelines` audit. Every finding gets a recorded decision.
- Side-by-side captures vs every sample, saved to `refs/build-sbs/`.
- Motion: check the rAF counter first (mistake #20); if the driven tab starves it, verify with real
  wheel-scroll screenshots at the start, middle and end poses, and report the timing as unverified.
  Reduced motion verified structurally (grep the SSR HTML for the transient classes: 0 hits).
- Keyboard tab path, focus-visible, heading outline, alt text.
- Fact audit: the claims test plus a grep of the served HTML.

## Close-out
D-021 (with Verified / Not verified) → STATUS → INVARIANTS 27 amended → DESIGN.md (hero, illustration rule,
signature) → stage-2 plan note → ROADMAP deferral → Blueprint §14 ledger + §19.2 (the accepted hero) and §19.5
(the trip-fidelity miss) → LOG → memory → `context-head.mjs --wrap` + `docs-check.mjs`. Then ask about
committing (D-015); nothing is committed without that.
