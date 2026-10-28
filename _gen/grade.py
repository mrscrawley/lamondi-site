"""Светлее и теплее фото блюд, фон цвета сайта не трогаем.
   python3 grade.py src dst — src берётся из _gen/pre_grade (исходник до грейдинга)."""
import sys
import numpy as np
from PIL import Image, ImageFilter

BG = np.array([248, 241, 231], float)
src, dst = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert("RGB")).astype(float) / 255

# тени и середина вверх (гамма), лёгкий контраст, тепло, чуть насыщенности
x = im ** 0.85
x = np.clip((x - 0.5) * 1.05 + 0.5, 0, 1)
x[..., 0] *= 1.035; x[..., 2] *= 0.965
g = x.mean(axis=2, keepdims=True)
x = np.clip(g + (x - g) * 1.12, 0, 1)

# фон: где пиксель уже цвета сайта — оставляем как было (мягкий переход по расстоянию)
d = np.abs(im * 255 - BG).max(axis=2)
w = np.clip((d - 4) / 14, 0, 1)
w = np.asarray(Image.fromarray((w * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(float)[..., None] / 255
out = im * (1 - w) + x * w
Image.fromarray((out * 255 + .5).astype(np.uint8)).save(dst, quality=88, optimize=True, progressive=True)
