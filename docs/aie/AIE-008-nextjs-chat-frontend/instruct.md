# Instruct — Next.js chat frontend with health profile sidebar

**AIE:** AIE-008

## Directive
> "Create a Next.js 16 frontend in web/ with React 19 and Tailwind CSS 4:
>
> 1. web/app/page.tsx — 'use client' component. Define TypeScript interfaces
>    matching backend models: Citation, LabResult, Medication, HealthProfile,
>    Message (with role, content, citations?, is_emergency?). State: messages[],
>    input, loading, profile, activeTab, userId='demo-marcus-chen'. useEffect
>    to fetch /api/profile/{userId} on mount. useEffect to auto-scroll on new
>    messages. sendMessage() POSTs to /api/chat with {message, user_id} and
>    appends response to messages. Components:
>    - CitationCard: expandable card with title, journal/year, PMID link to
>      pubmed.ncbi.nlm.nih.gov, collapsible abstract
>    - HealthProfileSidebar: right sidebar (hidden mobile, lg:flex), profile
>      header with stat boxes (conditions/meds/abnormal counts), BmiCalculator
>      import, conditions as pills, medications with name+dosage, allergies as
>      red pills, lab results color-coded (high=red↑, low=amber↓, normal=green),
>      family history
>    - TypingIndicator: 3 animated teal dots
>    Header: tabs (Chat/Blood Work/Bio Tracker), Clear chat/Edit profile/Sign out
>    Empty state: 3 suggested questions. Emergency messages: bg-red-900/50 border.
>    Input area: attachment icon, camera icon, text input (Enter to send), Send btn.
>
> 2. web/app/BMI.tsx — export calculateBmi(heightCm, weightKg) using metric,
>    getBmiCategory(bmi) returning {label, color, position}, BmiCalculator
>    component displaying height in ft/in, weight in lbs (converted from metric),
>    BMI value + category, gradient bar blue→green→yellow→red with markers 18.5/25/30.
>
> 3. web/app/layout.tsx — RootLayout with dark theme bg-[#0b1929], metadata title.
>
> 4. web/app/globals.css — @import tailwindcss. CSS vars for pulse colors. Citation
>    card hover animation. Custom scrollbar. Typing dot keyframe animation with
>    staggered delays.
>
> 5. web/next.config.ts — rewrite /api/:path* to http://localhost:8000/api/:path*.
>
> 6. web/package.json — next ^16.2.1, react ^19.2.4, tailwindcss 4.2.2, typescript 6.
>
> 7. web/tsconfig.json — ES2017, strict, @/* path alias, Next.js plugin."

## Context Provided
- `Pulse AI.md` — UI specifications, component requirements
- `backend/api/chat.py` — POST /api/chat request/response format
- `backend/api/profile.py` — GET /api/profile/{user_id} response format
- `backend/models/health_profile.py` — all data models for type reference

## Scope
**In scope:** Chat UI, profile sidebar, BMI component, citation cards, layout, globals.css, API proxy config, tsconfig, package.json
**Out of scope:** Blood Work tab content, Bio Tracker tab content (tabs exist but not implemented), Edit profile functionality, Sign out functionality, file attachment, camera capture
