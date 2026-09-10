import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "gemma3:1b")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/coalgov")
PORT = int(os.getenv("PORT", "8001"))
HOST = os.getenv("HOST", "0.0.0.0")

# Hugging Face Donut Model Settings
DONUT_MODEL_NAME = os.getenv("DONUT_MODEL_NAME", "naver-clova-ix/donut-base-finetuned-docvqa")
MODELS_CACHE_DIR = os.getenv("MODELS_CACHE_DIR", os.path.join(os.path.dirname(__file__), "models"))
EXTRACT_CACHE_DIR = os.getenv("EXTRACT_CACHE_DIR", os.path.join(os.path.dirname(__file__), "cache", "field_extraction"))
TESSERACT_CMD = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
