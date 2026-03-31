# Instruct — FastAPI backend setup with configuration and CORS

**AIE:** AIE-001

## Directive
> "Set up a FastAPI backend with Pydantic settings, CORS middleware, structlog logging,
> and a /health endpoint. Load configuration from .env using pydantic-settings.
> Include routers for /api/chat and /api/profile. Create a Makefile with install,
> run, dev, web, and verify targets. Pin all dependencies in requirements.txt.
> Default Claude model should be claude-sonnet-4-20250514."

## Context Provided
- `Pulse AI.md` — project architecture, build order, code standards
- `.env.example` — required environment variables (ANTHROPIC_API_KEY, PUBMED_EMAIL, SUPABASE_URL, SUPABASE_KEY)

## Scope
**In scope:** FastAPI app creation, Settings class, CORS middleware, structlog configuration, Makefile, requirements.txt, .env.example, /health endpoint, router registration
**Out of scope:** Route handler implementations (separate AIE entries), database integration
