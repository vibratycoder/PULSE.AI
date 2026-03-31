# Align — Make BMI calculator height and weight adjustable

**AIE:** AIE-009
**Date:** 2026-03-30
**Severity:** moderate
**Domain:** frontend

## Problem
The BMI calculator in the sidebar is read-only — it displays the user's height and weight from their profile but provides no way to adjust the values. Users may want to explore "what-if" scenarios (e.g., "what would my BMI be if I lost 10 lbs?") without changing their actual profile data.

## Decision
Add interactive controls to the BMI calculator component:
- Convert the static height (ft/in) and weight (lbs) displays into editable number inputs
- Store local state for adjusted height and weight, initialized from profile values
- Recalculate BMI live as the user changes values
- Add a reset button to restore profile values
- Keep the existing gradient bar and category display, updating reactively

The adjustments are local/ephemeral — they do not modify the user's actual health profile.

## Why This Approach
Inline editable inputs keep the interaction contained within the existing sidebar layout. Local state means no API calls or profile mutations. Users get immediate visual feedback via the BMI bar and category as they adjust values.

Alternative considered: Modal with sliders — rejected as overly complex for a simple two-field adjustment in an already compact sidebar.

## Impact
- Modifies `web/app/BMI.tsx` — adds state and input controls
- No backend changes required
- No profile data is mutated

## Success Criteria
- User can type or increment/decrement height (ft, in) and weight (lbs)
- BMI value, category, color, and gradient bar update live as values change
- Reset button restores original profile values
- Initial values match the profile data on load
