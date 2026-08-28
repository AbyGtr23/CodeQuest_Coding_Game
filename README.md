# ░▒▓ CodeQuest ▓▒░

> **Level up your code. Conquer the stack.**

A quest-based developer learning platform with RPG-style progression, an in-browser code editor, and real-time code execution.

![Terminal Noir](https://img.shields.io/badge/theme-Terminal%20Noir-0a0e17?style=flat-square&labelColor=111827&color=06b6d4)
![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)

## ⚡ Features

- **Quest-based learning** — 12 tools across 5 difficulty levels (67 stages each)
- **In-browser IDE** — Monaco Editor with real-time code execution via Judge0
- **RPG progression** — XP, ranks (Cadet → Archmage), streaks, badges
- **Tool mastery system** — Focus on 2 tools at a time, master before unlocking more
- **Activity heatmap** — GitHub-style contribution calendar
- **Leaderboard** — Compete with other questers globally

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, CSS Modules |
| Backend | Next.js API Routes (Serverless) |
| Database | Supabase (PostgreSQL + Row-Level Security) |
| Auth | Supabase Auth (Email/Password + GitHub OAuth) |
| Code Execution | Judge0 CE (via RapidAPI or self-hosted) |
| Editor | Monaco Editor (VS Code engine) |
| Hosting | Vercel |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account (free tier)
- [Judge0 CE API key](https://rapidapi.com/hermanzdosilovic/api/judge0-ce) (free tier)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd codequest
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JUDGE0_API_KEY=your-rapidapi-key
```

### 3. Setup Database

In your Supabase SQL Editor, run these files in order:
1. `supabase/migrations/001_create_tables.sql`
2. `supabase/migrations/002_create_rls_policies.sql`
3. `supabase/migrations/003_create_indexes.sql`
4. `supabase/migrations/004_create_triggers.sql`
5. `supabase/seed.sql`

### 4. Seed Curriculum Data

```bash
node scripts/generate_curriculum.js
node scripts/seed-curriculum.js
```

### 5. Configure GitHub OAuth (Optional)

1. Go to GitHub Settings → Developer Settings → OAuth Apps → New
2. Set callback URL: `https://<your-supabase-id>.supabase.co/auth/v1/callback`
3. Add Client ID & Secret to Supabase Auth → Providers → GitHub

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
codequest/
├── app/                    # Pages & API routes (App Router)
│   ├── api/                # 10 API routes
│   ├── auth/               # Login, signup, callback
│   ├── dashboard/          # Active quests overview
│   ├── catalog/            # Tool selection (max 2 active)
│   ├── quest/[toolSlug]/   # Quest map + stage interface
│   ├── calendar/           # Activity heatmap
│   ├── profile/            # Stats & badges
│   └── leaderboard/        # Global rankings
├── components/             # 10 reusable React components
├── hooks/                  # 4 custom hooks
├── providers/              # Auth & Quest context providers
├── lib/                    # Supabase clients, Judge0 wrapper, utilities
├── supabase/               # SQL migrations & seed data
├── scripts/                # Curriculum generation & seeding
├── data/seed/              # JSON reference data & curriculum
└── docs/                   # Implementation plan, task list, walkthrough
```

## 🎮 How It Works

1. **Choose your weapons** — Select up to 2 tools to master
2. **Follow the quest map** — Progress through 5 levels per tool
3. **Write code** — Solve coding challenges in the built-in IDE
4. **Get instant feedback** — Code is executed and tested in real-time
5. **Earn XP & rank up** — Climb from Cadet to Archmage

## 📖 Documentation

- [Developer & DevOps Manual](docs/devops_and_setup_manual.md) — Complete setup, database, OAuth, Judge0, & deployment guide
- [Implementation Plan](docs/implementation.md) — Architecture, database schema, API design
- [Task Checklist](docs/task.md) — Development progress tracker
- [Repository Walkthrough](docs/walkthrough.md) — File-by-file guide
- [Technical Specification](docs/technical_documentation.md) — Engineering deep-dive

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Vercel Settings
4. Deploy!

## License

MIT
