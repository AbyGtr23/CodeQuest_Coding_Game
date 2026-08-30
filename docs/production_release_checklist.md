# CodeQuest — Production Release Checklist

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    CODEQUEST PRODUCTION RELEASE CHECKLIST                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 1. Database & Migrations

- [x] **Migrations Applied in Order**:
  - `001_create_tables.sql` — Canonical table structures (`users`, `tools`, `levels`, `stages`, `test_cases`, `user_tools`, `stage_progress`, `code_submissions`, `daily_activity`, `badges`, `user_badges`).
  - `002_create_rls_policies.sql` — Row Level Security enabled across all sensitive user tables.
  - `003_create_indexes.sql` — Performance indexes for foreign keys, slugs, and dates.
  - `004_create_triggers.sql` — Active weapon constraints (max 2 active tools enforcement).
  - `005_create_user_profile_trigger.sql` — Initial profile creation trigger.
  - `006_fix_user_trigger.sql` — Non-destructive `ON CONFLICT DO UPDATE` trigger preservation.
  - `007_user_onboarding.sql` — Onboarding status, IT role, and tech stack columns.
- [x] **Row-Level Security (RLS)**:
  - Anonymous users can read public tables (`tools`, `levels`, `stages`, visible `test_cases`).
  - Anonymous and regular authenticated browser clients CANNOT read `test_cases.is_hidden = true`.
  - Users can ONLY modify their own `user_tools`, `stage_progress`, and `users` data.
- [x] **Data Integrity**:
  - All 5 canonical levels (`Cadet`, `Soldier`, `Knight`, `Wizard`, `Archmage`) present with sequential `order_index`.
  - Zero orphan stages or missing foreign keys.
- [x] **Production Seeding**:
  - Idempotent `scripts/seed-curriculum.js` verified with 50 stages and 126 test cases seeded.

---

## 2. Authentication & Onboarding

- [x] **Google & GitHub OAuth**:
  - Configured with dynamic callback URL: `${NEXT_PUBLIC_APP_URL}/auth/callback`.
  - Safe OAuth metadata extraction (handles Google `picture`/`name`, GitHub `avatar_url`/`user_name`).
- [x] **Profile Creation & Sync**:
  - Auto-creates `public.users` record on user creation with sanitized username.
  - Retries profile retrieval up to 3 times (500ms backoff) to prevent race conditions.
- [x] **First-Time User Onboarding**:
  - Step 1: OAuth Identity verification.
  - Step 2: IT Role selection (19 canonical industry roles).
  - Step 3: Technology Stack selection (Languages, Frameworks, Tools, Cloud/DevOps).
  - Step 4: Deterministic, explainable Weapon Recommendations.
  - Step 5: Weapon selection enforcing maximum 2 active weapons.
  - Step 6: Atomic persistence to `/api/user/onboarding` and transition to `/dashboard`.
- [x] **Returning User Flow**:
  - Onboarded users navigate straight to `/dashboard`.
  - Unauthenticated users redirected to `/auth/login`.
  - Sign out immediately purges local session and cookies.

---

## 3. Security Hardening

- [x] **Service Role Isolation**:
  - `SUPABASE_SERVICE_ROLE_KEY` is strictly used server-side in `lib/supabase/admin.js` to fetch hidden test cases in `/api/submit`.
  - Zero client-side exposure of service role keys or Judge0 credentials.
- [x] **Hidden Test Case Protection**:
  - Hidden test inputs, actual outputs, and expected outputs are completely stripped/redacted from client responses when tests fail.
- [x] **Server-Side Progression Authority**:
  - XP awards, streak calculations, badge awards, rank promotions, and mastery statuses are 100% computed server-side in `/api/submit`. Client submissions cannot spoof XP or test results.
- [x] **Anti-Farming Protection**:
  - Repeat submissions increment attempts only; zero duplicate XP or progression awarded.

---

## 4. Curriculum & Academic Integrity

- [x] **Single Source of Truth**:
  - `/curriculum/[toolSlug]/[level]/[stage]` and `/quest/[toolSlug]/[level]/[stage]` consume the exact same database records via `/api/quest/...`.
- [x] **Real Pedagogical Content**:
  - 15 Python Cadet stages fully authored with authentic problems, constraints, I/O formats, starter code, solutions, and test cases.
  - 15 JavaScript Cadet stages fully authored.
  - 10 Git Cadet stages fully authored.
  - 10 SQL Cadet stages fully authored.
  - 8 pending tools (`typescript`, `go`, `rust`, `docker`, `nodejs`, `react`, `django`, `linux-cli`) registered with 0 stages pending authoring.
- [x] **Curriculum Validator**:
  - `npm run validate:curriculum` runs with **0 errors and 0 warnings**.

---

## 5. Application Features & UI

- [x] **Dashboard (`/dashboard`)**:
  - Welcome banner with current rank and track.
  - Total XP, current streak, active weapons progress.
  - Primary **"BEGIN YOUR QUEST"** action button.
  - Recent activity feed linking to activity heatmap.
- [x] **Weapon Catalog (`/catalog`)**:
  - Categorized tool grid with difficulty stars and descriptions.
  - Active tool limit enforcement (max 2 active tools).
  - Clear user alerts and disabled states.
- [x] **Quest Map (`/quest/[toolSlug]`)**:
  - Dynamic level and stage hierarchy loaded from database.
  - Server-calculated completed and unlocked states.
- [x] **Quest Stage & Code Execution (`/quest/.../.../...`)**:
  - Monaco editor with tabbed Lesson, Code, and Results views.
  - `Run` button executes against visible test cases via Judge0.
  - `Submit` button evaluates full test suite (including hidden) server-side.
  - Next stage routing and rank-up modal triggers.
- [x] **Curriculum Reference (`/curriculum`)**:
  - Public catalog, tool syllabus, level outcomes, and stage problem viewer with `[ SOLVE IN QUEST MODE ]` button.
- [x] **Activity Heatmap (`/calendar`)**:
  - GitHub-style 365-day SVG grid indexed by `activity_date` (YYYY-MM-DD).
  - Day details sidebar with stage counts, XP, and submission stats.
- [x] **Operative Profile (`/profile`)**:
  - Avatar, username, email, IT role, tech stack chips.
  - Total XP, rank badge, streaks, tool progress bars, and earned badges.
- [x] **Leaderboard (`/leaderboard`)**:
  - Global rankings ordered by `total_xp DESC` using canonical `current_rank`.

---

## 6. Testing & Quality Assurance

- [x] **Automated Test Suite**:
  - `npm run test` executes 101 assertions across Schema, RLS, Data Integrity, API contracts, Frontend contracts, Judge0, Submit Security, Migrations, and Documentation.
  - **101 passed, 0 failed, 0 skipped**.
- [x] **End-to-End User Journeys Verified**:
  - Journey 1: Fresh user registration, OAuth identity, onboarding, and dashboard entry.
  - Journey 2: Catalog weapon selection with 2-tool limit enforcement.
  - Journey 3: Quest stage execution, test passing, XP award, streak increment, and next-stage unlock.
  - Journey 4: Anti-farming verification (repeat submission -> 0 XP).
  - Journey 5: Curriculum reference navigation and transition to Quest mode.
  - Journey 6: Activity calendar contribution tracking.
  - Journey 7: Profile rendering with role, tech stack, and badges.
  - Journey 8: Logout session invalidation and login restoration.

---

## 7. Production Build & Deployment

- [x] **Next.js Production Build**:
  - `npm run build` compiles 26 routes (20/20 static/dynamic pages) with zero TypeScript or syntax errors.
- [x] **Environment Configuration**:
  - `.env.example` documented with client public keys and server-only secrets.
- [x] **Deployment Documentation**:
  - `docs/deployment.md`, `docs/development_setup.md`, `docs/architecture.md`, `docs/database_schema.md`, `docs/api_documentation.md`, and `README.md` fully up-to-date.
