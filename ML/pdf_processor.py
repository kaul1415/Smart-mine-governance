import os
import io
import re
import json
import time
import hashlib
import logging
from typing import List, Dict, Any, Optional
from PIL import Image
import pymupdf
import torch
from transformers import DonutProcessor, VisionEncoderDecoderModel
from config import DONUT_MODEL_NAME, MODELS_CACHE_DIR, EXTRACT_CACHE_DIR

logger = logging.getLogger("pdf_processor")
logger.setLevel(logging.INFO)

# Global singletons
_PROCESSOR: Optional[DonutProcessor] = None
_MODEL: Optional[VisionEncoderDecoderModel] = None
_DEVICE: str = "cpu"
_MEMORY_CACHE: Dict[str, Dict[str, Any]] = {}

os.makedirs(MODELS_CACHE_DIR, exist_ok=True)
os.makedirs(EXTRACT_CACHE_DIR, exist_ok=True)


def get_donut_pipeline():
    """
    Singleton loader for DonutProcessor and VisionEncoderDecoderModel.
    Cached locally in MODELS_CACHE_DIR so subsequent startups run fully offline.
    """
    global _PROCESSOR, _MODEL, _DEVICE

    if _PROCESSOR is not None and _MODEL is not None:
        return _PROCESSOR, _MODEL, _DEVICE

    model_dir = os.path.join(MODELS_CACHE_DIR, DONUT_MODEL_NAME.replace("/", "_"))
    os.makedirs(model_dir, exist_ok=True)

    _DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Loading Donut model ({DONUT_MODEL_NAME}) on {_DEVICE}...")
    start_time = time.time()

    is_local = os.path.exists(os.path.join(model_dir, "config.json")) or os.environ.get("HF_HUB_OFFLINE") == "1"

    try:
        if is_local:
            logger.info(f"Loading Donut model from local offline directory: {model_dir}")
            _PROCESSOR = DonutProcessor.from_pretrained(model_dir, local_files_only=True)
            _MODEL = VisionEncoderDecoderModel.from_pretrained(model_dir, local_files_only=True)
        else:
            logger.info(f"Downloading/loading Donut model: {DONUT_MODEL_NAME} (cache: {MODELS_CACHE_DIR})")
            _PROCESSOR = DonutProcessor.from_pretrained(DONUT_MODEL_NAME, cache_dir=MODELS_CACHE_DIR)
            _MODEL = VisionEncoderDecoderModel.from_pretrained(DONUT_MODEL_NAME, cache_dir=MODELS_CACHE_DIR)
            
            logger.info(f"Saving offline snapshot to {model_dir}...")
            _PROCESSOR.save_pretrained(model_dir)
            _MODEL.save_pretrained(model_dir)

    except Exception as e:
        logger.error(f"Error loading Donut model: {e}")
        if is_local:
            logger.info("Retrying with remote hub download...")
            _PROCESSOR = DonutProcessor.from_pretrained(DONUT_MODEL_NAME, cache_dir=MODELS_CACHE_DIR)
            _MODEL = VisionEncoderDecoderModel.from_pretrained(DONUT_MODEL_NAME, cache_dir=MODELS_CACHE_DIR)
            _PROCESSOR.save_pretrained(model_dir)
            _MODEL.save_pretrained(model_dir)
        else:
            raise e

    _MODEL.to(_DEVICE)
    _MODEL.eval()
    logger.info(f"Donut model loaded successfully in {time.time() - start_time:.2f}s on {_DEVICE}.")
    return _PROCESSOR, _MODEL, _DEVICE


def render_document_page(file_bytes: bytes, filename: str, page_num: int = 0):
    """
    Renders the specified page of a PDF or image into a PIL Image.
    Returns (PIL Image, total_pages).
    """
    ext = os.path.splitext(filename)[1].lower()
    
    if ext in [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"]:
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        return image, 1

    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    total_pages = len(doc)
    if total_pages == 0:
        raise ValueError("PDF document contains no pages")
    
    if page_num >= total_pages:
        page_num = 0

    page = doc[page_num]
    pix = page.get_pixmap(dpi=150)
    image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc.close()
    return image, total_pages


def compute_cache_key(file_bytes: bytes, fields: list, page_num: int) -> str:
    """Computes SHA-256 hash of document bytes and field schema."""
    h = hashlib.sha256()
    h.update(file_bytes)
    schema_str = f"page:{page_num}:" + ",".join(sorted(f.strip().lower() for f in fields))
    h.update(schema_str.encode("utf-8"))
    return h.hexdigest()


def get_cached_extraction(cache_key: str):
    """Retrieves cached result from memory or disk."""
    if cache_key in _MEMORY_CACHE:
        return _MEMORY_CACHE[cache_key]
    
    disk_path = os.path.join(EXTRACT_CACHE_DIR, f"{cache_key}.json")
    if os.path.exists(disk_path):
        try:
            with open(disk_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _MEMORY_CACHE[cache_key] = data
                return data
        except Exception as e:
            logger.warning(f"Failed to read disk cache {disk_path}: {e}")
    return None


def save_cached_extraction(cache_key: str, data: dict):
    """Saves extraction result to memory and disk."""
    _MEMORY_CACHE[cache_key] = data
    disk_path = os.path.join(EXTRACT_CACHE_DIR, f"{cache_key}.json")
    try:
        with open(disk_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to save disk cache {disk_path}: {e}")


def clean_extracted_value(val: str) -> str:
    """Cleans Donut XML tags and normalizes answer text."""
    if not val:
        return ""
    cleaned = re.sub(r"</?[^>]+>", "", val).strip()
    return cleaned


def extract_fields_from_document(
    file_bytes: bytes,
    filename: str,
    fields: list,
    page_num: int = 0,
    use_cache: bool = True,
) -> dict:
    """
    Extracts structured fields from a PDF or document image using offline Donut DocVQA.
    Includes SHA-256 caching for instantaneous repeats.
    """
    if not fields:
        return {"extracted_fields": {}, "error": "No fields requested"}

    cache_key = compute_cache_key(file_bytes, fields, page_num)
    if use_cache:
        cached = get_cached_extraction(cache_key)
        if cached:
            return {
                **cached,
                "cached": True,
                "cache_key": cache_key,
            }

    start_time = time.time()
    processor, model, device = get_donut_pipeline()

    image, total_pages = render_document_page(file_bytes, filename, page_num=page_num)

    pixel_values = processor(image, return_tensors="pt").pixel_values
    pixel_values = pixel_values.to(device)

    extracted_results = {}

    for field in fields:
        field_clean = field.strip()
        if not field_clean:
            continue

        prompt = f"<s_docvqa><s_question>What is the {field_clean}?</s_question><s_answer>"
        decoder_input_ids = processor.tokenizer(
            prompt,
            add_special_tokens=False,
            return_tensors="pt"
        ).input_ids.to(device)

        with torch.no_grad():
            outputs = model.generate(
                pixel_values,
                decoder_input_ids=decoder_input_ids,
                max_new_tokens=48,
                pad_token_id=processor.tokenizer.pad_token_id,
                eos_token_id=processor.tokenizer.eos_token_id,
                use_cache=True,
                num_beams=1,
                bad_words_ids=[[processor.tokenizer.unk_token_id]],
                return_dict_in_generate=True,
            )

        seq = processor.batch_decode(outputs.sequences)[0]
        seq = seq.replace(processor.tokenizer.eos_token, "").replace(processor.tokenizer.pad_token, "")

        match = re.search(r"<s_answer>(.*?)(?:</s_answer>|$)", seq, flags=re.DOTALL)
        if match:
            raw_answer = match.group(1)
        else:
            raw_answer = seq.split("<s_answer>")[-1] if "<s_answer>" in seq else seq

        extracted_results[field_clean] = clean_extracted_value(raw_answer)

    elapsed_ms = int((time.time() - start_time) * 1000)

    result_data = {
        "filename": filename,
        "page": page_num + 1,
        "total_pages": total_pages,
        "extracted_fields": extracted_results,
        "inference_time_ms": elapsed_ms,
        "cached": False,
        "cache_key": cache_key,
    }

    if use_cache:
        save_cached_extraction(cache_key, result_data)

    return result_data
