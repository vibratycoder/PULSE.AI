# Instruct — PubMed evidence retrieval pipeline

**AIE:** AIE-004

## Directive
> "Create backend/evidence/pubmed.py with an async pipeline:
> 1. _build_search_query(question, health_domain) — define a set of 60+ stop words,
>    strip them from the lowercase question, keep terms >2 chars, limit to first 6
>    terms, optionally prepend health_domain
> 2. _search_pmids(query, max_results=3) — async GET to ESEARCH_URL with db=pubmed,
>    retmode=json, sort=relevance. Include pubmed_email from settings if set.
>    Decorated with @with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0).
>    Use httpx.AsyncClient(timeout=15.0). Return list of PMID strings.
> 3. _fetch_article_details(pmids) — async GET to EFETCH_URL with retmode=xml,
>    rettype=abstract. Parse XML with xml.etree.ElementTree. Extract PMID,
>    ArticleTitle, Journal/Title, Journal/JournalIssue/PubDate/Year, and
>    Abstract/AbstractText elements (preserve Label attributes as prefixes).
>    Same retry decorator. Return list[Citation].
> 4. get_citations_for_question(question, health_domain='') — orchestrate: build
>    query → search PMIDs → fetch details. Wrap in try/except catching all
>    exceptions, log error as 'pubmed_unavailable', return empty list on failure."

## Context Provided
- `Pulse AI.md` — PubMed integration architecture, Citation model spec
- `backend/models/health_profile.py` — Citation Pydantic model
- `backend/utils/retry.py` — with_retries decorator
- `backend/config.py` — settings.pubmed_email

## Scope
**In scope:** PubMed search, fetch, XML parsing, Citation assembly, retry logic, graceful degradation
**Out of scope:** Citation display in frontend (AIE-008), caching layer, rate limiting
