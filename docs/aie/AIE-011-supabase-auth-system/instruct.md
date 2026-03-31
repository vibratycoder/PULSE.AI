# Instruct — Supabase Authentication System

**AIE:** AIE-011

## Directive
> Build a complete email/password authentication system using Supabase Auth. Create a Supabase client singleton, a React Context provider for session management, a login page, and a signup page with profile creation. Wrap the app in the auth provider and gate the main page behind authentication.

## Context Provided
- **`web/lib/supabase.ts`** (7 lines) — Supabase client singleton. Uses `createClient()` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
- **`web/app/auth-context.tsx`** (53 lines) — React Context provider. `AuthProvider` component manages session state via `supabase.auth.getSession()` on mount and `onAuthStateChange()` listener. Exposes `session`, `user`, `loading`, and `signOut()` through the `useAuth()` hook.
- **`web/app/login/page.tsx`** (113 lines) — Login form page. Email and password fields, calls `supabase.auth.signInWithPassword()`, displays errors, redirects to `/` on success, redirects away if already logged in.
- **`web/app/signup/page.tsx`** (242 lines) — Signup form page. Fields: first name, last name, email, phone, password, confirm password. Validates password length (6+) and match. Calls `supabase.auth.signUp()` with user metadata. Inserts row into `profiles` table. Shows verification message if email confirmation is required. Redirects to `/` if session is created immediately.
- **`web/app/layout.tsx`** — Root layout, wraps the entire app with `<AuthProvider>`.
- **`web/app/page.tsx`** — Main dashboard page, uses `useAuth()` for sign-out button and redirect logic for unauthenticated users.

## Scope
**In scope:**
- Supabase client initialization with environment variables
- Auth context provider with session lifecycle management
- Login page with email/password sign-in
- Signup page with form validation, user metadata, and profile row insertion
- Global auth provider wrapping in the root layout
- Auth-gated main page with sign-out functionality

**Out of scope:**
- Password reset / forgot password flow
- OAuth / social login providers
- Email template customization
- Role-based access control (RBAC)
- Server-side auth middleware or route protection
- Supabase RLS policy definitions
- Profile editing or account settings pages
