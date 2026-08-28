# CodeQuest Technical Documentation & Specification

Welcome to the technical biography and engineering specification of **CodeQuest** — a quest-based developer learning platform.

---

## 1. System Vision & Architecture

CodeQuest is built to combine RPG progression mechanisms (quest lines, rank tiers, levels, XP rewards) with professional development environments (Monaco Code Editor, containerized code compiler, Postgres schemas, Row-Level security).

### System Topology

```
             ┌────────────────────────────────────────┐
             │            User Browser                │
             │  (React 19, Monaco, CSS Variables)      │
             └───────┬────────────────────────┬───────┘
                     │                        │
                     │ Next.js App            │ Supabase JS API Client
                     │ Route Proxies          │ (Direct RLS Queries)
                     ▼                        ▼
             ┌──────────────┐          ┌──────────────┐
             │  Vercel CDN  │          │   Supabase   │
             │ (Next.js 16.3.1         │  (Postgres,  │
             │  Serverless) │          │  Auth, RLS)  │
             └───────┬──────┘          └──────────────┘
                     │
                     │ HTTP Submissions
                     ▼
             ┌──────────────┐
             │  Judge0 API  │
             │ (Sandboxed   │
             │   Compilers) │
             └──────────────┘
```

---

## 2. Core Functional Specifications

### 2.1 Tool Slots Selection Logic
*   **Enforcement**: Users can select and register a maximum of **2 active tools** (languages, frameworks, or developer tools) concurrently.
*   **Constraint**: Selecting a 3rd active tool triggers an exception.
*   **State Transition**: An active tool slot is freed when the enrolled tool is **Mastered**. Mastery requires 100% completion of all levels and stages (67/67 stages). Once mastered, the user status updates to `mastered`, and the trigger frees up a learning slot.
*   **Database Trigger**: Checked via PostgreSQL trigger functions (`check_max_active_tools`) prior to row insertions in `user_tools`.

### 2.2 Progress Tracking & Scoring Formulas
*   **XP Tier Matrix**:
    *   **Cadet (Beginner)**: 15 stages × 30 XP = 450 XP
    *   **Soldier (Elementary)**: 15 stages × 50 XP = 750 XP
    *   **Knight (Intermediate)**: 15 stages × 80 XP = 1,200 XP
    *   **Wizard (Advanced)**: 12 stages × 120 XP = 1,440 XP
    *   **Archmage (Expert)**: 10 stages × 200 XP = 2,000 XP
    *   **Total Tool XP**: 5,840 XP
*   **Progress Percentage Calculation**:
    $$\text{Progress \%} = \left(\frac{\text{Completed Stages}}{\text{Total Tool Stages}}\right) \times 100$$
*   **Rank Progression Rules**:
    *   **Cadet**: Initial rank (0 XP)
    *   **Soldier**: Unlocks at 1,000 XP
    *   **Knight**: Unlocks at 3,000 XP
    *   **Wizard**: Unlocks at 6,000 XP
    *   **Archmage**: Unlocks at 10,000+ XP

### 2.3 Streak Tracking Logic
*   Calculated dynamically by evaluating contiguous days in the `daily_activity` log.
*   Upon submission completion:
    *   If `last_active_at` is **today**, streak remains constant.
    *   If `last_active_at` is **yesterday**, `current_streak` increments by 1.
    *   If `last_active_at` is **older than yesterday**, `current_streak` resets to 1.
    *   If `current_streak` exceeds `longest_streak`, update `longest_streak`.

---

## 3. Database Schema Specification

### Tables & Columns Description

#### `users`
Tracks profiles linked directly to Supabase Authentication UUIDs.
*   `id` (UUID, Primary Key, references `auth.users.id`): Main identifier.
*   `email` (TEXT, Not Null): Cache of user credentials.
*   `username` (TEXT, Unique, Not Null): Public handle.
*   `avatar_url` (TEXT, Nullable): Custom profile path.
*   `current_rank` (TEXT): Default 'Cadet'. Enum: `Cadet`, `Soldier`, `Knight`, `Wizard`, `Archmage`.
*   `total_xp` (INTEGER): Accumulated points.
*   `current_streak` / `longest_streak` (INTEGER): Active habit trackers.

#### `tools`
Available learning catalogs.
*   `id` (UUID, Primary Key): Unique tool ID.
*   `slug` (TEXT, Unique): Used for paths (e.g. `python`, `react`).
*   `name` (TEXT): Display name.
*   `category` (TEXT): `language`, `tool`, or `framework`.
*   `difficulty_rating` (INTEGER): 1-5 representation.

#### `stages`
Quest stages.
*   `id` (UUID, Primary Key).
*   `tool_id` (UUID, Foreign Key).
*   `level_id` (UUID, Foreign Key).
*   `stage_number` (INTEGER): Sequence positioning.
*   `quest_name` (TEXT): RPG naming (e.g. "The Decorator Den").
*   `lesson_content_md` (TEXT): Markdown syllabus contents.
*   `problem_statement_md` (TEXT): Description of the exercise.
*   `starter_code` / `solution_code` (TEXT): Initial content and reference solution.
*   `exercise_type` (TEXT): Enum: `quiz`, `fill-code`, `coding-challenge`, `debug`, `project`, `refactor`.

#### `test_cases`
Assertion conditions matching user code executions.
*   `id` (UUID, Primary Key).
*   `stage_id` (UUID, Foreign Key).
*   `input` (TEXT): Stdin payload.
*   `expected_output` (TEXT): Expected stdout match.
*   `is_hidden` (BOOLEAN): Hidden flag for final tests.

---

## 4. API Endpoints Specification

### 4.1 Submissions API Proxy (`POST /api/submit`)
*   **Request Body**:
    ```json
    {
      "stageId": "uuid-string",
      "sourceCode": "def add(a, b): return a + b",
      "languageId": "71"
    }
    ```
*   **Execution Pipeline**:
    1. Authenticate user request via server headers.
    2. Read target `test_cases` for `stageId` from database.
    3. Loop calls to Judge0 compilation node (`/submissions`) using Base64 encoding.
    4. Validate standard outputs against target expected strings.
    5. Log entries in database table `code_submissions`.
    6. Return compilation stats:
*   **Response Payload**:
    ```json
    {
      "status": "accepted",
      "xpEarned": 80,
      "results": [
        { "testNumber": 1, "status": "passed", "duration": 0.02 },
        { "testNumber": 2, "status": "passed", "duration": 0.01 }
      ]
    }
    ```

---

## 5. UI/UX Design System Specification

We implement the **Terminal Noir** theme to cultivate a dorky and retro-inspired feel for hackers and tech geeks.

*   **Scanlines Overlay**: Subtle, repeating radial background overlays that mirror vintage CRT terminal screens.
*   **Console Textures**: Mono-space formatting, explicit error diagnostics, glowing borders, and retro badges.
*   **Focus Animations**: Cursor blink effects, pixelated transitions when ranking up, and glowing green/cyan hover accents.
*   **Color Guide**:
    *   Console Background: `#0a0e17`
    *   Panel Surfaces: `#111827`
    *   Command Terminal / Success: `#22c55e`
    *   Alert Errors / Fails: `#ef4444`
    *   Hyperlink Cyan: `#06b6d4`
