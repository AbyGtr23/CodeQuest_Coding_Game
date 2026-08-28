-- Seed Levels
INSERT INTO levels (id, slug, name, display_name, order_index, stage_count, xp_per_stage) VALUES
('a1111111-1111-1111-1111-111111111111', 'cadet', 'Cadet', 'Cadet', 1, 15, 30),
('b2222222-2222-2222-2222-222222222222', 'soldier', 'Soldier', 'Soldier', 2, 15, 50),
('c3333333-3333-3333-3333-333333333333', 'knight', 'Knight', 'Knight', 3, 15, 80),
('d4444444-4444-4444-4444-444444444444', 'wizard', 'Wizard', 'Wizard', 4, 12, 120),
('e5555555-5555-5555-5555-555555555555', 'archmage', 'Archmage', 'Archmage', 5, 10, 200);

-- Seed Tools
INSERT INTO tools (id, slug, name, description, icon_emoji, category, difficulty_rating, total_stages, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'python', 'Python', 'Learn Python programming language', '🐍', 'language', 1, 67, 1),
('22222222-2222-2222-2222-222222222222', 'javascript', 'JavaScript', 'Learn JavaScript programming language', '💛', 'language', 2, 67, 2),
('33333333-3333-3333-3333-333333333333', 'typescript', 'TypeScript', 'Learn TypeScript', '💙', 'language', 3, 67, 3),
('44444444-4444-4444-4444-444444444444', 'go', 'Go', 'Learn Go programming language', '🐹', 'language', 3, 67, 4),
('55555555-5555-5555-5555-555555555555', 'rust', 'Rust', 'Learn Rust programming language', '🦀', 'language', 5, 67, 5),
('66666666-6666-6666-6666-666666666666', 'git', 'Git', 'Learn Git version control', '🔀', 'tool', 2, 67, 6),
('77777777-7777-7777-7777-777777777777', 'docker', 'Docker', 'Learn Docker containerization', '🐳', 'tool', 3, 67, 7),
('88888888-8888-8888-8888-888888888888', 'linux-cli', 'Linux CLI', 'Learn Linux Command Line', '🐧', 'tool', 2, 67, 8),
('99999999-9999-9999-9999-999999999999', 'sql', 'SQL', 'Learn Structured Query Language', '💾', 'language', 2, 67, 9),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'react', 'React', 'Learn React library', '⚛️', 'framework', 3, 67, 10),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'nodejs', 'Node.js/Express', 'Learn Node.js and Express backend framework', '🟢', 'framework', 3, 67, 11),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'django', 'Django', 'Learn Django backend framework', '🎸', 'framework', 4, 67, 12);

-- Seed Badges
INSERT INTO badges (slug, name, description, icon, condition_type, condition_value) VALUES
('first_blood', 'First Blood', 'Complete your first stage', '🩸', 'stages_completed', 1),
('week_warrior', 'Week Warrior', 'Maintain a 7-day streak', '⚔️', 'streak', 7),
('speed_demon', 'Speed Demon', 'Complete a stage quickly', '⚡', 'speed', 1),
('perfect_stage', 'Perfect Stage', 'Pass all tests on first try', '⭐', 'perfect_attempt', 1),
('centurion', 'Centurion', 'Earn 100 XP', '💯', 'xp_earned', 100),
('tool_master', 'Tool Master', 'Master your first tool', '🏆', 'tools_mastered', 1);
