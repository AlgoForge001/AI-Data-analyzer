from datetime import datetime, timezone
import asyncio
import io
import json
import logging
import uuid
from pydantic import BaseModel

import pandas as pd
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from plotly.utils import PlotlyJSONEncoder

from app.services.chart_service import ChartGenerator
from app.utils.task_manager import create_task, cancel_task, remove_task, is_cancelled
from app.services.chat_service import ChatService
from app.utils.data_store import data_store

# MongoDB imports
from app.db.mongodb import (
    save_file,
    save_analysis,
    update_analysis_result,
    append_chat,
    get_history as db_get_history,
    get_analysis_by_id,
    get_analysis_by_dataset_id,
    get_file,
    delete_analysis
)

router = APIRouter()

# ---------- LOGGER ----------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
@router.get("/health")
def health_check():
    return {"status": "successful"}

# ─────────────────────────────────────────────
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload dataset ONLY (no processing). Returns dataset_id.
    """
    contents = await file.read()
    filename = file.filename or ""

    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    elif filename.endswith(".xlsx"):
        df = pd.read_excel(io.BytesIO(contents))
    else:
        return JSONResponse(
            status_code=400,
            content={"error": "Unsupported file format"},
        )

    dataset_id = data_store.save(df)
    logger.info("Dataset uploaded: %s → %s", filename, dataset_id)
    return {"dataset_id": dataset_id}

# ─────────────────────────────────────────────
@router.post("/start-analysis")
async def start_analysis(
    file: UploadFile = File(...),
    query: str = Form(...),
):
    """
    Accepts file + query directly (frontend-compatible).
    Kicks off a background task and immediately returns a task_id.
    The client polls /status/{task_id} and may call /cancel/{task_id}.
    """
    task_id = str(uuid.uuid4())
    filename = file.filename or ""
    logger.info("Starting analysis task %s | file=%s | query=%r", task_id, filename, query[:60])

    # ── parse uploaded file ──────────────────────────────────────────
    contents = await file.read()

    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    elif filename.endswith(".xlsx"):
        df = pd.read_excel(io.BytesIO(contents))
    else:
        return JSONResponse(
            status_code=400,
            content={"error": "Unsupported file format. Upload a .csv or .xlsx file."},
        )

    # Save to data_store for memory cache
    dataset_id = data_store.save(df)
    
    # Save file to GridFS
    file_id = save_file(contents, filename)
    
    # Save analysis record to MongoDB
    save_analysis(task_id, query, filename, dataset_id, file_id)

    async def _run():
        try:
            generator = ChartGenerator(df)
            result = await generator.generate(query, task_id)

            if is_cancelled(task_id):
                update_analysis_result(task_id, "cancelled")
                logger.info("Task %s: cancelled after LLM — discarding result", task_id)
                return

            serialised = json.loads(json.dumps(result, cls=PlotlyJSONEncoder))
            update_analysis_result(task_id, "completed", serialised)
            logger.info("Task %s completed successfully", task_id)

        except asyncio.CancelledError:
            update_analysis_result(task_id, "cancelled")
            logger.info("Task %s pipeline aborted via cancel flag", task_id)
            raise

        except Exception as exc:
            update_analysis_result(task_id, "error", error=str(exc))
            logger.exception("Task %s raised an exception", task_id)

        finally:
            remove_task(task_id)

    create_task(task_id, _run())
    return {"task_id": task_id}

# ─────────────────────────────────────────────
@router.get("/status/{task_id}")
async def get_status(task_id: str):
    """
    Returns the current state of the task.
    Possible: running | completed | cancelled | error | not_found
    """
    result = get_analysis_by_id(task_id)
    if result is None:
        return JSONResponse(status_code=404, content={"status": "not_found"})
    return JSONResponse(content=result)

# ─────────────────────────────────────────────
@router.post("/cancel/{task_id}")
async def cancel(task_id: str):
    """
    Requests cancellation of a running task.
    Returns {"cancelled": true/false}. Never 404s — frontend may send stale IDs.
    """
    result = get_analysis_by_id(task_id)
    if result is None:
        return {"cancelled": False}

    cancelled = cancel_task(task_id)
    return {"cancelled": cancelled}

# ─────────────────────────────────────────────
@router.delete("/history/{task_id}")
async def delete_history_item(task_id: str):
    """
    Deletes an analysis task and its associated files.
    """
    success = delete_analysis(task_id)
    if success:
        return {"deleted": True}
    return JSONResponse(status_code=404, content={"error": "Not found or could not be deleted"})

# ─────────────────────────────────────────────
@router.get("/history")
async def get_history():
    """
    Returns a list of all tasks (newest first) for the sidebar.
    Only returns metadata — not the full result data.
    """
    items = db_get_history()
    return items

# ─────────────────────────────────────────────
@router.get("/history/{task_id}")
async def get_history_item(task_id: str):
    """
    Returns full result data for a specific task (used when clicking sidebar item).
    """
    result = get_analysis_by_id(task_id)
    if result is None:
        return JSONResponse(status_code=404, content={"error": "Not found"})
    return JSONResponse(content=result)

# ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    dataset_id: str
    query: str
    history: list[dict] = []

@router.post("/chat")
async def chat(req: ChatRequest):
    df = data_store.get(req.dataset_id)

    # Rehydrate dataframe from DB if missing in memory
    if df is None:
        doc = get_analysis_by_dataset_id(req.dataset_id)
        if doc and doc.get("file_id"):
            contents = get_file(doc["file_id"])
            if contents:
                filename = doc.get("filename", "")
                if filename.endswith(".csv"):
                    df = pd.read_csv(io.BytesIO(contents))
                elif filename.endswith(".xlsx"):
                    df = pd.read_excel(io.BytesIO(contents))
                if df is not None:
                    data_store._store[req.dataset_id] = df

    if df is None:
        return JSONResponse(status_code=400, content={"error": "Invalid dataset_id or dataset expired"})

    service = ChatService(df)
    result = await service.chat(req.query, history=req.history)
    
    # Save the chat to database
    append_chat(req.dataset_id, req.query, result.get("answer"), result.get("table"))
    
    return result