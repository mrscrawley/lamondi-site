"""assets/img/**.jpg → .webp (+ -800.webp для широких). Запускать после любой замены фото."""
import glob
from PIL import Image
for f in sorted(glob.glob("assets/img/**/*.jpg", recursive=True)):
    im = Image.open(f).convert("RGB"); base = f[:-4]
    im.save(base + ".webp", "WEBP", quality=80, method=6)
    if im.width > 1000 and not base.endswith("-s"):
        s = im.copy(); s.thumbnail((800, 10000), Image.LANCZOS); s.save(base + "-800.webp", "WEBP", quality=78, method=6)
