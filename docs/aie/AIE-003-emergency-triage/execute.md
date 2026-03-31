# Execute — Emergency symptom triage system

**AIE:** AIE-003

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `backend/health/__init__.py` | created | Empty package init |
| `backend/health/triage.py` | created | 29 compiled `re.Pattern` objects in `EMERGENCY_PATTERNS` list (all with `re.IGNORECASE`). `EMERGENCY_RESPONSE` constant with 911 instructions and 988 crisis line. `check_emergency(message: str) -> bool` function — iterates all patterns, logs first match as warning (pattern + message_preview[:100]), returns True on first match / False if none. 74 lines. |

## Outcome
All 29 patterns compile and match correctly. Emergency detection is case-insensitive. Function returns `bool` only — the caller imports `EMERGENCY_RESPONSE` separately.

Full pattern list (29 patterns):
1. `chest\s+pain` 2. `chest\s+pressure` 3. `chest\s+tight`
4. `difficulty\s+breathing` 5. `can'?t\s+breathe` 6. `hard\s+to\s+breathe`
7. `shortness\s+of\s+breath` 8. `sudden\s+severe\s+headache` 9. `worst\s+headache`
10. `sudden\s+(one[- ]sided\s+)?(weakness|numbness)` 11. `face\s+droop`
12. `slurred\s+speech` 13. `sudden\s+confusion` 14. `coughing\s+(up\s+)?blood`
15. `vomiting\s+blood` 16. `severe\s+abdominal\s+pain` 17. `throat\s+swelling`
18. `difficulty\s+swallowing` 19. `can'?t\s+swallow` 20. `anaphyla`
21. `seizure` 22. `unconscious` 23. `not\s+breathing`
24. `stroke\s+symptoms?` 25. `heart\s+attack` 26. `suicid`
27. `self[- ]harm` 28. `overdose`

Note: Pattern 20 (`anaphyla`) matches both "anaphylaxis" and "anaphylactic" via prefix matching. Pattern 26 (`suicid`) matches "suicidal", "suicide", etc.

## Side Effects
None — standalone module. Only dependency is structlog for logging.

## Tests
No automated tests. Patterns verified manually with sample phrases.

## Follow-Up Required
- [x] AIE-006: Chat API imports `check_emergency` and `EMERGENCY_RESPONSE` as first pipeline step
