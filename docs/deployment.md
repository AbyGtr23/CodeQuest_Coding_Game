# CodeQuest — Production Deployment Guide

This guide details the deployment of CodeQuest to production environments using **Vercel** (Next.js App Router), **Supabase** (PostgreSQL & Auth), and **Judge0 CE** (Code Execution Engine).

---

## 1. Architecture Overview

```
                          ┌───────────────────────────┐
                          │   Client Browser / PWA    │
                          └─────────────┬─────────────┘
                                        │ HTTPS
                                        ▼
                          ┌───────────────────────────┐
                          │    Next.js on Vercel      │
                          │     (App Router 16)       │
                          └──────┬─────────────┬──────┘
                                 │             │
                    REST/GraphQL │             │ RapidAPI / Self-Hosted
                                 ▼             ▼
                     ┌───────────────┐     ┌──────────────────┐
                     │ Supabase DB   │     │  Judge0 CE API   │
                     │  & Auth + RLS │     │  (Sandboxed Code │
                     └───────────────┘     │   Execution)     │
                                           └──────────────────┘
```

---

## 2. Environment Variables Configuration

Set the following environment variables in your deployment platform (e.g. Vercel Dashboard → Project Settings → Environment Variables):

### Public Variables (Client Accessible)
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project REST URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anonymous API Key | `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | Canonical Production Application URL | `https://codequest.app` |

### Server-Only Variables (Protected Secrets)
| Variable | Description | Example |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin Service Role Key (bypasses RLS) | `eyJhbGciOi...` |
| `JUDGE0_API_KEY` | RapidAPI / Judge0 API Key | `your_judge0_api_key` |
| `JUDGE0_API_HOST` | Judge0 Host (Default: RapidAPI) | `judge0-ce.p.rapidapi.com` |

---

## 3. Database Migration Deployment

Execute migrations `001` through `007` sequentially in your production Supabase SQL Editor or using Supabase CLI:

```bash
# Apply migrations sequentially
supabase db push
# OR execute files in supabase/migrations/ in numerical order:
# 001_create_tables.sql
# 002_create_rls_policies.sql
# 003_create_indexes.sql
# 004_create_triggers.sql
# 005_create_user_profile_trigger.sql
# 006_fix_user_trigger.sql
# 007_user_onboarding.sql
```

---

## 4. Production Curriculum Seeding

Once migrations are applied and `.env.local` or environment variables are configured with `SUPABASE_SERVICE_ROLE_KEY`:

```bash
# Seed canonical tools, levels, stages, and test cases
npm run seed:curriculum
```

---

## 5. OAuth Provider Configuration (Google & GitHub)

In the **Supabase Dashboard → Authentication → URL Configuration**:
- **Site URL**: `https://codequest.app`
- **Redirect URLs**:
  - `https://codequest.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local staging)

In **GitHub Developer Settings → OAuth Apps**:
- **Authorization callback URL**: `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`

In **Google Cloud Console → Credentials → OAuth 2.0 Client IDs**:
- **Authorized redirect URIs**: `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`

---

## 6. Build & Health Verification

Verify production build before release:
```bash
npm run validate:curriculum
npm run test
npm run build
```
