# Zieht aus Fotos eine ruhige Grundfarbe (Median der Pixel, aufgehellt) für die v2-Hero-Flächen.
# Aufruf: python tools/sample-colors.py name1 name2 ...   (Aufhellung per TINT=0.55, Standard 0.70)
import os
import sys
from PIL import Image, ImageStat

tint_factor = float(os.environ.get('TINT', '0.70'))
for name in sys.argv[1:]:
    im = Image.open(f'public/img/{name}-sm.webp').convert('RGB').resize((64, 64))
    med = ImageStat.Stat(im).median
    # Richtung Weiß, damit dunkle Schrift darauf lesbar bleibt
    tint = [round(c + (255 - c) * tint_factor) for c in med]
    print(name, '#%02x%02x%02x' % tuple(med), '#%02x%02x%02x' % tuple(tint))
