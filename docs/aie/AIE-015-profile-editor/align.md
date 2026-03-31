# Align — Profile Editor system

**AIE:** AIE-015
**Date:** 2026-03-30
**Severity:** major
**Domain:** frontend

## Problem
Users have no way to edit their health profile. The "Edit profile" button in the top nav bar was a placeholder (noted as follow-up in AIE-008). Users need a full editing interface for personal information, medical history, medications, lifestyle notes, and health goals, with data persisted to localStorage.

## Decision
Build an `EditProfileView` component and a reusable `WordBankSection` component, both embedded in `web/app/page.tsx`:

**EditProfileView component:**
- Triggered by "Edit profile" button in the top nav bar; sets `showEditProfile` state to true
- Personal Information section: name, age, sex (male/female/other toggle buttons), height (ft + in), weight (lbs)
- Medical History section (uses WordBankSection): conditions with suggestions (Hypertension, Type 2 Diabetes, Asthma, etc.), allergies with suggestions (Penicillin, Sulfa, Latex, etc.), family history with suggestions
- Medications section: word bank of common meds (Lisinopril, Metformin, Atorvastatin, etc.), structured per-med editing rows with name, amount, unit dropdown (mg/ml/g/mcg/IU), frequency dropdown (daily/BID/TID/weekly/etc.), remove button per med, "Add new medication" button
- Lifestyle Notes section (WordBankSection): suggestions like "Exercises 3x/week", "Sedentary job", "Vegetarian"
- Health Goals section (WordBankSection): suggestions like "Lose weight", "Reduce cardiovascular risk"
- Save button: assembles full HealthProfile object, converts imperial to metric (ft/in to cm, lbs to kg), persists to localStorage
- Cancel button: closes editor without saving
- State: individual useState hooks for each field, initialized from profile prop

**WordBankSection reusable component:**
- Props: title, suggestions array, current items, onUpdate callback, addLabel, placeholder
- Renders clickable suggestion chips (teal highlight when added)
- Shows current items as removable pills
- "Add new" button with inline text input

## Why This Approach
Embedding directly in `page.tsx` keeps the profile editor co-located with the existing profile state and avoids routing complexity. The WordBankSection pattern is reused across five sections (conditions, allergies, family history, lifestyle, goals), reducing code duplication. Imperial-to-metric conversion on save matches the backend's metric storage while presenting user-friendly US units. localStorage persistence enables offline editing without backend dependency.

Alternative considered: separate route for profile editing — rejected because the editor is a modal overlay, not a distinct page, and sharing state is simpler within one component tree.

## Impact
Completes the AIE-008 follow-up item for "Edit profile functionality." Users can now maintain their own health profile data, which flows into all chat interactions and health analysis.

## Success Criteria
- "Edit profile" button opens the full editor view
- All profile fields are pre-populated from existing profile data
- WordBankSection chips toggle teal when selected, show removable pills for current items
- Medications support structured editing with name, amount, unit, and frequency per row
- Save correctly converts ft/in to cm and lbs to kg before persisting
- Cancel closes editor without modifying profile
- Profile changes persist across page reloads via localStorage
