# Instruct — Medication Tracker

**AIE:** AIE-013

## Directive
> Build a complete medication adherence tracking system as a single React component. Support per-dose tracking for multi-dose medications (BID, TID), a weekly adherence analysis grid, a 30-day compliance heatmap, and a streak counter. Persist all data to LocalStorage and receive the medication list from the parent profile via props.

## Context Provided
- **`web/app/MedTracker.tsx`** (659 lines) — `MedTrackerTab` component. Full medication adherence tracking system. Receives `medications` array (name + dosage) from parent profile. Persists dose logs to LocalStorage under key `pulseai_medlog`.

Key interfaces and helpers:
- **`MedLog` interface** — `{ [dateKey: string]: { [medName: string]: number | boolean } }`. Stores dose counts per medication per day. Supports legacy boolean values for backward compatibility.
- **`getDoseCount(log, day, medName)`** — Returns numeric dose count for a given day and medication, normalizing legacy boolean entries to `0` or `1`.
- **`parseDosesPerWeek(dosage)`** — Parses dosage strings ("BID", "3x daily", "weekly", "as needed") into expected weekly dose counts.
- **`parseDosesPerDay(dosage)`** — Extracts daily dose frequency from dosage strings for rendering per-dose buttons.
- **`getFrequencyLabel(dosage)`** — Converts dosage strings to human-readable labels (e.g., "BID" to "Twice daily").
- **`STORAGE_KEY`** constant — `pulseai_medlog`.
- **`DAY_NAMES`** constant — Array of day abbreviations for the weekly grid.

UI sections:
1. Summary cards: streak count, today's completion %, week completion %, total logged doses.
2. Today's Checklist: per-medication dose buttons (1x, 2x, 3x based on `parseDosesPerDay`), check/uncheck individual doses.
3. This Week grid: 7-column day view, per-medication dose indicators, status classifications (complete/on-track/behind/missed/as-needed/extra).
4. 30-Day Heatmap: color-coded grid cells (green=100%, yellow=partial, red=0%, gray=no data).

## Scope
**In scope:**
- `MedTrackerTab` component with props receiving medications array from parent
- `MedLog` data structure with LocalStorage persistence
- Per-dose tracking supporting multi-dose medications (BID, TID, etc.)
- Dosage string parsing helpers (`parseDosesPerWeek`, `parseDosesPerDay`, `getFrequencyLabel`)
- Legacy boolean value handling in `getDoseCount`
- Today's medication checklist with dose buttons
- Weekly adherence analysis grid with status classifications
- 30-day compliance heatmap with color coding
- Streak counter for consecutive full-adherence days
- Summary cards (streak, today %, week %, total logged)
- Integration into top nav as "Med" tab

**Out of scope:**
- Backend persistence or cross-device sync
- Medication reminders or push notifications
- Medication interaction checking
- Prescription management or refill tracking
- Dosage time-of-day tracking (morning vs evening doses)
- Data export or sharing with healthcare providers
- Medication search or database lookup
