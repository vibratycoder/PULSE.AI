# Execute — File upload system with drag-and-drop and PDF reading

**AIE:** AIE-010

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `requirements.txt` | modified | Added `PyPDF2==3.0.1` |
| `backend/api/upload.py` | created | `POST /api/upload` endpoint accepting multipart file uploads. `_extract_pdf_text()` uses PyPDF2.PdfReader to extract text from all pages. Validates file extension (.pdf, .txt only) and size (10MB max). Returns `{filename, text}`. 78 lines. |
| `backend/api/chat.py` | modified | Added step 3: when `request.file_text` is present, appends it to user message as `--- UPLOADED DOCUMENT ---` block. Claude call now uses `user_message` (with file text) instead of `request.message`. PubMed search still uses original `request.message` (not polluted with file content). |
| `backend/models/health_profile.py` | modified | Added `file_text: str = ""` field to `ChatRequest` model. |
| `backend/main.py` | modified | Imported and registered `upload_router`. |
| `web/app/FileUpload.tsx` | created | `FileUpload` component: drag-and-drop zone with click-to-browse, visual drag-over feedback (teal border), upload spinner, error display, compact attached-file indicator with remove button. `useChatDrop` hook for drag-and-drop over entire chat area. 175 lines. |
| `web/app/page.tsx` | modified | Added imports for FileUpload + useChatDrop. New state: fileText, attachedFile, showUploadZone. `handleFileText()` callback stores extracted text + filename. `handleDropFile()` for whole-chat-area drops. `sendMessage()` now includes `file_text` in request body and shows filename in user message bubble. Attachment button toggles upload zone. Drag overlay with teal border appears when dragging files over chat. Camera button removed. |

## Outcome
Full file upload pipeline works end-to-end:
1. User clicks attachment button → drop zone appears with "Drop a file here or browse"
2. User drags PDF over chat area → teal overlay appears, dropping triggers upload
3. Backend extracts text via PyPDF2 → returns to frontend
4. Attached file shows as compact teal indicator with filename and X button
5. On send, file text is appended to user message for Claude with `--- UPLOADED DOCUMENT ---` separator
6. User message bubble shows filename with paper clip emoji
7. File is cleared after sending

PubMed search uses the original question (not polluted with file content) for better citation relevance.

## Side Effects
- New PyPDF2 dependency (~1MB)
- Scanned/image-only PDFs return error "PDF contains no extractable text"

## Tests
No automated tests. Verified: PDF upload + text extraction, TXT upload, drag-and-drop, file too large rejection, wrong file type rejection, file text sent to Claude.

## Follow-Up Required
- [ ] OCR support for scanned PDFs (e.g., via Tesseract)
- [ ] Image file support (lab result photos)
- [ ] File size display in attachment indicator
