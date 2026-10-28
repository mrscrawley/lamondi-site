# Блюдо на деревянной доске, снятое сверху на тёмном фоне -> доска на цвете сайта.
# Маска строится построчно: в каждой строке — от первого до последнего «деревянного» пикселя
# (тень доски и фон отсекаются; тёмные нори внутри доски не страдают). Итог — квадрат 1600 с полями.
import sys
from PIL import Image, ImageDraw, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
BG = (248, 241, 231)
im = Image.open(src).convert("RGB"); w, h = im.size; px = im.load()
def woody(p): return max(p) - min(p) > 40 and max(p) > 110
mask = Image.new("L", (w, h), 0); d = ImageDraw.Draw(mask)
for y in range(h):
    row = [woody(px[x, y]) for x in range(w)]
    l = next((x for x in range(w - 6) if all(row[x:x + 6])), None)
    r = next((x for x in range(w - 1, 5, -1) if all(row[x - 5:x + 1])), None)
    if l is not None and r is not None and r - l > w * 0.4:
        d.line([(l, y), (r, y)], fill=255)
mask = mask.filter(ImageFilter.MedianFilter(9)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
bb = mask.point(lambda v: 255 if v > 128 else 0).getbbox()
out = Image.composite(im, Image.new("RGB", (w, h), BG), mask)
side = max(bb[2] - bb[0], bb[3] - bb[1]) * 1.18
c = Image.new("RGB", (round(side), round(side)), BG)
c.paste(out.crop(bb), (round(side / 2 - (bb[2] - bb[0]) / 2), round(side / 2 - (bb[3] - bb[1]) / 2)))
c.resize((1600, 1600), Image.LANCZOS).save(dst, quality=88)
print(dst, bb)
