"""done/*.jpg → assets/img/sushi/<n>.jpg (крупно) и <n>-s.jpg (миниатюра, вплотную к доске)."""
import glob, os
import numpy as np
from PIL import Image
BG = (248, 241, 231)
out = "../../assets/img/sushi"; os.makedirs(out, exist_ok=True)
for f in sorted(glob.glob("done/*.jpg")):
    n = os.path.basename(f)[:-4]
    if "_" in n or n in ("mix-g1", "mix-g2", "mix-r1", "mix-r2"): continue
    im = Image.open(f).convert("RGB"); a = np.asarray(im).astype(int)
    m = np.abs(a - np.array(BG)).max(axis=2) > 10
    ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    p = int(max(x1 - x0, y1 - y0) * .05)
    big = im.crop((max(0, x0 - p), max(0, y0 - p), min(im.width, x1 + p), min(im.height, y1 + p)))
    big.thumbnail((1400, 1400)); big.save(f"{out}/{n}.jpg", quality=86, optimize=True, progressive=True)
    # миниатюра 3:2: доска целиком, вписана с небольшим полем
    th = Image.new("RGB", (330, 220), BG); bd = im.crop((x0, y0, x1, y1))
    bd.thumbnail((330 - 16, 220 - 16), Image.LANCZOS)
    th.paste(bd, ((330 - bd.width) // 2, (220 - bd.height) // 2))
    th.save(f"{out}/{n}-s.jpg", quality=84, optimize=True)
    print(n, end=" ")
