"""Evidence swarm orchestrator — runs multiple source agents in parallel.

The swarm dispatches search queries to PubMed, Europe PMC, and Semantic Scholar
simultaneously using asyncio.gather. Results are deduplicated by DOI/PMID,
ranked by a composite score (credibility + citation count + recency), and the
top citations are returned for injection into the system prompt.

This is the core evidence pipeline for Pulse.ai — every health response
is grounded in real peer-reviewed literature from multiple sources.
"""

import asyncio
from datetime import datetime

import structlog

from backend.evidence.cache import get_cached_results, store_results
from backend.evidence.sources.base import EvidenceSource, RawPaper
from backend.evidence.sources.europepmc_agent import EuropePMCAgent
from backend.evidence.sources.pubmed_agent import PubMedAgent
from backend.evidence.sources.semantic_scholar_agent import SemanticScholarAgent
from backend.models.health_profile import Citation

log = structlog.get_logger()

# Stop words for query building
_STOP_WORDS = {
    "i", "me", "my", "should", "would", "could", "can", "do", "does",
    "is", "am", "are", "was", "were", "be", "been", "being", "have",
    "has", "had", "the", "a", "an", "and", "or", "but", "in", "on",
    "at", "to", "for", "of", "with", "about", "what", "how", "why",
    "when", "where", "which", "who", "whom", "this", "that", "these",
    "those", "it", "its", "if", "then", "than", "very", "just", "also",
    "so", "too", "not", "no", "nor", "only", "own", "same", "will",
    "worried", "concern", "concerned", "given", "really", "much",
}


def _build_query(question: str, health_domain: str = "") -> str:
    """Convert a natural-language question into search terms.

    Args:
        question: User's health question.
        health_domain: Optional domain to focus the query.

    Returns:
        Cleaned search query string.
    """
    words = question.lower().replace("?", "").replace(".", "").split()
    terms = [w for w in words if w not in _STOP_WORDS and len(w) > 2]
    query = " ".join(terms[:8])
    if health_domain:
        query = f"{health_domain} {query}"
    return query


def _deduplicate(papers: list[RawPaper]) -> list[RawPaper]:
    """Remove duplicate papers across sources, preferring higher credibility.

    Deduplicates by DOI first, then by normalized title. When duplicates
    are found, keeps the version from the most credible source and merges
    citation counts.

    Args:
        papers: Combined list from all source agents.

    Returns:
        Deduplicated list of papers.
    """
    seen_dois: dict[str, RawPaper] = {}
    seen_titles: dict[str, RawPaper] = {}
    unique: list[RawPaper] = []

    for paper in sorted(papers, key=lambda p: p.credibility_score, reverse=True):
        # Check DOI dedup
        if paper.doi:
            if paper.doi in seen_dois:
                # Merge citation count from duplicate
                existing = seen_dois[paper.doi]
                if paper.citation_count > existing.citation_count:
                    existing.citation_count = paper.citation_count
                continue
            seen_dois[paper.doi] = paper

        # Check title dedup (normalized)
        norm_title = paper.title.lower().strip().rstrip(".")
        if norm_title in seen_titles:
            existing = seen_titles[norm_title]
            if paper.citation_count > existing.citation_count:
                existing.citation_count = paper.citation_count
            continue
        seen_titles[norm_title] = paper

        unique.append(paper)

    return unique


def _rank_papers(papers: list[RawPaper], max_results: int = 5) -> list[RawPaper]:
    """Rank papers by composite score and return top results.

    Scoring factors:
    - Source credibility (0–1.0): PubMed=1.0, EuropePMC=0.95, S2=0.9
    - Citation count (log-scaled): High-impact papers rank higher
    - Recency: Papers from the last 3 years get a bonus

    Args:
        papers: Deduplicated list of papers.
        max_results: Maximum papers to return.

    Returns:
        Top-ranked papers sorted by composite score.
    """
    current_year = datetime.now().year

    def score(paper: RawPaper) -> float:
        s = paper.credibility_score * 40

        # Citation impact (log-scaled, capped)
        if paper.citation_count > 0:
            import math
            s += min(math.log10(paper.citation_count + 1) * 10, 30)

        # Recency bonus
        try:
            pub_year = int(paper.year)
            years_old = current_year - pub_year
            if years_old <= 2:
                s += 20
            elif years_old <= 5:
                s += 10
            elif years_old <= 10:
                s += 5
        except (ValueError, TypeError):
            pass

        # Penalize papers without abstracts
        if not paper.abstract:
            s -= 30

        return s

    ranked = sorted(papers, key=score, reverse=True)
    return ranked[:max_results]


def _to_citation(paper: RawPaper) -> Citation:
    """Convert a RawPaper to a Citation for the response.

    Args:
        paper: A ranked RawPaper object.

    Returns:
        Citation object compatible with the existing system prompt.
    """
    # Use PMID if available, otherwise use external_id
    pmid = paper.external_id if paper.source == "pubmed" else ""
    if not pmid and paper.source == "europepmc" and paper.external_id.isdigit():
        pmid = paper.external_id

    return Citation(
        pmid=pmid or paper.external_id,
        title=paper.title,
        journal=paper.journal,
        year=paper.year,
        abstract=paper.abstract[:1000],
    )


# Initialize the source agents
_AGENTS: list[EvidenceSource] = [
    PubMedAgent(),
    EuropePMCAgent(),
    SemanticScholarAgent(),
]


async def _search_single_agent(
    agent: EvidenceSource,
    query: str,
    max_results: int,
) -> list[RawPaper]:
    """Run a single agent search with error isolation.

    Args:
        agent: The evidence source agent.
        query: Search query.
        max_results: Max results per source.

    Returns:
        List of papers, or empty list if the agent fails.
    """
    try:
        return await agent.search(query, max_results)
    except Exception as exc:
        log.error(
            "agent_search_failed",
            agent=agent.name,
            error=str(exc),
            query=query,
        )
        return []


async def swarm_search(
    question: str,
    health_domain: str = "",
    max_results: int = 5,
    use_cache: bool = True,
) -> list[Citation]:
    """Run the evidence swarm — search all sources in parallel.

    This is the main entry point for the evidence pipeline. It:
    1. Checks the local cache for recent results
    2. Dispatches queries to PubMed, Europe PMC, and Semantic Scholar in parallel
    3. Deduplicates results across sources by DOI/title
    4. Ranks papers by credibility, citations, and recency
    5. Caches results for future queries
    6. Returns the top citations for the system prompt

    Args:
        question: The user's health question.
        health_domain: Optional domain hint (e.g. "cardiology").
        max_results: Maximum citations to return.
        use_cache: Whether to check/store in the local cache.

    Returns:
        List of up to max_results Citation objects, ranked by relevance.
        Returns empty list if all sources fail.
    """
    query = _build_query(question, health_domain)
    if not query.strip():
        return []

    # Check cache first
    if use_cache:
        cached = get_cached_results(query)
        if cached:
            ranked = _rank_papers(cached, max_results)
            return [_to_citation(p) for p in ranked]

    # Dispatch all agents in parallel
    log.info("swarm_search_start", query=query, agents=len(_AGENTS))

    results = await asyncio.gather(
        *[_search_single_agent(agent, query, max_results) for agent in _AGENTS]
    )

    # Flatten and process
    all_papers: list[RawPaper] = []
    for agent, papers in zip(_AGENTS, results):
        log.info("agent_results", agent=agent.name, papers=len(papers))
        all_papers.extend(papers)

    if not all_papers:
        log.warning("swarm_no_results", query=query)
        return []

    # Deduplicate across sources
    unique_papers = _deduplicate(all_papers)
    log.info(
        "swarm_dedup",
        total=len(all_papers),
        unique=len(unique_papers),
    )

    # Rank and select top results
    top_papers = _rank_papers(unique_papers, max_results)

    # Cache for future use
    if use_cache:
        store_results(query, unique_papers)

    citations = [_to_citation(p) for p in top_papers]
    log.info(
        "swarm_search_complete",
        query=query,
        sources_queried=len(_AGENTS),
        total_found=len(all_papers),
        unique_found=len(unique_papers),
        returned=len(citations),
    )

    return citations
