from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test root
root_res = client.get("/")
assert root_res.status_code == 200
print("Root health check:", root_res.json())

# Test user example
payload = {
    "text": "We need to finish the final project presentation for the review meeting on 10 November at 10am. Before that, ask Rahul to review the slides and test the demo code tomorrow at 4pm. Submit the abstract by 8 November at 5pm."
}
res = client.post("/api/parse", json=payload)
assert res.status_code == 200, res.text
data = res.json()

print(f"Total extracted tasks: {data['total_tasks']}")
for t in data["tasks"]:
    print(f"  * [{t['type']}] {t['task']}")
    print(f"    Date: {t['date_display']} | Time: {t['time_display']} | Priority: {t['priority']}")

print("\nDay Summary:", data["day_summary"])

