import io
import httpx

sample_text = (
    "DGMS Guideline on Ventilation and Water Cannons 2024:\n"
    "Water cannons deployed at coal loading points must operate at exactly 6 bar line pressure. "
    "Methane sensors must be calibrated every 14 days by a certified electrical supervisor."
)

print("1. Testing Backend POST /api/documents...")
with httpx.Client(timeout=60.0) as client:
    # Upload via multipart form
    files = {"file": ("ventilation_rules.txt", io.BytesIO(sample_text.encode("utf-8")), "text/plain")}
    upload_res = client.post("http://127.0.0.1:5000/api/documents", files=files)
    print("Upload status:", upload_res.status_code)
    print("Upload response:", upload_res.json())

    # Get documents list from backend
    print("\n2. Testing Backend GET /api/documents...")
    docs_res = client.get("http://127.0.0.1:5000/api/documents")
    print("Docs status:", docs_res.status_code)
    print("Docs response:", docs_res.json())

    # Ask question that requires the RAG document
    print("\n3. Testing Backend POST /api/chat with RAG question...")
    chat_payload = {
        "message": "According to the guideline, what line pressure is required for water cannons?",
        "isPersistent": False
    }
    answer = ""
    with client.stream("POST", "http://127.0.0.1:5000/api/chat", json=chat_payload) as r:
        print("Chat status:", r.status_code)
        for line in r.iter_lines():
            if line.startswith("data: "):
                import json
                try:
                    data = json.loads(line[6:])
                    if data.get("token"):
                        token = data["token"]
                        answer += token
                        print(token, end="", flush=True)
                except:
                    pass
    print("\n\nFull AI answer with RAG context:\n", answer)
