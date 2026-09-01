import urllib.request
import json
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://review.welurik.com/api/ai/generate"
topics = ["Coffee Quality", "Fresh Bakery Items", "Fast Wi-Fi & Work Friendly"]
services = ["Specialty Coffee", "Artisan Bakery"]

print("=== GENERATING 5 CONSECUTIVE REVIEWS TO VERIFY DIVERSITY ===")
for i in range(1, 6):
    payload = {
        "businessSlug": "the-coffee-house",
        "rating": 5,
        "selectedTopics": topics,
        "selectedServices": services,
        "tone": "natural"
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            data = json.loads(r.read().decode("utf-8"))
            print(f"\n[Review #{i}] - Source: {data.get('source')}")
            print(f"\"{data.get('review')}\"")
    except Exception as e:
        print(f"Error on review {i}:", e)
    time.sleep(1)
