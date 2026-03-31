"""PubMed E-utilities client for retrieving peer-reviewed citations.

Converts natural-language health questions into PubMed search queries,
fetches article metadata and abstracts, and returns structured Citation objects.
"""

import xml.etree.ElementTree as ET

import httpx
import structlog

from backend.config import settings
from backend.models.health_profile import Citation
from backend.utils.retry import with_retries

log = structlog.get_logger()

ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"


def _build_search_query(question: str, health_domain: str = "") -> str:
    """Convert a natural-language question into a PubMed search query.

    Args:
        question: The user's health question in plain English.
        health_domain: Optional health domain to narrow the search.

    Returns:
        An optimized PubMed search query string.
    """
    # Extract key medical terms, strip common filler words
    stop_words = {
        "i", "me", "my", "should", "would", "could", "can", "do", "does",
        "is", "am", "are", "was", "were", "be", "been", "being", "have",
        "has", "had", "the", "a", "an", "and", "or", "but", "in", "on",
        "at", "to", "for", "of", "with", "about", "what", "how", "why",
        "when", "where", "which", "who", "whom", "this", "that", "these",
        "those", "it", "its", "if", "then", "than", "very", "just", "also",
        "so", "too", "not", "no", "nor", "only", "own", "same", "will",
        "worried", "concern", "concerned", "given", "really", "much",
    }
    words = question.lower().replace("?", "").replace(".", "").split()
    terms = [w for w in words if w not in stop_words and len(w) > 2]

    query = " ".join(terms[:6])
    if health_domain:
        query = f"{health_domain} {query}"

    return query


@with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0)
async def _search_pmids(query: str, max_results: int = 3) -> list[str]:
    """Search PubMed and return a list of PMIDs.

    Args:
        query: PubMed search query string.
        max_results: Maximum number of results to return.

    Returns:
        List of PMID strings.

    Raises:
        httpx.HTTPStatusError: If PubMed returns a non-2xx response.
    """
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": str(max_results),
        "retmode": "json",
        "sort": "relevance",
    }
    if settings.pubmed_email:
        params["email"] = settings.pubmed_email

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(ESEARCH_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    pmids: list[str] = data.get("esearchresult", {}).get("idlist", [])
    log.info("pubmed_search", query=query, results=len(pmids))
    return pmids


@with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0)
async def _fetch_article_details(pmids: list[str]) -> list[Citation]:
    """Fetch article metadata and abstracts from PubMed.

    Args:
        pmids: List of PubMed IDs to fetch.

    Returns:
        List of Citation objects with title, journal, year, abstract.

    Raises:
        httpx.HTTPStatusError: If PubMed returns a non-2xx response.
    """
    if not pmids:
        return []

    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
        "rettype": "abstract",
    }
    if settings.pubmed_email:
        params["email"] = settings.pubmed_email

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(EFETCH_URL, params=params)
        resp.raise_for_status()

    citations: list[Citation] = []
    root = ET.fromstring(resp.text)

    for article_elem in root.findall(".//PubmedArticle"):
        medline = article_elem.find(".//MedlineCitation")
        if medline is None:
            continue

        pmid_elem = medline.find("PMID")
        pmid = pmid_elem.text if pmid_elem is not None and pmid_elem.text else ""

        art = medline.find(".//Article")
        if art is None:
            continue

        title_elem = art.find("ArticleTitle")
        title = title_elem.text if title_elem is not None and title_elem.text else ""

        journal_elem = art.find(".//Journal/Title")
        journal = journal_elem.text if journal_elem is not None and journal_elem.text else ""

        year_elem = art.find(".//Journal/JournalIssue/PubDate/Year")
        year = year_elem.text if year_elem is not None and year_elem.text else ""

        abstract_parts: list[str] = []
        abstract_elem = art.find("Abstract")
        if abstract_elem is not None:
            for text_elem in abstract_elem.findall("AbstractText"):
                if text_elem.text:
                    label = text_elem.get("Label", "")
                    prefix = f"{label}: " if label else ""
                    abstract_parts.append(f"{prefix}{text_elem.text}")

        citations.append(
            Citation(
                pmid=pmid,
                title=title,
                journal=journal,
                year=year,
                abstract="\n".join(abstract_parts),
            )
        )

    log.info("pubmed_fetch", pmids=pmids, citations_found=len(citations))
    return citations


async def get_citations_for_question(
    question: str,
    health_domain: str = "",
) -> list[Citation]:
    """Retrieve PubMed citations relevant to a health question.

    Converts the question to a search query, searches PubMed, and fetches
    article details. Returns up to 3 citations. If PubMed is unavailable,
    returns an empty list (caller should label response as training-only).

    Args:
        question: The user's health question in natural language.
        health_domain: Optional domain hint (e.g. "cardiology").

    Returns:
        List of up to 3 Citation objects with abstracts.
    """
    try:
        query = _build_search_query(question, health_domain)
        pmids = await _search_pmids(query, max_results=3)
        if not pmids:
            log.warning("pubmed_no_results", question=question, query=query)
            return []
        return await _fetch_article_details(pmids)
    except Exception as exc:
        log.error(
            "pubmed_unavailable",
            error=str(exc),
            question=question,
        )
        return []
