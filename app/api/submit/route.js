import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runTestCases } from '@/lib/judge0';
import { calculateXp } from '@/lib/utils';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { stageId, sourceCode, languageId } = await request.json();

  if (!stageId || !sourceCode || !languageId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Get all test cases for this stage
  const { data: testCases, error: tcError } = await supabase
    .from('test_cases')
    .select('*')
    .eq('stage_id', stageId);

  if (tcError || !testCases.length) {
    return NextResponse.json({ error: 'Test cases not found' }, { status: 404 });
  }

  // 2. Run code against test cases using Judge0
  let results;
  try {
    results = await runTestCases(sourceCode, languageId, testCases);
  } catch (err) {
    return NextResponse.json({ error: 'Execution service unavailable' }, { status: 503 });
  }

  const allPassed = results.every(r => r.passed);

  // 3. Save submission
  const { data: submission, error: subError } = await supabase
    .from('code_submissions')
    .insert([{
      user_id: user.id,
      stage_id: stageId,
      source_code: sourceCode,
      language_id: languageId,
      passed: allPassed,
      execution_time_ms: Math.max(...results.map(r => r.time || 0)),
      memory_bytes: Math.max(...results.map(r => r.memory || 0))
    }])
    .select()
    .single();

  if (subError) {
    console.error('Failed to save submission:', subError);
  }

  // 4. If passed, update progress and XP
  let levelCompleted = false;
  let xpAwarded = 0;

  if (allPassed) {
    // Get stage info
    const { data: stageInfo } = await supabase
      .from('stages')
      .select('tool_id, level, xp_reward')
      .eq('id', stageId)
      .single();

    // Check previous progress to ensure we don't award XP twice
    const { data: existingProgress } = await supabase
      .from('stage_progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('stage_id', stageId)
      .single();

    const isFirstTime = !existingProgress || existingProgress.status !== 'completed';

    if (isFirstTime) {
      xpAwarded = stageInfo.xp_reward;
      
      // Upsert progress
      await supabase
        .from('stage_progress')
        .upsert({
          user_id: user.id,
          stage_id: stageId,
          status: 'completed',
          completed_at: new Date().toISOString()
        });

      // Update User XP
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', user.id)
        .single();
        
      await supabase
        .from('users')
        .update({ total_xp: (userData.total_xp || 0) + xpAwarded })
        .eq('id', user.id);

      // Record Daily Activity
      await supabase
        .from('daily_activity')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          stage_id: stageId,
          xp_earned: xpAwarded
        });

      // Update Tool Progress
      // Count total stages vs completed stages for this tool
      const { count: totalStages } = await supabase
        .from('stages')
        .select('id', { count: 'exact', head: true })
        .eq('tool_id', stageInfo.tool_id);
        
      const { data: completedStages } = await supabase
        .from('stage_progress')
        .select('stage_id')
        .eq('user_id', user.id)
        .eq('status', 'completed');
        
      // Also get all stage IDs for this tool to intersect
      const { data: toolStages } = await supabase
        .from('stages')
        .select('id')
        .eq('tool_id', stageInfo.tool_id);
        
      const toolStageIds = new Set(toolStages.map(s => s.id));
      const completedToolStagesCount = completedStages.filter(p => toolStageIds.has(p.stage_id)).length;
      
      const progressPercent = Math.round((completedToolStagesCount / totalStages) * 100);
      const isMastered = progressPercent === 100;

      await supabase
        .from('user_tools')
        .update({
          progress: progressPercent,
          mastered: isMastered
        })
        .eq('user_id', user.id)
        .eq('tool_id', stageInfo.tool_id);

      // Check if level was just completed
      const { count: totalLevelStages } = await supabase
        .from('stages')
        .select('id', { count: 'exact', head: true })
        .eq('tool_id', stageInfo.tool_id)
        .eq('level', stageInfo.level);
        
      const levelStageIds = new Set(toolStages.filter(s => s.level === stageInfo.level).map(s => s.id));
      const completedLevelStagesCount = completedStages.filter(p => levelStageIds.has(p.stage_id)).length;
      
      if (completedLevelStagesCount === totalLevelStages) {
        levelCompleted = true;
      }
    }
  }

  // Hide expected output for hidden test cases if they failed
  const safeResults = results.map(r => {
    const tc = testCases.find(t => t.id === r.testCaseId);
    if (tc?.is_hidden && !r.passed) {
      return {
        ...r,
        expectedOutput: 'Hidden Test Case',
        output: 'Hidden Test Case Failed',
        input: 'Hidden Input'
      };
    }
    return r;
  });

  return NextResponse.json({
    success: allPassed,
    results: safeResults,
    xpAwarded,
    levelCompleted
  });
}
