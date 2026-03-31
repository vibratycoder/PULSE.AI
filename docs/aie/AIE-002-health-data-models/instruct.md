# Instruct — Health data models and demo profiles

**AIE:** AIE-002

## Directive
> "Create Pydantic models in backend/models/health_profile.py for Medication,
> LabResult, HealthProfile, Citation, ChatRequest, and ChatResponse. HealthProfile
> should use metric units: height_cm (float) and weight_kg (float). Include
> user_id, name, age, sex, conditions, medications, allergies, family_history,
> lifestyle_notes, lab_results, and health_goals. All list fields should default
> to empty lists using Field(default_factory=list). Citation needs pmid, title,
> journal, year, abstract. ChatResponse needs response, citations, is_emergency.
>
> Create a demo profile for Marcus Chen (42yo male, 180cm, 91kg, hypertension,
> prediabetes) in backend/models/demo_profiles.py with realistic lab values:
> HbA1c 6.3% (high), LDL 158 mg/dL (high), HDL 42 mg/dL (low), Fasting glucose
> 118 mg/dL (high), Triglycerides 195 mg/dL (high), eGFR 74 mL/min/1.73m² (low).
> All dated 2026-03-15. Include get_demo_profile() lookup function."

## Context Provided
- `Pulse AI.md` — Marcus Chen profile specification, data model requirements
- `backend/config.py` — Settings class for reference

## Scope
**In scope:** All Pydantic models, demo profile data, profile lookup function, DEMO_PROFILES dict
**Out of scope:** Database integration, Supabase client, profile API routes
