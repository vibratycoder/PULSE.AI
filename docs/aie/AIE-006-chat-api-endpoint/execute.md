# Execute — Chat and profile API endpoints

**AIE:** AIE-006

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `backend/api/__init__.py` | created | Empty package init |
| `backend/api/chat.py` | created | `router = APIRouter()`. `POST /api/chat` with `response_model=ChatResponse`. 5-step pipeline: (1) `check_emergency()` → early return with `EMERGENCY_RESPONSE` and `is_emergency=True`, (2) load profile via `get_demo_profile()` or default `HealthProfile()`, (3) `await get_citations_for_question()`, (4) `build_health_system_prompt(profile, message, citations)`, (5) **synchronous** `anthropic.Anthropic().messages.create()` with `model=settings.claude_model`, `max_tokens=1024`. HTTPException 500 if no API key, 502 on `anthropic.APIError`. Logs: chat_request, emergency_triage_triggered, profile_loaded, claude_api_error, chat_response. 95 lines. |
| `backend/api/profile.py` | created | `router = APIRouter()`. `GET /api/profile/{user_id}` returns HealthProfile (empty if not found). `GET /api/profiles/demo` returns `list(DEMO_PROFILES.values())`. Logs profile_retrieved and profile_not_found_returning_empty. 42 lines. |
| `backend/main.py` | modified | Added `app.include_router(chat_router)` and `app.include_router(profile_router)` |

## Outcome
Full chat pipeline works end-to-end. Emergency messages are intercepted before any external API calls. Non-emergency messages go through the full evidence pipeline and return Claude's response with citations.

Key details:
- Uses **synchronous** `anthropic.Anthropic()` client (not AsyncAnthropic)
- Claude model configurable via `settings.claude_model` (default: `claude-sonnet-4-20250514`)
- Each non-emergency chat request makes 3 external calls: PubMed search, PubMed fetch, Claude API
- Profile endpoint returns empty `HealthProfile(user_id=user_id)` for unknown users (no 404)

## Side Effects
- Anthropic API key must be set in `.env` for chat to function
- Synchronous Claude client blocks the event loop briefly during API call

## Tests
No automated tests. Full pipeline verified via manual API calls.

## Follow-Up Required
- [x] AIE-008: Frontend consumes POST /api/chat and GET /api/profile endpoints
- [ ] Future: Switch to AsyncAnthropic for true non-blocking Claude calls
- [ ] Future: Add response streaming via Server-Sent Events
