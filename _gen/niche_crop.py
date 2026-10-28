"""_gen/niches2/*.png → assets/img/niches/<name>.webp: квадрат точно по проёму ниши, одинаковое кадрирование."""
import glob, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
out = "assets/img/niches"; os.makedirs(out, exist_ok=True)
for f in sorted(glob.glob("_gen/niches2/*.png")):
    n = os.path.basename(f)[:-4]
    im = Image.open(f).convert("RGB"); a = np.asarray(im).astype(int)
    warm = (a[..., 0] - a[..., 2]) > 22          # тёплый свет внутри ниши, стена вокруг почти серая
    lab, k = ndimage.label(ndimage.binary_opening(warm, iterations=3))
    big = max(range(1, k + 1), key=lambda i: (lab == i).sum())
    ys, xs = np.where(lab == big)
    x0, x1, y0, y1 = np.percentile(xs, 1), np.percentile(xs, 99), np.percentile(ys, 1), np.percentile(ys, 99)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; s = max(x1 - x0, y1 - y0) / 2 * 1.0
    c = im.crop((int(cx - s), int(cy - s), int(cx + s), int(cy + s))).resize((320, 320), Image.LANCZOS)
    c.save(f"{out}/{n}.webp", "WEBP", quality=84); print(n, int(x0), int(x1), int(y0), int(y1))
