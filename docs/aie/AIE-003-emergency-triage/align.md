# Align — Emergency symptom triage system

**AIE:** AIE-003
**Date:** 2026-03-28
**Severity:** critical
**Domain:** ai

## Problem
Users may describe life-threatening symptoms (chest pain, stroke signs, difficulty breathing, suicidal ideation) in a health chat. The system must detect these immediately and respond with emergency instructions before any other processing. Failure to intercept emergencies is a safety-critical issue.

## Decision
Build a regex-based emergency triage system with **29 compiled patterns** covering:
- Cardiac: chest pain, chest pressure, chest tightness, heart attack
- Respiratory: difficulty breathing, can't breathe, hard to breathe, shortness of breath, not breathing
- Neurological: sudden severe headache, worst headache, sudden weakness/numbness (one-sided), face drooping, slurred speech, sudden confusion, seizure, unconscious, stroke symptoms
- Hemorrhagic: coughing blood, vomiting blood
- GI: severe abdominal pain
- Allergic: throat swelling, difficulty swallowing, can't swallow, anaphylaxis
- Mental health: suicidal ideation, self-harm, overdose

When triggered, return a standardized `EMERGENCY_RESPONSE` constant directing the user to call 911 immediately and providing the 988 Suicide & Crisis Lifeline number.

The `check_emergency()` function returns a **boolean only** (True/False). The caller retrieves the response text from the `EMERGENCY_RESPONSE` constant separately. This check runs BEFORE any Claude API call or PubMed lookup.

## Why This Approach
Regex pattern matching is deterministic, instant (~microseconds), and independent of external services. For safety-critical detection, deterministic rules are more reliable than LLM classification which adds latency and non-determinism.

Alternative considered: Use Claude to classify emergency severity — rejected because it adds ~2s latency and could hallucinate a non-emergency classification.

## Impact
Affects the entire chat flow. Emergency check is the first operation in `/api/chat`. If triggered, no PubMed or Claude calls occur.

## Success Criteria
- "I'm having chest pain" → immediate 911 response, no Claude call
- "my headache won't go away" → normal processing (not matched by "sudden severe headache" pattern)
- All 29 patterns match correctly with case-insensitive matching
- Zero false negatives on life-threatening phrases
- Matched patterns logged as warnings via structlog
