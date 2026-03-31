# AIE Index

> Every non-minor change recorded using the AIE framework — Align, Instruct, Execute.
> Each entry is a folder with three documents: align.md, instruct.md, execute.md.
> Updated automatically after every completed AIE entry.

---

## How to read this

Every row links to a folder in `docs/aie/`. Open any folder to read:
- `align.md` — why the change was made and what was decided
- `instruct.md` — the exact directive given to implement it
- `execute.md` — every file touched and what actually happened

---

## Summary Table

| # | Folder | Title | Date | Severity | Domain | Status |
|---|--------|-------|------|----------|--------|--------|
| AIE-001 | fastapi-backend-setup | FastAPI backend with config and CORS | 2026-03-28 | major | backend | complete |
| AIE-002 | health-data-models | Health data models and demo profiles | 2026-03-28 | major | backend | complete |
| AIE-003 | emergency-triage | Emergency symptom triage system | 2026-03-28 | critical | ai | complete |
| AIE-004 | pubmed-evidence-pipeline | PubMed evidence retrieval pipeline | 2026-03-28 | major | ai | complete |
| AIE-005 | health-prompt-injection | Health profile and evidence injection into Claude system prompt | 2026-03-28 | major | ai | complete |
| AIE-006 | chat-api-endpoint | Chat and profile API endpoints | 2026-03-28 | major | backend | complete |
| AIE-007 | retry-utility | Retry utility with exponential backoff | 2026-03-28 | moderate | backend | complete |
| AIE-008 | nextjs-chat-frontend | Next.js chat frontend with health profile sidebar | 2026-03-28 | major | frontend | complete |
| AIE-009 | adjustable-bmi-calculator | Make BMI calculator height and weight adjustable | 2026-03-30 | moderate | frontend | complete |
| AIE-010 | file-upload-system | File upload with drag-and-drop and PDF reading | 2026-03-30 | major | backend, frontend | complete |
| AIE-011 | supabase-auth-system | Supabase authentication with login, signup, and session management | 2026-03-30 | major | auth, frontend | complete |
| AIE-012 | bloodwork-parsing-visualization | Blood work PDF parsing and lab value visualization | 2026-03-30 | major | backend, frontend | complete |
| AIE-013 | medication-tracker | Medication adherence tracker with weekly grid and heatmap | 2026-03-30 | major | frontend | complete |
| AIE-014 | vaccines-tracking | Vaccine records tracking with sidebar display and dedicated tab | 2026-03-30 | moderate | backend, frontend | complete |
| AIE-015 | profile-editor | Health profile editor with word banks and structured medication input | 2026-03-30 | major | frontend | complete |

---

## Severity key
`minor` · `moderate` · `major` · `critical`

## Domain key
`backend` · `frontend` · `mobile` · `database` · `auth` · `ai` · `deps` · `infrastructure`

## Status key
`planned` · `in-progress` · `complete` · `rolled-back`
