"""Semantic Scholar source agent — searches the AI2 academic graph.

Semantic Scholar indexes 200M+ papers across all academic fields with
AI-powered relevance ranking and citation graph data. Its API is free
for moderate usage (100 requests/5 minutes without a key).

API docs: https://api.semanticscholar.org/api-docs/
"""

import httpx
import structlog

from backend.evidence.sources.base import EvidenceSource, RawPaper
from backend.utils.retry import with_retries

log = structlog.get_logger()

SEARCH_URL = "https://api.semanticscholar.org/graph/v1/paper/search"

# Fields to request from the API
FIELDS = "paperId,externalIds,title,authors,journal,year,abstract,url,citationCount,isOpenAccess"


class SemanticScholarAgent(EvidenceSource):
    """Searches Semantic Scholar for academic papers with citation data.

    Complements PubMed by providing citation counts for relevance ranking
    and covering a broader range of academic disciplines including
    nutrition, exercise science, and public health.
    """

    name = "semantic_scholar"
    credibility_score = 0.9  # Broad coverage, includes some non-peer-reviewed

    @with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0)
    async def search(self, query: str, max_results: int = 5) -> list[RawPaper]:
        """Search Semantic Scholar and return structured paper data.

        Args:
            query: Search query string.
            max_results: Maximum papers to return.

        Returns:
            List of RawPaper objects with metadata and abstracts.
        """
        params = {
            "query": query,
            "limit": str(max_results),
            "fields": FIELDS,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        results = data.get("data", [])
        papers: list[RawPaper] = []

        for item in results:
            paper = self._parse_result(item)
            if paper and paper.abstract:
                papers.append(paper)

        log.info("semantic_scholar_agent_search", query=query, results=len(papers))
        return papers

    def _parse_result(self, item: dict) -> RawPaper | None:
        """Parse a Semantic Scholar result into a RawPaper.

        Args:
            item: A single result dict from the Semantic Scholar API.

        Returns:
            RawPaper if parsing succeeds, None otherwise.
        """
        title = item.get("title", "")
        if not title:
            return None

        # Extract identifiers
        external_ids = item.get("externalIds") or {}
        pmid = str(external_ids.get("PubMed", ""))
        doi = external_ids.get("DOI", "") or ""
        s2_id = item.get("paperId", "")
        external_id = pmid or s2_id

        # Extract authors
        authors: list[str] = []
        for author in (item.get("authors") or [])[:5]:
            name = author.get("name", "")
            if name:
                authors.append(name)

        # Journal info
        journal_info = item.get("journal") or {}
        journal = journal_info.get("name", "") if isinstance(journal_info, dict) else ""

        year = str(item.get("year", ""))
        url = item.get("url", "") or (f"https://doi.org/{doi}" if doi else "")

        return RawPaper(
            source="semantic_scholar",
            external_id=external_id,
            doi=doi,
            title=title,
            authors=authors,
            journal=journal,
            year=year,
            abstract=item.get("abstract", "") or "",
            url=url,
            credibility_score=self.credibility_score,
            citation_count=item.get("citationCount", 0) or 0,
            is_open_access=item.get("isOpenAccess", False) or False,
        )
