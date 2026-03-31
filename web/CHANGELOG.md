# Web UI Changelog

All notable UI changes to Pulse.ai web frontend are documented here.

---

## [0.2.1] — 2026-03-30

### Changed
- Extracted BMI calculator into dedicated `web/app/BMI.tsx` (getBmiCategory, calculateBmi, BmiCalculator component)
- page.tsx now imports BmiCalculator from BMI.tsx instead of inlining BMI logic

---

## [0.2.0] — 2026-03-30

### Changed
- Moved health profile sidebar from right to right-anchored panel with darker bg (#0a1628)
- Redesigned to match Sana Health-style dark navy theme (#0b1929 base)
- Replaced blue/purple gradient branding with teal accent color scheme
- Top nav bar now has pill tabs (Chat, Blood Work, Bio Tracker) with teal active state
- Added action links in header: Clear chat, Edit profile, Sign out
- Profile sidebar now shows stat boxes (conditions count, meds count, abnormal count)
- Added BMI calculator section with colored gradient bar and category labels
- Medications now display with teal-highlighted drug names and dosage in muted text
- Allergies use red-tinted pill tags
- Input bar redesigned: integrated attachment + camera icons, transparent bg, inline Send button
- User message bubbles changed from blue to teal
- Citation accent color changed from blue to teal
- Scrollbar styled with thin dark navy track
- Empty state simplified: headline + subtitle + suggestion buttons

---

## [0.1.0] — 2026-03-30

### Added
- Initial chat interface with dark theme (slate-950 background)
- Health profile sidebar (conditions, medications, allergies, labs, family history)
- Citation cards with expandable PubMed abstracts and PMID links
- Emergency response styling (red border/background for 911 triage)
- Typing indicator animation (three pulsing dots)
- Suggested question buttons on empty state
- Pulse.ai gradient branding (blue-to-purple)
- API proxy via Next.js rewrites to backend on port 8000
- Tailwind CSS v4 with PostCSS integration
- Marcus Chen demo profile auto-loaded on startup
