# Execute — Health profile and evidence injection into Claude system prompt

**AIE:** AIE-005

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `backend/health/injector.py` | created | `BASE_PHILOSOPHY` constant (~1200 chars) defining Pulse.ai identity, 5 core principles, and 4 response format rules. `_format_profile_section(profile: HealthProfile) -> str` builds "USER HEALTH PROFILE:" section with name, age/sex, height/weight/BMI (metric: `weight_kg / (height_cm/100)**2`), conditions, medications (name + dosage), allergies, family history, lifestyle, lab results (value + unit + flag + date), health goals — returns empty string when profile has no name and no conditions. `_format_citations_section(citations: list[Citation]) -> str` formats numbered citations with title, journal, year, PMID, abstract[:800] — returns "EVIDENCE STATUS" fallback when list is empty. `build_health_system_prompt(profile, question, citations) -> str` joins all parts with `\n\n---\n\n`. 138 lines. |

## Outcome
System prompt correctly assembles all three layers. Profile section includes all HealthProfile fields with computed BMI. Marcus Chen BMI: `91 / (180/100)² = 91 / 3.24 = 28.1` (correct).

Key details:
- Profile section skipped entirely when profile has no name AND no conditions (anonymous users)
- Lab results formatted as `  {name}: {value} {unit} ({flag}) [{date}]`
- Medications formatted as `{name} {dosage}` joined by commas
- Citations numbered `[1]`, `[2]`, `[3]` with abstract truncated to 800 chars
- Evidence fallback explicitly instructs Claude to note "based on medical training knowledge"
- `question` parameter accepted but not directly used in prompt assembly (available for future context)

## Side Effects
None — pure function with no external calls or side effects.

## Tests
No automated tests. Verified by inspecting assembled prompts in chat endpoint logs.

## Follow-Up Required
- [x] AIE-006: Chat API calls build_health_system_prompt() as step 4 of pipeline
