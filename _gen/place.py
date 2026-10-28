# Блюдо на ровный фон сайта. Форму берём из вырезки Higgsfield (её альфа-канал,
# доведённый до «всё, что хоть немного объект — непрозрачно»), а пиксели — из исходного
# кадра, поэтому светлые места блюда и тарелки не становятся полупрозрачными.
import sys
from PIL import Image, ImageFilter
src, cut, dst = sys.argv[1], sys.argv[2], sys.argv[3]
BG = (248, 241, 231)
im = Image.open(src).convert("RGB")
a = Image.open(cut).convert("RGBA").split()[-1].resize(im.size)
m = a.point(lambda v: 255 if v > 24 else 0)
# заполнить «дыры» внутри силуэта: всё, что не связано с краем кадра, — объект
from PIL import ImageDraw
holes = m.copy()
ImageDraw.floodfill(holes, (0, 0), 128)
m = holes.point(lambda v: 0 if v == 128 else 255)
m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
out = Image.composite(im, Image.new("RGB", im.size, BG), m)
out.save(dst, quality=90)
print(dst)
