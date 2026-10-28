"""Тарелка по точному кругу: python3 plate.py src dst [--dark-bg] [--rim]
   src — кадр с тарелкой сверху (на угольном фоне с --dark-bg, иначе уже на цвете сайта).
   Круг подбирается по краю тарелки с отбрасыванием выбросов (тень, крошки), всё вне круга = цвет сайта.
   --rim: тонкий мягкий ободок по краю, чтобы белая тарелка не терялась на светлом фоне."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
BG = np.array([248, 241, 231], float)
src, dst = sys.argv[1], sys.argv[2]; dark = "--dark-bg" in sys.argv; rim = "--rim" in sys.argv
im = Image.open(src).convert("RGB"); a = np.asarray(im).astype(float); h, w = a.shape[:2]
if dark:
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]); ref = np.median(edge, 0)
    m = np.abs(a - ref).max(2) > 45
else:
    m = np.abs(a - BG).max(2) > 7
m = ndimage.binary_opening(m, iterations=2)
lab, n = ndimage.label(m); big = 1 + np.argmax(ndimage.sum(m, lab, range(1, n + 1)))
m = ndimage.binary_fill_holes(lab == big)
ys, xs = np.where(m ^ ndimage.binary_erosion(m))      # контур
pts = np.stack([xs, ys], 1).astype(float)
for _ in range(8):                                     # МНК-круг, выбросы (тень снаружи) отбрасываем
    A = np.c_[2 * pts, np.ones(len(pts))]; b = (pts ** 2).sum(1)
    cx, cy, c = np.linalg.lstsq(A, b, rcond=None)[0]; R = np.sqrt(c + cx * cx + cy * cy)
    d = np.hypot(pts[:, 0] - cx, pts[:, 1] - cy) - R
    keep = np.abs(d) < max(2.0, np.percentile(np.abs(d), 70)); pts = pts[keep]
R -= 1.5
yy, xx = np.mgrid[0:h, 0:w]; r = np.hypot(xx - cx, yy - cy)
alpha = np.clip(R - r + 0.75, 0, 1)[..., None]         # гладкий край ~1.5 px
out = a.copy()
if rim:                                                # мягкий ободок: чуть темнее у самого края тарелки
    t = np.clip((r - (R - R * 0.035)) / (R * 0.035), 0, 1)[..., None]
    out = out * (1 - 0.07 * t ** 1.6)
out = out * alpha + BG * (1 - alpha)
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dst, quality=92)
print(dst, "circle", round(cx), round(cy), round(R), "of", w, h)
