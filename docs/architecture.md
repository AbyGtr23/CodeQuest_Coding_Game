# CodeQuest Architecture

## Overview
CodeQuest is a gamified coding education platform built with a modern web stack. It uses a Next.js App Router frontend, a Supabase backend for database and authentication, and Judge0 for code execution. The UI is designed with a "terminal-noir" aesthetic (CRT effects, monospace fonts, dark theme).

## High-Level Architecture Diagram

```mermaid
flowchart TD
    Client[Client Browser (Next.js)]
    NextAPI[Next.js API Routes (/api/*)]
    SupabaseDB[(Supabase PostgreSQL)]
    SupabaseAuth[Supabase Auth]
    Judge0[Judge0 API]

    Client <-->|HTTP/REST| NextAPI
    Client <-->|JWT/Auth| SupabaseAuth
    NextAPI <-->|SQL/REST| SupabaseDB
    NextAPI <-->|HTTP/REST| Judge0
```

## Components

### Frontend (Next.js 16 App Router)
- **UI Theme**: Terminal-noir, utilizing Tailwind CSS for styling and custom CSS for CRT effects.
- **State Management**: React Context / Hooks for state.
- **Client-Side Components**: Interactive elements like the code editor, terminal output, and quest progression UI.

### Backend (Next.js API Routes)
- Acts as a server-side controller layer.
- **Data Flow**: Client → API → Supabase/Judge0.
- Handles logic such as code submission, testing, user progression, and leaderboard data aggregation.

### Database & Auth (Supabase)
- **PostgreSQL Database**: Stores users, curriculum, progress, and gamification data.
- **Authentication**: Supabase Auth (Email/Password).
- **Triggers**: A `handle_new_user` trigger automatically creates a profile in `public.users` upon signup.
- **RLS**: Row Level Security ensures data privacy, and secure server-side interactions bypass RLS using a service role key when necessary (e.g., retrieving hidden test cases).

### Code Execution (Judge0)
- Securely compiles and runs user code submissions.
- Used for both quick "Run" tests (visible test cases) and comprehensive "Submit" evaluations (including hidden test cases).

## Gamification System
- **XP & Ranks**: Users earn XP by completing stages. Ranks range from Cadet to Archmage based on XP thresholds.
- **Streaks**: Daily activity tracked to maintain coding streaks.
- **Badges & Mastery**: Earned upon completing specific milestones or tools.
