"""Base classes for evidence source agents."""

from abc import ABC, abstractmethod

from pydantic import BaseModel, Field


class RawPaper(BaseModel):
    """A paper retrieved from any evidence source before deduplication.

    Attributes:
        source: Which database this came from (pubmed, europepmc, semantic_scholar).
        external_id: Source-specific identifier (PMID, PMC ID, S2 Paper ID).
        doi: Digital Object Identifier (empty if unavailable).
        title: Full article title.
        authors: List of author names (last name + first initial).
        journal: Journal or publication venue name.
        year: Publication year as string.
        abstract: Full abstract text.
        url: Direct URL to the paper.
        credibility_score: 0.0–1.0 score reflecting source reliability.
        citation_count: Number of citations (if available from source).
        is_open_access: Whether the full text is freely available.
    """

    source: str
    external_id: str
    doi: str = ""
    title: str
    authors: list[str] = Field(default_factory=list)
    journal: str = ""
    year: str = ""
    abstract: str = ""
    url: str = ""
    credibility_score: float = 0.5
    citation_count: int = 0
    is_open_access: bool = False


class EvidenceSource(ABC):
    """Abstract base class for evidence source agents.

    Each source agent knows how to search a specific academic database
    and return structured paper data.
    """

    name: str = "base"
    credibility_score: float = 0.5

    @abstractmethod
    async def search(self, query: str, max_results: int = 5) -> list[RawPaper]:
        """Search this source for papers matching the query.

        Args:
            query: Search query string.
            max_results: Maximum number of papers to return.

        Returns:
            List of RawPaper objects.
        """
        ...
