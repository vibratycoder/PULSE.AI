"""Profile API router — health profile management endpoints."""

import structlog
from fastapi import APIRouter

from backend.models.demo_profiles import DEMO_PROFILES, get_demo_profile
from backend.models.health_profile import HealthProfile

log = structlog.get_logger()
router = APIRouter()


@router.get("/api/profile/{user_id}", response_model=HealthProfile)
async def get_profile(user_id: str) -> HealthProfile:
    """Retrieve a user's health profile.

    Args:
        user_id: The user ID to look up.

    Returns:
        The user's HealthProfile.

    Raises:
        HTTPException: If the profile is not found (currently returns empty profile).
    """
    profile = get_demo_profile(user_id)
    if profile:
        log.info("profile_retrieved", user_id=user_id)
        return profile
    log.info("profile_not_found_returning_empty", user_id=user_id)
    return HealthProfile(user_id=user_id)


@router.get("/api/profiles/demo", response_model=list[HealthProfile])
async def list_demo_profiles() -> list[HealthProfile]:
    """List all available demo profiles.

    Returns:
        List of demo HealthProfile objects.
    """
    return list(DEMO_PROFILES.values())
