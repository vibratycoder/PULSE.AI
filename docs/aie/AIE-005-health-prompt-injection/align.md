# Align — Health profile and evidence injection into Claude system prompt

**AIE:** AIE-005
**Date:** 2026-03-28
**Severity:** major
**Domain:** ai

## Problem
Claude needs contextual awareness of the user's health profile (conditions, medications, lab values) and relevant PubMed evidence to provide personalized, evidence-based health responses. Without this injection, Claude responds generically with no personalization or citations.

## Decision
Build a three-layer system prompt assembler in `backend/health/injector.py`:

**Layer 1 — BASE_PHILOSOPHY** (constant string):
- 5 core principles: evidence-first, safety-first, contextualize-don't-diagnose, not a doctor replacement, not a prescription service
- 4 response format rules: 250-word limit, 8th-grade reading level, citation format `(Source: [Title] — [Journal] [Year], PMID: [number])`, actionable takeaway

**Layer 2 — Profile section** (`_format_profile_section()`):
- User demographics, conditions, medications, allergies, family history, lifestyle
- BMI computed at prompt-build time using **metric formula**: `weight_kg / (height_cm / 100)²`
- Lab results with flag indicators and dates
- Health goals

**Layer 3 — Citations section** (`_format_citations_section()`):
- PubMed abstracts formatted with index, title, journal, year, PMID
- Abstracts truncated to 800 characters
- When no citations available: explicit "EVIDENCE STATUS" notice instructing Claude to note this to user

`build_health_system_prompt(profile, question, citations)` joins all layers with `\n\n---\n\n` separators.

## Why This Approach
A layered system prompt keeps concerns separated and makes each component independently testable. Computing BMI at prompt-build time avoids storing derived values. Including the full abstract (truncated at 800 chars) gives Claude enough context to cite meaningfully without blowing up the token count.

Alternative considered: Multiple system messages — rejected because the Anthropic Messages API accepts a single system prompt parameter.

## Impact
- Directly controls Claude's behavior, tone, and response quality
- Changes to BASE_PHILOSOPHY affect every health response
- BMI calculation depends on correct height_cm/weight_kg values

## Success Criteria
- System prompt includes user's conditions, medications, and lab values when profile is loaded
- BMI is calculated correctly using metric formula (Marcus Chen: 91 / (1.80)² = 28.1)
- Citations are formatted with numbered indexes, PMID, title, and truncated abstract
- Empty profile produces no profile section (returns empty string)
- No citations triggers "EVIDENCE STATUS" fallback message
