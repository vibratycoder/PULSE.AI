# Execute — Make BMI calculator height and weight adjustable

**AIE:** AIE-009

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `web/app/BMI.tsx` | modified | Added `useState` and `useEffect` imports from React. Added helper functions: `cmToFeetInches()`, `feetInchesToCm()`, `kgToLbs()`, `lbsToKg()` for unit conversion. `BmiCalculator` now uses local state (`feet`, `inches`, `lbs`) initialized from props and synced via `useEffect`. Static text displays replaced with `<input type="number">` elements with min/max constraints (ft: 0-8, in: 0-11, lbs: 0-999). BMI recalculates live from current input state. `isModified` flag tracks whether values differ from profile. Reset button appears when modified, restoring original profile values. Gradient bar marker now has `transition-all duration-300` for smooth movement. 132 lines (was 70). |

## Outcome
BMI calculator is now fully interactive. Users can type values directly into the ft, in, and lbs fields. BMI value, category label, color, and gradient bar position all update instantly. Reset button appears only when values differ from the profile.

Inputs focus with a teal ring (`focus:ring-1 focus:ring-teal-500`) matching the app's design language. Gradient bar marker animates smoothly between positions via CSS transition.

No profile data is mutated — all changes are ephemeral local state. If the profile prop changes (e.g., different user loaded), `useEffect` syncs the inputs to the new profile values.

## Side Effects
None — local state only, no API calls, no profile mutations.

## Tests
No automated tests. Verified visually: input changes update BMI live, reset restores profile values, useEffect syncs on profile change.

## Follow-Up Required
None.
