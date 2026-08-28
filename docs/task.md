# CodeQuest Project Checklist

This is the living task list for the CodeQuest development workflow. 

- `[ ]` Uncompleted tasks
- `[/]` In progress tasks (Agent working)
- `[x]` Completed tasks

---

## 🔑 User Prerequisites (To be completed by User)

- [ ] **Create a Supabase Project**
  - Create free project on [Supabase Console](https://supabase.com)
  - Copy the Project URL, Anon Key, and Service Role Key
- [ ] **Get Judge0 API Credentials**
  - Sign up for a free tier key on [RapidAPI Judge0 CE](https://rapidapi.com/uzay95/api/judge0-ce) or prepare a self-hosted endpoint
- [ ] **Create GitHub OAuth App**
  - Go to GitHub Settings → Developer Settings → OAuth Apps → New OAuth App
  - Set Homepage URL to `http://localhost:3000` (development) or your Vercel URL (production)
  - Set Callback URL to `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
- [ ] **Configure Supabase Auth**
  - Enable GitHub Provider in Supabase Auth Settings and input the Client ID & Secret
- [ ] **Set Up Local Env File**
  - Copy `.env.local.example` to `.env.local` and fill in the values
- [ ] **Run Database Migrations**
  - Execute SQL files from `supabase/migrations/` in order (001 → 004) in the Supabase SQL Editor
  - Execute `supabase/seed.sql` to insert levels, tools, and badges
- [ ] **Seed Curriculum Data**
  - Run `node scripts/generate_curriculum.js` to generate curriculum JSON files
  - Run `node scripts/seed-curriculum.js` to populate stages and test cases

---

## ⚙️ Phase 1: Project Initialization & Configuration (Agent)

- [x] **Bootstrap Next.js Project**
  - Initialize Next.js app in `codequest/` directory using non-interactive CLI script
  - Setup routing directory structures (App Router)
- [x] **Configure CSS Variables & Global Styles**
  - Setup the Terminal Noir design system tokens in `app/globals.css`
  - Style default markdown templates, code themes, scrollbars, and interactive buttons
- [x] **Setup Configuration & Dependency Files**
  - Configure `package.json` scripts, `.gitignore`, and Next.js configuration settings
  - Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `@monaco-editor/react`, `react-markdown`, `date-fns`, `react-syntax-highlighter`, `rehype-raw`

---

## 🗄️ Phase 2: Database Setup & Schema Migrations (Agent)

- [x] **Write Database Schema Migrations**
  - Create tables schema file (`supabase/migrations/001_create_tables.sql`)
  - Create row-level security (RLS) definitions (`supabase/migrations/002_create_rls_policies.sql`)
  - Create query performance indexes (`supabase/migrations/003_create_indexes.sql`)
  - Create triggers and checks (`supabase/migrations/004_create_triggers.sql`)
- [x] **Generate Seed Data & Curriculum Scripts**
  - Build default seed files for Levels, Badges, and Tools (`supabase/seed.sql`)
  - Write Node curriculum import runner (`scripts/seed-curriculum.js`)
  - Write curriculum generator script (`scripts/generate_curriculum.js`)
  - Create Python curriculum JSON (`data/seed/curriculum/python.json`)
  - Create JSON reference files (`data/seed/tools.json`, `levels.json`, `badges.json`)

---

## 🔐 Phase 3: Supabase Authentication Flow (Agent)

- [x] **Implement Supabase Route Helpers**
  - Write browser, server, and middleware client factories (`lib/supabase/`)
- [x] **Configure Route Protection Middleware**
  - Intercept pages (`/dashboard`, `/quest/*`, `/calendar`, `/profile`, `/leaderboard`) to ensure valid JWT session redirects
- [x] **Build Auth UI Screens**
  - Write terminal-styled login and signup interfaces under `/auth/login` and `/auth/signup`
  - Implement Email/Password login and client-side GitHub OAuth redirections
  - Create OAuth callback handler (`/auth/callback/route.js`)

---

## 🗃️ Phase 4: Core Services & Backend API Routes (Agent)

- [x] **Build Catalog API Route**
  - `GET /api/tools` to retrieve available languages, frameworks, and developer tools
- [x] **Build Active User Tools API Route**
  - `GET /api/user/tools` to fetch current user's active tools with progress
  - `POST /api/user/tools` to lock up to 2 active learning targets
  - `DELETE /api/user/tools/[toolId]` to drop or pause active tools
- [x] **Build Quest Map API Route**
  - `GET /api/quest/[toolSlug]` to fetch full list of stages, tiers, and user progress percentages
  - `GET /api/quest/[toolSlug]/[level]/[stage]` to fetch single stage with lesson, code, test cases
- [x] **Build Code Submission Route & Judge0 Pipeline**
  - `POST /api/submit` to parse code, fetch expected test cases, dispatch execution requests, and save submission logs
  - `POST /api/run` to execute code without saving results (sandbox mode)
- [x] **Build Support API Routes**
  - `GET /api/calendar` for daily activity data (past 365 days)
  - `GET /api/profile` for user profile, tool progress, badges, and stats
  - `GET /api/leaderboard` for top 50 users by XP with period filtering

---

## 💻 Phase 5: Common Shell & Navigation Components (Agent)

- [x] **Build Terminal Navbar**
  - Create `/components/Navbar/` with path indicators, XP levels, rank badges, and login toggles
  - Responsive hamburger menu for mobile
- [x] **Build Modular UI Elements**
  - ProgressBar — terminal-style block character progress bars
  - ToolCard — tool selection cards with emoji, difficulty stars, progress
  - StageNode — quest map stage nodes with status icons
  - Badge — achievement badge display (earned/locked states)
  - RankUpModal — celebration overlay with pixel confetti
  - CodeEditor — Monaco Editor wrapper with Terminal Noir theme
  - TestResults — pass/fail test case display with hidden test support
  - LessonPanel — markdown renderer with syntax-highlighted code blocks
  - HeatmapCalendar — GitHub-style SVG contribution grid

---

## 🎛️ Phase 6: Pages & Views Implementation (Agent)

- [x] **Develop Landing Page (`/`)**
  - Hero section with typing animation, tool showcase, how-it-works steps, CTA
- [x] **Develop Tool Catalog Page (`/catalog`)**
  - Grid listings categorized by type with difficulty ratings and enrollment mechanics
- [x] **Develop Dashboard Page (`/dashboard`)**
  - Active tools widgets, resume options, recent XP logs, mini activity preview
- [x] **Develop Quest Map Page (`/quest/[toolSlug]`)**
  - Vertical tier checkpoints (Cadet to Archmage) with progress indicators and stage node locking
- [x] **Develop Quest Stage Interface (`/quest/[toolSlug]/[level]/[stage]`)**
  - Tabbed interface: Lesson, Code, Results with Monaco editor and test runner

---

## 🧪 Phase 7: Monaco Editor & Output Evaluators (Agent)

- [x] **Configure Inline Code Editor**
  - Set up Monaco React wrappers with Custom Theme styling, line numbers, and language configurations
- [x] **Build Output Results Panel**
  - Test cases pass/fail verification with execution time and memory stats

---

## 📊 Phase 8: Stats, Profile & Progress Heatmaps (Agent)

- [x] **Develop User Profile Page (`/profile`)**
  - User XP totals, stats records, quest progress, and combat stats
- [x] **Develop Calendar Heatmap (`/calendar`)**
  - SVG/CSS grid activity heatmap tracking daily submissions and completion logs
- [x] **Develop Gamification Leaderboards (`/leaderboard`)**
  - Global rankings with time period filters and trophy medals for top questers

---

## 🚀 Phase 9: Verification & Build Check (Agent)

- [x] **Validation Testing**
  - [x] Fix AuthProvider import path (layout.js → providers/AuthProvider)
  - [x] Fix RankUpModal import path (quest stage → components/RankUpModal/RankUpModal)
  - [x] Fix CSS Module purity (profile.module.css bare h2 selector)
  - [x] Fix missing 'use client' directives on hooks
  - [x] Fix Navbar auth routes (/login → /auth/login)
  - [x] Fix RankUpModal prop mismatch in quest stage page
  - [x] Fix AuthProvider SSG crash (guard missing env vars)
  - [x] Fix Supabase browser client SSG crash (mock client during build)
  - [ ] Verify code execution flows using sample scripts (requires Judge0 key)
- [x] **Build Optimizations**
  - [x] Run `npm run build` — Round 1: found 3 errors (import paths, CSS purity), fixed all
  - [x] Run `npm run build` — Round 2: found SSG crash in AuthProvider, fixed
  - [x] Run `npm run build` — Round 3: found SSG crash in Supabase client factory, fixed
  - [x] Run `npm run build` — Round 4: ✅ PASSED — 19 pages, 10 API routes, all compiled
- [x] **Setup Vercel Configuration**
  - [x] Created `vercel.json` with framework config and API cache headers
  - [ ] Complete environment mappings in Vercel dashboard (requires user action)
