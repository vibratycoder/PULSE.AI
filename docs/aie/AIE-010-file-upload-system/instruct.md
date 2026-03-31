# Instruct — File upload system with drag-and-drop and PDF reading

**AIE:** AIE-010

## Directive
> "Create a file upload system with drag-and-drop and PDF reading:
>
> 1. Add PyPDF2 to requirements.txt
> 2. Create backend/api/upload.py — POST /api/upload accepting multipart file,
>    extract text from PDF via PyPDF2 or read plain text, return {filename, text},
>    reject files >10MB or unsupported types, register router in main.py
> 3. Add optional file_text field to ChatRequest in health_profile.py
> 4. Modify chat.py to append file_text to message when present
> 5. Create web/app/FileUpload.tsx — drag-and-drop zone component with click-to-browse,
>    visual drag-over feedback, file type validation, upload to /api/upload,
>    return extracted text, show filename with remove button
> 6. Modify page.tsx — wire attachment button to FileUpload, store file text in state,
>    pass file_text in chat request body, drag-and-drop over chat area"

## Context Provided
- `backend/api/chat.py` — current chat endpoint
- `backend/models/health_profile.py` — ChatRequest/ChatResponse models
- `backend/main.py` — router registration
- `web/app/page.tsx` — current chat UI with placeholder attachment button

## Scope
**In scope:** PDF text extraction, plain text upload, drag-and-drop, file validation, backend endpoint, frontend component, chat integration
**Out of scope:** Image/OCR processing, file storage/persistence, camera capture
