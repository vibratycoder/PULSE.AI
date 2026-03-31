# Instruct — Blood Work parsing and visualization system

**AIE:** AIE-012

## Directive
> "Build the Blood Work parsing and visualization system as a full-stack feature:
>
> 1. backend/api/bloodwork.py — FastAPI endpoint for lab report parsing (134 lines).
>    Define Pydantic models: `ParsedLabValue` with fields name (str), value (float),
>    unit (str), normal_low (float), normal_high (float), flag (str), category (str).
>    `BloodworkResponse` with fields filename (str), results (list[ParsedLabValue]),
>    raw_text (str). Create `POST /api/bloodwork/parse` endpoint accepting
>    `UploadFile` via multipart form data with 10MB max file size validation.
>    For PDF files, use PyPDF2 to extract text from all pages. For TXT files,
>    read directly. Send extracted text to Claude AI with a prompt instructing it
>    to parse lab values into structured JSON matching ParsedLabValue schema.
>    Claude should classify each value into categories: Metabolic, Lipid, CBC,
>    Thyroid, Liver, Kidney, Vitamin, Hormone, Iron, Inflammation. Flag each
>    value as 'high' (above normal_high), 'low' (below normal_low), or 'normal'.
>    Return BloodworkResponse with filename, parsed results list, and raw_text.
>
> 2. web/app/BloodWork.tsx — BloodWorkTab React component (762 lines).
>    'use client' component. Props: onResults callback (receives parsed results
>    array). State: results[], loading, error, selectedCategory, viewMode,
>    dragActive. Implement drag-and-drop zone with onDragEnter/onDragLeave/
>    onDragOver/onDrop handlers plus hidden file input with click-to-browse.
>    Accept .pdf and .txt files. On file selection, POST to /api/bloodwork/parse
>    as multipart FormData. On success, store results in state and LocalStorage
>    under key 'pulseai_bloodwork'. useEffect on mount to restore from
>    LocalStorage. Call onResults(results) whenever results update.
>
>    Summary cards row: 4 cards showing total labs (slate), normal count (green),
>    high count (red), low count (amber). Each card with icon and count number.
>
>    Category filter: row of 11 buttons — 'All' plus one per category (Metabolic,
>    Lipid, CBC, Thyroid, Liver, Kidney, Vitamin, Hormone, Iron, Inflammation).
>    Active button highlighted with teal. Filter results by selected category.
>
>    View mode toggle: 3 buttons — All, Abnormal Only (filter flag != 'normal'),
>    Recommendations. Active button highlighted.
>
>    Lab results list: for each ParsedLabValue, render a card with lab name,
>    value + unit, flag badge (green/red/amber), category badge, and range bar.
>    Range bar: horizontal bar representing normal_low to normal_high range.
>    Calculate marker position as percentage: ((value - normal_low) /
>    (normal_high - normal_low)) * 100, clamped 0-100%. Bar fill color:
>    green (#10b981) for normal, red (#ef4444) for high, amber (#f59e0b) for low.
>
>    LAB_RECOMMENDATIONS: dictionary with keys for 16+ lab types (e.g.,
>    'LDL Cholesterol', 'HDL Cholesterol', 'Glucose', 'HbA1c', 'Vitamin D',
>    'TSH', 'Iron', 'Ferritin', 'CRP', 'Triglycerides', etc.). Each entry
>    contains a recommendation string with lifestyle/dietary advice.
>    Recommendations view shows recommendations only for flagged (high/low) labs.
>
>    Clear results button to reset state and remove from LocalStorage."

## Context Provided
- `Pulse AI.md` — UI specifications, feature requirements for Blood Work tab
- `backend/api/chat.py` — reference for FastAPI endpoint pattern and Claude AI integration
- `backend/api/bloodwork.py` — the backend parsing API (134 lines)
- `web/app/page.tsx` — parent component that renders BloodWorkTab and passes onResults prop
- AIE-008 follow-up item: "Blood Work tab implementation"

## Scope
**In scope:** Backend bloodwork parsing endpoint with PyPDF2 + Claude AI, frontend BloodWorkTab component with drag-and-drop upload, category filtering, view modes, range bar visualization, summary cards, recommendations dictionary, LocalStorage persistence, onResults callback integration
**Out of scope:** Database storage of lab results (using LocalStorage for MVP), historical trend tracking across multiple uploads, lab report image/scan support (PDF text and TXT only), integration with external lab APIs (e.g., Quest, LabCorp), printing/export of results
