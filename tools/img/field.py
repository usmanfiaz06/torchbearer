"""
Crop the programme photographs in assets/img/ into web plates under assets/img/field/.

Sources are phone photographs at 4:3 (and one panorama). The site uses them at three
shapes: 3:4 portrait in the drag rails, 16:9 in the media bands, and 3:2 in cards.
Cropping is done here rather than with CSS so the subject survives the crop — object-fit
centres blindly, which cuts the presenter out of the frame she is standing in.

    python3 tools/img/field.py
"""
import os
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "assets", "img")
OUT = os.path.join(SRC, "field")

W = "WhatsApp Image 2026-07-29 at %s.jpeg"

# name: (source, target w, target h, horizontal bias, vertical bias, zoom)
# bias 0.5 is a centred crop; lower keeps the left/top of the frame. zoom above 1
# tightens onto the subject, which is the only way to crop a 3:4 source to 3:4.
PLATES = {
    "session-women":       (W % "23.20.43", 1800, 1013, 0.50, 0.45, 1.0),
    "session-women-p":     (W % "23.20.43",  900, 1200, 0.52, 0.45, 1.0),
    "literacy-training":   (W % "23.14.51", 1800, 1013, 0.38, 0.45, 1.0),
    "literacy-training-p": (W % "23.14.51",  900, 1200, 0.30, 0.42, 1.0),
    "classroom":           (W % "23.13.47", 1800, 1013, 0.50, 0.50, 1.0),
    "classroom-p":         (W % "23.13.47",  900, 1200, 0.55, 0.50, 1.0),
    "worksheets":          (W % "23.22.41", 1800, 1013, 0.50, 0.50, 1.0),
    "worksheets-p":        (W % "23.22.41",  900, 1200, 0.50, 0.50, 1.0),
    "village-p":           (W % "23.22.57",  900, 1200, 0.50, 0.78, 1.32),
    "village":             (W % "23.22.57", 1800, 1013, 0.50, 0.42, 1.0),
    "cohort":              (W % "23.13.39", 2400, 1020, 0.50, 0.50, 1.0),
}


def crop(src, w, h, bx, by, zoom):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    sw, sh = im.size
    scale = max(w / sw, h / sh) * zoom
    nw, nh = round(sw * scale), round(sh * scale)
    im = im.resize((nw, nh), Image.LANCZOS)
    x = round((nw - w) * bx)
    y = round((nh - h) * by)
    return im.crop((x, y, x + w, y + h))


os.makedirs(OUT, exist_ok=True)
for name, (src, w, h, bx, by, zoom) in PLATES.items():
    path = os.path.join(SRC, src)
    if not os.path.exists(path):
        raise SystemExit("missing source: %s" % path)
    out = os.path.join(OUT, name + ".jpg")
    crop(path, w, h, bx, by, zoom).save(out, "JPEG", quality=82, optimize=True, progressive=True)
    print("  %-22s %sx%s  %6.0f kB" % (name + ".jpg", w, h, os.path.getsize(out) / 1024))
