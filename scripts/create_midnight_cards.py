import math
import os
from PIL import Image, ImageDraw, ImageFont

artifact_dir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82"
public_dir = "e:/anti/google review app/public"

font_eyebrow = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 14)
font_title = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 26)
font_title_small = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 23)
font_headline = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 19)
font_sub = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 14)
font_brand = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 14)
font_domain = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)

def draw_star(draw, cx, cy, r_outer, r_inner, fill):
    coords = []
    for s in range(10):
        r = r_outer if s % 2 == 0 else r_inner
        angle = math.pi / 2 * 3 + s * (math.pi / 5)
        coords.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
    draw.polygon(coords, fill=fill)

def generate_midnight_card(business_name, qr_filename, headline, out_filename):
    width, height = 560, 836
    img = Image.new('RGB', (width, height), color=(0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Eyebrow Tag: RATE YOUR EXPERIENCE
    eyebrow_text = "RATE YOUR EXPERIENCE"
    # letter spacing
    spaced_eyebrow = "  ".join(eyebrow_text.split())
    # Or draw characters with small tracking
    draw.text((width // 2, 74), eyebrow_text, fill=(251, 191, 36), font=font_eyebrow, anchor="mm")

    # 2. Business Title
    t_font = font_title if len(business_name) < 22 else font_title_small
    draw.text((width // 2, 118), business_name, fill=(255, 255, 255), font=t_font, anchor="mm")

    # 3. 5 Gold Stars
    star_spacing = 23
    start_x = width // 2 - 2 * star_spacing
    for i in range(5):
        cx = start_x + i * star_spacing
        draw_star(draw, cx, 164, 8.5, 4.0, (251, 191, 36))

    # 4. White Rounded QR Box
    box_w, box_h = 338, 338
    box_x = (width - box_w) // 2
    box_y = 204
    radius = 38
    draw.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + box_h], radius=radius, fill=(255, 255, 255))

    # Paste QR Code
    qr_path = os.path.join(public_dir, qr_filename)
    if os.path.exists(qr_path):
        qr_img = Image.open(qr_path).convert('RGB')
        qr_size = 282
        qr_resized = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
        qr_x = (width - qr_size) // 2
        qr_y = box_y + (box_h - qr_size) // 2
        img.paste(qr_resized, (qr_x, qr_y))

    # 5. Headline Prompt
    draw.text((width // 2, 604), headline, fill=(251, 191, 36), font=font_headline, anchor="mm")

    # 6. Subtitle Instructions
    line1 = "Scan with your phone to leave a quick 5-star Google review"
    line2 = "& support our team!"
    draw.text((width // 2, 642), line1, fill=(156, 163, 175), font=font_sub, anchor="mm")
    draw.text((width // 2, 664), line2, fill=(156, 163, 175), font=font_sub, anchor="mm")

    # 7. Divider Line
    draw.line([(48, 754), (width - 48, 754)], fill=(39, 44, 53), width=1)

    # 8. Footer (Welurik Logo + Powered by Welurik + review.welurik.com)
    logo_path = os.path.join(public_dir, "welurik-logo.png")
    if os.path.exists(logo_path):
        logo_img = Image.open(logo_path).convert('RGBA')
        logo_resized = logo_img.resize((22, 22), Image.Resampling.LANCZOS)
        img.paste(logo_resized, (54, 767), logo_resized)

    draw.text((82, 778), "Powered by Welurik", fill=(255, 255, 255), font=font_brand, anchor="lm")
    draw.text((width - 54, 778), "review.welurik.com", fill=(156, 163, 175), font=font_domain, anchor="rm")

    # Save to artifact and public directory
    out_artifact = os.path.join(artifact_dir, out_filename)
    out_public = os.path.join(public_dir, out_filename)
    img.save(out_artifact, quality=98)
    img.save(out_public, quality=98)
    print(f"SUCCESS: Saved {out_filename}")

# Generate Asha Yatry Nivas
generate_midnight_card(
    business_name="Asha Yatry Nivas",
    qr_filename="asha-yatry-nivas-qr.png",
    headline="Enjoyed your stay at Asha Yatry Nivas?",
    out_filename="asha-yatry-nivas-midnight-card.png"
)


# Generate Adventure Wave Experience
generate_midnight_card(
    business_name="Adventure Wave Experience",
    qr_filename="adventure-wave-experience-qr.png",
    headline="Enjoyed your water adventure?",
    out_filename="adventure-wave-experience-midnight-card.png"
)

# Generate Axon Accounting
generate_midnight_card(
    business_name="Axon Accounting",
    qr_filename="axon-accounting-qr.png",
    headline="Happy with our accounting & tax services?",
    out_filename="axon-accounting-midnight-card.png"
)
