# Align — FastAPI backend setup with configuration and CORS

**AIE:** AIE-001
**Date:** 2026-03-28
**Severity:** major
**Domain:** backend

## Problem
No backend server exists. PulseAI needs an HTTP API server to serve health-related endpoints, connect to Claude via the Anthropic SDK, and support cross-origin requests from the Next.js frontend running on a different port.

## Decision
Create a FastAPI application with:
- `Settings` class using `pydantic-settings` to load configuration from `.env` (Anthropic API key, Claude model name, PubMed email, Supabase URL/key, host, port, log level)
- CORS middleware allowing `http://localhost:3000` (Next.js) and `http://localhost:19006` (Expo)
- Structured JSON logging via `structlog` with ISO timestamps
- Uvicorn ASGI server with hot-reload for development
- `GET /health` endpoint returning `{"status": "healthy", "service": "pulse.ai"}`
- Router-based API organization: `chat_router` at `/api/chat`, `profile_router` at `/api/profile`
- Makefile with `install`, `run`, `dev`, `web`, and `verify` targets
- Pinned dependencies in `requirements.txt` (10 packages)

## Why This Approach
FastAPI provides automatic OpenAPI docs, native async support for concurrent PubMed + Claude calls, and Pydantic integration for request/response validation. Structlog produces JSON-formatted logs for production observability. Pydantic Settings handles typed env var loading with `.env` file support.

Alternative considered: Flask — rejected because it lacks native async support needed for concurrent external API calls.

## Impact
Foundation for all backend functionality. Every API route, model, and service depends on this server setup.

## Success Criteria
- `make dev` starts the server on port 8000 with hot-reload
- `GET /health` returns 200 with `{"status": "healthy", "service": "pulse.ai"}`
- Environment variables load correctly from `.env`
- CORS allows requests from `localhost:3000`
