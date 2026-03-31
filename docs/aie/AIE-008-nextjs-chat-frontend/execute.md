# Execute — Next.js chat frontend with health profile sidebar

**AIE:** AIE-008

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `web/app/page.tsx` | created | Main chat component (457 lines). 5 TypeScript interfaces (Citation, LabResult, Medication, HealthProfile, Message). 3 sub-components: `CitationCard` (expandable with PMID link), `HealthProfileSidebar` (right side, hidden <lg, stat boxes + BMI + conditions/meds/allergies/labs/family history), `TypingIndicator` (3 animated dots). `Home()` component with useState for messages/input/loading/profile/activeTab/userId. useEffect for profile fetch and auto-scroll. `sendMessage()` POSTs to /api/chat. `clearChat()` resets messages. Header with 3 tabs + 3 action buttons. Empty state with 3 suggested questions. Message bubbles: user=teal right, assistant=slate left, emergency=red-900/50+red-700 border. Citations rendered below assistant messages as "Sources". Input area with attachment/camera icons (placeholder), text input, Send button. |
| `web/app/BMI.tsx` | created | 70 lines. `BmiCategory` interface (label, color, position). `getBmiCategory(bmi)` returns category with Tailwind color class and bar position (bmi/40*100, capped at 95%). `calculateBmi(heightCm, weightKg)` metric formula. `BmiCalculator` component: displays height converted to ft/in (`Math.floor(heightCm/30.48)` ft, `Math.round((heightCm/2.54)%12)` in), weight in lbs (`Math.round(weightKg*2.205)`), BMI value (1 decimal), category label with color, gradient bar `from-blue-500 via-green-500 via-yellow-500 to-red-500` with white marker, reference markers at 18.5/25/30. |
| `web/app/layout.tsx` | created | 23 lines. RootLayout with Metadata: title "Pulse.ai — Your AI Health Companion", description "Personalized health insights grounded in peer-reviewed evidence." Body: `bg-[#0b1929] text-slate-100 min-h-screen`. Imports globals.css. |
| `web/app/globals.css` | created | 53 lines. `@import "tailwindcss"`. 5 CSS variables (--pulse-teal, --pulse-dark, --pulse-sidebar, --pulse-card, --pulse-border). System font stack. `.citation-card` hover: translateY(-1px) + box-shadow. Webkit scrollbar: 4px, dark (#1e3a5f/#2a4a6f). `@keyframes pulse-dot` (0%,80%,100% opacity:0; 40% opacity:1). `.typing-dot` animation 1.4s infinite, nth-child delays 0.2s/0.4s. |
| `web/next.config.ts` | created | 14 lines. NextConfig with `rewrites()` returning `[{source: "/api/:path*", destination: "http://localhost:8000/api/:path*"}]`. |
| `web/package.json` | created | 28 lines. name "web", scripts: dev (port 3000), build, start. Dependencies: next ^16.2.1, react ^19.2.4, react-dom ^19.2.4. DevDeps: @tailwindcss/postcss 4.2.2, @types/node 25.5.0, @types/react 19.2.14, postcss 8.5.8, tailwindcss 4.2.2, typescript 6.0.2. |
| `web/tsconfig.json` | created | 42 lines. ES2017 target, strict, noEmit, esModuleInterop, module esnext, bundler resolution, jsx react-jsx, incremental, @/* path alias, Next.js plugin. |

## Outcome
Full chat interface works end-to-end. Messages render with proper user/assistant styling. Citations display as expandable cards with clickable PubMed links. Emergency messages render with red background and border. Profile sidebar shows all Marcus Chen data with tabbed sections.

Key UI details:
- BMI correctly shows 28.1 (Overweight, orange) for Marcus Chen (180cm, 91kg)
- Height converts to 5ft 11in, weight to 201lbs for sidebar display
- Lab flags color-coded: HbA1c/LDL/Glucose/Triglycerides show red ↑, HDL/eGFR show amber ↓
- Tab system has Chat (functional), Blood Work (placeholder), Bio Tracker (placeholder)
- Error fallback shows "Unable to connect" message if backend is down

## Side Effects
- Frontend depends on backend running at localhost:8000
- node_modules directory is large (~200MB+) due to Next.js + Sharp image processing

## Tests
No automated tests. Verified visually in browser.

## Follow-Up Required
- [x] Blood Work tab implementation → AIE-012
- [x] Bio Tracker tab implementation → AIE-013 (Medication Tracker)
- [x] Edit profile functionality → AIE-015
- [x] File attachment and camera capture → AIE-010
- [ ] Response streaming for better UX
- [ ] Mobile responsive sidebar (currently hidden on <lg screens)
