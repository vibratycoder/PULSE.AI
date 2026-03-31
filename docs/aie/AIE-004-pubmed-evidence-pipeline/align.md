# Align — PubMed evidence retrieval pipeline

**AIE:** AIE-004
**Date:** 2026-03-28
**Severity:** major
**Domain:** ai

## Problem
Health responses grounded only in Claude's training data cannot be verified by users. This erodes trust and makes PulseAI indistinguishable from a generic chatbot. Users need peer-reviewed citations to validate the advice they receive.

## Decision
Build an async pipeline that queries PubMed E-utilities before every health response:
1. `_build_search_query()` — convert natural language to PubMed search query by stripping 60+ stop words, keeping terms >2 characters, limiting to first 6 terms. Optional `health_domain` prefix.
2. `_search_pmids()` — async GET to `esearch.fcgi` with JSON response, sorted by relevance, returning up to 3 PMIDs. Decorated with `@with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0)`.
3. `_fetch_article_details()` — async GET to `efetch.fcgi` with XML response, parsing `PubmedArticle` elements for PMID, ArticleTitle, Journal/Title, PubDate/Year, and structured AbstractText (with Label prefixes). Same retry decorator.
4. `get_citations_for_question()` — orchestrator that calls the above functions in sequence. Catches **all exceptions** and returns empty list on failure (graceful degradation).

Use `httpx.AsyncClient(timeout=15.0)` for HTTP requests. Include PubMed email from settings when available (enables 10 req/s rate limit).

## Why This Approach
PubMed E-utilities is free, requires no API key, contains 40M+ papers, and is updated daily. Abstracts are short enough to inject into the context window (~600 tokens average).

Alternative considered: Proprietary medical knowledge bases (UpToDate, DynaMed) — rejected due to cost and licensing complexity at this stage.

## Impact
- Adds ~400ms latency per response (2 PubMed HTTP roundtrips: search + fetch)
- Provides the evidence foundation for the entire product
- Citations flow into system prompt via injector.py and into API response for frontend display
- Network dependency on `eutils.ncbi.nlm.nih.gov`

## Success Criteria
- "what does high LDL mean?" returns at least one citation with a valid PMID
- PubMed unavailable → graceful degradation with empty citations list and error log
- Retry logic handles transient network failures with exponential backoff
- Structured abstracts preserve section labels (BACKGROUND, METHODS, RESULTS, etc.)
