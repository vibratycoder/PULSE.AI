# Execute — Blood Work parsing and visualization system

**AIE:** AIE-012

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `backend/api/bloodwork.py` | created | 134 lines. Pydantic models: `ParsedLabValue` (name: str, value: float, unit: str, normal_low: float, normal_high: float, flag: str, category: str) and `BloodworkResponse` (filename: str, results: list[ParsedLabValue], raw_text: str). `POST /api/bloodwork/parse` endpoint accepting `UploadFile` via multipart form data. File size validation enforcing 10MB maximum. PDF handling: uses PyPDF2 `PdfReader` to iterate all pages and extract text via `page.extract_text()`. TXT handling: reads bytes and decodes to UTF-8. Sends extracted raw text to Claude AI with a structured prompt instructing it to parse each lab value into JSON matching the ParsedLabValue schema. Claude assigns categories from 10 options (Metabolic, Lipid, CBC, Thyroid, Liver, Kidney, Vitamin, Hormone, Iron, Inflammation) and flags each value as "high" (value > normal_high), "low" (value < normal_low), or "normal". Parses Claude's JSON response and validates through Pydantic. Returns `BloodworkResponse` with filename, validated results list, and raw extracted text. |
| `web/app/BloodWork.tsx` | created | 762 lines. `BloodWorkTab` component with `onResults` callback prop. State variables: `results` (ParsedLabValue[]), `loading` (boolean), `error` (string), `selectedCategory` (string, default "All"), `viewMode` (string: "all"/"abnormal"/"recommendations"), `dragActive` (boolean). Drag-and-drop upload zone with `onDragEnter`/`onDragLeave`/`onDragOver`/`onDrop` handlers; dashed border that highlights teal when dragging. Hidden `<input type="file" accept=".pdf,.txt">` triggered by click on drop zone. `handleFile()` function: creates `FormData`, POSTs to `/api/bloodwork/parse`, parses response, sets results in state, persists to `localStorage.setItem('pulseai_bloodwork', JSON.stringify(results))`, calls `onResults(results)`. `useEffect` on mount: reads `pulseai_bloodwork` from LocalStorage and restores results if present. `useEffect` on results change: calls `onResults(results)` to update parent sidebar counts. Summary cards row: 4 cards — total labs (slate-400 icon), normal count (green-400 icon + green-900/30 background), high count (red-400 icon + red-900/30 background), low count (amber-400 icon + amber-900/30 background). Category filter: 11 buttons in a horizontally scrollable row — "All" plus one per category. Active button: `bg-teal-600 text-white`; inactive: `bg-slate-700 text-slate-300 hover:bg-slate-600`. Each category button shows a count badge. View mode toggle: 3 buttons (All, Abnormal Only, Recommendations) with active state styling. Filtered results computed via `useMemo`: filters by `selectedCategory` (if not "All") and by `viewMode` ("abnormal" filters to `flag !== 'normal'`). Lab result cards: each shows lab name (bold), value + unit (large text), flag badge (`bg-green-900/50 text-green-400` for normal, `bg-red-900/50 text-red-400` for high, `bg-amber-900/50 text-amber-400` for low), category badge (`bg-slate-700 text-slate-300`), and range bar visualization. Range bar: `div` with `bg-slate-700` track, colored fill bar width calculated as `Math.min(Math.max(((value - normal_low) / (normal_high - normal_low)) * 100, 0), 100)%`, fill color `bg-green-500` (normal) / `bg-red-500` (high) / `bg-amber-500` (low), white circular marker positioned at value percentage, labels showing `normal_low` on left and `normal_high` on right. `LAB_RECOMMENDATIONS` dictionary with 16+ entries: LDL Cholesterol, HDL Cholesterol, Total Cholesterol, Triglycerides, Glucose, HbA1c, Vitamin D, Vitamin B12, TSH, T4, Iron, Ferritin, CRP, eGFR, BUN, Creatinine, and others. Each entry contains a multi-sentence recommendation string with actionable lifestyle/dietary advice. Recommendations view: iterates flagged results, matches lab name against `LAB_RECOMMENDATIONS` keys, renders recommendation cards with lab name, current value, flag, and recommendation text. Clear results button: resets `results` to `[]`, removes `pulseai_bloodwork` from LocalStorage, calls `onResults([])`. |

## Outcome
Full blood work parsing and visualization pipeline works end-to-end. Users can drag-and-drop or click-to-browse for PDF/TXT lab reports. The backend extracts text from PDFs via PyPDF2, sends it to Claude AI for structured parsing, and returns validated lab values with categories and flags. The frontend renders parsed results with intuitive visual indicators.

Key UI details:
- Summary cards update dynamically as results are parsed, showing at-a-glance counts for total/normal/high/low
- Category filter buttons each display a count badge showing how many labs are in that category
- Range bar visualization clearly shows where each value falls relative to its normal range with color-coded fill
- Abnormal Only view quickly surfaces values that need attention, filtering out all normal results
- Recommendations view provides actionable health advice for each abnormal lab value
- Drag zone border animates to teal highlight (`border-teal-500`) when a file is dragged over
- Loading state shows a spinner/skeleton while waiting for Claude AI parsing response
- Error state displays a red error message if upload fails or file exceeds 10MB

## Side Effects
- Backend requires `PyPDF2` package installed (`pip install PyPDF2`)
- Backend requires Anthropic API key configured for Claude AI calls during parsing
- Each file upload triggers a Claude AI API call, which has associated latency (~2-5 seconds) and cost
- LocalStorage usage means results are per-browser and not synced across devices

## Tests
No automated tests. Verified manually by uploading sample PDF and TXT lab reports, confirming parsed values match source documents, verifying category classification accuracy, testing all three view modes, confirming LocalStorage persistence across page refreshes, and validating 10MB file size limit rejection.

## Follow-Up Required
- [ ] Historical trend tracking — chart lab values across multiple uploads over time
- [ ] Database persistence — migrate from LocalStorage to backend database storage
- [ ] Image/scan support — OCR for photographed or scanned lab reports
- [ ] Export functionality — PDF/CSV export of parsed results
- [ ] Lab report templates — pre-built parsing rules for common lab providers (Quest, LabCorp)
- [ ] Unit conversion — automatic conversion between different unit systems (e.g., mg/dL vs mmol/L)
