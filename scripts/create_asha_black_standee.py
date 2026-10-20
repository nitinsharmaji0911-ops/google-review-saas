import math
import os
from PIL import Image, ImageDraw, ImageFont

artifact_dir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82"
public_dir = "e:/anti/google review app/public"

width = 800
height = 1200

try:
    font_eyebrow = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 19)
    font_title = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 44)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 28)
    font_desc = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
    font_pill = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    font_footer = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 20)
    font_footersub = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
    font_brand = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 18)
except Exception:
    font_eyebrow = font_title = font_sub = font_desc = font_pill = font_footer = font_footersub = font_brand = ImageFont.load_default()

def draw_stars(draw, cy=194):
    star_spacing = 42
    start_x = width // 2 - 2 * star_spacing
    for i in range(5):
        cx = start_x + i * star_spacing
        coords = []
        for s in range(10):
            r = 16 if s % 2 == 0 else 7.5
            angle = math.pi / 2 * 3 + s * (math.pi / 5)
            coords.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
        draw.polygon(coords, fill=(245, 158, 11))

def create_asha_black_standee():
    img = Image.new('RGB', (width, height), color=(8, 8, 10))
    draw = ImageDraw.Draw(img)

    # Ultra-subtle luxury dark obsidian gradient
    for y in range(height):
        ratio = y / height
        v = int(14 * (1 - ratio) + 6 * ratio)
        draw.line([(0, y), (width, y)], fill=(v, v, v + 2))

    # Elegant gold/metallic outer border
    draw.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(245, 158, 11, 140), width=2)

    # Top Eyebrow Tag
    bw, bh = 530, 42
    bx, by = (width - bw) // 2, 50
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=21, fill=(22, 22, 26), outline=(245, 158, 11), width=1)
    draw.text((width // 2, by + bh // 2), "HOTEL & YATRI NIVAS  •  LAXMIPURI, KOLHAPUR", fill=(253, 230, 138), font=font_eyebrow, anchor="mm")

    # Business Title
    draw.text((width // 2, 134), "Asha Yatry Nivas", fill=(255, 255, 255), font=font_title, anchor="mm")

    # 5 Gold Stars
    draw_stars(draw, 194)

    # High-contrast White QR Container
    cw, ch = 540, 540
    cx, cy = (width - cw) // 2, 242
    draw.rounded_rectangle([cx - 4, cy - 4, cx + cw + 4, cy + ch + 4], radius=36, fill=(245, 158, 11, 90))
    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=32, fill=(255, 255, 255))

    qr_path = os.path.join(public_dir, "asha-yatry-nivas-qr.png")
    if os.path.exists(qr_path):
        qr_img = Image.open(qr_path).resize((480, 480), Image.Resampling.LANCZOS)
        img.paste(qr_img, ((width - 480) // 2, cy + 30))

    # Headings & Instructions
    draw.text((width // 2, 835), "Loved Your Stay in Kolhapur?", fill=(245, 158, 11), font=font_sub, anchor="mm")
    draw.text((width // 2, 885), "Scan with your phone camera to leave a quick 5-star Google review", fill=(255, 255, 255), font=font_desc, anchor="mm")
    draw.text((width // 2, 918), "and share your experience with our clean rooms, hot water & hospitality!", fill=(212, 212, 216), font=font_desc, anchor="mm")

    # Micro Trust Pillars
    pills = ["Clean & Sanitized Rooms", "Near Mahalaxmi Mandir", "24/7 Hot Water & Care"]
    pw, ph, sp = 224, 38, 12
    tot_w = len(pills) * pw + (len(pills) - 1) * sp
    start_px = (width - tot_w) // 2
    py = 970
    for i, p in enumerate(pills):
        px = start_px + i * (pw + sp)
        draw.rounded_rectangle([px, py, px + pw, py + ph], radius=19, fill=(20, 20, 24), outline=(245, 158, 11), width=1)
        draw.text((px + pw // 2, py + ph // 2), p, fill=(253, 230, 138), font=font_pill, anchor="mm")

    # Divider line
    draw.line([(80, 1045), (width - 80, 1045)], fill=(60, 60, 68), width=1)

    # Footer
    draw.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
    draw.text((width // 2, 1120), "review.welurik.com/r/asha-yatry-nivas", fill=(245, 158, 11), font=font_footersub, anchor="mm")
    draw.text((width // 2, 1150), "Asha Yatry Nivas  |  Laxmipuri, Kolhapur  |  Family & Pilgrim Stay", fill=(161, 161, 170), font=font_footersub, anchor="mm")

    # Save to artifacts and public
    filenames = [
        "asha-yatry-nivas-black-standee.png",
        "asha-yatry-nivas-standee.png"
    ]
    for fn in filenames:
        img.save(os.path.join(artifact_dir, fn), quality=95)
        img.save(os.path.join(public_dir, fn), quality=95)
        print(f"SUCCESS: Saved {fn}")

if __name__ == "__main__":
    create_asha_black_standee()
