"""Bloodwork parsing API — extracts lab values from PDF text using Claude."""

import io
import json

import anthropic
import structlog
from fastapi import APIRouter, HTTPException, UploadFile
from pydantic import BaseModel, Field
from PyPDF2 import PdfReader

from backend.config import settings

log = structlog.get_logger()
router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class NormalRange(BaseModel):
    low: float
    high: float


class ParsedLabValue(BaseModel):
    name: str
    value: float
    unit: str
    normal_low: float
    normal_high: float
    flag: str = ""
    category: str = ""


class BloodworkResponse(BaseModel):
    filename: str
    results: list[ParsedLabValue] = Field(default_factory=list)
    raw_text: str = ""


PARSE_PROMPT = """\
You are a clinical lab report parser. Extract every lab test result from the text below.

Return a JSON array where each element has these exact keys:
- "name": the test name (e.g. "Glucose", "LDL Cholesterol", "TSH")
- "value": the numeric result as a number (not a string)
- "unit": the measurement unit (e.g. "mg/dL", "mIU/L")
- "normal_low": the low end of the normal/reference range as a number
- "normal_high": the high end of the normal/reference range as a number
- "flag": "" if normal, "high" if above normal_high, "low" if below normal_low
- "category": one of "Metabolic", "Lipid", "CBC", "Thyroid", "Liver", "Kidney", "Vitamin", "Hormone", "Iron", "Inflammation", "Other"

If the reference range is not listed, use standard adult reference ranges.
If a value cannot be parsed as a number, skip it.
Return ONLY the JSON array, no other text.

--- LAB REPORT TEXT ---
{text}
"""


@router.post("/api/bloodwork/parse", response_model=BloodworkResponse)
async def parse_bloodwork(file: UploadFile) -> BloodworkResponse:
    """Upload a bloodwork PDF and extract structured lab values.

    Uses PyPDF2 to extract text, then Claude to parse lab values
    into structured data with normal ranges.
    """
    filename = file.filename or "unknown"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in {".pdf", ".txt"}:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 10 MB.")

    # Extract text
    try:
        if ext == ".pdf":
            reader = PdfReader(io.BytesIO(contents))
            pages = [p.extract_text() for p in reader.pages if p.extract_text()]
            if not pages:
                raise ValueError("PDF contains no extractable text.")
            text = "\n\n".join(pages)
        else:
            text = contents.decode("utf-8", errors="replace")
    except Exception as exc:
        log.error("bloodwork_text_extraction_failed", error=str(exc))
        raise HTTPException(status_code=400, detail=f"Could not read file: {exc}") from exc

    # Parse with Claude
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured.")

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        message = client.messages.create(
            model=settings.claude_model,
            max_tokens=4096,
            messages=[{"role": "user", "content": PARSE_PROMPT.format(text=text)}],
        )
        raw_json = message.content[0].text.strip()
        # Strip markdown fences if present
        if raw_json.startswith("```"):
            raw_json = raw_json.split("\n", 1)[1] if "\n" in raw_json else raw_json[3:]
            if raw_json.endswith("```"):
                raw_json = raw_json[:-3]
            raw_json = raw_json.strip()

        parsed = json.loads(raw_json)
    except (json.JSONDecodeError, anthropic.APIError) as exc:
        log.error("bloodwork_parse_failed", error=str(exc))
        raise HTTPException(status_code=502, detail=f"Failed to parse bloodwork: {exc}") from exc

    results = []
    for item in parsed:
        try:
            results.append(ParsedLabValue(
                name=item["name"],
                value=float(item["value"]),
                unit=item.get("unit", ""),
                normal_low=float(item.get("normal_low", 0)),
                normal_high=float(item.get("normal_high", 0)),
                flag=item.get("flag", ""),
                category=item.get("category", "Other"),
            ))
        except (KeyError, ValueError, TypeError):
            continue

    log.info("bloodwork_parsed", filename=filename, result_count=len(results))
    return BloodworkResponse(filename=filename, results=results, raw_text=text)
