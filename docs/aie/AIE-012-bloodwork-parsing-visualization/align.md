# Align — Blood Work parsing and visualization system

**AIE:** AIE-012
**Date:** 2026-03-30
**Severity:** major
**Domain:** backend, frontend

## Problem
Users have no way to upload blood work lab results and view parsed, categorized, and color-coded lab values within PulseAI. The Blood Work tab created in AIE-008 was a placeholder with no functionality. Users need to upload PDF/TXT lab reports, have them automatically parsed into structured data, and see visual indicators for which values are normal, high, or low.

## Decision
Build a full-stack Blood Work feature with a backend parsing API and a frontend visualization tab:

**Backend API (`backend/api/bloodwork.py`, 134 lines):**
- `POST /api/bloodwork/parse` endpoint accepting PDF/TXT file uploads via multipart (`UploadFile`), 10MB maximum file size
- Uses PyPDF2 for PDF text extraction from uploaded files
- Sends extracted raw text to Claude AI with a structured prompt to parse lab values into categorized, structured data
- Pydantic model `ParsedLabValue`: name (str), value (float), unit (str), normal_low (float), normal_high (float), flag (str: "high"/"low"/"normal"), category (str)
- Pydantic model `BloodworkResponse`: filename (str), results (list of ParsedLabValue), raw_text (str)
- Claude classifies each lab value into one of 10 categories: Metabolic, Lipid, CBC, Thyroid, Liver, Kidney, Vitamin, Hormone, Iron, Inflammation
- Flag assignment: values above normal_high flagged "high", below normal_low flagged "low", otherwise "normal"

**Frontend tab (`web/app/BloodWork.tsx`, 762 lines):**
- `BloodWorkTab` component replacing the placeholder Blood Work tab from AIE-008
- Drag-and-drop PDF/TXT upload zone with click-to-browse fallback
- Calls `POST /api/bloodwork/parse` with multipart form data on file selection
- Summary cards row at top: total labs count, normal count (green badge), high count (red badge), low count (amber badge)
- 11 category filter buttons with color-coded badges (All + 10 lab categories) to filter displayed results
- Three view modes toggled by buttons: All (shows every parsed lab), Abnormal Only (filters to high/low flags), Recommendations (shows personalized health recommendations)
- Range bar visualization for each lab value: horizontal bar showing normal range with a marker indicating where the actual value falls; green fill for normal, red for high, amber for low
- `LAB_RECOMMENDATIONS` dictionary containing personalized lifestyle/dietary recommendations for 16+ lab types (e.g., high LDL, low Vitamin D, elevated HbA1c)
- LocalStorage persistence under key `pulseai_bloodwork` so results survive page refreshes
- Results passed back to parent component via `onResults` callback prop to update the sidebar lab counts

## Why This Approach
Combining Claude AI for unstructured lab report parsing with structured Pydantic validation ensures reliable extraction from varied lab report formats (different hospitals, labs, formats). The range bar visualization gives users an intuitive at-a-glance understanding of where each value falls relative to normal. Category filtering and abnormal-only view help users focus on what matters most. LocalStorage persistence avoids requiring a database for MVP while still providing a good user experience.

Alternative considered: OCR-based parsing with Tesseract — rejected because Claude AI handles varied text layouts more robustly and can infer normal ranges from context. PyPDF2 handles the PDF-to-text extraction, and Claude handles the semantic parsing.

## Impact
Completes the Blood Work tab placeholder from AIE-008. Users can now upload real lab reports and get structured, visual, actionable feedback on their blood work. The `onResults` callback updates the sidebar's abnormal lab count, connecting this feature to the main chat interface's health profile display.

## Success Criteria
- PDF and TXT lab reports upload successfully via drag-and-drop or file picker
- Files exceeding 10MB are rejected with a clear error message
- Claude AI correctly parses lab values with name, value, unit, normal range, flag, and category
- Summary cards accurately reflect total/normal/high/low counts
- Category filter buttons correctly filter displayed lab results
- Range bar visualization correctly positions value markers within normal range bars
- Abnormal Only view filters to only high/low flagged values
- Recommendations view shows relevant recommendations for flagged lab values
- Results persist in LocalStorage across page refreshes
- Sidebar lab counts update via onResults callback
