# Instruct — Make BMI calculator height and weight adjustable

**AIE:** AIE-009

## Directive
> "Make the BMI calculator a usable feature, not a display feature. Add editable
> number inputs for height (feet and inches) and weight (lbs) so users can adjust
> values and see BMI recalculate live. Initialize from profile values. Add a reset
> button to restore original profile values. Keep the gradient bar and category
> updating reactively. All changes are local — no profile mutations."

## Context Provided
- `web/app/BMI.tsx` — current read-only BMI component (70 lines)
- `web/app/page.tsx` — sidebar passes `heightCm` and `weightKg` as props

## Scope
**In scope:** Editable height/weight inputs, local state, live BMI recalculation, reset to profile values
**Out of scope:** Persisting adjusted values to profile, backend changes
