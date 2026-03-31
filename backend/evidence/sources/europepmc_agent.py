"""Europe PMC source agent — searches the European life-sciences literature database.

Europe PMC indexes 40M+ articles including all of PubMed plus European-funded
research, preprints, and patents. Its REST API is free with no key required.

API docs: https://europepmc.org/RestfulWebService
"""

import re

import httpx
import structlog

from backend.evidence.sources.base import EvidenceSource, RawPaper
from backend.utils.retry import with_retries

log = structlog.get_logger()

SEARCH_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"


class EuropePMCAgent(EvidenceSource):
    """Searches Europe PMC for peer-reviewed biomedical literature.

    Complements PubMed by also indexing European-funded research,
    preprints from bioRxiv/medRxiv, and additional full-text sources.
    """

    name = "europepmc"
    credibility_score = 0.95  # Highly credible, slightly below PubMed direct

    @with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0)
    async def search(self, query: str, max_results: int = 5) -> list[RawPaper]:
        """Search Europe PMC and return structured paper data.

        Args:
            query: Search query string.
            max_results: Maximum papers to return.

        Returns:
            List of RawPaper objects with metadata and abstracts.
        """
        params = {
            "query": f"{query} SRC:MED",
            "format": "json",
            "pageSize": str(max_results),
            "resultType": "core",
            "sort": "RELEVANCE",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        results = data.get("resultList", {}).get("result", [])
        papers: list[RawPaper] = []

        for item in results:
            paper = self._parse_result(item)
            if paper and paper.abstract:
                papers.append(paper)

        log.info("europepmc_agent_search", query=query, results=len(papers))
        return papers

    def _parse_result(self, item: dict) -> RawPaper | None:
        """Parse a Europe PMC search result into a RawPaper.

        Args:
            item: A single result dict from the Europe PMC API.

        Returns:
            RawPaper if parsing succeeds, None otherwise.
        """
        title = item.get("title", "")
        if not title:
            return None

        # Extract identifiers
        pmid = item.get("pmid", "")
        doi = item.get("doi", "")
        pmc_id = item.get("pmcid", "")
        external_id = pmid or pmc_id or doi

        if not external_id:
            return None

        # Extract authors
        authors: list[str] = []
        author_str = item.get("authorString", "")
        if author_str:
            authors = [a.strip() for a in author_str.split(",")][:5]

        # Build URL
        if pmid:
            url = f"https://europepmc.org/article/MED/{pmid}"
        elif pmc_id:
            url = f"https://europepmc.org/article/PMC/{pmc_id}"
        else:
            url = f"https://doi.org/{doi}" if doi else ""

        year = str(item.get("pubYear", ""))
        journal = item.get("journalTitle", "") or item.get("journalInfo", {}).get("journal", {}).get("title", "")

        # Strip HTML tags from abstract (Europe PMC sometimes includes <h4> etc.)
        raw_abstract = item.get("abstractText", "")
        clean_abstract = re.sub(r"<[^>]+>", "", raw_abstract) if raw_abstract else ""

        return RawPaper(
            source="europepmc",
            external_id=external_id,
            doi=doi,
            title=title.rstrip("."),
            authors=authors,
            journal=journal,
            year=year,
            abstract=clean_abstract,
            url=url,
            credibility_score=self.credibility_score,
            citation_count=item.get("citedByCount", 0),
            is_open_access=item.get("isOpenAccess", "N") == "Y",
        )
