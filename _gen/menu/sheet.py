import sys, glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob(f"done/{sys.argv[1]}*.jpg")); fs=[f for f in fs if "_" not in f.split("/")[-1]]
W=360; cols=4; rows=(len(fs)+cols-1)//cols
im=Image.new("RGB",(W*cols,(W+22)*rows),(248,241,231)); d=ImageDraw.Draw(im)
for i,f in enumerate(fs):
    a=Image.open(f); a.thumbnail((W-10,W-10)); x,y=(i%cols)*W,(i//cols)*(W+22)
    im.paste(a,(x+(W-a.width)//2,y+(W-a.height)//2)); d.text((x+8,y+W+4),f.split("/")[-1],fill=(0,0,0))
im.save(sys.argv[2],quality=85)
