# Блюдо, снятое сверху на ровном тёмно-угольном фоне -> то же блюдо на цвете сайта.
# Фон = пиксели, близкие к цвету края кадра и связанные с краем (белая тарелка и еда не задеваются).
# Затем кадр обрезается по блюду с полями и приводится к квадрату.
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops
src, dst = sys.argv[1], sys.argv[2]
TOL = int(sys.argv[3]) if len(sys.argv) > 3 else 42      # допуск по цвету от фона
BG = (248, 241, 231)
im = Image.open(src).convert("RGB"); w, h = im.size
# эталон фона — медиана пикселей по краю кадра; фон = близкие к нему по цвету
border = [im.getpixel((x, y)) for x in range(0, w, 8) for y in (2, h - 3)] + \
         [im.getpixel((x, y)) for y in range(0, h, 8) for x in (2, w - 3)]
ref = [sorted(c[i] for c in border)[len(border) // 2] for i in range(3)]
diff = ImageChops.difference(im, Image.new("RGB", im.size, tuple(ref)))
dr, dg, db = diff.split()
dist = ImageChops.lighter(ImageChops.lighter(dr, dg), db)
cand = dist.point(lambda v: 255 if v < TOL else 0)
for x in range(0, w, 32):
    for y in (0, h - 1):
        if cand.getpixel((x, y)) == 255: ImageDraw.floodfill(cand, (x, y), 128)
for y in range(0, h, 32):
    for x in (0, w - 1):
        if cand.getpixel((x, y)) == 255: ImageDraw.floodfill(cand, (x, y), 128)
bg = cand.point(lambda v: 255 if v == 128 else 0)
obj = ImageChops.invert(bg)
# оставить только сам объект — область, связанную с центром кадра (без отдельных крошек и пятен)
core = obj.copy(); ImageDraw.floodfill(core, (w // 2, h // 2), 128)
obj = core.point(lambda v: 255 if v == 128 else 0)
obj = obj.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
out = Image.composite(im, Image.new("RGB", im.size, BG), obj)
# квадрат с полями ~9% вокруг блюда
bb = obj.point(lambda v: 255 if v > 128 else 0).getbbox()
cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
side = max(bb[2] - bb[0], bb[3] - bb[1]) * 1.18
canvas = Image.new("RGB", (round(side), round(side)), BG)
canvas.paste(out.crop(bb), (round(side / 2 - (bb[2] - bb[0]) / 2), round(side / 2 - (bb[3] - bb[1]) / 2)))
canvas.resize((1600, 1600), Image.LANCZOS).save(dst, quality=88)
print(dst, bb, f"фон {100 * bg.histogram()[255] / (w * h):.0f}%")
