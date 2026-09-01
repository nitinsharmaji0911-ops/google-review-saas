import urllib.request
import json
import time

BASE_URL = "https://review.welurik.com"

run_id = int(time.time())
email = f"debug_{run_id}@welurik.test"
password = "Password123!"

def get_cookie(headers):
    for h in headers.get_all('Set-Cookie') or []:
        for part in h.split(';'):
            part = part.strip()
            if part.startswith('review_saas_session='):
                return part
    return ''

# 1. Signup
req = urllib.request.Request(
    f"{BASE_URL}/api/auth/signup",
    data=json.dumps({"email": email, "password": password}).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)
res = urllib.request.urlopen(req)
cookie = get_cookie(res.headers)
print("Signed up, cookie:", cookie[:30])

# 2. Create Business
biz_name = f"Debug Dental {run_id}"
req_biz = urllib.request.Request(
    f"{BASE_URL}/api/business/me",
    data=json.dumps({
        "name": biz_name,
        "category": "clinic",
        "googleReviewUrl": "https://g.page/r/test",
        "services": ["Teeth"],
        "topics": ["Painless"]
    }).encode('utf-8'),
    headers={"Content-Type": "application/json", "Cookie": cookie},
    method="PUT"
)
res_biz = urllib.request.urlopen(req_biz)
biz_res = json.loads(res_biz.read().decode('utf-8'))
slug = biz_res.get('business', {}).get('slug')
print("Business created, slug:", slug)

# 3. Submit Feedback
req_fb = urllib.request.Request(
    f"{BASE_URL}/api/feedback",
    data=json.dumps({
        "businessSlug": slug,
        "customerName": "John Tester",
        "customerPhone": "+91 99999 88888",
        "customerEmail": "john@example.com",
        "message": "Wait time was a bit high.",
        "issueTopics": ["Wait Time"]
    }).encode('utf-8'),
    headers={"Content-Type": "application/json"},
    method="POST"
)
res_fb = urllib.request.urlopen(req_fb)
fb_post_res = json.loads(res_fb.read().decode('utf-8'))
print("Feedback POST response:", fb_post_res)

# 4. Fetch Feedback Inbox
req_inbox = urllib.request.Request(
    f"{BASE_URL}/api/feedback",
    headers={"Cookie": cookie}
)
res_inbox = urllib.request.urlopen(req_inbox)
inbox_res = json.loads(res_inbox.read().decode('utf-8'))
print("Feedback GET response:", inbox_res)
