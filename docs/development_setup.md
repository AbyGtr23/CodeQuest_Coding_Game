# CodeQuest — Development Setup Manual

This manual provides instructions for configuring, running, testing, and debugging CodeQuest locally.

---

## 1. System Requirements

- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **Package Manager**: `npm` (v9+)
- **Supabase Account**: Free or Pro cloud instance
- **Judge0 API Key**: RapidAPI Judge0 CE key or self-hosted instance

---

## 2. Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/codequest.git
cd codequest

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in your Supabase and Judge0 credentials

# 4. Validate Curriculum
npm run validate:curriculum

# 5. Run Database Migrations (in Supabase SQL Editor)
# Execute supabase/migrations/001_create_tables.sql through 007_user_onboarding.sql

# 6. Seed Curriculum Data
npm run seed:curriculum

# 7. Run Test Suite
npm run test

# 8. Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Development Workflow

- **`npm run dev`**: Starts Next.js Turbopack development server on port 3000.
- **`npm run validate:curriculum`**: Validates JSON schema, hierarchy, learning objectives, problem statements, and test cases across all 12 tools.
- **`npm run seed:curriculum`**: Idempotently upserts tools, levels, stages, and test cases into Supabase.
- **`npm run test`**: Runs the 100+ assertion automated contract and security test suite.
- **`npm run build`**: Compiles production application with Turbopack.
