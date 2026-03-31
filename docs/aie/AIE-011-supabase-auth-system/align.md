# Align — Supabase Authentication System

**AIE:** AIE-011
**Date:** 2026-03-30
**Severity:** major
**Domain:** auth, frontend

## Problem
PulseAI needed a complete authentication system to gate access to the trading dashboard. Without auth, any visitor could view portfolio data, execute trades, and modify settings. A secure, session-aware auth flow with signup, login, and sign-out was required before the app could be exposed beyond localhost.

## Decision
Built a full email/password authentication system using Supabase Auth, integrated into the Next.js frontend via React Context.

- **`web/lib/supabase.ts`** — Supabase client singleton created with `createClient()` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
- **`web/app/auth-context.tsx`** — `AuthProvider` React Context provider that manages session state via `supabase.auth.getSession()` on mount and `onAuthStateChange()` for real-time updates. Exposes `session`, `user`, `loading`, and `signOut()` through the `useAuth()` hook.
- **`web/app/login/page.tsx`** — Login page with email/password fields, calling `supabase.auth.signInWithPassword()`. Displays errors on failure, redirects to `/` on success, and redirects away if the user is already authenticated.
- **`web/app/signup/page.tsx`** — Signup page with fields for first name, last name, email, phone, password, and confirm password. Validates password length (6+ characters) and match. Calls `supabase.auth.signUp()` with user metadata, inserts a row into the `profiles` table, shows a verification message if email confirmation is required, and redirects to `/` if a session is created immediately.
- **`web/app/layout.tsx`** — Wraps the entire app with `<AuthProvider>` so auth state is available globally.
- **`web/app/page.tsx`** — Main page consumes `useAuth()` for sign-out button rendering and redirect logic for unauthenticated users.

## Why This Approach
Supabase Auth was chosen because PulseAI already uses Supabase as its backend (database, real-time). Using the built-in auth avoids introducing a separate identity provider, keeps Row Level Security (RLS) policies aligned with auth tokens, and requires minimal configuration.

React Context was chosen over a state management library (Redux, Zustand) because auth state is simple (session + user + loading flag) and needs to be globally available. Context is the idiomatic React solution for this shape of problem.

Alternatives considered:
- **NextAuth.js** — adds a server-side session layer that would duplicate what Supabase already provides. Rejected to avoid unnecessary complexity.
- **Clerk/Auth0** — third-party hosted auth. Rejected because Supabase Auth is free-tier sufficient and keeps all data in one place.

## Impact
- Every page in the app is now gated behind authentication.
- The `profiles` table is populated on signup, enabling user-specific data queries.
- All Supabase client requests carry the authenticated user's JWT, enabling RLS enforcement on the database.

## Success Criteria
- Users can sign up with email/password and receive a verification email when configured.
- Users can log in and are redirected to the dashboard.
- Unauthenticated users are redirected to the login page.
- Session persists across page refreshes via Supabase's built-in token storage.
- Users can sign out and are redirected to the login page.
- Auth state is available to any component via the `useAuth()` hook.
