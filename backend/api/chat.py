"""Chat API router — the main conversation endpoint for Pulse.ai."""

import anthropic
import structlog
from fastapi import APIRouter, HTTPException

from backend.config import settings
from backend.evidence.swarm import swarm_search
from backend.health.injector import build_health_system_prompt
from backend.health.triage import EMERGENCY_RESPONSE, check_emergency
from backend.models.demo_profiles import get_demo_profile
from backend.models.health_profile import (
    ChatRequest,
    ChatResponse,
    HealthProfile,
)

log = structlog.get_logger()
router = APIRouter()


@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Process a health question and return an evidence-grounded response.

    Performs emergency triage, retrieves PubMed citations, loads the user's
    health profile, and calls Claude with the assembled system prompt.

    Args:
        request: The chat request containing the user's message and optional user_id.

    Returns:
        ChatResponse with Claude's response, citations, and emergency flag.

    Raises:
        HTTPException: If the Anthropic API key is missing or the API call fails.
    """
    log.info("chat_request", user_id=request.user_id, message_preview=request.message[:80])

    # Step 1: Emergency triage — ALWAYS check first
    if check_emergency(request.message):
        log.warning("emergency_triage_triggered", user_id=request.user_id)
        return ChatResponse(
            response=EMERGENCY_RESPONSE,
            citations=[],
            is_emergency=True,
        )

    # Step 2: Load health profile
    profile = HealthProfile()
    if request.user_id:
        demo_profile = get_demo_profile(request.user_id)
        if demo_profile:
            profile = demo_profile
            log.info("profile_loaded", user_id=request.user_id, name=profile.name)

    # Step 3: Build user message (append file content if provided)
    user_message = request.message
    if request.file_text:
        user_message = f"{request.message}\n\n--- UPLOADED DOCUMENT ---\n{request.file_text}"
        log.info("file_text_attached", length=len(request.file_text))

    # Step 4: Retrieve citations from evidence swarm (PubMed + Europe PMC + Semantic Scholar)
    citations = await swarm_search(request.message)

    # Step 5: Build system prompt
    system_prompt = build_health_system_prompt(
        profile, request.message, citations, has_file=bool(request.file_text)
    )

    # Step 5: Call Claude
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY not configured. Set it in your .env file.",
        )

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        message = client.messages.create(
            model=settings.claude_model,
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        response_text = message.content[0].text
    except anthropic.APIError as exc:
        log.error("claude_api_error", error=str(exc), user_id=request.user_id)
        raise HTTPException(status_code=502, detail=f"Claude API error: {exc}") from exc

    log.info(
        "chat_response",
        user_id=request.user_id,
        citations_count=len(citations),
        response_length=len(response_text),
    )

    return ChatResponse(
        response=response_text,
        citations=citations,
        is_emergency=False,
    )
