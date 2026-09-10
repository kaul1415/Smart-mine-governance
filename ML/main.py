import json
import logging
import os
import re
import sqlite3
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional
from contextlib import asynccontextmanager

import httpx
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    psycopg2 = None
    RealDictCursor = None
    HAS_PSYCOPG2 = False
import pypdf
import io
from pdf_processor import extract_fields_from_document, get_donut_pipeline

from config import (
    DATABASE_URL,
    HOST,
    OLLAMA_BASE_URL,
    OLLAMA_CHAT_MODEL,
    OLLAMA_EMBED_MODEL,
    PORT,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_service")

# Database connection helpers
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "rag_fallback.db")

def get_sqlite_conn():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_schema():
    conn = get_sqlite_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT,
            filename TEXT NOT NULL,
            content TEXT NOT NULL,
            embedding_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def get_db_connection():
    if not HAS_PSYCOPG2:
        return None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL via DATABASE_URL: {e}. Utilizing fallback local storage.")
        return None

def init_db_schema():
    init_sqlite_schema()
    conn = get_db_connection()
    if not conn:
        logger.info("PostgreSQL currently offline; fallback SQLite database initialized.")
        return
    try:
        cur = conn.cursor()
        try:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            conn.commit()
            has_vector = True
            logger.info("PostgreSQL 'vector' extension is active.")
        except Exception as e:
            conn.rollback()
            has_vector = False
            logger.info(f"Native 'vector' extension not active ({e}). Using JSON vector storage.")

        if has_vector:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id TEXT PRIMARY KEY,
                    document_id TEXT,
                    filename TEXT NOT NULL,
                    content TEXT NOT NULL,
                    embedding vector(768),
                    embedding_json JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id TEXT PRIMARY KEY,
                    document_id TEXT,
                    filename TEXT NOT NULL,
                    content TEXT NOT NULL,
                    embedding_json JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
        conn.commit()
        cur.close()
        conn.close()
        logger.info("PostgreSQL schema checked/initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing DB schema: {e}")
        if conn:
            conn.rollback()
            conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db_schema()
    try:
        logger.info("Initializing offline Donut visual document processor...")
        get_donut_pipeline()
    except Exception as e:
        logger.warning(f"Donut model preloading deferred: {e}")
    yield

app = FastAPI(title="CoalGov ML & AI Copilot Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class HistoryItem(BaseModel):
    role: str
    content: str

class ChatStreamRequest(BaseModel):
    sessionId: Optional[str] = None
    message: str
    history: Optional[List[HistoryItem]] = []
    systemPrompt: Optional[str] = None

class RagQueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 4

# Helper: embed text using Ollama
async def embed_text(text: str) -> List[float]:
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Ollama supports /api/embeddings or /api/embed
        resp = await client.post(
            f"{OLLAMA_BASE_URL}/api/embeddings",
            json={"model": OLLAMA_EMBED_MODEL, "prompt": text},
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("embedding", [])
        
        resp2 = await client.post(
            f"{OLLAMA_BASE_URL}/api/embed",
            json={"model": OLLAMA_EMBED_MODEL, "input": text},
        )
        if resp2.status_code == 200:
            data = resp2.json()
            embeddings = data.get("embeddings", [])
            if embeddings:
                return embeddings[0]
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate embeddings from Ollama: {resp.text}"
        )

# Helper: chunking
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    cleaned = re.sub(r'\s+', ' ', text).strip()
    if not cleaned:
        return []
    chunks = []
    start = 0
    text_len = len(cleaned)
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = cleaned[start:end]
        chunks.append(chunk)
        if end == text_len:
            break
        start += (chunk_size - overlap)
    return chunks

@app.get("/health")
async def health():
    ollama_status = "unreachable"
    models_available = []
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if res.status_code == 200:
                ollama_status = "connected"
                data = res.json()
                models_available = [m.get("name") for m in data.get("models", [])]
    except Exception as e:
        ollama_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "service": "ml_service",
        "ollama_url": OLLAMA_BASE_URL,
        "ollama_status": ollama_status,
        "chat_model": OLLAMA_CHAT_MODEL,
        "embed_model": OLLAMA_EMBED_MODEL,
        "models_available": models_available,
    }

@app.post("/chat/stream")
async def chat_stream(req: ChatStreamRequest):
    """
    Streams tokens from Ollama gemma3:1b back to client in SSE format.
    """
    messages = []
    
    # 1. System prompt
    system_text = req.systemPrompt or (
        "You are CoalGov AI Copilot, an expert assistant for Indian coal mining governance, "
        "safety compliance (DGMS regulations, Mines Act 1952), contractor management, and environmental monitoring. "
        "Provide direct, clear, and actionable answers. If context documents are provided, prioritize information from them."
    )
    messages.append({"role": "system", "content": system_text})
    
    # 2. Add history (limit to last 6 messages to stay within gemma3:1b context limit)
    if req.history:
        for item in req.history[-6:]:
            messages.append({"role": item.role, "content": item.content})
    
    # 3. Add latest user query
    messages.append({"role": "user", "content": req.message})

    async def token_generator() -> AsyncGenerator[str, None]:
        payload = {
            "model": OLLAMA_CHAT_MODEL,
            "messages": messages,
            "stream": True,
        }
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_BASE_URL}/api/chat",
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        err_text = await response.aread()
                        err_msg = json.dumps({"error": f"Ollama error: {err_text.decode('utf-8')}"})
                        yield f"data: {err_msg}\n\n"
                        return

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            chunk_data = json.loads(line)
                            content_piece = chunk_data.get("message", {}).get("content", "")
                            done = chunk_data.get("done", False)

                            out = json.dumps({"token": content_piece, "done": done})
                            yield f"data: {out}\n\n"

                            if done:
                                break
                        except Exception as parse_err:
                            logger.error(f"Error parsing Ollama stream chunk: {parse_err}")
        except Exception as conn_err:
            logger.error(f"Connection error to Ollama: {conn_err}")
            err_json = json.dumps({"error": f"Failed to communicate with Ollama: {str(conn_err)}"})
            yield f"data: {err_json}\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")

@app.post("/rag/ingest")
async def rag_ingest(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    filename: Optional[str] = Form(None),
):
    """
    Ingests a document (via file upload or raw text), extracts text,
    splits into chunks, generates nomic-embed-text embeddings, and persists.
    """
    doc_text = ""
    doc_name = filename or "document.txt"

    if file:
        doc_name = file.filename
        content_bytes = await file.read()
        if doc_name.lower().endswith(".pdf"):
            try:
                reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                pages_text = [page.extract_text() or "" for page in reader.pages]
                doc_text = "\n".join(pages_text)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")
        else:
            try:
                doc_text = content_bytes.decode("utf-8")
            except Exception:
                doc_text = content_bytes.decode("latin-1", errors="ignore")
    elif text:
        doc_text = text
    else:
        raise HTTPException(status_code=400, detail="Must provide either a file or text.")

    if not doc_text.strip():
        raise HTTPException(status_code=400, detail="Document contains no readable text.")

    chunks = chunk_text(doc_text, chunk_size=500, overlap=50)
    if not chunks:
        raise HTTPException(status_code=400, detail="Unable to create chunks from document.")

    doc_id = str(uuid.uuid4())
    conn = get_db_connection()
    ingested_count = 0

    if conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'document_chunks' AND column_name = 'embedding';
        """)
        has_native_vector = cur.fetchone() is not None

        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}-{i}"
            embedding = await embed_text(chunk)
            embedding_json = json.dumps(embedding)

            if has_native_vector:
                cur.execute("""
                    INSERT INTO document_chunks (id, document_id, filename, content, embedding, embedding_json)
                    VALUES (%s, %s, %s, %s, %s::vector, %s)
                """, (chunk_id, doc_id, doc_name, chunk, str(embedding), embedding_json))
            else:
                cur.execute("""
                    INSERT INTO document_chunks (id, document_id, filename, content, embedding_json)
                    VALUES (%s, %s, %s, %s, %s)
                """, (chunk_id, doc_id, doc_name, chunk, embedding_json))

            ingested_count += 1

        conn.commit()
        cur.close()
        conn.close()
    else:
        # Fallback to local SQLite storage
        sconn = get_sqlite_conn()
        scur = sconn.cursor()
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}-{i}"
            embedding = await embed_text(chunk)
            embedding_json = json.dumps(embedding)
            scur.execute("""
                INSERT INTO document_chunks (id, document_id, filename, content, embedding_json)
                VALUES (?, ?, ?, ?, ?)
            """, (chunk_id, doc_id, doc_name, chunk, embedding_json))
            ingested_count += 1
        sconn.commit()
        scur.close()
        sconn.close()

    return {
        "success": True,
        "document_id": doc_id,
        "filename": doc_name,
        "chunks_count": ingested_count,
    }

@app.post("/rag/query")
async def rag_query(req: RagQueryRequest):
    """
    Embeds query, searches PostgreSQL document_chunks by cosine similarity,
    and returns top-k matching chunks.
    """
    if not req.query.strip():
        return {"chunks": []}

    query_embedding = await embed_text(req.query)
    top_k = req.top_k or 4

    conn = get_db_connection()
    results = []

    if conn:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'document_chunks' AND column_name = 'embedding';
        """)
        has_native_vector = cur.fetchone() is not None

        if has_native_vector:
            try:
                cur.execute("""
                    SELECT id, document_id, filename, content, 
                           (1 - (embedding <=> %s::vector)) AS score
                    FROM document_chunks
                    ORDER BY embedding <=> %s::vector
                    LIMIT %s;
                """, (str(query_embedding), str(query_embedding), top_k))
                rows = cur.fetchall()
                for r in rows:
                    results.append({
                        "id": r["id"],
                        "document_id": r["document_id"],
                        "filename": r["filename"],
                        "content": r["content"],
                        "score": float(r["score"]) if r["score"] is not None else 0.0,
                    })
            except Exception as e:
                logger.warning(f"Native pgvector search failed ({e}), falling back to Python cosine search.")
                has_native_vector = False

        if not has_native_vector:
            cur.execute("SELECT id, document_id, filename, content, embedding_json FROM document_chunks;")
            rows = cur.fetchall()
            if rows:
                q_vec = np.array(query_embedding, dtype=np.float32)
                q_norm = np.linalg.norm(q_vec)
                scored = []
                for r in rows:
                    if not r.get("embedding_json"):
                        continue
                    c_vec = np.array(r["embedding_json"], dtype=np.float32)
                    c_norm = np.linalg.norm(c_vec)
                    if q_norm > 0 and c_norm > 0:
                        cos_sim = float(np.dot(q_vec, c_vec) / (q_norm * c_norm))
                    else:
                        cos_sim = 0.0
                    scored.append({
                        "id": r["id"],
                        "document_id": r["document_id"],
                        "filename": r["filename"],
                        "content": r["content"],
                        "score": cos_sim,
                    })
                scored.sort(key=lambda x: x["score"], reverse=True)
                results = scored[:top_k]

        cur.close()
        conn.close()
    else:
        # Query local SQLite fallback storage
        sconn = get_sqlite_conn()
        scur = sconn.cursor()
        scur.execute("SELECT id, document_id, filename, content, embedding_json FROM document_chunks")
        rows = scur.fetchall()
        if rows:
            q_vec = np.array(query_embedding, dtype=np.float32)
            q_norm = np.linalg.norm(q_vec)
            scored = []
            for r in rows:
                c_json = r["embedding_json"]
                if not c_json:
                    continue
                c_vec = np.array(json.loads(c_json), dtype=np.float32)
                c_norm = np.linalg.norm(c_vec)
                if q_norm > 0 and c_norm > 0:
                    cos_sim = float(np.dot(q_vec, c_vec) / (q_norm * c_norm))
                else:
                    cos_sim = 0.0
                scored.append({
                    "id": r["id"],
                    "document_id": r["document_id"],
                    "filename": r["filename"],
                    "content": r["content"],
                    "score": cos_sim,
                })
            scored.sort(key=lambda x: x["score"], reverse=True)
            results = scored[:top_k]
        scur.close()
        sconn.close()

    return {"chunks": results}

@app.get("/rag/documents")
async def rag_documents():
    """List distinct indexed documents."""
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT document_id, filename, COUNT(*) as chunks, MIN(created_at) as created_at
                FROM document_chunks
                GROUP BY document_id, filename
                ORDER BY created_at DESC;
            """)
            docs = [dict(r) for r in cur.fetchall()]
            cur.close()
            conn.close()
            return {"documents": docs}
        except Exception:
            if conn:
                conn.close()

    sconn = get_sqlite_conn()
    scur = sconn.cursor()
    scur.execute("""
        SELECT document_id, filename, COUNT(*) as chunks, MIN(created_at) as created_at
        FROM document_chunks
        GROUP BY document_id, filename
        ORDER BY created_at DESC;
    """)
    docs = [dict(r) for r in scur.fetchall()]
    scur.close()
    sconn.close()
    return {"documents": docs}

@app.get("/rag/documents/{document_id}/chunks")
async def rag_document_chunks(document_id: str):
    """Retrieve all content chunks for a specific document."""
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT id, document_id, filename, content, created_at
                FROM document_chunks
                WHERE document_id = %s
                ORDER BY id ASC;
            """, (document_id,))
            chunks = [dict(r) for r in cur.fetchall()]
            cur.close()
            conn.close()
            if chunks:
                return {"document_id": document_id, "filename": chunks[0]["filename"], "chunks": chunks}
        except Exception:
            if conn:
                conn.close()

    sconn = get_sqlite_conn()
    scur = sconn.cursor()
    scur.execute("""
        SELECT id, document_id, filename, content, created_at
        FROM document_chunks
        WHERE document_id = ?
        ORDER BY id ASC;
    """, (document_id,))
    chunks = [dict(r) for r in scur.fetchall()]
    scur.close()
    sconn.close()
    if not chunks:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"document_id": document_id, "filename": chunks[0]["filename"], "chunks": chunks}

@app.delete("/rag/documents/{document_id}")
async def rag_delete_document(document_id: str):
    """Delete a document and all its chunks from the RAG store."""
    deleted_count = 0
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM document_chunks WHERE document_id = %s;", (document_id,))
            deleted_count += cur.rowcount
            conn.commit()
            cur.close()
            conn.close()
        except Exception:
            if conn:
                conn.rollback()
                conn.close()

    sconn = get_sqlite_conn()
    scur = sconn.cursor()
    scur.execute("DELETE FROM document_chunks WHERE document_id = ?;", (document_id,))
    deleted_count += scur.rowcount
    sconn.commit()
    scur.close()
    sconn.close()

    return {"success": True, "document_id": document_id, "deleted_chunks": deleted_count}

@app.post("/pdf/extract-fields")
async def extract_pdf_fields(
    file: UploadFile = File(...),
    fields: str = Form(...),
    page: int = Form(0),
    use_cache: bool = Form(True),
):
    """
    Extract structured fields from a PDF or document image using offline Donut DocVQA.
    fields can be a JSON array (e.g. '["lease_id", "lessee_name"]') or comma-separated string.
    """
    try:
        field_list = []
        fields_str = fields.strip()
        if fields_str.startswith("["):
            try:
                field_list = json.loads(fields_str)
            except Exception:
                field_list = [f.strip() for f in fields_str.strip("[]").split(",") if f.strip()]
        else:
            field_list = [f.strip() for f in fields_str.split(",") if f.strip()]

        if not field_list:
            raise HTTPException(status_code=400, detail="No valid field names provided in 'fields'")

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        result = extract_fields_from_document(
            file_bytes=content,
            filename=file.filename or "document.pdf",
            fields=field_list,
            page_num=page,
            use_cache=use_cache,
        )
        return {"success": True, **result}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in extract_pdf_fields: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)
