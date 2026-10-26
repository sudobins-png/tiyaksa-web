#!/usr/bin/env python3
"""Build the link-preview images in public/og/ from the clean crops in
scripts/og-src/ — each gets a brand band at the bottom: logo, name, tagline
and the main phone number, so the number is visible in Telegram/WhatsApp/VK
previews even when the text under them is cut off.

    python3 scripts/make-og-images.py

Sources are 1200×630 crops of the site's own photos (see lib/seo/metadata.ts
for which page uses which). Fonts: Arial from macOS — any TTF with Cyrillic
works, pass FONT_DIR to override.
"""
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'scripts' / 'og-src'
OUT = ROOT / 'public' / 'og'
LOGO = ROOT / 'public' / 'logo-mini.png'
FONT_DIR = Path(os.environ.get('FONT_DIR', '/System/Library/Fonts/Supplemental'))

PHONE = '+7 (981) 891-66-02'  # siteConfig.phone
TAGLINE = 'Ремонт квартир под ключ в Санкт-Петербурге'

FOREST = (27, 79, 27)      # #1B4F1B
GOLD = (240, 180, 41)      # #F0B429
SAGE = (141, 190, 46)      # #8DBE2E
WHITE = (255, 255, 255)

W, H = 1200, 630
BAND_H = 132


def font(name, size):
    return ImageFont.truetype(str(FONT_DIR / name), size)


def build(src: Path, dst: Path):
    img = Image.open(src).convert('RGB').resize((W, H))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, H - BAND_H, W, H], fill=FOREST)
    # thin gold rule on top of the band
    draw.rectangle([0, H - BAND_H, W, H - BAND_H + 4], fill=GOLD)

    pad = 40
    logo = Image.open(LOGO).convert('RGBA')
    # The logo is green itself — on a white tile so it doesn't sink into the band.
    tile = 92
    logo_h = 72
    logo = logo.resize((round(logo.width * logo_h / logo.height), logo_h))
    band_top = H - BAND_H + 4
    tile_y = band_top + (BAND_H - 4 - tile) // 2
    draw.rounded_rectangle([pad, tile_y, pad + tile, tile_y + tile], radius=18, fill=WHITE)
    img.paste(logo, (pad + (tile - logo.width) // 2, tile_y + (tile - logo_h) // 2), logo)
    logo_y = tile_y

    bold = font('Arial Bold.ttf', 40)
    regular = font('Arial.ttf', 24)
    x = pad + tile + 24
    y = logo_y + 2
    # «ТиЯКСа.Ремонт» — same colours as the light Logo variant
    for text, color in (('ТиЯКСа', WHITE), ('.', GOLD), ('Ремонт', SAGE)):
        draw.text((x, y), text, font=bold, fill=color)
        x += draw.textlength(text, font=bold)
    draw.text((pad + tile + 24, y + 50), TAGLINE, font=regular, fill=(255, 255, 255, 220))

    phone_font = font('Arial Bold.ttf', 42)
    pw = draw.textlength(PHONE, font=phone_font)
    draw.text((W - pad - pw, band_top + (BAND_H - 4 - 42) // 2 - 4), PHONE, font=phone_font, fill=GOLD)

    img.save(dst, 'JPEG', quality=85, optimize=True, progressive=True)
    print(f'{dst.relative_to(ROOT)}  {dst.stat().st_size // 1024} KB')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sources = sorted(SRC.glob('*.jpg'))
    if not sources:
        sys.exit(f'no sources in {SRC}')
    for src in sources:
        build(src, OUT / src.name)


if __name__ == '__main__':
    main()
