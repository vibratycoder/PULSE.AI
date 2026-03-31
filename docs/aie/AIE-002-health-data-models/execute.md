# Execute — Health data models and demo profiles

**AIE:** AIE-002

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `backend/models/__init__.py` | created | Empty package init |
| `backend/models/health_profile.py` | created | 6 Pydantic models: `Medication` (name, dosage), `LabResult` (name, value, unit, flag, date_taken with Field default_factory=date.today), `HealthProfile` (user_id, name, age, sex, height_cm, weight_kg — all list fields use Field default_factory=list), `Citation` (pmid, title, journal, year, abstract defaults ""), `ChatRequest` (message, user_id defaults ""), `ChatResponse` (response, citations list, is_emergency bool). 115 lines. |
| `backend/models/demo_profiles.py` | created | `MARCUS_CHEN` HealthProfile: age=42, male, 180cm, 91kg, conditions=[hypertension, prediabetes], medications=[Lisinopril 10mg QD, Metformin 500mg BID], allergies=[penicillin], family_history=[father MI at age 58], lifestyle_notes=[inconsistent exercise, 5.5hr sleep], 6 lab results all dated 2026-03-15: HbA1c 6.3% high, LDL 158 mg/dL high, HDL 42 mg/dL low, Fasting glucose 118 mg/dL high, Triglycerides 195 mg/dL high, eGFR 74 mL/min/1.73m² low. health_goals=[reduce CV risk, control blood sugar]. `DEMO_PROFILES` dict keyed by user_id. `get_demo_profile()` returns Optional HealthProfile. 51 lines. |

## Outcome
All models validate correctly. Marcus Chen profile includes realistic borderline values across cardiovascular and metabolic markers. HealthProfile uses **metric** units (height_cm, weight_kg) consistently. ChatResponse includes citations list and is_emergency flag for frontend rendering decisions.

## Side Effects
None — new files only.

## Tests
No automated tests. Models validated manually through API usage.

## Follow-Up Required
- [x] AIE-005: Health prompt injection consumes HealthProfile and Citation
- [x] AIE-006: Chat API uses ChatRequest/ChatResponse
- [x] AIE-008: Frontend mirrors these TypeScript interfaces
