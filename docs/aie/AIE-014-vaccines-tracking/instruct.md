# Instruct — Vaccines tracking system with quick-add and prompt injection

**AIE:** AIE-014

## Directive
> "Create a vaccines tracking system with quick-add word bank and prompt injection:
>
> 1. Add Vaccine model (name: str, date: str) and vaccines: list[Vaccine] field
>    to HealthProfile in backend/models/health_profile.py
> 2. Add 3 sample vaccines to Marcus Chen in demo_profiles.py:
>    COVID-19 (Pfizer) 2025-10-12, Influenza 2025-09-20, Tdap 2022-06-15
> 3. Add vaccines section to _format_profile_section() in injector.py,
>    formatted as 'Vaccines: name (date), ...'
> 4. Add Vaccine TS interface and vaccines field to HealthProfile in page.tsx,
>    add Vaccines sidebar section between Allergies and Recent Labs,
>    add 'Vaccines' to nav tab array, add conditional rendering for vaccines tab
>    with localStorage persistence
> 5. Create web/app/VaccinesTab.tsx — word bank of 12 common vaccines with
>    quick-add buttons showing checkmarks for already-added, manual add form
>    with name input and date picker, vaccine list with remove buttons,
>    onUpdate callback to persist to parent state and localStorage"

## Context Provided
- `backend/models/health_profile.py` — HealthProfile model
- `backend/models/demo_profiles.py` — Marcus Chen demo profile
- `backend/health/injector.py` — system prompt builder with `_format_profile_section()`
- `web/app/page.tsx` — main chat UI with sidebar, nav tabs, and localStorage persistence

## Scope
**In scope:** Vaccine model, demo data, prompt injection, sidebar display, dedicated tab with word bank and manual entry, localStorage persistence
**Out of scope:** Vaccine schedule recommendations, CDC API integration, vaccination reminders, vaccine verification/documentation upload
