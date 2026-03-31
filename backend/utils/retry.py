"""Retry wrapper for external API calls with exponential backoff."""

import structlog
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

log = structlog.get_logger()


def with_retries(
    max_attempts: int = 3,
    min_wait: float = 1.0,
    max_wait: float = 10.0,
) -> retry:
    """Create a tenacity retry decorator for external API calls.

    Args:
        max_attempts: Maximum number of attempts before giving up.
        min_wait: Minimum wait time in seconds between retries.
        max_wait: Maximum wait time in seconds between retries.

    Returns:
        A tenacity retry decorator configured with exponential backoff.
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=min_wait, max=max_wait),
        retry=retry_if_exception_type((TimeoutError, ConnectionError, OSError)),
        before_sleep=lambda state: log.warning(
            "retrying_api_call",
            attempt=state.attempt_number,
            fn=state.fn.__name__ if state.fn else "unknown",
        ),
        reraise=True,
    )
