# Align — Health data models and demo profiles

**AIE:** AIE-002
**Date:** 2026-03-28
**Severity:** major
**Domain:** backend

## Problem
No data models exist to represent health profiles, lab results, medications, or chat interactions. The backend needs structured types for API request/response validation and for injecting user health context into Claude's system prompt.

## Decision
Create Pydantic models for the full health data domain:
- `Medication` — name (str), dosage (str)
- `LabResult` — name, value, unit, flag (normal/high/low), date_taken (defaults to today)
- `HealthProfile` — user_id, name, age, sex, **height_cm** (float), **weight_kg** (float), conditions[], medications[], allergies[], family_history[], lifestyle_notes[], lab_results[], health_goals[]
- `Citation` — pmid, title, journal, year, abstract (optional, defaults to "")
- `ChatRequest` — message (str), user_id (str, defaults to "")
- `ChatResponse` — response (str), citations[] (list[Citation]), is_emergency (bool)

Also create a demo profile for Marcus Chen (42yo male, 180cm, 91kg) with realistic health data for development and demonstrations.

## Why This Approach
Pydantic models provide runtime validation, automatic JSON serialization, and serve as the single source of truth for the API contract. Using **metric units** (cm/kg) internally avoids conversion errors and matches international medical standards. A demo profile enables frontend development without requiring a database.

Alternative considered: Plain dataclasses — rejected because FastAPI integrates natively with Pydantic for request/response validation and OpenAPI schema generation.

## Impact
Every backend module depends on these models. The chat endpoint, injector, profile API, and frontend all consume these types.

## Success Criteria
- All models validate correctly with sample data
- Demo profile loads via `get_demo_profile("demo-marcus-chen")`
- ChatResponse serializes with citations array and is_emergency flag
- HealthProfile uses metric units consistently (height_cm, weight_kg)
