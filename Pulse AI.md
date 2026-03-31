
# CLAUDE.md — Pulse.ai

> Read this entire file before writing a single line of code.
> This is not a trading project, a legal tool, or a generic chatbot.
> This is a personalized AI health companion where **evidence is the product**.

---

## What Pulse.ai is

Pulse.ai fills the gap between having a health question and having a doctor to ask. 75 million Americans have no primary care doctor. 73% of patients wait over 70 days for an appointment. In that gap, people are alone with their symptoms, their lab results, and their fear.

Pulse.ai is what they have.

Two things make Pulse.ai worth paying for and worth trusting:

**1. It knows your health.** A persistent health profile — conditions, medications, lab values, symptom history, wearable data — is stored in Supabase and injected into every Claude API call. The same memory architecture as a professional medical relationship, built in code.

**2. Every answer cites a real study.** The PubMed E-utilities API retrieves peer-reviewed literature before every response. Users see real PMIDs, real journals, real years. They can tap any citation and read the abstract. This is what makes Pulse.ai credible to users and to their doctors.

**These two systems are the product. Everything else is infrastructure.**

---

## What Pulse.ai is NOT

- Not a diagnostic tool. Pulse.ai contextualizes and educates. It does not diagnose.
- Not a replacement for emergency care. Life-threatening symptoms route to 911 before anything else. Always.
- Not a prescription service. Pulse.ai explains medications. It does not prescribe.
- Not a trading system. The global trading-bot skill does not apply here. Ignore it entirely.


---

## Project structure

```
Pulse.ai/
├── CLAUDE.md                        ← you are here
├── README.md                        ← product overview
├── ARCHITECTURE.md                  ← full technical design
├── CHANGELOG.md                     ← updated after every meaningful commit
├── PROGRESS.md                      ← updated every 30 minutes during build
├── agents.md                        ← all agent data with tasks
├── Makefile                         ← make dev | make test | make verify
├── pyproject.toml                   ← Python deps + ruff + mypy
├── .env.example                     ← all env vars with comments
│
├── backend/
│   ├── main.py                      FastAPI app + all routes
│   ├── health/
│   │   ├── injector.py              MOST IMPORTANT FILE — builds system prompts
│   │   ├── updater.py               Background task: extracts facts post-response
│   │   └── profile.py               HealthProfile Pydantic model
│   ├── evidence/
│   │   ├── pubmed.py                SECOND MOST IMPORTANT — PubMed API client
│   │   ├── query_builder.py         Converts questions to PubMed search queries
│   │   └── citation_formatter.py   Formats citations for mobile/web display
│   ├── intake/
│   │   ├── lab_ocr.py               Claude Vision lab results extraction
│   │   ├── pdf_parser.py            Health record PDF extraction
│   │   └── healthkit_sync.py        Processes HealthKit payloads from mobile
│   ├── features/
│   │   ├── triage.py                Symptom severity + escalation rules
│   │   ├── drug_interactions.py     Medication interaction checking
│   │   ├── lab_interpreter.py       Lab analysis + trend detection
│   │   ├── patterns.py              Wearable + symptom correlation
│   │   └── visit_prep.py            Doctor visit summary generator
│   ├── models/
│   │   ├── health_profile.py        HealthProfile, Medication, LabResult
│   │   ├── conversation.py          Conversation, Message, Citation
│   │   └── intake.py                LabOCRResult, SymptomEntry, WearableSummary
│   └── utils/
│       ├── logger.py                Structured logging with user_id context
│       └── retry.py                 Exponential backoff for all external calls
│
├── mobile/                          Expo React Native (iOS primary)
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── (auth)/onboarding.tsx    5-question health profile intake
│   │   └── (app)/
│   │       ├── home.tsx             Health dashboard
│   │       ├── chat.tsx             Primary chat screen
│   │       ├── labs.tsx             Lab results + photo scan tab
│   │       ├── symptoms.tsx         Daily check-in
│   │       └── profile.tsx          Health profile viewer
│   ├── components/
│   │   ├── ChatBubble.tsx           Message + inline citation display
│   │   ├── LabCard.tsx              Single lab value with trend
│   │   ├── CitationSheet.tsx        Bottom sheet → PubMed abstract
│   │   ├── TriageAlert.tsx          Red banner for urgent symptoms
│   │   ├── HealthSummaryCard.tsx    Visit prep card
│   │   └── SymptomLogger.tsx        Quick symptom entry
│   └── lib/
│       ├── api.ts                   Typed API client
│       ├── healthkit.ts             HealthKit integration
│       ├── supabase.ts
│       └── types.ts
│
├── web/                             Next.js (demo surface)
│   ├── app/
│   │   ├── page.tsx                 Marketing landing
│   │   ├── onboarding/page.tsx
│   │   ├── chat/page.tsx
│   │   └── labs/page.tsx
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── HealthProfileSidebar.tsx Always visible during chat
│   │   ├── LabResultsChart.tsx      Trend visualization
│   │   ├── CitationCard.tsx         PubMed citation display
│   │   └── VisitPrepGenerator.tsx
│   └── lib/
│       ├── api.ts
│       ├── supabase.ts
│       └── types.ts
│
├── shared/types/
│   ├── health-profile.ts
│   ├── lab-results.ts
│   └── citations.ts
│
├── docs/decisions/
│   ├── 001-evidence-first-architecture.md
│   ├── 002-photo-ocr-over-lab-apis.md
│   ├── 003-healthkit-as-primary-wearable-source.md
│   ├── 004-health-profile-memory-pattern.md
│   └── 005-triage-escalation-rules.md
│
├── tests/
│   ├── conftest.py
│   ├── test_health_injector.py      Priority 1
│   ├── test_pubmed_client.py        Priority 2
│   ├── test_lab_ocr.py
│   ├── test_triage.py
│   └── test_drug_interactions.py
│
└── .github/workflows/ci.yml
```

---

## Commands

```bash
make dev          # Start backend + web together
make backend      # FastAPI backend only (port 8000)
make web          # Next.js web app only (port 3000)
make mobile       # Expo mobile app (scan QR for Expo Go)
make test         # Run full test suite
make lint         # ruff + eslint (web + mobile)
make typecheck    # mypy + tsc (web + mobile)
make verify       # test + lint + typecheck — run before every commit
make install      # uv sync + pnpm install (web + mobile)
```

**Run `make verify` before every single commit. Never commit failing tests.**

---

## Environment variables

```bash
# Anthropic — required for all AI features including Vision
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # backend only — never expose to frontend

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000

# PubMed — no key required, but email unlocks higher rate limits (10 req/sec vs 3)
PUBMED_EMAIL=team@Nova.health

# Runtime
LOG_LEVEL=INFO
NODE_ENV=development
```

---

## The two most important files — implement these first

### 1. `backend/health/injector.py` — The health memory pattern

```python
def build_health_system_prompt(profile: HealthProfile, question: str,
                                 citations: list[Citation]) -> str:
    """
    Assembles the complete system prompt for a Pulse.ai health response.

    Combines three layers:
      1. Pulse.ai's base response philosophy (evidence-first, safety-first)
      2. The user's complete health profile (all known context)
      3. PubMed abstracts retrieved relating to only the question

    The evidence layer is what separates Pulse.ai from every other health chatbot.
    Responses are grounded in real literature, not just training data.

    Args:
        profile: The user's complete HealthProfile from Supabase.
        question: The user's current question (used to retrieve citations).
        citations: PubMed abstracts retrieved for this question.

    Returns:
        Complete system prompt string ready to pass to the Anthropic API.

    Example:
        >>> prompt = build_health_system_prompt(profile, "why is my LDL high?", cits)
        >>> # Returns prompt containing health context + NEJM abstract on LDL + rules
    """
    evidence_block = _format_citations_for_prompt(citations)
    profile_block = profile.to_context_string()

    return f"""
You are Pulse.ai — a personalized AI health companion. You are not a doctor.
You are the knowledgeable, evidence-based health friend that everyone deserves.

SAFETY RULE — CHECK THIS FIRST:
If the user describes ANY of these symptoms, your FIRST response is
"Please call 911 or go to the ER immediately" before anything else:
- Chest pain / pressure / tightness
- Difficulty breathing or shortness of breath at rest
- Sudden severe headache unlike any before
- Sudden weakness or numbness on one side of the body
- Slurred speech or confusion
- Coughing or vomiting blood
- Severe abdominal pain
- Signs of allergic reaction (throat swelling, difficulty swallowing)
Do not provide information before the emergency instruction. Safety first, always.

USER'S HEALTH PROFILE:
{profile_block}

MEDICAL EVIDENCE FOR THIS QUESTION:
{evidence_block}

RESPONSE RULES:
1. Reference what you know about them. Never make them re-explain their conditions.
2. Ground your response in the evidence provided above. Cite specific relevent studies.
3. Cite using format: (Source: [Paper Title] — [Journal] [Year], PMID: [number])
4. Give practical, actionable guidance — not just information.
5. Be direct about what warrants a doctor visit. Do not minimize serious findings.
6. For lab values: state the value, the reference range, what it means clinically,
   what questions to ask their doctor, and what (if anything) they can do now.
7. Never diagnose. Contextualize, educate, and guide — then recommend the right
   level of care.
8. Keep responses under 250 words unless complexity genuinely requires more.
"""
```

### 2. `backend/evidence/pubmed.py` — The citation engine

```python
async def get_citations_for_question(question: str,
                                      health_domain: str) -> list[Citation]:
    """
    Retrieves relevant PubMed citations for a health question.

    Converts the question to an optimized PubMed search query, retrieves
    the top matching papers, and returns structured Citation objects with
    title, journal, year, PMID, and abstract text.

    These citations are passed to Claude alongside the health profile to
    ground the response in real peer-reviewed literature.

    Args:
        question: The user's health question in natural language.
        health_domain: Classified domain (symptoms/medications/lab_results/etc)
                       used to focus the search query.

    Returns:
        List of up to 3 Citation objects, ordered by PubMed relevance ranking.
        Returns empty list gracefully if API is unavailable — response degrades
        to Claude's training knowledge only, clearly labeled as such.

    Note:
        PubMed E-utilities is free with no API key. Rate limit is 3 req/sec
        without a key, 10/sec with the PUBMED_EMAIL env var set.
    """
    query = build_pubmed_query(question, health_domain)

    search_url = (
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        f"?db=pubmed&term={urllib.parse.quote(query)}&retmax=5"
        f"&sort=relevance&retmode=json&tool=Pulseai&email={PUBMED_EMAIL}"
    )
    # Fetch PMIDs → fetch abstracts → return Citation objects
```

---

## Supabase schema — run this SQL first

```sql
create extension if not exists "uuid-ossp";

create table health_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text not null,
  age integer,
  sex text,
  height_cm float,
  weight_kg float,
  primary_conditions jsonb not null default '[]',
  current_medications jsonb not null default '[]',
  allergies jsonb not null default '[]',
  health_facts jsonb not null default '[]',
  wearable_summary jsonb,
  conversation_count integer not null default 0,
  member_since timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lab_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  test_name text not null,
  loinc_code text,
  value float,
  value_text text,
  unit text,
  reference_range_low float,
  reference_range_high float,
  status text,           -- 'normal' | 'low' | 'high' | 'critical'
  date_collected date,
  lab_source text,       -- 'photo_ocr' | 'healthkit' | 'manual'
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  messages jsonb not null default '[]',
  health_domain text,
  citations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table symptom_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  symptoms jsonb not null default '[]',
  severity integer check (severity between 1 and 10),
  notes text,
  voice_note_path text,
  logged_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  storage_path text not null,
  document_type text,
  extracted_facts jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table health_profiles enable row level security;
alter table lab_results enable row level security;
alter table conversations enable row level security;
alter table symptom_logs enable row level security;
alter table documents enable row level security;

create policy "Users own their health data"
  on health_profiles for all using (auth.uid() = user_id);
create policy "Users own their lab results"
  on lab_results for all using (auth.uid() = user_id);
create policy "Users own their conversations"
  on conversations for all using (auth.uid() = user_id);
create policy "Users own their symptom logs"
  on symptom_logs for all using (auth.uid() = user_id);
create policy "Users own their documents"
  on documents for all using (auth.uid() = user_id);

-- Performance indexes
create index idx_lab_results_user_id on lab_results(user_id);
create index idx_lab_results_date on lab_results(user_id, date_collected);
create index idx_symptom_logs_user_id on symptom_logs(user_id, logged_at);
create index idx_conversations_user_id on conversations(user_id);
```

---

## Build order — follow exactly

### Hour 0–1: Foundation
- [ ] `make install` — verify clean install
- [ ] Supabase schema created (all 5 tables with RLS)
- [ ] `.env` populated with all keys
- [ ] `GET /health` returns 200
- [ ] Commit: `chore: initial scaffold with Supabase schema`

### Hour 1–3: The two core systems
- [ ] `backend/models/health_profile.py` — HealthProfile model, all fields
- [ ] `backend/evidence/pubmed.py` — PubMed client working (test: search "LDL cholesterol")
- [ ] `backend/health/injector.py` — build_health_system_prompt() working
- [ ] `POST /api/chat` — profile + citations + Claude → response with sources
- [ ] Verify: ask "what does high LDL mean?" → response cites a real PMID
- [ ] Commit: `feat(core): health injector + PubMed evidence pipeline working`

### Hour 3–5: Lab OCR (the demo feature)
- [ ] `backend/intake/lab_ocr.py` — Claude Vision reads lab PDF photo
- [ ] `POST /api/labs/scan` — upload image → returns structured LabResult list
- [ ] Lab results stored to Supabase `lab_results` table
- [ ] Verify: photograph a real lab printout → values correctly extracted
- [ ] Commit: `feat(intake): lab photo OCR pipeline working`

### Hour 5–7: Onboarding + profile storage
- [ ] `POST /api/profile` — creates health profile from intake answers
- [ ] `mobile/app/(auth)/onboarding.tsx` — 5 questions: age/sex, conditions, meds, allergies, goals
- [ ] Profile visible in app after onboarding
- [ ] Commit: `feat(onboarding): health profile intake storing to Supabase`

### Hour 7–9: HealthKit sync (iOS)
- [ ] `mobile/lib/healthkit.ts` — permission request + data fetch
- [ ] `POST /api/healthkit/sync` — receives HealthKit payload, updates profile
- [ ] Heart rate, sleep, blood glucose pulling into Pulse.ai
- [ ] Commit: `feat(intake): HealthKit integration syncing health data`

### Hour 9–12: Triage + drug interactions
- [ ] `backend/features/triage.py` — emergency pattern detection first
- [ ] `backend/features/drug_interactions.py` — interaction checking on meds
- [ ] Triage escalation tested with chest pain scenario (must route to 911)
- [ ] Commit: `feat(safety): triage escalation and drug interaction checking`

### Hour 12–16: Profile auto-updater + visit prep
- [ ] `backend/health/updater.py` — background task extracts health facts post-conversation
- [ ] `backend/features/visit_prep.py` — one-page doctor visit summary
- [ ] `POST /api/visit-prep` — returns formatted summary
- [ ] Commit: `feat(features): auto-updater and doctor visit prep`

### Hour 16–20: Web + mobile UI (T1 leads)
- [ ] Web: `HealthProfileSidebar.tsx` — always visible during chat
- [ ] Web: `CitationCard.tsx` — renders PubMed citation with tap-to-expand
- [ ] Web: `LabResultsChart.tsx` — trend visualization for key values
- [ ] Mobile: `CitationSheet.tsx` — bottom sheet with PubMed abstract
- [ ] Mobile: `LabCard.tsx` — lab value with status indicator
- [ ] Mobile: `TriageAlert.tsx` — urgent symptom banner
- [ ] Commit: `feat(ui): citation display, lab cards, health profile sidebar`

### Hour 20–24: Hardening + demo prep
- [ ] Seed Marcus Chen demo profile (see below)
- [ ] Test full bloodwork demo scenario 3 times
- [ ] Run `make verify` — zero failures
- [ ] Final PROGRESS.md update
- [ ] Commit: `chore: demo profile seeded, final QA pass`

---

## Demo profile — Marcus Chen (seed Friday night)

```python
DEMO_PROFILE = {
    "display_name": "Marcus",
    "age": 42,
    "sex": "male",
    "height_cm": 180,
    "weight_kg": 91,
    "primary_conditions": ["hypertension", "prediabetes"],
    "current_medications": [
        {"name": "Lisinopril", "dose": "10mg", "frequency": "once daily"},
        {"name": "Metformin", "dose": "500mg", "frequency": "twice daily"},
    ],
    "allergies": ["penicillin"],
    "health_facts": [
        "Father had a heart attack at age 58",
        "Tries to exercise 3x/week but inconsistent",
        "Reports poor sleep quality — averages 5.5 hours",
        "HbA1c was 6.1% three months ago (previous panel)",
    ],
    "conversation_count": 9,
    "member_since": "2025-12-15",
}

DEMO_LAB_RESULTS = [
    {"test_name": "LDL Cholesterol", "value": 158, "unit": "mg/dL",
     "reference_range_high": 100, "status": "high", "date_collected": "2026-03-15"},
    {"test_name": "HDL Cholesterol", "value": 42, "unit": "mg/dL",
     "reference_range_low": 40, "status": "normal", "date_collected": "2026-03-15"},
    {"test_name": "HbA1c", "value": 6.3, "unit": "%",
     "reference_range_high": 5.7, "status": "high", "date_collected": "2026-03-15"},
    {"test_name": "Fasting Glucose", "value": 118, "unit": "mg/dL",
     "reference_range_high": 100, "status": "high", "date_collected": "2026-03-15"},
    {"test_name": "Triglycerides", "value": 195, "unit": "mg/dL",
     "reference_range_high": 150, "status": "high", "date_collected": "2026-03-15"},
    {"test_name": "eGFR", "value": 74, "unit": "mL/min/1.73m²",
     "reference_range_low": 60, "status": "normal", "date_collected": "2026-03-15"},
]
```

**Demo script (2 minutes 45 seconds):**

1. Open the labs tab — Marcus's panel is pre-loaded, 4 values flagged
2. Tap "LDL: 158 ↑" — Pulse.ai explains with PMID citation from Lancet 2024
3. Tap the citation → PubMed abstract opens in bottom sheet
4. Type: "should I be worried about my A1C given my family history?"
5. Pulse.ai responds knowing his father's cardiac history, his current LDL, his lisinopril
   and metformin, and cites a NEJM paper on cardiovascular risk in prediabetes
6. Tap "Prep for appointment" → one-page summary appears in 4 seconds
7. Say: *"His cardiologist would spend the first 10 minutes of a $300 appointment
   gathering this context. Pulse.ai has it before he walks in the door."*

---

## Code standards — non-negotiable

1. **Docstrings on every class and every public method** — Args, Returns, Raises
2. **Type annotations on every function** — no `Any`, no missing return types
3. **Structured logging** — `log.info("event", user_id=id, domain=domain)` not `print()`
4. **All external API calls** (Anthropic, PubMed, Supabase) go through `utils/retry.py`
5. **No bare `except`** — catch specific exceptions, log with user_id, re-raise with context
6. **SAFETY FIRST** — triage escalation must be tested before any UI polish
7. **No placeholder code** — every stub raises `NotImplementedError` with a message

---

## Commit format

```
feat(evidence): PubMed citation pipeline working end-to-end
feat(intake): lab photo OCR extracts structured values via Claude Vision
feat(safety): triage escalation routes chest pain to 911 first
feat(mobile): citation bottom sheet with PubMed abstract display
feat(web): health profile sidebar always visible during chat
fix(pubmed): handle empty results gracefully without breaking response
test(injector): health profile injection coverage
docs(decisions): ADR 002 photo OCR over lab API integrations
chore: update PROGRESS.md [14:30]
```

**Commit every 45–60 minutes. Commit velocity is a scored dimension.**
