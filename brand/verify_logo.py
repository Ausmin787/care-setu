"""Verify the rebuilt logo against the supplied JPEG (D-014, D-018).

    python brand/verify_logo.py <out_dir>

Renders logo.svg on the source's own 500x500 frame with headless Chrome and compares it
pixel by pixel with brand/logo-source-whatsapp-2026-09-14.jpeg:
  - colour-class agreement (every pixel snapped to the nearest brand colour), measured on
    interior pixels only, because anti-aliased edges in a 500 px JPEG can't be matched exactly
  - mean absolute RGB error
  - a 400% side-by-side + difference crop of the mark, and small-size renders (16..512 px)
Writes images to <out_dir> (keep them out of the repo). Needs Chrome, numpy and Pillow.
"""

import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops

import build_logo

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "logo-source-whatsapp-2026-09-14.jpeg"
CHROME = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
PALETTE = {
    "lime": build_logo.LIME, "olive": build_logo.OLIVE, "blue": build_logo.BLUE,
    "word": build_logo.WORD_BLUE, "grey": build_logo.TAG_GREY, "white": "#FFFFFF",
}


def rgb(hex_):
    return np.array([int(hex_[i:i + 2], 16) for i in (1, 3, 5)])


def render(svg_text, size, out_png):
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "r.html"
        page.write_text(
            "<!doctype html><style>html,body{margin:0;background:#fff}"
            f"svg{{display:block;width:{size}px;height:{size}px}}</style>{svg_text}",
            encoding="utf-8")
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--force-device-scale-factor=1", f"--window-size={size},{size}",
                        f"--screenshot={out_png}", page.as_uri()],
                       check=True, capture_output=True, timeout=60)
    return Image.open(out_png).convert("RGB").crop((0, 0, size, size))


def classes(arr):
    cols = np.stack([rgb(h) for h in PALETTE.values()])
    d = np.abs(arr[:, :, None, :].astype(int) - cols[None, None]).sum(3)
    return d.argmin(2)


def interior(cls):
    """Pixels whose 5x5 neighbourhood is one class (edges excluded)."""
    ok = np.ones_like(cls, bool)
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            ok &= np.roll(np.roll(cls, dy, 0), dx, 1) == cls
    return ok


def main(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    # Fidelity is measured with the text at the source's own positions; the shipped files
    # centre it on the tile axis, a deliberate cleanup that would otherwise read as error.
    framed = build_logo.main(frame="0 0 500 500", source_positions=True)
    rend = np.asarray(render(framed["logo.svg"], 500, out / "render-500.png")).astype(int)
    src = np.asarray(Image.open(SOURCE).convert("RGB")).astype(int)

    cs, cr = classes(src), classes(rend)
    names = list(PALETTE)
    # The heart gets its own region: it is a tiny share of the olive pixels, so a broken
    # heart once scored 98% "olive agreement" while rendering as two dots on a stalk.
    regions = {"mark (tile)": (slice(100, 300), slice(150, 355)),
               "heart": (slice(180, 217), slice(245, 290)),
               "wordmark": (slice(312, 345), slice(155, 345)),
               "tagline": (slice(355, 370), slice(118, 405))}
    print("region          interior-agree  all-px-agree  mean|dRGB|")
    for label, (ys, xs) in regions.items():
        s, r = cs[ys, xs], cr[ys, xs]
        inner = interior(s)
        print(f"{label:15s} {100 * (s == r)[inner].mean():12.2f}%  {100 * (s == r).mean():10.2f}%"
              f"  {np.abs(src[ys, xs] - rend[ys, xs]).mean():9.2f}")
    ys, xs = regions["mark (tile)"]
    s, r, inner = cs[ys, xs], cr[ys, xs], interior(cs[ys, xs])
    for i, n in enumerate(names):
        m = (s == i) & inner
        if m.sum():
            print(f"  mark class {n:6s} interior px {m.sum():6d}  agree {100 * (r[m] == i).mean():6.2f}%")

    # 400% side-by-side: source | render | difference (amplified).
    box = (150, 95, 355, 380)
    a = Image.open(SOURCE).convert("RGB").crop(box)
    b = Image.fromarray(rend.astype(np.uint8)).crop(box)
    diff = ImageChops.difference(a, b).point(lambda v: min(255, v * 3))
    w, h = a.size
    sheet = Image.new("RGB", (w * 3 * 4 + 40, h * 4), "white")
    for i, im in enumerate((a, b, diff)):
        sheet.paste(im.resize((w * 4, h * 4), Image.NEAREST), (i * (w * 4 + 20), 0))
    sheet.save(out / "compare-400pct.png")

    # Small sizes of the mark, plus a large one for edge quality.
    mark = build_logo.main()["logo-mark.svg"]
    for size in (16, 32, 64, 512):
        render(mark, size, out / f"mark-{size}.png")
    print(f"images written to {out}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "logo-verify-out")
