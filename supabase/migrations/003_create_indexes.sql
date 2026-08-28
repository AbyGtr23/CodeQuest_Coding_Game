CREATE INDEX idx_user_tools_user_id ON user_tools(user_id);
CREATE INDEX idx_user_tools_user_status ON user_tools(user_id, status);
CREATE INDEX idx_stage_progress_user_id ON stage_progress(user_id);
CREATE INDEX idx_stages_tool_level_stage ON stages(tool_id, level_id, stage_number);
CREATE INDEX idx_code_submissions_user_stage ON code_submissions(user_id, stage_id);
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date);
CREATE INDEX idx_test_cases_stage_id ON test_cases(stage_id);
