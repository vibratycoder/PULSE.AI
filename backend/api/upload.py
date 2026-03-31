"""File upload router — extracts text from PDFs and plain text files."""

import io

import structlog
from fastapi import APIRouter, HTTPException, UploadFile
from PyPDF2 import PdfReader

log = structlog.get_logger()
router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".txt"}


@router.post("/api/upload")
async def upload_file(file: UploadFile) -> dict[str, str]:
    """Upload a file and extract its text content.

    Supports PDF and plain text files up to 10MB.

    Args:
        file: The uploaded file.

    Returns:
        Dict with filename and extracted text.

    Raises:
        HTTPException: If file is too large, wrong type, or unreadable.
    """
    filename = file.filename or "unknown"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Accepted: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(contents) // 1024 // 1024}MB). Maximum: 10MB.",
        )

    try:
        if ext == ".pdf":
            text = _extract_pdf_text(contents)
        else:
            text = contents.decode("utf-8", errors="replace")
    except Exception as exc:
        log.error("file_extraction_failed", filename=filename, error=str(exc))
        raise HTTPException(
            status_code=400,
            detail=f"Could not read file: {exc}",
        ) from exc

    log.info("file_uploaded", filename=filename, text_length=len(text))
    return {"filename": filename, "text": text}


def _extract_pdf_text(data: bytes) -> str:
    """Extract text from PDF bytes.

    Args:
        data: Raw PDF file bytes.

    Returns:
        Extracted text from all pages, joined by newlines.
    """
    reader = PdfReader(io.BytesIO(data))
    pages: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            pages.append(page_text)
    if not pages:
        raise ValueError("PDF contains no extractable text (may be scanned/image-only).")
    return "\n\n".join(pages)
