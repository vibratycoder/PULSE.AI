# Align — File upload system with drag-and-drop and PDF reading

**AIE:** AIE-010
**Date:** 2026-03-30
**Severity:** major
**Domain:** backend, frontend

## Problem
Users cannot upload documents (lab results PDFs, medical reports) to PulseAI. The attachment button in the chat input is a non-functional placeholder. Users need to share documents so Claude can analyze their health data in context.

## Decision
Build a full file upload system across backend and frontend:

**Backend — new file `backend/api/upload.py`:**
- `POST /api/upload` endpoint accepting multipart file uploads
- PDF text extraction using `PyPDF2` library
- Plain text file support (.txt)
- Returns extracted text content as JSON
- File size limit (10MB)
- Accepted types: `.pdf`, `.txt`

**Backend — modify `backend/api/chat.py`:**
- Add optional `file_text` field to `ChatRequest` model
- Append uploaded file content to the user's message when building the Claude prompt

**Frontend — new file `web/app/FileUpload.tsx`:**
- Drag-and-drop zone component with visual feedback
- Click-to-browse file picker
- File type validation (PDF, TXT)
- Upload progress state
- Displays attached file name with remove button
- Calls `POST /api/upload` to extract text, passes result to chat

**Frontend — modify `web/app/page.tsx`:**
- Wire the attachment button to the FileUpload component
- Pass extracted file text along with the chat message
- Show attached file indicator in chat input area
- Drag-and-drop over the entire chat area

## Why This Approach
Server-side PDF extraction is more reliable than browser-based parsing and keeps the frontend lightweight. PyPDF2 is a pure-Python library with no system dependencies. Extracting text server-side and passing it as context to Claude keeps the existing chat pipeline intact — no architectural changes needed.

Alternative considered: Browser-side PDF.js parsing — rejected because it adds ~500KB to the frontend bundle and has inconsistent text extraction quality.

## Impact
- New backend endpoint and dependency (PyPDF2)
- New frontend component (FileUpload.tsx)
- ChatRequest model gains optional file_text field
- Existing chat pipeline unchanged — file text is appended to the user message

## Success Criteria
- Drag a PDF onto the chat area → file uploads and text is extracted
- Click the attachment button → file picker opens, PDF selectable
- Uploaded PDF content is sent with the next chat message to Claude
- Claude can answer questions about the uploaded document
- Non-PDF/TXT files are rejected with clear error message
- Files over 10MB are rejected
