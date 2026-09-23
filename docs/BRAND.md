# Brand — Care Setu

**Status:** vector logo built and verified (D-018). **Provisional until the owners confirm the
reconstruction, colours and fonts (Q4).**

## Files (`brand/`)
| File | What it is |
|---|---|
| `logo.svg` | Full lockup: mark + wordmark + tagline, text converted to outlines (no font needed to display) |
| `logo-mark.svg` | Tile only (favicon/app icon source, ≥ 24 px) |
| `logo-mono.svg` | **Proposal, not in the source.** One-colour knockout in `currentColor`, for single-ink print, embossing and dark grounds. Needs owner approval |
| `logo-source-whatsapp-2026-09-14.jpeg` | The supplied original (500×500 JPEG); the reference everything is measured against |
| `build_logo.py` | Regenerates all three SVGs from measured geometry: `python brand/build_logo.py` |
| `verify_logo.py` | Renders with headless Chrome and diffs against the source: `python brand/verify_logo.py <out_dir>` |
| `fonts/OpenSans-VF.ttf` + `OpenSans-OFL.txt` | Open Sans variable font (SIL OFL 1.1, redistribution permitted with the licence), used only to generate outlines |

## Construction
Lime rounded-square tile (radius ≈ 10.7% of the side) holding **two identical plus-shaped
crosses**. Each has 60-unit bars and arms reaching 80 units from its centre, ending in semicircle
caps. The **back cross is white**, offset left by 38 units. The **front cross** has olive top and
left arms, blue right and bottom arms, and a white centre square with an **olive heart** (two
lobes tapering to a point). Built from circles, rectangles and tangent lines, not auto-traced (D-014).

## Colours
| Role | Hex | Evidence |
|---|---|---|
| Lime (tile) | `#9BCC3C` | median of 12,016 interior pixels |
| Olive (arms, heart) | `#6D9620` | median of 4,104 interior pixels |
| Blue (arms) | `#0F8FCC` | median of 3,728 interior pixels |
| Wordmark blue | `#138AB2` | median of 827 interior pixels, wide spread; **genuinely darker than the arm blue** (its blue channel sits ~180 vs 204, and white blending could only raise it), but the exact value is uncertain |
| Tagline grey | `#363636` | 7 px text never reaches a solid interior; approximate |
| White | `#FFFFFF` | |
JPEG compression shifts values by a few units. Exact hexes are requested from the owners (Q4).

## Typography (in the logo)
- **Wordmark:** Open Sans Bold (700), +0.02 em tracking. Best fit (IoU 0.885 unstretched vs
  0.846 Segoe UI Bold and 0.381 Arial Bold). **Most likely, not certain.**
- **Tagline:** Open Sans at +0.288 em tracking. All 31 letter centres match Open Sans advances
  with **0.30 px RMS error**, so the family is well supported. The **weight is assumed Regular**:
  400/500/600 fit equally at 7 px.
- This Open Sans build has no kerning feature (only mark positioning), so none is applied.
  This is consistent with the fit.
- These are **logo fonts**, not the website's type system. Site typography is chosen at Stage 2
  (Blueprint §6) and may differ.

## Usage rules
- **Size floor:** full mark ≥ **24 px**. At 20 px and below the heart turns into a smudge. A
  16 px favicon needs a simplified variant (e.g. without the back cross, with a larger heart). That's a
  design decision for the owners, not made here.
- **Clear space:** at least the tile's corner radius (≈ 20 units at the 187-unit tile size, i.e.
  ~11% of the tile width) on every side. `logo.svg` includes it.
- **Grounds:** the full-colour mark is self-contained on its lime tile and works on white and dark
  grounds. The lockup's wordmark and tagline are for **light grounds**. On dark grounds use the
  mark alone, or a light-text lockup (not yet made).
- Never recolour the arms, stretch the tile, or rebuild the mark from the deck's other variants.

## Verification (D-018)
Rendered with headless Chrome on the source's own 500×500 frame and compared pixel by pixel,
every pixel snapped to the nearest brand colour. "Interior" excludes anti-aliased edges, which a
500 px JPEG can't match exactly.
| Region | Interior agreement | All pixels | Mean abs RGB error |
|---|---|---|---|
| Mark | 100.00% | 95.91% | 5.07 |
| Heart | 100.00% | 93.75% | 9.06 |
| Wordmark | 99.88% | 85.31% | 19.38 |
| Tagline | 100.00% | 87.22% | 13.83 |
Text fidelity is measured at the source's positions. The shipped files centre the text on the tile
axis (see below).

## Interpretation choices (flag to the owners)
1. **Clipped to the tile.** In the source the white back cross runs past the tile's left edge,
   invisible on white but a white bump on any coloured ground. Both crosses are clipped to the tile.
2. **Text centred.** In the source the wordmark sits ~4 px left of the tile's axis and the tagline
   ~12 px right of it. Both are centred on the tile axis here.
3. **Heart centred** on the front cross (the source is 0.5 px off).

## Open (Q4)
Original design file (Canva/AI/SVG)? Exact hexes? Wordmark and tagline font names and weights? Is
a Hindi (Devanagari) lockup wanted later (D-008)? Approve or reject `logo-mono.svg`. A 16 px favicon
variant?
