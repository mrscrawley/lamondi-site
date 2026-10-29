"""Перекрасить запечённый фон картинок: кремовый #F8F1E7 → новый (по умолчанию тёмный #14100D).
Фон = почти кремовые пиксели, связанные с краем кадра; кайма вокруг предмета пересчитывается мягко,
чтобы на тёмном не осталось светлого ореола. python3 rebg.py file.jpg [...]"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
OLD = np.array([0xF8, 0xF1, 0xE7], float)
TOL = float(os.environ.get("TOL", 14)); SOFT = float(os.environ.get("SOFT", 46))  # допуск фона и ширина мягкого края
NEW = np.array([int(os.environ.get("BG", "14100D")[i:i + 2], 16) for i in (0, 2, 4)], float)
for f in sys.argv[1:]:
    im = np.asarray(Image.open(f).convert("RGB")).astype(float)
    d = np.abs(im - OLD).max(-1)
    near = d < TOL
    lab, _ = ndimage.label(near)
    edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    if not edge: print("skip", f); continue
    bg = np.isin(lab, list(edge))
    band = ndimage.binary_dilation(bg, iterations=4) & ~bg
    a = np.where(bg, 1.0, np.where(band, np.clip(1 - (d - TOL) / SOFT, 0, 1), 0.0))[..., None]
    out = im + (NEW - OLD) * a
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(f, quality=88, optimize=True)
    print("ok", os.path.basename(f), f"{bg.mean():.0%}")
