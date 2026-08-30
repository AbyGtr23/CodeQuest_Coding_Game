# CodeQuest — Troubleshooting & FAQ Guide

This document catalogs common issues, error messages, root causes, and verified remediations.

---

## 1. Authentication & Profile Issues

### Symptom: User logs in but profile data shows "Recruit" or fails to load
- **Root Cause**: Race condition where `users` row is being inserted by `handle_new_user()` trigger while client is querying `public.users`.
- **Solution**: `AuthProvider.js` implements a 3-attempt retry with 500ms backoff. If issue persists, check that migration `007_user_onboarding.sql` is applied.

### Symptom: `Cannot read properties of null (reading 'username')`
- **Root Cause**: Component attempted to access nested profile properties before auth state resolved.
- **Solution**: AuthProvider and pages (`Profile`, `Dashboard`, `Navbar`) use null-coalescing fallbacks (`profile?.username || 'Cadet'`) and explicit loading gates.

---

## 2. Code Execution & Submissions

### Symptom: Submissions return `500 Internal Server Error`
- **Root Cause**: Missing or invalid `SUPABASE_SERVICE_ROLE_KEY` or `JUDGE0_API_KEY` in `.env.local`.
- **Solution**: Ensure `.env.local` contains valid server-side secrets. `/api/submit` uses the admin client (`lib/supabase/admin.js`) to read hidden test cases under RLS.

### Symptom: Code runs with error `btoa is not defined`
- **Root Cause**: Obsolete browser-only `btoa` encoding used in Node.js route handlers.
- **Solution**: `lib/judge0.js` now uses `Buffer.from(str, 'utf-8').toString('base64')`.

---

## 3. Database & Tool Selection

### Symptom: `Maximum of 2 active tools allowed`
- **Root Cause**: User already has 2 active tools in `user_tools` table with `status = 'active'`.
- **Solution**: Complete an active tool to reach `status = 'mastered'` or drop a tool via `DELETE /api/user/tools/[toolId]`.

### Symptom: Seed script fails with `Missing Supabase env vars`
- **Root Cause**: `.env.local` is missing or does not define `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- **Solution**: Copy `.env.example` to `.env.local` and add your service role credentials before running `npm run seed:curriculum`.
