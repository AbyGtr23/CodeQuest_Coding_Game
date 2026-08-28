CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    current_rank TEXT DEFAULT 'Cadet' CHECK (current_rank IN ('Cadet','Soldier','Knight','Wizard','Archmage')),
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_emoji TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('language','tool','framework')),
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    total_stages INTEGER DEFAULT 67,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    order_index INTEGER UNIQUE NOT NULL,
    stage_count INTEGER NOT NULL,
    xp_per_stage INTEGER NOT NULL
);

CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES tools(id),
    level_id UUID REFERENCES levels(id),
    stage_number INTEGER,
    title TEXT,
    quest_name TEXT,
    lesson_content_md TEXT,
    problem_statement_md TEXT,
    starter_code TEXT DEFAULT '',
    solution_code TEXT DEFAULT '',
    exercise_type TEXT CHECK (exercise_type IN ('quiz','fill-code','coding-challenge','debug','project','refactor')),
    language_id TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 50,
    UNIQUE(tool_id, level_id, stage_number)
);

CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
    test_number INTEGER,
    input TEXT DEFAULT '',
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    time_limit_ms INTEGER DEFAULT 5000,
    memory_limit_kb INTEGER DEFAULT 128000,
    UNIQUE(stage_id, test_number)
);

CREATE TABLE user_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    tool_id UUID REFERENCES tools(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active','mastered','dropped')),
    current_level_order INTEGER DEFAULT 1,
    current_stage_number INTEGER DEFAULT 1,
    progress_pct NUMERIC(5,2) DEFAULT 0.00,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    mastered_at TIMESTAMPTZ,
    UNIQUE(user_id, tool_id)
);

CREATE TABLE stage_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    stage_id UUID REFERENCES stages(id),
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
    attempts INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    first_attempted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, stage_id)
);

CREATE TABLE code_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    stage_id UUID REFERENCES stages(id),
    source_code TEXT,
    language_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','accepted','wrong_answer','runtime_error','time_limit','compilation_error')),
    tests_passed INTEGER DEFAULT 0,
    tests_total INTEGER DEFAULT 0,
    execution_time_ms NUMERIC(10,2),
    memory_used_kb INTEGER,
    stdout TEXT,
    stderr TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    activity_date DATE,
    stages_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    submissions_count INTEGER DEFAULT 0,
    UNIQUE(user_id, activity_date)
);

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    name TEXT,
    description TEXT,
    icon TEXT,
    condition_type TEXT,
    condition_value INTEGER DEFAULT 1
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    badge_id UUID REFERENCES badges(id),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);
