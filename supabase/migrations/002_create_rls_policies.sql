ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Public read for levels" ON levels FOR SELECT USING (true);
CREATE POLICY "Public read for stages" ON stages FOR SELECT USING (true);
CREATE POLICY "Public read for badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Public read for users" ON users FOR SELECT USING (true);

CREATE POLICY "Users can manage their own user_tools" ON user_tools FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own stage_progress" ON stage_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own code_submissions" ON code_submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own daily_activity" ON daily_activity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read their own user_badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public read for non-hidden test cases" ON test_cases FOR SELECT USING (is_hidden = false);
