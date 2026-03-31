"""Evidence API router — cache stats and manual evidence search."""

import structlog
from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.evidence.cache import get_cache_stats
from backend.evidence.swarm import swarm_search
from backend.models.health_profile import Citation

log = structlog.get_logger()
router = APIRouter()


class EvidenceSearchRequest(BaseModel):
    """Request to search the evidence swarm directly.

    Attributes:
        query: Health question to search for.
        health_domain: Optional domain hint.
        max_results: Maximum citations to return.
    """

    query: str
    health_domain: str = ""
    max_results: int = 5


class EvidenceSearchResponse(BaseModel):
    """Response from a direct evidence search.

    Attributes:
        citations: Retrieved peer-reviewed citations.
        sources_queried: Number of academic databases searched.
    """

    citations: list[Citation] = Field(default_factory=list)
    sources_queried: int = 3


@router.post("/api/evidence/search", response_model=EvidenceSearchResponse)
async def search_evidence(request: EvidenceSearchRequest) -> EvidenceSearchResponse:
    """Search the evidence swarm for peer-reviewed citations.

    Queries PubMed, Europe PMC, and Semantic Scholar in parallel,
    deduplicates, ranks, and returns the best citations.

    Args:
        request: The search request.

    Returns:
        EvidenceSearchResponse with ranked citations.
    """
    log.info("evidence_search", query=request.query, domain=request.health_domain)
    citations = await swarm_search(
        request.query,
        health_domain=request.health_domain,
        max_results=request.max_results,
    )
    return EvidenceSearchResponse(citations=citations, sources_queried=3)


@router.get("/api/evidence/stats")
async def evidence_stats() -> dict:
    """Get statistics about the local evidence cache.

    Returns:
        Dict with total cached papers, queries, and database size.
    """
    return get_cache_stats()
