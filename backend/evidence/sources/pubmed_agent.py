"""PubMed source agent — searches NCBI PubMed via E-utilities.

PubMed is the gold standard for biomedical literature. This agent searches
PubMed's 36M+ records of peer-reviewed articles and retrieves structured
citation data including abstracts.

API docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
"""

import xml.etree.ElementTree as ET

import httpx
import structlog

from backend.config import settings
from backend.evidence.sources.base import EvidenceSource, RawPaper
from backend.utils.retry import with_retries

log = structlog.get_logger()

ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"


class PubMedAgent(EvidenceSource):
    """Searches PubMed for peer-reviewed biomedical literature.

    Uses NCBI E-utilities (esearch + efetch) to find articles by keyword,
    then retrieves full metadata and abstracts in XML format.
    """

    name = "pubmed"
    credibility_score = 1.0  # Gold standard for biomedical literature

    @with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0)
    async def search(self, query: str, max_results: int = 5) -> list[RawPaper]:
        """Search PubMed and return structured paper data.

        Args:
            query: Search query string (medical terms).
            max_results: Maximum papers to return.

        Returns:
            List of RawPaper objects with metadata and abstracts.
        """
        pmids = await self._search_pmids(query, max_results)
        if not pmids:
            return []
        return await self._fetch_details(pmids)

    async def _search_pmids(self, query: str, max_results: int) -> list[str]:
        """Search PubMed for matching PMIDs.

        Args:
            query: PubMed search query.
            max_results: Max results to return.

        Returns:
            List of PMID strings.
        """
        params = {
            "db": "pubmed",
            "term": query,
            "retmax": str(max_results),
            "retmode": "json",
            "sort": "relevance",
            "tool": "PulseAI",
        }
        if settings.pubmed_email:
            params["email"] = settings.pubmed_email

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(ESEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        pmids: list[str] = data.get("esearchresult", {}).get("idlist", [])
        log.info("pubmed_agent_search", query=query, results=len(pmids))
        return pmids

    async def _fetch_details(self, pmids: list[str]) -> list[RawPaper]:
        """Fetch article metadata and abstracts from PubMed.

        Args:
            pmids: List of PubMed IDs.

        Returns:
            List of RawPaper objects.
        """
        params = {
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "xml",
            "rettype": "abstract",
            "tool": "PulseAI",
        }
        if settings.pubmed_email:
            params["email"] = settings.pubmed_email

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(EFETCH_URL, params=params)
            resp.raise_for_status()

        papers: list[RawPaper] = []
        root = ET.fromstring(resp.text)

        for article_elem in root.findall(".//PubmedArticle"):
            paper = self._parse_article(article_elem)
            if paper:
                papers.append(paper)

        log.info("pubmed_agent_fetch", pmids=len(pmids), papers=len(papers))
        return papers

    def _parse_article(self, article_elem: ET.Element) -> RawPaper | None:
        """Parse a PubmedArticle XML element into a RawPaper.

        Args:
            article_elem: XML element for a single PubMed article.

        Returns:
            RawPaper if parsing succeeds, None otherwise.
        """
        medline = article_elem.find(".//MedlineCitation")
        if medline is None:
            return None

        pmid_elem = medline.find("PMID")
        pmid = pmid_elem.text if pmid_elem is not None and pmid_elem.text else ""

        art = medline.find(".//Article")
        if art is None:
            return None

        title_elem = art.find("ArticleTitle")
        title = title_elem.text if title_elem is not None and title_elem.text else ""

        journal_elem = art.find(".//Journal/Title")
        journal = journal_elem.text if journal_elem is not None and journal_elem.text else ""

        year_elem = art.find(".//Journal/JournalIssue/PubDate/Year")
        year = year_elem.text if year_elem is not None and year_elem.text else ""

        # Extract authors
        authors: list[str] = []
        author_list = art.find("AuthorList")
        if author_list is not None:
            for author_elem in author_list.findall("Author"):
                last = author_elem.find("LastName")
                fore = author_elem.find("ForeName")
                if last is not None and last.text:
                    name = last.text
                    if fore is not None and fore.text:
                        name = f"{last.text} {fore.text[0]}"
                    authors.append(name)

        # Extract abstract
        abstract_parts: list[str] = []
        abstract_elem = art.find("Abstract")
        if abstract_elem is not None:
            for text_elem in abstract_elem.findall("AbstractText"):
                if text_elem.text:
                    label = text_elem.get("Label", "")
                    prefix = f"{label}: " if label else ""
                    abstract_parts.append(f"{prefix}{text_elem.text}")

        # Extract DOI
        doi = ""
        for id_elem in article_elem.findall(".//ArticleIdList/ArticleId"):
            if id_elem.get("IdType") == "doi" and id_elem.text:
                doi = id_elem.text
                break

        return RawPaper(
            source="pubmed",
            external_id=pmid,
            doi=doi,
            title=title,
            authors=authors[:5],
            journal=journal,
            year=year,
            abstract="\n".join(abstract_parts),
            url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            credibility_score=self.credibility_score,
        )
