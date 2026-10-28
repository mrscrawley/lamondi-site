# Фото блюда сверху на светлом фоне -> то же блюдо на ровном цвете сайта, без тени.
# Фон вместе с исходной тенью (бесцветные пиксели, связанные с краем) заливается цветом сайта.
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops
src, dst = sys.argv[1], sys.argv[2]
tol = int(sys.argv[3]) if len(sys.argv) > 3 else 48
BG = (248, 241, 231)
im = Image.open(src).convert("RGB"); w, h = im.size
# фон = бесцветные светлые пиксели (белый фон и серая тень), связанные с краем кадра
r, g, b = im.split()
mx = ImageChops.lighter(ImageChops.lighter(r, g), b); mn = ImageChops.darker(ImageChops.darker(r, g), b)
sat = ImageChops.subtract(mx, mn)
neutral = ImageChops.multiply(sat.point(lambda v: 255 if v < tol else 0), mx.point(lambda v: 255 if v > 100 else 0))
neutral = neutral.convert("L")
for p in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
    if neutral.getpixel(p) == 255:
        ImageDraw.floodfill(neutral, p, 128)
bg = neutral.point(lambda v: 255 if v == 128 else 0)
obj = ImageChops.invert(bg).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
out = Image.new("RGB", im.size, BG)
out = Image.composite(im, out, obj)
out.save(dst, quality=90)
print(dst)
