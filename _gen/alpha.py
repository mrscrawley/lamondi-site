"""Вырезанные картинки → WebP с прозрачным фоном (работают и на тёмной, и на светлой теме).
Источник — кремовые оригиналы (_gen/cream_backup). Края «размешиваются»: из полупрозрачных пикселей
вычитается кремовый, чтобы не было ни светлой каймы на чёрном, ни тёмной на светлом.
  python3 alpha.py board src.jpg dst.webp     доски/суши: фон = кремовые пиксели у края кадра (TOL/SOFT)
  python3 alpha.py plate src.jpg dst.webp     круглая тарелка: точный круг (THR — порог края тарелки)
  python3 alpha.py fade  src.png dst.webp     здание: кремовая заливка + растворение низа/боков
Рядом пишется dst-800.webp, если картинка шире 1000 px (кроме миниатюр -s)."""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
CREAM = np.array([0xF8, 0xF1, 0xE7], float)

def board(im):
    TOL = float(os.environ.get("TOL", 14)); SOFT = float(os.environ.get("SOFT", 46))
    d = np.abs(im - CREAM).max(-1)
    lab, _ = ndimage.label(d < TOL)
    edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    bg = np.isin(lab, list(edge))
    band = ndimage.binary_dilation(bg, iterations=4) & ~bg
    return np.where(bg, 1.0, np.where(band, np.clip(1 - (d - TOL) / SOFT, 0, 1), 0.0))

def plate(im):
    h, w = im.shape[:2]
    m = np.abs(im - CREAM).max(2) > float(os.environ.get("THR", 7))
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m); big = 1 + np.argmax(ndimage.sum(m, lab, range(1, n + 1)))
    m = ndimage.binary_fill_holes(lab == big)
    ys, xs = np.where(m ^ ndimage.binary_erosion(m)); pts = np.stack([xs, ys], 1).astype(float)
    for _ in range(8):
        A = np.c_[2 * pts, np.ones(len(pts))]; b = (pts ** 2).sum(1)
        cx, cy, c = np.linalg.lstsq(A, b, rcond=None)[0]; R = np.sqrt(c + cx * cx + cy * cy)
        dd = np.hypot(pts[:, 0] - cx, pts[:, 1] - cy) - R
        pts = pts[np.abs(dd) < max(2.0, np.percentile(np.abs(dd), 70))]
    R -= 1.5
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.hypot(xx - cx, yy - cy)
    if os.environ.get("RIM", "1") == "1":                # лёгкий ободок: белая тарелка не теряется на светлой теме
        t = np.clip((r - (R - R * 0.035)) / (R * 0.035), 0, 1)[..., None]
        im *= 1 - 0.07 * t ** 1.6
    return 1 - np.clip(R - r + 0.75, 0, 1)   # доля фона

def fade(im):
    f = float(os.environ.get("FADE", 0.16))
    d = np.abs(im - im[8:40, 8:40].reshape(-1, 3).mean(0)).max(-1)
    lab, _ = ndimage.label(d < 22)
    edge = set(np.unique(np.r_[lab[0], lab[:, 0], lab[:, -1]])) - {0}
    m = ndimage.binary_opening(np.isin(lab, list(edge)), iterations=1)
    m = ndimage.binary_dilation(m, iterations=int(os.environ.get("GROW", 2)))
    a = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(float) / 255
    h, w = im.shape[:2]; y = np.arange(h)[:, None] / h; x = np.arange(w)[None, :] / w
    g = np.clip((y - (1 - f)) / f, 0, 1) ** 1.6
    side = np.clip(1 - np.minimum(x, 1 - x) / 0.09, 0, 1) ** 1.4 * np.clip((y - 0.7) / 0.08, 0, 1)
    return np.maximum(np.maximum(a, g), side)

mode, src, dst = sys.argv[1:4]
im = np.asarray(Image.open(src).convert("RGB")).astype(float)
if mode == "fade":   # кремовая заливка генератора чуть отличается от цвета сайта — размешиваем с ней
    CREAM = im[8:40, 8:40].reshape(-1, 3).mean(0)
bga = {"board": board, "plate": plate, "fade": fade}[mode](im)
fa = 1 - bga                                            # непрозрачность предмета
rgb = (im - CREAM * bga[..., None]) / np.maximum(fa, 1e-3)[..., None]
rgb = np.where(fa[..., None] > 0.02, rgb, 0)
out = Image.fromarray(np.dstack([rgb.clip(0, 255), fa * 255]).round().astype(np.uint8), "RGBA")
W = int(os.environ.get("MAXW", 0))
if W and out.width > W: out = out.resize((W, round(out.height * W / out.width)), Image.LANCZOS)
out.save(dst, "WEBP", quality=82, method=6, alpha_quality=90)
if out.width > 1000 and not dst.endswith("-s.webp"):
    s = out.copy(); s.thumbnail((800, 10000), Image.LANCZOS); s.save(dst[:-5] + "-800.webp", "WEBP", quality=80, method=6, alpha_quality=90)
print("ok", os.path.basename(dst), f"{fa.mean():.0%} opaque")
