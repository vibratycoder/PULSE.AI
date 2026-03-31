# Align — Vaccines tracking system with quick-add and prompt injection

**AIE:** AIE-014
**Date:** 2026-03-30
**Severity:** moderate
**Domain:** backend, frontend

## Problem
PulseAI has no way to track a user's vaccination history. Claude cannot consider immunization status when answering health questions, and users have no place to record or view their vaccines. This is a gap in the health profile that limits the quality of personalized health guidance.

## Decision
Build a full-stack vaccines tracking feature across backend models, prompt injection, and frontend UI:

**Backend — modify `backend/models/health_profile.py`:**
- Add `Vaccine` model with `name: str` and `date: str` fields
- Add `vaccines: list[Vaccine]` field to `HealthProfile`

**Backend — modify `backend/models/demo_profiles.py`:**
- Add 3 sample vaccines to Marcus Chen profile: COVID-19 (Pfizer) 2025-10-12, Influenza 2025-09-20, Tdap 2022-06-15
- Add `Vaccine` to imports

**Backend — modify `backend/health/injector.py`:**
- Add vaccines section to `_format_profile_section()`: formats as "Vaccines: name (date), ..." in the system prompt sent to Claude

**Frontend — modify `web/app/page.tsx`:**
- Add `Vaccine` interface and `vaccines: Vaccine[]` to HealthProfile TS interface
- Add Vaccines section to `HealthProfileSidebar` (between Allergies and Recent Labs) showing vaccine name and date
- Add "Vaccines" to top nav tab array
- Add conditional rendering for vaccines tab with persistence to localStorage

**Frontend — new file `web/app/VaccinesTab.tsx`:**
- Common vaccines word bank with quick-add buttons (COVID-19, Flu, Tdap, Shingles, Pneumonia, Hepatitis A/B, HPV, MMR, Meningococcal, Varicella, Polio)
- Checkmark indicators for already-added vaccines
- Manual add form with vaccine name text input and date picker
- Vaccine list with name, date, and remove button
- `onUpdate` callback persists changes to parent profile state and localStorage

## Why This Approach
Vaccines are a core part of a health profile and directly relevant to health guidance (e.g., booster timing, travel recommendations, contraindications). Adding vaccines to the system prompt via the existing injector pattern means Claude automatically considers immunization history without any changes to the chat pipeline. The word bank of common vaccines reduces friction for data entry while the manual form handles less common vaccines.

Alternative considered: Free-text vaccine entry only — rejected because structured data enables consistent prompt formatting and the word bank covers the majority of use cases.

## Impact
- `Vaccine` model added to health profile schema
- Demo profile gains sample vaccine data
- System prompt grows by one section when vaccines are present
- New frontend component (VaccinesTab.tsx)
- New tab in navigation and sidebar section in page.tsx

## Success Criteria
- Vaccines appear in the health profile sidebar
- Quick-add a common vaccine from the word bank with one click
- Manually add a vaccine with custom name and date
- Remove a vaccine from the list
- Vaccine data persists across page reloads via localStorage
- Claude receives vaccine history in the system prompt and can answer questions about immunization status
