# Align — Medication Tracker

**AIE:** AIE-013
**Date:** 2026-03-30
**Severity:** major
**Domain:** frontend

## Problem
PulseAI users managing chronic conditions or complex medication regimens had no way to track whether they were taking their medications on schedule. The "Bio Tracker" placeholder noted in AIE-008 needed to be replaced with a functional medication adherence tracking system that supports multi-dose medications (BID, TID), provides visual feedback on compliance, and motivates consistent behavior through streak tracking.

## Decision
Built a complete frontend-only medication adherence tracking system as the `MedTrackerTab` component in a single file.

- **`web/app/MedTracker.tsx`** (659 lines) — Self-contained medication tracker component that receives a `medications` array (name + dosage) from the parent profile and persists all tracking data to LocalStorage under the `pulseai_medlog` key.

Key architectural elements:
- **`MedLog` interface:** `{ [dateKey: string]: { [medName: string]: number | boolean } }` — stores dose counts per medication per day, with backward compatibility for legacy boolean values.
- **`getDoseCount(log, day, medName)`** — normalizes legacy boolean entries to numeric dose counts.
- **`parseDosesPerWeek(dosage)`** — parses dosage strings like "BID", "3x daily", "weekly", "as needed" into weekly dose counts for adherence calculations.
- **`parseDosesPerDay(dosage)`** — extracts daily dose frequency for per-dose button rendering.
- **`getFrequencyLabel(dosage)`** — converts dosage strings to human-readable frequency labels.

UI sections:
1. **Summary cards** — streak count, today's completion %, week completion %, total logged doses.
2. **Today's Checklist** — each medication shows dose buttons (1x, 2x, 3x based on dosage frequency) to check/uncheck individual doses.
3. **This Week grid** — 7-column day view with per-medication dose indicators and status classifications (complete, on-track, behind, missed, as-needed, extra).
4. **30-Day Heatmap** — color-coded grid cells (green=100%, yellow=partial, red=0%, gray=no data).

## Why This Approach
A frontend-only approach with LocalStorage persistence was chosen because medication tracking is personal, latency-sensitive, and benefits from offline capability. Users can log doses instantly without waiting for network round-trips, and the data persists across sessions without requiring backend infrastructure.

The per-dose tracking model (numeric counts rather than simple booleans) was chosen to properly support medications prescribed at BID (twice daily), TID (three times daily), or other multi-dose frequencies. The legacy boolean compatibility in `getDoseCount` ensures existing data from earlier prototypes is not lost.

Alternatives considered:
- **Backend-persisted tracking** — would enable cross-device sync but adds latency and complexity. Deferred until multi-device support is prioritized.
- **Third-party medication tracking library** — no well-maintained React library exists that handles the specific combination of multi-dose tracking, streak counting, and heatmap visualization needed here.
- **Calendar-based UI** — a full calendar view was considered but rejected in favor of the focused "today + this week + 30-day heatmap" layout, which better serves the daily check-in workflow.

## Impact
- Users can track medication adherence with per-dose granularity for multi-dose medications.
- The streak counter and heatmap provide visual motivation for consistent adherence.
- The weekly analysis grid gives a quick overview of adherence patterns and identifies missed doses.
- Replaces the "Bio Tracker" placeholder from AIE-008 with a functional feature.
- Accessible from the top navigation bar as the "Med" tab.

## Success Criteria
- Users can log individual doses for each medication on today's checklist.
- Multi-dose medications (BID, TID) show the correct number of dose buttons.
- The streak counter accurately reflects consecutive days of full adherence.
- The weekly grid correctly classifies each medication-day as complete, on-track, behind, missed, as-needed, or extra.
- The 30-day heatmap renders color-coded cells reflecting daily completion percentages.
- Dose data persists across page refreshes via LocalStorage.
- Legacy boolean values in existing logs are handled without errors.
