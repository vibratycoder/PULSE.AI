# Execute — Profile Editor system

**AIE:** AIE-015

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `web/app/page.tsx` | modified | Added `WordBankSection` component — reusable for list-type profile fields. Props: title, suggestions[], items[], onUpdate callback, addLabel, placeholder. Renders clickable suggestion chips with teal highlight when active, removable pills for current items, and an inline "Add new" text input. Added `EditProfileView` component — full health profile editor. Individual useState hooks for name, age, sex, heightFt, heightIn, weightLbs, conditions, allergies, familyHistory, medications, lifestyle, goals (all initialized from profile prop). Personal Information section with name, age, sex toggle (male/female/other), height (ft + in), weight (lbs). Medical History section using WordBankSection for conditions (Hypertension, Type 2 Diabetes, Asthma, etc.), allergies (Penicillin, Sulfa, Latex, etc.), and family history. Medications section with word bank chips (Lisinopril, Metformin, Atorvastatin, etc.), structured per-med rows (name, amount, unit dropdown mg/ml/g/mcg/IU, frequency dropdown daily/BID/TID/weekly/etc., remove button), "Add new medication" button. Lifestyle Notes section (WordBankSection: "Exercises 3x/week", "Sedentary job", "Vegetarian", etc.). Health Goals section (WordBankSection: "Lose weight", "Reduce cardiovascular risk", etc.). Save button assembles HealthProfile, converts ft/in to cm and lbs to kg, persists to localStorage. Cancel button closes without saving. Added `showEditProfile` boolean state to Home component. Wired "Edit profile" header button to set showEditProfile = true. Conditionally renders EditProfileView when showEditProfile is true, otherwise renders chat interface. |

## Outcome
Full profile editing interface works end-to-end. Users click "Edit profile" in the header, see the editor pre-populated with their current profile data, make changes across all sections, and save. Completes the AIE-008 follow-up item.

Key UI details:
- WordBankSection reused across 5 sections (conditions, allergies, family history, lifestyle, goals), providing consistent chip + pill + manual-add UX
- Sex field uses toggle buttons instead of a dropdown for quick selection
- Height displayed in ft/in and weight in lbs for US-friendly input; converted to metric on save (totalInches * 2.54 for cm, lbs / 2.205 for kg)
- Medication rows are fully structured with dropdowns for unit and frequency
- Profile persists to localStorage, surviving page reloads without backend dependency

## Side Effects
- page.tsx file size increased significantly with two new components (EditProfileView, WordBankSection)
- localStorage now stores profile data — clearing browser storage will reset profile to defaults

## Tests
No automated tests. Verified visually in browser: form pre-population, chip toggling, medication row add/remove, imperial-to-metric conversion, localStorage round-trip.

## Follow-Up Required
- [ ] Backend API endpoint for profile persistence (replace localStorage)
- [ ] Form validation (required fields, numeric ranges for age/height/weight)
- [ ] Profile photo upload
- [ ] Lab result editing interface
- [ ] Extract EditProfileView and WordBankSection into separate files to reduce page.tsx size
