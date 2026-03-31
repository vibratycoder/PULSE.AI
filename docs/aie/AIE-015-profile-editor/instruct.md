# Instruct — Profile Editor system

**AIE:** AIE-015

## Directive
> "Add a full profile editing system to web/app/page.tsx:
>
> 1. WordBankSection component — reusable component for list-type profile fields.
>    Props: title (string), suggestions (string[]), items (string[]),
>    onUpdate (callback), addLabel (string), placeholder (string).
>    Render suggestion chips as clickable buttons — teal highlight when the
>    item is in the current list, default slate when not. Show current items
>    as removable pills with an X button. 'Add new' button toggles an inline
>    text input for manual entry.
>
> 2. EditProfileView component — full health profile editing interface.
>    Props: profile (HealthProfile), onSave (callback), onCancel (callback).
>    State: individual useState hooks for name, age, sex, heightFt, heightIn,
>    weightLbs, conditions, allergies, familyHistory, medications, lifestyle,
>    goals — all initialized from the profile prop.
>
>    Sections:
>    - Personal Information: name text input, age number input, sex with
>      male/female/other toggle buttons, height as ft + in number inputs,
>      weight as lbs number input.
>    - Medical History: WordBankSection for conditions (suggestions:
>      Hypertension, Type 2 Diabetes, Asthma, etc.), WordBankSection for
>      allergies (suggestions: Penicillin, Sulfa, Latex, etc.),
>      WordBankSection for family history with relevant suggestions.
>    - Medications: word bank of common meds (Lisinopril, Metformin,
>      Atorvastatin, etc.) as clickable chips. Per-medication editing rows:
>      name text input, amount number input, unit dropdown (mg/ml/g/mcg/IU),
>      frequency dropdown (daily/BID/TID/weekly/etc.), remove button.
>      'Add new medication' button appends a blank row.
>    - Lifestyle Notes: WordBankSection with suggestions like 'Exercises
>      3x/week', 'Sedentary job', 'Vegetarian'.
>    - Health Goals: WordBankSection with suggestions like 'Lose weight',
>      'Reduce cardiovascular risk'.
>
>    Save button: assemble HealthProfile object, convert height ft/in to cm
>    (totalInches * 2.54), convert lbs to kg (lbs / 2.205), persist to
>    localStorage, call onSave with updated profile.
>    Cancel button: call onCancel without saving.
>
> 3. Wire into page.tsx — add showEditProfile state (boolean, default false).
>    'Edit profile' button in header sets showEditProfile = true. When true,
>    render EditProfileView instead of the chat interface. onSave updates
>    profile state and sets showEditProfile = false. onCancel sets
>    showEditProfile = false."

## Context Provided
- `web/app/page.tsx` — existing chat frontend with HealthProfile interface, profile state, and placeholder "Edit profile" button (AIE-008)
- AIE-008 align.md — HealthProfile TypeScript interface definition, header action buttons
- AIE-008 execute.md — follow-up item noting "Edit profile functionality" as pending

## Scope
**In scope:** EditProfileView component, WordBankSection component, showEditProfile state toggle, imperial-to-metric conversion on save, localStorage persistence, wiring "Edit profile" button
**Out of scope:** Backend API endpoint for profile saving (localStorage only), profile photo upload, lab result editing, Blood Work tab, Bio Tracker tab
