"""Build the Care Setu logo SVGs from measured geometry (D-014, D-018).

Reproducible: `python brand/build_logo.py` rewrites brand/logo.svg, brand/logo-mark.svg and
brand/logo-mono.svg. Needs fontTools (Python) and brand/fonts/OpenSans-VF.ttf (SIL OFL 1.1).

All coordinates are in the pixel space of the supplied source,
brand/logo-source-whatsapp-2026-09-14.jpeg (500x500), measured by row/column colour scans.
That keeps verify_logo.py able to overlay the render on the source 1:1.

Construction (read from the source):
  - Lime rounded-square tile.
  - Two identical plus-shaped crosses: 60-wide bars, arms reaching 80 from the centre,
    ending in r=30 semicircle caps.
      back cross:  white, centre shifted 38 px left of the front cross
      front cross: olive top + left arms, blue right + bottom arms, white centre square
  - Olive heart in the centre square: two r=9 lobes tapering to a point.
  - Wordmark "CARE SETU": best fit Open Sans Bold, +0.02 em tracking (IoU 0.885 vs 0.846
    Segoe UI Bold / 0.381 Arial Bold). Most likely, not certain; owners to confirm (Q4).
  - Tagline: 7 px tall in the source. Open Sans letter advances match all 31 letter centres
    at +0.288 em tracking (RMS 0.30 px), so the family is well supported; the weight
    (Regular) is an assumption, because 400/500/600 fit equally at this size.
Interpretation choices (flag to owners): both crosses are clipped to the tile (in the
source the white cross runs past the tile's left edge, invisible only on white), and the
wordmark and tagline are centred on the tile axis (off by ~4 and ~12 px in the source).
"""

import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = Path(__file__).resolve().parent
FONT = HERE / "fonts" / "OpenSans-VF.ttf"

# Colours: medians of eroded region interiors in the source JPEG (provisional, Q4).
LIME, OLIVE, BLUE = "#9BCC3C", "#6D9620", "#0F8FCC"
WORD_BLUE, TAG_GREY, WHITE = "#138AB2", "#363636", "#FFFFFF"

# Geometry (source px).
TILE = dict(x=159.5, y=105.5, size=187.0, r=20.0)
AXIS_X = TILE["x"] + TILE["size"] / 2          # 253: centre line for the text
FRONT = (267.0, 199.0)                         # front (coloured) cross centre
BACK = (FRONT[0] - 38.0, FRONT[1])             # back (white) cross centre
HALF, CAP_C = 30.0, 50.0                       # bar half-width; centre -> cap-circle centre
HEART = dict(r=9.0, dx=8.5, cy=193.5, tip=213.0)

WORDMARK = dict(text="CARE SETU", wght=700, track=0.02, cap_top=317.0, baseline=340.0, fill=WORD_BLUE,
                source_centre=249.0)
# Tagline tracking/scale/centre from a least-squares fit of all 31 letter centres
# (RMS 0.30 px); weight is not identifiable at 7 px (400/500/600 fit equally).
TAGLINE = dict(text="CONNECTING CARE. EMPOWERING LIVES.", wght=400, track=0.288,
               cap_top=358.64, baseline=365.6, fill=TAG_GREY, source_centre=264.9)


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def tile_path():
    t = TILE
    x, y, s, r = t["x"], t["y"], t["size"], t["r"]
    return (f"M{f(x + r)},{f(y)}H{f(x + s - r)}A{f(r)},{f(r)} 0 0 1 {f(x + s)},{f(y + r)}"
            f"V{f(y + s - r)}A{f(r)},{f(r)} 0 0 1 {f(x + s - r)},{f(y + s)}"
            f"H{f(x + r)}A{f(r)},{f(r)} 0 0 1 {f(x)},{f(y + s - r)}"
            f"V{f(y + r)}A{f(r)},{f(r)} 0 0 1 {f(x + r)},{f(y)}Z")


def capsules(cx, cy):
    """The whole cross as two capsules (vertical + horizontal)."""
    h, c = HALF, CAP_C
    v = (f"M{f(cx - h)},{f(cy - c)}A{f(h)},{f(h)} 0 0 1 {f(cx + h)},{f(cy - c)}"
         f"V{f(cy + c)}A{f(h)},{f(h)} 0 0 1 {f(cx - h)},{f(cy + c)}Z")
    hz = (f"M{f(cx - c)},{f(cy - h)}H{f(cx + c)}A{f(h)},{f(h)} 0 0 1 {f(cx + c)},{f(cy + h)}"
          f"H{f(cx - c)}A{f(h)},{f(h)} 0 0 1 {f(cx - c)},{f(cy - h)}Z")
    return v + hz


def arms(cx, cy):
    """Front cross split into its four coloured arms and the centre square."""
    h, c = HALF, CAP_C
    top = f"M{f(cx - h)},{f(cy - h)}V{f(cy - c)}A{f(h)},{f(h)} 0 0 1 {f(cx + h)},{f(cy - c)}V{f(cy - h)}Z"
    left = f"M{f(cx - h)},{f(cy - h)}H{f(cx - c)}A{f(h)},{f(h)} 0 0 0 {f(cx - c)},{f(cy + h)}H{f(cx - h)}Z"
    right = f"M{f(cx + h)},{f(cy - h)}H{f(cx + c)}A{f(h)},{f(h)} 0 0 1 {f(cx + c)},{f(cy + h)}H{f(cx + h)}Z"
    bottom = f"M{f(cx - h)},{f(cy + h)}V{f(cy + c)}A{f(h)},{f(h)} 0 0 0 {f(cx + h)},{f(cy + c)}V{f(cy + h)}Z"
    centre = f"M{f(cx - h)},{f(cy - h)}H{f(cx + h)}V{f(cy + h)}H{f(cx - h)}Z"
    return dict(top=top, left=left, right=right, bottom=bottom, centre=centre)


def heart_path(cx):
    r, dx, cy, tip_y = HEART["r"], HEART["dx"], HEART["cy"], HEART["tip"]
    tip = (cx, tip_y)

    def tangent(c, side):
        # Tangent point on circle c from the tip, on the outer side (-1 left, +1 right).
        vx, vy = tip[0] - c[0], tip[1] - c[1]
        d = math.hypot(vx, vy)
        base = math.atan2(vy, vx)
        a = base - side * math.acos(r / d)
        return c[0] + r * math.cos(a), c[1] + r * math.sin(a)

    c1, c2 = (cx - dx, cy), (cx + dx, cy)
    # Outer tangents: left lobe rotates towards the left (+acos in y-down space), right lobe
    # towards the right. The first build had these swapped and drew two dots on a stalk.
    p1, p2 = tangent(c1, -1), tangent(c2, +1)
    notch = (cx, cy - math.sqrt(r * r - dx * dx))
    return (f"M{f(tip[0])},{f(tip[1])}L{f(p1[0])},{f(p1[1])}"
            f"A{f(r)},{f(r)} 0 1 1 {f(notch[0])},{f(notch[1])}"
            f"A{f(r)},{f(r)} 0 1 1 {f(p2[0])},{f(p2[1])}Z")


class Face:
    """An instanced Open Sans with GPOS pair kerning."""

    def __init__(self, wght):
        font = instancer.instantiateVariableFont(TTFont(FONT), {"wght": wght, "wdth": 100})
        self.font, self.upm = font, font["head"].unitsPerEm
        self.cap = font["OS/2"].sCapHeight
        self.cmap, self.gs = font.getBestCmap(), font.getGlyphSet()
        self.kern = self._pairs(font)

    @staticmethod
    def _pairs(font):
        pairs = {}
        gpos = font["GPOS"].table
        kern_lookups = {i for fr in gpos.FeatureList.FeatureRecord if fr.FeatureTag == "kern"
                        for i in fr.Feature.LookupListIndex}
        for li in sorted(kern_lookups):
            lookup = gpos.LookupList.Lookup[li]
            for st in lookup.SubTable:
                if lookup.LookupType == 9:  # extension wrapper
                    if st.ExtensionLookupType != 2:
                        continue
                    st = st.ExtSubTable
                elif lookup.LookupType != 2:  # only pair positioning
                    continue
                if st.Format == 1:
                    for g1, ps in zip(st.Coverage.glyphs, st.PairSet):
                        for rec in ps.PairValueRecord:
                            v = getattr(rec.Value1, "XAdvance", 0) or 0
                            pairs.setdefault((g1, rec.SecondGlyph), v)
                elif st.Format == 2:
                    c1, c2 = st.ClassDef1.classDefs, st.ClassDef2.classDefs
                    for g1 in st.Coverage.glyphs:
                        row = st.Class1Record[c1.get(g1, 0)]
                        for g2 in set(c2) | {None}:
                            if g2 is None:
                                continue
                            v = getattr(row.Class2Record[c2.get(g2, 0)].Value1, "XAdvance", 0) or 0
                            if v:
                                pairs.setdefault((g1, g2), v)
        return pairs

    def outline(self, spec, centre=AXIS_X):
        """SVG path for a line of text, cap-height fitted, centred on `centre`."""
        glyphs = [self.cmap[ord(ch)] for ch in spec["text"]]
        track = spec["track"] * self.upm
        xs, x = [], 0.0
        for i, g in enumerate(glyphs):
            xs.append(x)
            x += self.font["hmtx"][g][0] + track
            if i + 1 < len(glyphs):
                x += self.kern.get((g, glyphs[i + 1]), 0)
        width = x - track
        scale = (spec["baseline"] - spec["cap_top"]) / self.cap
        left = centre - width * scale / 2
        pen = SVGPathPen(self.gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        for g, gx in zip(glyphs, xs):
            t = (scale, 0, 0, -scale, left + gx * scale, spec["baseline"])
            self.gs[g].draw(TransformPen(pen, t))
        return pen.getCommands()


def svg(view_box, body, title, extra_defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}" role="img" '
            f'aria-labelledby="t">\n<title id="t">{title}</title>\n'
            f'<defs><clipPath id="tile"><path d="{tile_path()}"/></clipPath>{extra_defs}</defs>\n'
            f"{body}\n</svg>\n")


def mark_body():
    a = arms(*FRONT)
    return (f'<path fill="{LIME}" d="{tile_path()}"/>\n'
            f'<g clip-path="url(#tile)">\n'
            f'  <path fill="{WHITE}" d="{capsules(*BACK)}"/>\n'
            f'  <path fill="{OLIVE}" d="{a["top"]}{a["left"]}"/>\n'
            f'  <path fill="{BLUE}" d="{a["right"]}{a["bottom"]}"/>\n'
            f'  <path fill="{WHITE}" d="{a["centre"]}"/>\n'
            f"</g>\n"
            f'<path fill="{OLIVE}" d="{heart_path(FRONT[0])}"/>')


def mono_body():
    """PROPOSAL (not in the source): one-colour knockout for single-ink use.
    Tile in currentColor; both crosses knocked out; the front cross's outline kept as a
    3px currentColor keyline so the two crosses still read; heart in currentColor."""
    return (f'<mask id="k"><path fill="#fff" d="{tile_path()}"/>'
            f'<g clip-path="url(#tile)"><path fill="#000" d="{capsules(*BACK)}{capsules(*FRONT)}"/></g></mask>\n'
            f'<path fill="currentColor" mask="url(#k)" d="{tile_path()}"/>\n'
            f'<g clip-path="url(#tile)"><path fill="none" stroke="currentColor" stroke-width="3" '
            f'd="{capsules(*FRONT)}"/></g>\n'
            f'<path fill="currentColor" d="{heart_path(FRONT[0])}"/>')


def main(frame=None, source_positions=False):
    """source_positions=True places the text where the source JPEG has it, so
    verify_logo.py can test the font fit separately from the centring cleanup."""
    wc = WORDMARK["source_centre"] if source_positions else AXIS_X
    tc = TAGLINE["source_centre"] if source_positions else AXIS_X
    word = Face(WORDMARK["wght"]).outline(WORDMARK, wc)
    tag = Face(TAGLINE["wght"]).outline(TAGLINE, tc)
    text = (f'<path fill="{WORDMARK["fill"]}" d="{word}"/>\n'
            f'<path fill="{TAGLINE["fill"]}" d="{tag}"/>')
    # Clear space = 20 px (the tile's corner radius) on every side.
    pad = 20
    tx0, ty0, ts = TILE["x"], TILE["y"], TILE["size"]
    lock_x0 = min(tx0, 124.0) - pad
    lock_w = (2 * AXIS_X - lock_x0) - lock_x0
    lock_vb = f"{f(lock_x0)} {f(ty0 - pad)} {f(lock_w)} {f(TAGLINE['baseline'] + 2 - ty0 + 2 * pad)}"
    mark_vb = f"{f(tx0)} {f(ty0)} {f(ts)} {f(ts)}"
    files = {
        "logo.svg": svg(frame or lock_vb, mark_body() + "\n" + text,
                        "Care Setu: Connecting Care. Empowering Lives."),
        "logo-mark.svg": svg(frame or mark_vb, mark_body(), "Care Setu"),
        "logo-mono.svg": svg(frame or mark_vb, mono_body(), "Care Setu (one-colour)"),
    }
    return files


if __name__ == "__main__":
    for name, content in main().items():
        (HERE / name).write_text(content, encoding="utf-8", newline="\n")
        print(f"wrote brand/{name} ({len(content)} bytes)")
