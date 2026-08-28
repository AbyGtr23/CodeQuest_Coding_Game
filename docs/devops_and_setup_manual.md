# 🛠️ CodeQuest — Developer & DevOps Operations Manual

> **Complete Infrastructure, Cloud Provisioning, Database Setup, and Production Deployment Guide**
> 
> *Target Environments: Local Development, Supabase (Cloud Postgres + Auth), RapidAPI / Self-Hosted Judge0, Vercel Serverless Hosting, and Custom Docker VPS.*

---

## 📑 Table of Contents

1. [Architecture & Infrastructure Overview](#1-architecture--infrastructure-overview)
2. [Prerequisites Checklist](#2-prerequisites-checklist)
3. [Step 1: Supabase Database & Auth Provisioning](#step-1-supabase-database--auth-provisioning)
4. [Step 2: GitHub OAuth Application Setup](#step-2-github-oauth-application-setup)
5. [Step 3: Judge0 Code Execution Engine Setup](#step-3-judge0-code-execution-engine-setup)
   - [Option A: RapidAPI Managed Judge0 (Fastest / Zero-Maintenance)](#option-a-rapidapi-managed-judge0-fastest--zero-maintenance)
   - [Option B: Self-Hosted Judge0 with Docker (Unlimited Scale)](#option-b-self-hosted-judge0-with-docker-unlimited-scale)
6. [Step 4: Local Development Setup & Data Seeding](#step-4-local-development-setup--data-seeding)
7. [Step 5: Comprehensive Local Testing & Pre-Deployment Quality Gate](#step-5-comprehensive-local-testing--pre-deployment-quality-gate)
   - [5.1 Automated Smoke Test Suite (`npm run test:smoke`)](#51-automated-smoke-test-suite-npm-run-testsmoke)
   - [5.2 Local Development Server Testing (`npm run dev`)](#52-local-development-server-testing-npm-run-dev)
   - [5.3 Local Production Simulation (`npm run build && npm start`)](#53-local-production-simulation-npm-run-build--npm-start)
   - [5.4 10-Point End-to-End Manual Testing Matrix](#54-10-point-end-to-end-manual-testing-matrix)
   - [5.5 Security & Data Isolation Verification](#55-security--data-isolation-verification)
8. [Step 6: Production Deployment on Vercel](#step-6-production-deployment-on-vercel)
9. [Step 7: Self-Hosted Deployment with Docker & Nginx](#step-7-self-hosted-deployment-with-docker--nginx)
10. [Step 8: Security, Monitoring & Maintenance](#step-8-security-monitoring--maintenance)
11. [Troubleshooting & DevOps FAQ](#11-troubleshooting--devops-faq)

---

## 1. Architecture & Infrastructure Overview

CodeQuest relies on a modern serverless topology designed for zero idle infrastructure costs, high performance, and rapid global distribution:

```
                                  ┌─────────────────────────────┐
                                  │      Client (Browser)       │
                                  │ Next.js App / Monaco Editor │
                                  └──────────────┬──────────────┘
                                                 │
                                                 │ HTTPS / WSS
                                                 ▼
               ┌─────────────────────────────────────────────────────────────────┐
               │                     Vercel Edge & Serverless                    │
               │  ┌───────────────────────┐     ┌─────────────────────────────┐  │
               │  │ Static Assets (CDN)   │     │ API Routes (Edge/Node.js)   │  │
               │  └───────────────────────┘     └──────────────┬──────────────┘  │
               └───────────────────────────────────────────────┼─────────────────┘
                                                               │
                                  ┌────────────────────────────┴────────────────────────────┐
                                  │                                                         │
                                  ▼                                                         ▼
                 ┌─────────────────────────────────┐                       ┌─────────────────────────────────┐
                 │       Supabase Cloud            │                       │           Judge0 CE             │
                 │  - PostgreSQL 15+ Engine        │                       │  - Sandboxed Code Execution     │
                 │  - Row-Level Security (RLS)     │                       │  - Multi-Language Compilers     │
                 │  - GoTrue Auth (OAuth & JWT)    │                       │  - Memory / CPU Limiter         │
                 │  - DB Triggers (Max 2 Tools)    │                       │  - RapidAPI or Self-Hosted      │
                 └─────────────────────────────────┘                       └─────────────────────────────────┘
```

---

## 2. Prerequisites Checklist

Before beginning setup, ensure you have:

- [ ] **Node.js**: v18.18.0 or v20.x+ installed (`node -v`)
- [ ] **npm**: v9.x or v10.x+ installed (`npm -v`)
- [ ] **Git**: Installed and configured (`git --version`)
- [ ] **Accounts**:
  - [Supabase Account](https://supabase.com) (Free Tier)
  - [GitHub Account](https://github.com) (For OAuth & repository hosting)
  - [RapidAPI Account](https://rapidapi.com) (For free Judge0 CE access)
  - [Vercel Account](https://vercel.com) (For free cloud deployment)

---

## Step 1: Supabase Database & Auth Provisioning

### 1.1 Create a New Supabase Project

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** and select your Organization.
3. Fill in the project details:
   - **Name**: `codequest-db` (or any custom name)
   - **Database Password**: Generate a secure password and save it in a password manager.
   - **Region**: Select the region closest to your expected users (e.g., `us-east-1` / `eu-central-1`).
   - **Pricing Plan**: **Free** ($0/month).
4. Click **Create new project** and wait 1–2 minutes for the database cluster to initialize.

### 1.2 Retrieve API Keys & Credentials

1. In the Supabase Dashboard, navigate to **Project Settings** (gear icon in sidebar) → **API**.
2. Note down the following values:
   - **Project URL**: `https://<your-project-ref>.supabase.co`
   - **anon / public key**: `eyJhbGciOi...` (Used in client-side Next.js code)
   - **service_role key**: `eyJhbGciOi...` (Secret admin key used **only** for database migrations, backend scripts, and seed runners).

> [!CAUTION]
> **Never** expose the `service_role` key to public Git repositories or client-side code! Keep it strictly in server-side environment variables.

### 1.3 Execute SQL Database Migrations

In the Supabase Dashboard, open the **SQL Editor** (terminal icon in left sidebar) and run the migration scripts in the exact sequence below:

#### Migration 1: Tables Schema (`001_create_tables.sql`)
1. Click **New query** in the SQL Editor.
2. Open [`supabase/migrations/001_create_tables.sql`](file:///d:/Coder_Games/codequest/supabase/migrations/001_create_tables.sql) from this repository.
3. Paste the entire SQL content and click **Run**.
4. *Output Verification*: Verify tables `users`, `tools`, `levels`, `stages`, `test_cases`, `user_tools`, `stage_progress`, `code_submissions`, `daily_activity`, `badges`, `user_badges` are created in the **Table Editor**.

#### Migration 2: Row-Level Security Policies (`002_create_rls_policies.sql`)
1. Click **New query**.
2. Open [`supabase/migrations/002_create_rls_policies.sql`](file:///d:/Coder_Games/codequest/supabase/migrations/002_create_rls_policies.sql).
3. Paste content and click **Run**.
4. *Functionality*: Ensures curriculum data is publicly readable, user progress is restricted to the authenticated user, and hidden test cases cannot be queried by regular users.

#### Migration 3: Performance Indexes (`003_create_indexes.sql`)
1. Click **New query**.
2. Open [`supabase/migrations/003_create_indexes.sql`](file:///d:/Coder_Games/codequest/supabase/migrations/003_create_indexes.sql).
3. Paste content and click **Run**.
4. *Functionality*: Adds B-tree indexes on `user_tools(user_id)`, `stage_progress(user_id)`, `stages(tool_id, level_id)`, and `daily_activity`.

#### Migration 4: Database Triggers (`004_create_triggers.sql`)
1. Click **New query**.
2. Open [`supabase/migrations/004_create_triggers.sql`](file:///d:/Coder_Games/codequest/supabase/migrations/004_create_triggers.sql).
3. Paste content and click **Run**.
4. *Functionality*: Enforces the hard rule: **Maximum 2 active tool slots per user**.

#### Migration 5: Reference Seed Data (`seed.sql`)
1. Click **New query**.
2. Open [`supabase/seed.sql`](file:///d:/Coder_Games/codequest/supabase/seed.sql).
3. Paste content and click **Run**.
4. *Functionality*: Seeds the 5 progression levels (Cadet → Archmage), 12 tools (Python, JS, Go, Rust, Git, Docker, etc.), and achievement badges.

---

## Step 2: GitHub OAuth Application Setup

CodeQuest supports instant passwordless sign-in via GitHub OAuth.

### 2.1 Register GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **OAuth Apps** → **New OAuth App**.
3. Enter the following parameters:
   - **Application name**: `CodeQuest`
   - **Homepage URL**:
     - *Development*: `http://localhost:3000`
     - *Production*: `https://your-app.vercel.app`
   - **Application description**: `Quest-based developer learning platform`
   - **Authorization callback URL**:
     ```
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```
     *(Replace `<your-supabase-project-ref>` with your actual Supabase reference ID found in your Supabase URL).*
4. Click **Register application**.
5. Click **Generate a new client secret**.
6. Copy both the **Client ID** and the **Client Secret**.

### 2.2 Configure GitHub Provider in Supabase

1. In Supabase Dashboard, go to **Authentication** → **Providers**.
2. Scroll to **GitHub** and toggle **Enable GitHub**.
3. Paste your **Client ID** and **Client Secret**.
4. Click **Save**.
5. Go to **Authentication** → **URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your production Vercel URL).
   - In **Redirect URLs**, add:
     - `http://localhost:3000/**`
     - `https://your-app.vercel.app/**`
     - `http://localhost:3000/auth/callback`
     - `https://your-app.vercel.app/auth/callback`

---

## Step 3: Judge0 Code Execution Engine Setup

Judge0 is the sandboxed code execution backend that compiles and runs student submissions safely against test cases.

### Option A: RapidAPI Managed Judge0 (Fastest / Zero-Maintenance)

1. Sign up / log into [RapidAPI](https://rapidapi.com).
2. Navigate to [Judge0 CE on RapidAPI](https://rapidapi.com/hermanzdosilovic/api/judge0-ce).
3. Click **Subscribe to Test** and select the **Basic (Free)** tier (50–100 submissions/day for testing).
4. Copy your **X-RapidAPI-Key** from the code snippets panel.
5. In your `.env.local`:
   ```env
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your_rapidapi_key_here
   ```

---

### Option B: Self-Hosted Judge0 with Docker (Unlimited Scale)

If you require high throughput without rate limits, deploy Judge0 on any Linux cloud VPS (Ubuntu 22.04 / 24.04 with 2GB+ RAM, e.g. DigitalOcean $12/mo, Hetzner €4/mo, or AWS EC2 `t3.medium`).

#### 1. Server Prerequisites
```bash
# Update system and install Docker & Docker Compose
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose git curl

# Enable Docker on startup
sudo systemctl enable --now docker
```

#### 2. Deploy Judge0 Stack
```bash
# Clone Judge0 official compose configuration
mkdir -p /opt/judge0 && cd /opt/judge0
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
unzip judge0-v1.13.1.zip

# Generate configuration file
cp judge0.conf.example judge0.conf

# Start services (Postgres, Redis, Judge0 Server, Workers)
docker-compose up -d db redis
sleep 10
docker-compose up -d
```

#### 3. Secure with HTTPS Reverse Proxy (Caddy)
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy -y

# Configure /etc/caddy/Caddyfile:
# judge0.yourdomain.com {
#     reverse_proxy localhost:2358
# }

sudo systemctl restart caddy
```

#### 4. Configure App for Self-Hosted Judge0
```env
JUDGE0_API_URL=https://judge0.yourdomain.com
JUDGE0_API_KEY=
```

---

## Step 4: Local Development Setup & Data Seeding

### 4.1 Configure Environment Variables

1. In `codequest/`, create `.env.local` by copying `.env.local.example`:
   ```bash
   cd codequest
   cp .env.local.example .env.local
   ```
2. Populate `.env.local` with your values:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

   # Judge0 Code Execution
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your_rapidapi_key_here

   # App Base URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4.2 Seed Curriculum & Stages into Database

Run the automated generator and Supabase database importer:

```bash
# 1. Generate full curriculum JSON files for all 12 tools
npm run generate:curriculum

# 2. Seed stages & test cases into Supabase
npm run seed:curriculum
```

*Expected Terminal Output:*
```
Starting seed...
Processing python.json
Processing javascript.json
Processing git.json
...
Seeding complete!
```

---

## Step 5: Comprehensive Local Testing & Pre-Deployment Quality Gate

Before deploying to public cloud servers, execute the multi-tier testing pipeline to guarantee database integrity, sandboxed code execution, session management, and UI responsiveness.

### 5.1 Automated Smoke Test Suite (`npm run test:smoke`)

CodeQuest includes a dedicated automated pre-deployment verification tool (`scripts/smoke_test.js`):

```bash
npm run test:smoke
```

This automated runner verifies:
1. **Environment Configuration Check**: Validates that `.env.local` contains well-formed URLs and keys for Supabase and Judge0.
2. **Database Connectivity & Data Health**: Connects to your live Supabase instance and asserts that all 12 tools, 5 levels, and quest stages are present and queryable.
3. **Judge0 Sandboxed Execution**: Dispatches a test Python program to your Judge0 engine and validates base64 payload delivery, stdout capture, and sandbox performance.
4. **Build Artifacts Validation**: Checks that production static chunks and dynamic server components are built and optimized.

---

### 5.2 Local Development Server Testing (`npm run dev`)

Start the interactive development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Use the developer console (`F12`) to monitor network traffic and React rendering performance.

---

### 5.3 Local Production Simulation (`npm run build && npm start`)

Testing in standard development mode (`npm run dev`) does not exercise Next.js's production compilation, minified assets, or Serverless SSG/SSR boundary behavior. Always test a production build locally before pushing:

```bash
# 1. Compile production bundle (ensures zero syntax, type, or CSS Module purity errors)
npm run build

# 2. Launch production HTTP server on port 3000
npm run start
```

*Expected Terminal Output:*
```
✓ Compiled successfully
✓ Generating static pages (19/19)
✓ Finalizing page optimization
Listening on port 3000...
```

---

### 5.4 10-Point End-to-End Manual Testing Matrix

Execute the following end-to-end user workflows on your local instance (`http://localhost:3000`):

| # | Test Scenario | Step-by-Step Action | Expected Result | Pass/Fail |
|---|---------------|---------------------|-----------------|:---------:|
| **1** | **Landing Page UX** | Navigate to `http://localhost:3000/`. | Terminal typing animation runs (`> LEVEL UP YOUR CODE_`), 3 featured tool cards render with neon borders, CTA button is visible. | [ ] |
| **2** | **Account Registration** | Click **Start Quest** → Navigate to `/auth/signup`. Enter a unique username, email, and password. Click Register. | User is created in Supabase `auth.users` and `public.users`. Redirects automatically to `/dashboard`. | [ ] |
| **3** | **Session & Route Guard** | Open an Incognito window and try navigating directly to `http://localhost:3000/dashboard` or `/quest/python`. | Next.js middleware intercepts unauthenticated request and redirects immediately to `/auth/login`. | [ ] |
| **4** | **Tool Selection (Max 2 Slots)** | Go to `/catalog`. Click **SELECT** on Python, then **SELECT** on JavaScript. | Slots counter displays `(2/2)`. Both tools appear as Active. | [ ] |
| **5** | **Max 2 Active Tools DB Trigger** | In `/catalog`, attempt to click **SELECT** on a 3rd tool (e.g. Go or Docker). | UI blocks selection with warning modal. If forced via API, database trigger `check_max_active_tools` throws error and prevents insertion. | [ ] |
| **6** | **Quest Map Navigation** | Go to `/quest/python`. | 5 rank tiers render (Cadet, Soldier, Knight, Wizard, Archmage). Stage 1 is marked available (⭐), while subsequent locked stages display lock icons (🔒). | [ ] |
| **7** | **Monaco IDE & Code Runner** | Click Stage 1 (e.g. "The Serpent's Awakening"). Switch between **[📖 Lesson]** and **[💻 Code]** tabs. Click **RUN CODE**. | Monaco editor renders with custom Terminal Noir dark theme. Judge0 executes code sandbox and displays stdout in terminal console without saving. | [ ] |
| **8** | **Test Evaluator & Submission** | Write correct solution code (e.g. `print("Hello, World!")`) and click **SUBMIT SOLUTION**. | Test cases pass (Test 1 ✅, Test 2 ✅, Hidden Test 3 ✅). XP award is added, Stage status changes to Completed, and Next Stage unlocks. | [ ] |
| **9** | **Calendar & Streak Tracking** | Navigate to `/calendar`. | Heatmap reflects today's date with green activity square (1+ stages completed). Current streak displays `1 day(s)`. | [ ] |
| **10** | **Profile & Leaderboard** | Navigate to `/profile` and `/leaderboard`. | Profile shows earned XP, badges, and progress bar for active tools. Leaderboard lists your quester ranking. | [ ] |

---

### 5.5 Security & Data Isolation Verification

Run these quick checks to ensure production readiness:

1. **Test Case Security**: Verify in browser Network DevTools that `test_cases` requests to `/api/quest/[toolSlug]/[level]/[stage]` **do not** leak `input` or `expected_output` for hidden test cases (`is_hidden = true`).
2. **RLS Isolation**: Create a second test account in a private browsing window. Verify that Account B **cannot** view or modify Account A's `stage_progress`, `user_tools`, or `code_submissions`.
3. **Environment Audit**: Ensure `.env.local` is listed in `.gitignore` and has **not** been staged or committed to Git (`git status`).

---

## Step 6: Production Deployment on Vercel

Vercel is the native host for Next.js 16 App Router applications.

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete CodeQuest platform"
   git push origin main
   ```
2. Open [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
3. Select your GitHub repository.
4. **Build and Output Settings**:
   - **Root Directory**: `codequest` *(important: set root directory to `codequest` if your repo root is parent)*
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
5. **Environment Variables**:
   Add the following production environment variables:
   
   | Name | Value | Environment |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Production, Preview |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Production |
   | `JUDGE0_API_URL` | `https://judge0-ce.p.rapidapi.com` | Production, Preview |
   | `JUDGE0_API_KEY` | `your_rapidapi_key` | Production, Preview |
   | `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production |

6. Click **Deploy**. Vercel will build and assign a global CDN URL (e.g. `https://codequest.vercel.app`).

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from codequest directory
cd codequest
vercel

# Deploy to production
vercel --prod
```

### 6.3 Post-Deployment Auth Whitelist

After receiving your live Vercel URL (e.g., `https://codequest.vercel.app`):
1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**.
2. Set **Site URL** to `https://codequest.vercel.app`.
3. Add `https://codequest.vercel.app/**` and `https://codequest.vercel.app/auth/callback` to **Redirect URLs**.
4. Go to **GitHub Developer Settings** → Update your OAuth App's Homepage and Callback URLs with the production domain.

---

## Step 7: Self-Hosted Deployment with Docker & Nginx

If deploying to a self-managed server (AWS EC2, DigitalOcean, VPS) rather than Vercel:

### 7.1 Production Dockerfile

Create `codequest/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 7.2 Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JUDGE0_API_URL=${JUDGE0_API_URL}
      - JUDGE0_API_KEY=${JUDGE0_API_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
```

Run:
```bash
docker-compose up -d --build
```

---

## Step 8: Security, Monitoring & Maintenance

### 8.1 Security Hardening

- **Row-Level Security (RLS)**: Verify all 11 tables have RLS enabled via `002_create_rls_policies.sql`.
- **Database Role Separation**:
  - Web clients interact via `anon` key + user JWT.
  - Seeding scripts use `service_role` key.
- **Sanitized Execution**: All user-submitted code is isolated inside Judge0 sandboxes with strict CPU (5s) and Memory (128MB) limits.
- **Rate Limiting**: Judge0 submission endpoints (`/api/submit`, `/api/run`) enforce synchronous response verification.

### 8.2 Database Backups

- **Automated Backups**: Supabase performs daily automated backups on all projects.
- **Manual Backups**: Use `pg_dump` via connection pooler:
  ```bash
  pg_dump -h db.<ref>.supabase.co -U postgres -d postgres -F c -b -v -f codequest_backup.dump
  ```

---

## 11. Troubleshooting & DevOps FAQ

### Q1: `Error: @supabase/ssr: Your project's URL and API key are required` during build
- **Cause**: Static prerendering executed without environment variables.
- **Solution**: Handled automatically in `lib/supabase/client.js` with our SSG-safe singleton mock. If seen in custom scripts, verify `.env.local` is present.

### Q2: GitHub OAuth returns `redirect_uri_mismatch`
- **Cause**: Callback URL in GitHub OAuth settings does not match Supabase's Auth callback URL.
- **Solution**: Check GitHub OAuth App settings. Authorization Callback URL must be `https://<your-supabase-id>.supabase.co/auth/v1/callback`, **not** your Vercel URL.

### Q3: `check_max_active_tools` trigger exception when enrolling in a 3rd tool
- **Cause**: Expected system behavior. The user has already enrolled in 2 active tools.
- **Solution**: The user must master one of the active tools (reach 100% completion) or drop an existing active tool before choosing a new one.

### Q4: Judge0 API returns `429 Too Many Requests`
- **Cause**: RapidAPI free tier daily limit reached (~50-100 requests/day).
- **Solution**: Upgrade RapidAPI plan to Pro, or switch to a self-hosted Judge0 instance (see [Step 3: Option B](#option-b-self-hosted-judge0-with-docker-unlimited-scale)).

---

*Manual maintained by the CodeQuest Core Engineering & DevOps Team.*


