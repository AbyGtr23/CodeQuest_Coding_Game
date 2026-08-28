# CodeQuest — Repository Walkthrough

> Last Updated: 2026-08-17

## Project Root (`codequest/`)

```
codequest/
├── app/                    # Next.js App Router pages & API routes
├── components/             # Reusable React components (CSS Modules)
├── data/seed/              # JSON seed data & curriculum files
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities, clients, constants
├── providers/              # React context providers
├── public/                 # Static assets
├── scripts/                # CLI tools (seeding, curriculum generation)
├── supabase/               # SQL migrations & seed
├── .env.local.example      # Environment template
├── middleware.js            # Auth session refresh & route guards
├── next.config.mjs         # Next.js configuration
├── vercel.json             # Vercel deployment settings
└── package.json            # Dependencies & scripts
```

---

## `/app` — Pages & API Routes

### Pages

| Path | File | Type | Description |
|------|------|------|-------------|
| `/` | `page.js` | Static | Landing page — hero, tool showcase, how-it-works, CTA |
| `/auth/login` | `auth/login/page.js` | Static | Terminal-styled login (email/password + GitHub OAuth) |
| `/auth/signup` | `auth/signup/page.js` | Static | Registration with username |
| `/auth/callback` | `auth/callback/route.js` | Dynamic | OAuth code exchange handler |
| `/dashboard` | `dashboard/page.js` | Static | Active quests, XP stats, recent activity |
| `/catalog` | `catalog/page.js` | Static | Tool selection grid (max 2 active slots) |
| `/calendar` | `calendar/page.js` | Static | Activity heatmap & streak tracker |
| `/profile` | `profile/page.js` | Static | User stats, badges, tool progress |
| `/leaderboard` | `leaderboard/page.js` | Static | Global XP rankings with time filters |
| `/quest/[toolSlug]` | `quest/[toolSlug]/page.js` | Dynamic | Quest map — 5 levels, stage nodes |
| `/quest/[toolSlug]/[level]/[stage]` | `quest/[toolSlug]/[level]/[stage]/page.js` | Dynamic | Learning + coding interface (tabs: Lesson/Code/Results) |

### API Routes

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/tools` | `api/tools/route.js` | List all 12 tools with metadata |
| GET | `/api/user/tools` | `api/user/tools/route.js` | Current user's active tools + progress |
| POST | `/api/user/tools` | `api/user/tools/route.js` | Select a new tool (enforces max 2) |
| DELETE | `/api/user/tools/[toolId]` | `api/user/tools/[toolId]/route.js` | Drop/deactivate a tool |
| GET | `/api/quest/[toolSlug]` | `api/quest/[toolSlug]/route.js` | Full stage list grouped by level |
| GET | `/api/quest/.../[stage]` | `api/quest/[toolSlug]/[level]/[stage]/route.js` | Single stage data + test cases |
| POST | `/api/submit` | `api/submit/route.js` | Submit code → Judge0 → grade → save |
| POST | `/api/run` | `api/run/route.js` | Execute code in sandbox (no save) |
| GET | `/api/calendar` | `api/calendar/route.js` | Past 365 days of daily activity |
| GET | `/api/profile` | `api/profile/route.js` | Full profile + stats + badges |
| GET | `/api/leaderboard` | `api/leaderboard/route.js` | Top 50 users by XP (filterable) |

---

## `/components` — UI Components

Each component follows the pattern: `ComponentName/ComponentName.js` + `ComponentName.module.css`

| Component | Purpose |
|-----------|---------|
| **Navbar** | Terminal-style top navigation with XP badge, rank, auth links |
| **ToolCard** | Tool selection card (emoji, difficulty, progress, select/resume) |
| **ProgressBar** | Block character progress bar: `████████░░ 80%` |
| **StageNode** | Quest map node with status icon (✅/🔶/🔒) |
| **CodeEditor** | Monaco Editor wrapper with Terminal Noir theme |
| **TestResults** | Test case pass/fail display with execution metrics |
| **HeatmapCalendar** | GitHub-style SVG contribution grid |
| **Badge** | Achievement badge (earned glow / locked grayscale) |
| **RankUpModal** | Rank-up celebration overlay with confetti |
| **LessonPanel** | Markdown renderer with syntax-highlighted code blocks |

---

## `/docs` — Documentation

| File | Purpose |
|------|---------|
| `devops_and_setup_manual.md` | Complete Developer & DevOps Operations Manual (Supabase, OAuth, Judge0, Vercel, Docker) |
| `implementation.md` | Architecture, wireframes, database schema, and curriculum design |
| `task.md` | Development task list and verification history |
| `walkthrough.md` | Comprehensive file-by-file repository walkthrough |
| `technical_documentation.md` | System biography and engineering specifications |

---

## `/lib` — Library Files

| File | Purpose |
|------|---------|
| `constants.js` | Ranks, levels, Judge0 language IDs, categories, exercise types |
| `utils.js` | XP formatting, rank calculation, progress math, time helpers |
| `judge0.js` | Judge0 API wrapper — code submission, multi-test-case execution |
| `supabase/client.js` | Browser Supabase client (singleton, SSG-safe) |
| `supabase/server.js` | Server Supabase client (cookie-based auth) |
| `supabase/middleware.js` | Session refresh + route protection logic |

---

## `/providers` — Context Providers

| Provider | Context | Provides |
|----------|---------|----------|
| **AuthProvider** | `AuthContext` | `user`, `profile`, `loading`, `signOut()` |
| **QuestProvider** | `QuestContext` | `activeTools`, `refreshTools()` |

---

## `/hooks` — Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth()` | Consumes AuthContext — returns `{ user, profile, loading, signOut }` |
| `useQuestProgress(toolSlug)` | Fetches stages + progress for a tool |
| `useCodeExecution()` | Manages code submission state: `{ submitting, results, submitCode, runCode }` |
| `useCalendarData()` | Fetches 365 days of daily activity + streak stats |

---

## `/supabase` — Database

### Migrations (execute in order)

1. `001_create_tables.sql` — 11 tables with constraints and foreign keys
2. `002_create_rls_policies.sql` — Row-Level Security policies
3. `003_create_indexes.sql` — Performance indexes
4. `004_create_triggers.sql` — Max 2 active tools trigger

### Seed Data

- `seed.sql` — Insert 5 levels, 12 tools, badges

---

## `/data/seed` — Curriculum Data

- `tools.json`, `levels.json`, `badges.json` — Reference data
- `curriculum/python.json` — Python curriculum (partial, generated by script)

---

## `/scripts` — CLI Tools

| Script | Purpose |
|--------|---------|
| `generate_curriculum.js` | Generates full curriculum JSON for all 12 tools |
| `seed-curriculum.js` | Reads curriculum JSON → inserts stages + test cases into Supabase |
