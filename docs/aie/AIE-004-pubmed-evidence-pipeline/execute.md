# Execute — PubMed evidence retrieval pipeline

**AIE:** AIE-004

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `backend/evidence/__init__.py` | created | Empty package init |
| `backend/evidence/pubmed.py` | created | Constants: `ESEARCH_URL`, `EFETCH_URL` (eutils.ncbi.nlm.nih.gov). `_build_search_query()` with 60+ stop words set including medical-context words ("worried", "concerned", "given", "really"). `_search_pmids()` async with `@with_retries(3, 1.0, 8.0)`, httpx.AsyncClient(timeout=15.0), JSON response parsing. `_fetch_article_details()` async with same retry config, XML parsing via `xml.etree.ElementTree` — extracts PMID, ArticleTitle, Journal/Title, PubDate/Year, structured AbstractText with Label prefixes joined by newlines. `get_citations_for_question()` orchestrator with broad exception handling returning empty list on failure. 194 lines. |

## Outcome
Pipeline works end-to-end. Health questions return 1-3 relevant citations with PMIDs, titles, journals, years, and full abstracts. Stop word removal produces reasonable PubMed queries from natural language. Structured abstracts preserve section labels (e.g., "BACKGROUND: ...\nMETHODS: ...").

Key implementation details:
- Search query limited to first 6 non-stop-word terms >2 chars
- PubMed email included in requests when configured (enables higher rate limit)
- XML parsing handles missing elements gracefully (defaults to empty string)
- Abstract truncated to 800 chars in display (handled in injector.py, not here)

## Side Effects
- Network dependency on PubMed E-utilities (eutils.ncbi.nlm.nih.gov)
- Each chat request makes 2 HTTP calls to PubMed (search + fetch)

## Tests
No automated tests. Verified manually with health questions.

## Follow-Up Required
- [x] AIE-005: Inject citations into Claude system prompt
- [x] AIE-006: Return citations in ChatResponse
- [x] AIE-008: Display citations as expandable cards in frontend
