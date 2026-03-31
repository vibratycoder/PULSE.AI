# Instruct — Retry utility with exponential backoff

**AIE:** AIE-007

## Directive
> "Create backend/utils/retry.py with a with_retries() function that returns a
> tenacity retry decorator. Parameters: max_attempts=3, min_wait=1.0, max_wait=10.0.
> Use stop_after_attempt, wait_exponential(multiplier=1, min, max), and
> retry_if_exception_type((TimeoutError, ConnectionError, OSError)). Add a
> before_sleep lambda that logs 'retrying_api_call' via structlog with attempt
> number (state.attempt_number) and function name (state.fn.__name__). Set
> reraise=True so the original exception surfaces after max attempts."

## Context Provided
- `Pulse AI.md` — retry requirements for external API calls
- `requirements.txt` — tenacity pinned at 9.1.2

## Scope
**In scope:** Retry decorator factory, exponential backoff config, error type filtering, warning logging, reraise
**Out of scope:** Circuit breaker pattern, per-endpoint retry policies, retry on HTTP status codes
