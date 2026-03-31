# Align — Retry utility with exponential backoff

**AIE:** AIE-007
**Date:** 2026-03-28
**Severity:** moderate
**Domain:** backend

## Problem
External API calls (PubMed E-utilities) can fail due to transient network issues, rate limits, or temporary outages. Without retry logic, a single failed HTTP request breaks the evidence retrieval pipeline.

## Decision
Create a reusable `with_retries()` decorator factory using the tenacity library:
- Configurable `max_attempts` (default 3), `min_wait` (default 1.0s), `max_wait` (default 10.0s)
- Exponential backoff via `wait_exponential(multiplier=1, min, max)`
- Retries only on network-level errors: `TimeoutError`, `ConnectionError`, `OSError`
- `before_sleep` callback logs warnings via structlog with attempt number and function name
- `reraise=True` — surfaces the original exception after max attempts exhausted

## Why This Approach
Tenacity is the standard Python retry library with well-tested backoff strategies. A decorator factory allows per-call configuration (PubMed uses 3 attempts, 1-8s backoff) while maintaining a consistent retry policy. Exponential backoff prevents thundering herd on recovering services.

Alternative considered: Manual try/except loops — rejected because they're error-prone, don't provide configurable backoff, and are verbose.

## Impact
Used by `_search_pmids()` and `_fetch_article_details()` in the PubMed pipeline. Could be applied to any external API call.

## Success Criteria
- Transient PubMed failures are retried up to max_attempts times
- Wait time increases exponentially between retries
- Permanent failures surface after max attempts exhausted
- Each retry attempt is logged with function name and attempt number
