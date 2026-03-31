# Align — Chat and profile API endpoints

**AIE:** AIE-006
**Date:** 2026-03-28
**Severity:** major
**Domain:** backend

## Problem
No API endpoints exist to handle user health questions or serve health profiles. The backend needs routes that orchestrate the full pipeline: emergency triage → profile loading → evidence retrieval → prompt injection → Claude API call → structured response.

## Decision
Create two API routers:

**1. POST /api/chat** (`backend/api/chat.py`) — Full 5-step chat pipeline:
1. `check_emergency(message)` — if True, return immediately with `EMERGENCY_RESPONSE` and `is_emergency=True`
2. Load profile via `get_demo_profile(user_id)` — fall back to empty `HealthProfile()` if not found
3. `await get_citations_for_question(message)` — fetch PubMed evidence
4. `build_health_system_prompt(profile, message, citations)` — assemble system prompt
5. `anthropic.Anthropic().messages.create()` — **synchronous** Claude API call with `max_tokens=1024`

Uses `settings.anthropic_api_key` and `settings.claude_model`. Raises HTTP 500 if API key missing, HTTP 502 on Claude API errors.

**2. Profile router** (`backend/api/profile.py`):
- `GET /api/profile/{user_id}` — return HealthProfile (empty profile if not found)
- `GET /api/profiles/demo` — list all demo profiles

## Why This Approach
Separating chat and profile into distinct routers follows REST conventions and keeps code modular. The chat pipeline's fixed step order ensures safety-critical triage runs first. Using synchronous Anthropic client (not AsyncAnthropic) simplifies error handling while FastAPI handles concurrency at the ASGI level.

Alternative considered: WebSocket-based streaming — deferred for MVP simplicity.

## Impact
These are the primary API surfaces consumed by the frontend. The chat endpoint is the core product interaction.

## Success Criteria
- POST /api/chat with "what does high LDL mean?" returns response with citations
- POST /api/chat with "I'm having chest pain" returns emergency response immediately (no Claude call)
- GET /api/profile/demo-marcus-chen returns full Marcus Chen profile
- GET /api/profiles/demo returns list of all demo profiles
- Missing API key returns clear 500 error message
