import httpx

sample_doc = (
    "DGMS Standard Operating Procedure 2024 (Coal Mines Regulation 104):\n"
    "Section 1.1: All open-cast coal mines in Jharkhand and Odisha must conduct methane gas monitoring twice daily. "
    "Section 1.2: In case methane concentration exceeds 0.75 percent, all electrical machinery and heavy earth-moving "
    "equipment in that pit section must be de-energized immediately, and the Area Safety Officer must be alerted. "
    "Section 1.3: Fire suppression water cannons must maintain minimum 6 bar line pressure at all active face points."
)

print("1. Ingesting test document into RAG...")
with httpx.Client(timeout=60.0) as client:
    ingest_res = client.post(
        "http://127.0.0.1:8001/rag/ingest",
        data={"text": sample_doc, "filename": "DGMS_Safety_SOP_2024.txt"},
    )
    print("Ingest status:", ingest_res.status_code)
    print("Ingest response:", ingest_res.json())

    print("\n2. Querying RAG index for: 'When must equipment be de-energized?'...")
    query_res = client.post(
        "http://127.0.0.1:8001/rag/query",
        json={"query": "When must electrical equipment be de-energized due to methane?", "top_k": 2},
    )
    print("Query status:", query_res.status_code)
    query_data = query_res.json()
    chunks = query_data.get("chunks", [])
    print(f"Retrieved {len(chunks)} chunks:")
    for idx, c in enumerate(chunks):
        print(f"  [{idx + 1}] (Score: {c['score']:.4f}) File: {c['filename']}")
        print(f"      Excerpt: {c['content'][:150]}...")
