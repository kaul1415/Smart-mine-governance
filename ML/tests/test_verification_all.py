import sys
import os
import json
import httpx
import pymupdf

BACKEND_URL = "http://127.0.0.1:5000/api"
ML_URL = "http://127.0.0.1:8001"

def test_user_chat_isolation():
    print("\n--- 1. Testing User Chat Isolation (Contractor vs Regulator) ---")
    
    # 1. Contractor creates a temporary chat
    headers_contractor = {"X-User-Id": "u5", "Authorization": "Bearer mock-token-u5", "Content-Type": "application/json"}
    r1 = httpx.post(f"{BACKEND_URL}/sessions", headers=headers_contractor, json={"title": "Contractor Mining Plan", "isPersistent": False})
    assert r1.status_code == 201, f"Failed creating contractor session: {r1.text}"
    c_session_id = r1.json()["session"]["id"]
    print(f"Contractor session created: {c_session_id}")

    # 2. Regulator creates a temporary chat
    headers_regulator = {"X-User-Id": "u6", "Authorization": "Bearer mock-token-u6", "Content-Type": "application/json"}
    r2 = httpx.post(f"{BACKEND_URL}/sessions", headers=headers_regulator, json={"title": "Regulator Inspection Review", "isPersistent": False})
    assert r2.status_code == 201, f"Failed creating regulator session: {r2.text}"
    reg_session_id = r2.json()["session"]["id"]
    print(f"Regulator session created: {reg_session_id}")

    # 3. Contractor fetches sessions -> MUST NOT SEE regulator's session!
    r3 = httpx.get(f"{BACKEND_URL}/sessions", headers=headers_contractor)
    assert r3.status_code == 200
    c_list = r3.json()["sessions"]
    c_ids = [s["id"] for s in c_list]
    assert c_session_id in c_ids, "Contractor should see own session"
    assert reg_session_id not in c_ids, "CRITICAL LEAK: Contractor sees Regulator session!"
    print(f"PASS: Contractor sees ONLY contractor sessions ({len(c_ids)} sessions)")

    # 4. Regulator fetches sessions -> MUST NOT SEE contractor's session!
    r4 = httpx.get(f"{BACKEND_URL}/sessions", headers=headers_regulator)
    assert r4.status_code == 200
    reg_list = r4.json()["sessions"]
    reg_ids = [s["id"] for s in reg_list]
    assert reg_session_id in reg_ids, "Regulator should see own session"
    assert c_session_id not in reg_ids, "CRITICAL LEAK: Regulator sees Contractor session!"
    print(f"PASS: Regulator sees ONLY regulator sessions ({len(reg_ids)} sessions)")

    # 5. Contractor logs out -> clear temporary sessions
    r5 = httpx.post(f"{BACKEND_URL}/sessions/clear", headers=headers_contractor)
    assert r5.status_code == 200
    print("Contractor logged out; temporary sessions cleared.")

    # 6. Verify contractor sessions now empty
    r6 = httpx.get(f"{BACKEND_URL}/sessions", headers=headers_contractor)
    assert r6.status_code == 200
    assert len(r6.json()["sessions"]) == 0, "Contractor sessions should be wiped on logout"
    print("PASS: Contractor temporary sessions wiped on logout")

    # 7. Verify regulator session STILL intact
    r7 = httpx.get(f"{BACKEND_URL}/sessions", headers=headers_regulator)
    assert r7.status_code == 200
    assert reg_session_id in [s["id"] for s in r7.json()["sessions"]], "Regulator session should remain active"
    print("PASS: Regulator sessions unaffected by contractor logout")

def test_donut_field_extraction():
    print("\n--- 2. Testing Donut Visual Document Field Extraction ---")
    
    # Create sample inspection form PDF using PyMuPDF
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842) # A4
    text = (
        "MINISTRY OF COAL - STATUTORY INSPECTION NOTICE\n\n"
        "Document Number: DOC-INSP-2024-99\n"
        "Lease ID: L-9042\n"
        "Lessee Name: Singareni Collieries\n"
        "Validity Date: 2035-12-31\n"
        "Inspection Status: Approved Compliant\n"
    )
    page.insert_text((50, 80), text, fontsize=14)
    pdf_bytes = doc.tobytes()
    doc.close()

    fields_to_extract = ["Lease ID", "Lessee Name", "Validity Date"]

    # 1. Direct ML endpoint test
    print("Sending PDF to ML POST /pdf/extract-fields...")
    files = {"file": ("inspection_notice.pdf", pdf_bytes, "application/pdf")}
    data = {"fields": json.dumps(fields_to_extract), "page": 0, "use_cache": "true"}
    
    r = httpx.post(f"{ML_URL}/pdf/extract-fields", files=files, data=data, timeout=180.0)
    assert r.status_code == 200, f"ML extract failed: {r.text}"
    res = r.json()
    print("ML Response:", json.dumps(res, indent=2))
    assert res["success"] is True
    assert res["cached"] is False
    assert "extracted_fields" in res
    print(f"PASS: Donut extraction complete in {res['inference_time_ms']}ms")

    # 2. Test SHA-256 Cache Hit (Instant response)
    print("\nTesting instant SHA-256 cache hit...")
    files2 = {"file": ("inspection_notice.pdf", pdf_bytes, "application/pdf")}
    r2 = httpx.post(f"{ML_URL}/pdf/extract-fields", files=files2, data=data, timeout=10.0)
    assert r2.status_code == 200
    res2 = r2.json()
    print("Cache Response:", json.dumps(res2, indent=2))
    assert res2["cached"] is True
    print(f"PASS: Instant cache hit verified! (cached=True, key={res2['cache_key']})")

    # 3. Test through Node Backend POST /api/documents/extract-fields
    print("\nTesting through Node Backend POST /api/documents/extract-fields...")
    files_be = {"file": ("inspection_notice.pdf", pdf_bytes, "application/pdf")}
    data_be = {"fields": json.dumps(fields_to_extract), "page": 0}
    r_be = httpx.post(f"{BACKEND_URL}/documents/extract-fields", files=files_be, data=data_be, timeout=60.0)
    assert r_be.status_code == 200, f"Backend route failed: {r_be.text}"
    be_res = r_be.json()
    assert be_res["success"] is True
    print(f"PASS: Backend endpoint /api/documents/extract-fields working properly!")

if __name__ == "__main__":
    test_user_chat_isolation()
    test_donut_field_extraction()
    print("\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===")
