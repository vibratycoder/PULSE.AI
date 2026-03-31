# Execute — Retry utility with exponential backoff

**AIE:** AIE-007

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `backend/utils/__init__.py` | created | Empty package init |
| `backend/utils/retry.py` | created | `with_retries(max_attempts=3, min_wait=1.0, max_wait=10.0) -> retry` factory function. Returns `tenacity.retry()` configured with `stop_after_attempt(max_attempts)`, `wait_exponential(multiplier=1, min=min_wait, max=max_wait)`, `retry_if_exception_type((TimeoutError, ConnectionError, OSError))`, `before_sleep` lambda logging `retrying_api_call` with `state.attempt_number` and `state.fn.__name__`, `reraise=True`. 40 lines. |

## Outcome
Decorator works correctly. Applied in `backend/evidence/pubmed.py`:
- `_search_pmids()` uses `@with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0)`
- `_fetch_article_details()` uses `@with_retries(max_attempts=3, min_wait=1.0, max_wait=8.0)`

Note: PubMed functions override `max_wait` to 8.0 (vs default 10.0) for faster failure.

## Side Effects
None — utility module with no side effects beyond logging.

## Tests
No automated tests. Verified via PubMed retry behavior during network interruptions.

## Follow-Up Required
None — self-contained utility.
