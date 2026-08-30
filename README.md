# CodeQuest

CodeQuest is a gamified coding education platform featuring a "terminal-noir" aesthetic. Learn to code, complete quests, earn XP, and rank up from Cadet to Archmage.

## Current Project State & Curriculum Status
**Disclaimer:** The application code and architecture have been remediated to match our canonical database schema. However, **the curriculum content is currently placeholder/filler**. While the system supports numerous languages, only Python, JavaScript, and Git are partially populated with test data. A real, pedagogically structured curriculum has NOT been written yet.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Execution Engine**: Judge0 API
- **UI Theme**: Custom terminal-noir CRT styling

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase project
- Judge0 API access

### Setup

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd codequest
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and populate the required keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JUDGE0_API_URL=your_judge0_url
   JUDGE0_API_KEY=your_judge0_key
   ```

3. **Database Setup**
   Execute the migrations in your Supabase project (SQL Editor). Ensure Migration 006 (the latest remediation migration) has been applied.

4. **Curriculum Seeding**
   Validate and seed the placeholder curriculum into your database:
   ```bash
   npm run validate:curriculum
   npm run seed
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

## Project Structure
- `/app` - Next.js App Router pages and layouts.
- `/api` - Server-side Next.js API Routes (controllers).
- `/components` - Reusable React components.
- `/lib` - Utility functions, Supabase clients, and Judge0 integration.
- `/docs` - Comprehensive architectural and system documentation.
- `/data` - Raw JSON curriculum data.
- `/scripts` - Seeding and validation utilities.

## Testing
- Run curriculum validation: `npm run validate:curriculum`
- Standard tests: `npm run test`

## Contributing
Please refer to the internal guidelines before contributing. Ensure any database schema modifications are documented and properly migrated.

## License
MIT License
