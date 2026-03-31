# Instruct — Chat and profile API endpoints

**AIE:** AIE-006

## Directive
> "Create backend/api/chat.py with a POST /api/chat endpoint using APIRouter.
> The pipeline is:
> 1. check_emergency(request.message) — if True, log warning and return
>    ChatResponse(response=EMERGENCY_RESPONSE, citations=[], is_emergency=True)
> 2. Load profile: HealthProfile() default, then get_demo_profile(request.user_id)
>    if user_id provided. Log profile loaded with name.
> 3. await get_citations_for_question(request.message) — async PubMed fetch
> 4. build_health_system_prompt(profile, request.message, citations)
> 5. anthropic.Anthropic(api_key=settings.anthropic_api_key).messages.create()
>    with model=settings.claude_model, max_tokens=1024, system=system_prompt,
>    messages=[{role: user, content: request.message}].
>    Extract response_text from message.content[0].text
> Raise HTTPException(500) if no API key. Catch anthropic.APIError, log and
> raise HTTPException(502). Log chat_response with citations_count and
> response_length.
>
> Create backend/api/profile.py with APIRouter:
> GET /api/profile/{user_id} — return get_demo_profile(user_id) or empty HealthProfile
> GET /api/profiles/demo — return list(DEMO_PROFILES.values())
> Both log operations via structlog."

## Context Provided
- `backend/health/triage.py` — check_emergency(), EMERGENCY_RESPONSE
- `backend/models/demo_profiles.py` — get_demo_profile(), DEMO_PROFILES
- `backend/evidence/pubmed.py` — get_citations_for_question()
- `backend/health/injector.py` — build_health_system_prompt()
- `backend/models/health_profile.py` — ChatRequest, ChatResponse, HealthProfile
- `backend/config.py` — settings.anthropic_api_key, settings.claude_model

## Scope
**In scope:** Chat endpoint pipeline, profile endpoints, router registration, error handling, structured logging
**Out of scope:** Authentication, rate limiting, response streaming, database-backed profiles
