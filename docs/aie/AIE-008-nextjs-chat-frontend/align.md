# Align — Next.js chat frontend with health profile sidebar

**AIE:** AIE-008
**Date:** 2026-03-28
**Severity:** major
**Domain:** frontend

## Problem
No user interface exists. Users need a chat interface to interact with PulseAI, view their health profile, see PubMed citations alongside responses, and receive clear emergency messaging.

## Decision
Build a Next.js 16 frontend with React 19 and Tailwind CSS 4:

**Main chat page (`page.tsx`, 457 lines):**
- TypeScript interfaces mirroring backend Pydantic models: Citation, LabResult, Medication, HealthProfile, Message
- State: messages[], input, loading, profile, activeTab, userId (hardcoded "demo-marcus-chen")
- Profile fetched from `GET /api/profile/{userId}` on mount
- Chat via `POST /api/chat` with JSON body `{message, user_id}`
- `CitationCard` component: expandable cards showing title, journal, year, PMID link (pubmed.ncbi.nlm.nih.gov), and collapsible abstract
- `HealthProfileSidebar` component (right side, hidden on mobile `lg:flex`): profile header with stat boxes (conditions/meds/abnormal counts), BMI calculator, conditions (pills), medications (name + dosage), allergies (red pills), recent labs (color-coded flags: red ↑ high, amber ↓ low, green normal), family history
- `TypingIndicator` component: 3 animated teal dots
- Emergency messages: red background with red border (`bg-red-900/50 border-red-700`)
- Header tabs: Chat, Blood Work, Bio Tracker (only Chat implemented)
- Actions: Clear chat, Edit profile (placeholder), Sign out (placeholder)
- 3 suggested starter questions in empty state
- Input area with attachment and camera icon buttons (placeholder), text input, Send button

**BMI calculator (`BMI.tsx`, 70 lines):**
- `calculateBmi(heightCm, weightKg)` — metric formula: `weightKg / (heightCm / 100) ** 2`
- `getBmiCategory(bmi)` — returns label, Tailwind color class, and position% for gradient bar:
  - <18.5: Underweight (blue-400)
  - <25: Normal (green-400)
  - <30: Overweight (orange-400)
  - ≥30: Obese (red-400)
- `BmiCalculator` component: displays height in ft/in, weight in lbs (converted from metric), BMI value, category, and gradient bar (blue→green→yellow→red) with reference markers at 18.5/25/30

**Layout (`layout.tsx`, 23 lines):**
- Dark theme: `bg-[#0b1929] text-slate-100 min-h-screen`
- Metadata: title "Pulse.ai — Your AI Health Companion"

**Styling (`globals.css`, 53 lines):**
- CSS variables: --pulse-teal (#14b8a6), --pulse-dark (#0b1929), --pulse-sidebar (#0a1628), --pulse-card (#111d30), --pulse-border (#1a2a42)
- System font stack
- Citation card hover: translateY(-1px) + box-shadow
- Custom scrollbar: 4px width, dark theme (#1e3a5f)
- `@keyframes pulse-dot` animation for typing indicator with staggered delays (0.2s, 0.4s)

**Config (`next.config.ts`, 14 lines):**
- API proxy: rewrites `/api/:path*` → `http://localhost:8000/api/:path*`

## Why This Approach
Next.js provides SSR capabilities, built-in API route proxying, and a mature React ecosystem. Tailwind enables rapid UI development with consistent dark theme. The API proxy avoids CORS issues in development.

Alternative considered: React Native for mobile-first — deferred; web-first allows faster iteration.

## Impact
This is the entire user-facing product. All backend endpoints are consumed here.

## Success Criteria
- Chat messages render with user (teal, right-aligned) and assistant (slate, left-aligned) styling
- Citations display as expandable cards with clickable PMID links
- Emergency messages show red styling with distinct border
- Health profile sidebar shows all Marcus Chen data
- BMI displays correctly: 28.1 (Overweight, orange) for Marcus Chen
- API proxy successfully forwards to backend on port 8000
