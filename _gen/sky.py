"""Убрать небо с фото здания: синие пиксели, связанные с верхним краем → фон сайта."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, out = sys.argv[1], sys.argv[2]
BG = np.array([0xF8, 0xF1, 0xE7], float)
im = np.asarray(Image.open(src).convert("RGB")).astype(float)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
blue = (b > r + 25) & (b > g + 5) & (b > 90)
lab, _ = ndimage.label(blue)
top = set(np.unique(lab[0])) - {0}
sky = np.isin(lab, list(top))
sky = ndimage.binary_closing(sky, iterations=2)
sky = ndimage.binary_fill_holes(sky | ~ndimage.binary_dilation(~sky, iterations=0)) if False else sky
# мягкий край
a = Image.fromarray((sky * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))
a = np.asarray(a).astype(float)[..., None] / 255
# синий ореол по краю: подтянуть к нейтрали
res = im * (1 - a) + BG * a
Image.fromarray(res.clip(0, 255).astype(np.uint8)).save(out, quality=92)
print("sky share", sky.mean())
