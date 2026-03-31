# Instruct — Health profile and evidence injection into Claude system prompt

**AIE:** AIE-005

## Directive
> "Create backend/health/injector.py with build_health_system_prompt(profile,
> question, citations). Define BASE_PHILOSOPHY as a constant string with
> Pulse.ai's identity and rules: 5 core principles (evidence-first, safety-first,
> contextualize don't diagnose, not a doctor, not a prescription service) and
> 4 response format rules (250 word limit, 8th-grade reading level, citation
> format, actionable takeaway).
>
> Add _format_profile_section(profile: HealthProfile) -> str that formats
> profile data as readable text. Compute BMI using metric formula:
> weight_kg / (height_cm / 100) ** 2. Include all profile fields: name, age,
> sex, height, weight, BMI, conditions, medications (name + dosage), allergies,
> family history, lifestyle, lab results (with flag and date), health goals.
> Return empty string if profile has no name and no conditions.
>
> Add _format_citations_section(citations: list[Citation]) -> str. When
> citations exist, format each with index, title, journal, year, PMID, and
> abstract truncated to 800 chars. When no citations, return an EVIDENCE STATUS
> notice telling Claude to base response on training knowledge only.
>
> build_health_system_prompt() joins BASE_PHILOSOPHY + profile section +
> citations section with '\\n\\n---\\n\\n' separators."

## Context Provided
- `Pulse AI.md` — system prompt philosophy, injector architecture
- `backend/models/health_profile.py` — HealthProfile and Citation models

## Scope
**In scope:** System prompt assembly, profile formatting, citation formatting, BMI calculation, evidence fallback message
**Out of scope:** Claude API call, response parsing, profile database integration
