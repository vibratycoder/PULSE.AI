# Instruct — Emergency symptom triage system

**AIE:** AIE-003

## Directive
> "Create backend/health/triage.py with a check_emergency() function. Define
> EMERGENCY_PATTERNS as a list of compiled re.Pattern objects covering chest
> pain/pressure/tightness, difficulty/hard to breathe, can't breathe, shortness
> of breath, not breathing, sudden severe headache, worst headache, sudden
> one-sided weakness/numbness, face drooping, slurred speech, sudden confusion,
> coughing/vomiting blood, severe abdominal pain, throat swelling, difficulty
> swallowing, can't swallow, anaphylaxis, seizure, unconscious, stroke symptoms,
> heart attack, suicidal ideation, self-harm, overdose. All patterns use
> re.IGNORECASE. Define EMERGENCY_RESPONSE as a constant string with 911
> instructions and 988 crisis line number. check_emergency() takes a message
> string, checks all patterns, logs any match as a warning with structlog
> (including pattern and message preview), and returns a boolean."

## Context Provided
- `Pulse AI.md` — safety-first philosophy, emergency handling requirements
- `backend/api/chat.py` — where triage will be called first in the chat pipeline

## Scope
**In scope:** Emergency regex patterns, response constant, check function, warning logging
**Out of scope:** Non-emergency severity classification, symptom scoring, configurable pattern lists
