"""Здание на кремовой заливке → точный фон сайта: заливка (связанная с краями) = #F8F1E7, низ растворяется в фон."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, out = sys.argv[1], sys.argv[2]
fade = float(sys.argv[3]) if len(sys.argv) > 3 else 0.14   # доля высоты снизу под растворение
import os
BG = np.array([int(os.environ.get("BG", "F8F1E7")[i:i + 2], 16) for i in (0, 2, 4)], float)  # тёмная тема: BG=14100D
im = np.asarray(Image.open(src).convert("RGB")).astype(float)
d = np.abs(im - im[8:40, 8:40].reshape(-1, 3).mean(0)).max(-1)
near = d < 22
lab, _ = ndimage.label(near)
edge = set(np.unique(np.r_[lab[0], lab[:, 0], lab[:, -1]])) - {0}
m = np.isin(lab, list(edge))
m = ndimage.binary_opening(m, iterations=1)
g = int(os.environ.get("GROW", 0))                 # на тёмном фоне: съесть светлую кайму по контуру
if g: m = ndimage.binary_dilation(m, iterations=g)
a = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(float) / 255
h = im.shape[0]; y = np.arange(h)[:, None] / h
g = np.clip((y - (1 - fade)) / fade, 0, 1) ** 1.6          # плавный переход к фону внизу
w = im.shape[1]; x = np.arange(w)[None, :] / w
side = np.clip(1 - np.minimum(x, 1 - x) / 0.09, 0, 1) ** 1.4 * np.clip((y - 0.7) / 0.08, 0, 1)  # бока тротуара
a = np.maximum(np.maximum(a, g), side)[..., None]
res = im * (1 - a) + BG * a
Image.fromarray(res.clip(0, 255).astype(np.uint8)).save(out, quality=92)
print("bg share", m.mean())
