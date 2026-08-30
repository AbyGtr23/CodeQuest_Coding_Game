# Database Schema

The canonical Supabase PostgreSQL database for CodeQuest consists of 11 tables, managing users, curriculum, progress, and gamification. Note that Migrations 001-005 are historical; Migration 006 is the latest, used for remediation.

## Tables

### 1. `users`
- **Columns**: `id` (uuid, PK), `username` (text, unique), `display_name` (text), `avatar_url` (text), `created_at` (timestamptz), `updated_at` (timestamptz), `total_xp` (integer), `rank` (text), `streak_days` (integer), `last_active` (date).
- **RLS Policies**: Users can read their own data; public can read basic info for leaderboards; only admins or triggers can insert/update certain fields.
- **Triggers**: `handle_new_user` trigger populates this table from Supabase Auth (`auth.users`). Migration 006 utilizes safe `ON CONFLICT` for managing auth vs app fields.

### 2. `tools`
- **Columns**: `id` (uuid, PK), `name` (text), `slug` (text, unique), `description` (text), `icon` (text), `order_index` (integer).
- **Notes**: Defines the programming languages/tools available. Currently, 12 are defined in curriculum JSONs but only 3 (`python`, `javascript`, `git`) are in the DB via `tools.json`.

### 3. `levels`
- **Columns**: `id` (uuid, PK), `tool_id` (uuid, FK to tools), `level_number` (integer), `title` (text), `description` (text), `unlock_xp` (integer).

### 4. `stages`
- **Columns**: `id` (uuid, PK), `level_id` (uuid, FK to levels), `stage_number` (integer), `title` (text), `content` (text), `starter_code` (text), `xp_reward` (integer).

### 5. `test_cases`
- **Columns**: `id` (uuid, PK), `stage_id` (uuid, FK to stages), `input_data` (text), `expected_output` (text), `is_hidden` (boolean).
- **Security**: Hidden test cases are secured via RLS and only readable by the server via an admin client.

### 6. `user_tools`
- **Columns**: `id` (uuid, PK), `user_id` (uuid, FK), `tool_id` (uuid, FK), `mastery_level` (integer), `xp_earned` (integer).

### 7. `stage_progress`
- **Columns**: `id` (uuid, PK), `user_id` (uuid, FK), `stage_id` (uuid, FK), `status` (text: 'locked', 'unlocked', 'completed'), `completed_at` (timestamptz).

### 8. `code_submissions`
- **Columns**: `id` (uuid, PK), `user_id` (uuid, FK), `stage_id` (uuid, FK), `code` (text), `status` (text: 'passed', 'failed', 'error'), `execution_time_ms` (integer), `submitted_at` (timestamptz).

### 9. `daily_activity`
- **Columns**: `id` (uuid, PK), `user_id` (uuid, FK), `date` (date), `xp_earned` (integer), `stages_completed` (integer).

### 10. `badges`
- **Columns**: `id` (uuid, PK), `name` (text), `description` (text), `icon` (text), `criteria` (jsonb).

### 11. `user_badges`
- **Columns**: `id` (uuid, PK), `user_id` (uuid, FK), `badge_id` (uuid, FK), `earned_at` (timestamptz).

## Triggers & Migrations
- **handle_new_user**: Inserts a record into `public.users` when a new user signs up in `auth.users`.
- **Migration 006**: Ensures the schema matches this canonical state, handles the ON CONFLICT safely for auth-managed and app-managed fields, and creates necessary constraints and RLS policies.
