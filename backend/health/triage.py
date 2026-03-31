"""Emergency symptom triage — checks for life-threatening symptoms.

If ANY emergency symptom is detected, the response MUST begin with a 911
instruction BEFORE any health information is provided. This is non-negotiable.
"""

import re

import structlog

log = structlog.get_logger()

EMERGENCY_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"chest\s+pain", re.IGNORECASE),
    re.compile(r"chest\s+pressure", re.IGNORECASE),
    re.compile(r"chest\s+tight", re.IGNORECASE),
    re.compile(r"difficulty\s+breathing", re.IGNORECASE),
    re.compile(r"can'?t\s+breathe", re.IGNORECASE),
    re.compile(r"hard\s+to\s+breathe", re.IGNORECASE),
    re.compile(r"shortness\s+of\s+breath", re.IGNORECASE),
    re.compile(r"sudden\s+severe\s+headache", re.IGNORECASE),
    re.compile(r"worst\s+headache", re.IGNORECASE),
    re.compile(r"sudden\s+(one[- ]sided\s+)?(weakness|numbness)", re.IGNORECASE),
    re.compile(r"face\s+droop", re.IGNORECASE),
    re.compile(r"slurred\s+speech", re.IGNORECASE),
    re.compile(r"sudden\s+confusion", re.IGNORECASE),
    re.compile(r"coughing\s+(up\s+)?blood", re.IGNORECASE),
    re.compile(r"vomiting\s+blood", re.IGNORECASE),
    re.compile(r"severe\s+abdominal\s+pain", re.IGNORECASE),
    re.compile(r"throat\s+swelling", re.IGNORECASE),
    re.compile(r"difficulty\s+swallowing", re.IGNORECASE),
    re.compile(r"can'?t\s+swallow", re.IGNORECASE),
    re.compile(r"anaphyla", re.IGNORECASE),
    re.compile(r"seizure", re.IGNORECASE),
    re.compile(r"unconscious", re.IGNORECASE),
    re.compile(r"not\s+breathing", re.IGNORECASE),
    re.compile(r"stroke\s+symptoms?", re.IGNORECASE),
    re.compile(r"heart\s+attack", re.IGNORECASE),
    re.compile(r"suicid", re.IGNORECASE),
    re.compile(r"self[- ]harm", re.IGNORECASE),
    re.compile(r"overdose", re.IGNORECASE),
]

EMERGENCY_RESPONSE = (
    "**Please call 911 or go to the ER immediately.**\n\n"
    "The symptoms you're describing could indicate a life-threatening "
    "emergency. Do not wait — call 911 or have someone drive you to the "
    "nearest emergency room right now.\n\n"
    "If you are in immediate danger to yourself, please call the "
    "988 Suicide & Crisis Lifeline (call or text 988).\n\n"
    "Once you are safe and have received medical attention, I'm here "
    "to help you understand your situation."
)


def check_emergency(message: str) -> bool:
    """Check if a message contains emergency symptoms.

    Args:
        message: The user's message text.

    Returns:
        True if any emergency pattern matches, False otherwise.
    """
    for pattern in EMERGENCY_PATTERNS:
        if pattern.search(message):
            log.warning(
                "emergency_detected",
                pattern=pattern.pattern,
                message_preview=message[:100],
            )
            return True
    return False
