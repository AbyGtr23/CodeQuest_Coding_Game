import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runTestCases } from '@/lib/judge0';
import { getRankFromXp } from '@/lib/utils';

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

  const { data: stage } = await supabase
    .from('stages')
    .select('*')
    .eq('id', stageId)
    .single();

  if (!stage) {
    return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
  }

  const adminClient = createAdminClient();
  const { data: testCases } = await adminClient
    .from('test_cases')
    .select('*')
    .eq('stage_id', stageId)
    .order('test_number');

  if (!testCases || testCases.length === 0) {
    return NextResponse.json({ error: 'Test cases not found' }, { status: 404 });
  }

  // Execute using the stage's language_id, NOT client-supplied
  const execution = await runTestCases(sourceCode, stage.language_id, testCases);
  const allPassed = execution.allPassed;
  
  let submissionStatus = 'accepted';
  if (!allPassed) {
    const firstFailed = execution.results.find(r => !r.passed);
    submissionStatus = firstFailed ? firstFailed.status : 'wrong_answer';
  }

  const firstStdout = execution.results[0]?.actualOutput || '';
  const firstFailing = execution.results.find(r => !r.passed);
  const stderrToSave = firstFailing ? (firstFailing.stderr || firstFailing.compileOutput) : '';

  await supabase
    .from('code_submissions')
    .insert([{
      user_id: user.id,
      stage_id: stageId,
      source_code: sourceCode,
      language_id: stage.language_id,
      status: submissionStatus,
      tests_passed: execution.testsPassed,
      tests_total: execution.testsTotal,
      execution_time_ms: Math.max(...execution.results.map(r => r.executionTime || 0)),
      memory_used_kb: Math.max(...execution.results.map(r => r.memoryUsed || 0)),
      stdout: firstStdout,
      stderr: stderrToSave,
      submitted_at: new Date().toISOString()
    }]);

  let xpAwarded = 0;
  let newRankName = null;
  let rankUp = false;
  let badgesEarned = [];

  const { data: existingProgress } = await supabase
    .from('stage_progress')
    .select('status, attempts')
    .eq('user_id', user.id)
    .eq('stage_id', stageId)
    .single();

  const isFirstTimeCompletion = (!existingProgress || existingProgress.status !== 'completed');
  const currentAttempts = existingProgress ? (existingProgress.attempts || 0) : 0;

  if (allPassed && isFirstTimeCompletion) {
    xpAwarded = stage.xp_reward;

    await supabase
      .from('stage_progress')
      .upsert({
        user_id: user.id,
        stage_id: stageId,
        status: 'completed',
        attempts: currentAttempts + 1,
        completed_at: new Date().toISOString(),
        best_score: 100
      }, { onConflict: 'user_id, stage_id' });

    const { data: userData } = await supabase
      .from('users')
      .select('total_xp, current_rank, last_active_at, current_streak, longest_streak')
      .eq('id', user.id)
      .single();

    const newTotalXp = (userData.total_xp || 0) + xpAwarded;
    const newRank = getRank(newTotalXp);
    
    if (newRank !== userData.current_rank) {
      rankUp = true;
      newRankName = newRank;
    } else {
      newRankName = userData.current_rank;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const lastActive = userData.last_active_at ? new Date(userData.last_active_at).toISOString().split('T')[0] : null;
    
    let newStreak = userData.current_streak || 0;
    if (lastActive !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActive === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }
    const newLongestStreak = Math.max(userData.longest_streak || 0, newStreak);

    await supabase
      .from('users')
      .update({
        total_xp: newTotalXp,
        current_rank: newRankName,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_active_at: new Date().toISOString()
      })
      .eq('id', user.id);

    const { data: dailyExisting } = await supabase
      .from('daily_activity')
      .select('id, stages_completed, xp_earned, submissions_count')
      .eq('user_id', user.id)
      .eq('activity_date', todayStr)
      .single();

    if (dailyExisting) {
      await supabase.from('daily_activity').update({
        stages_completed: (dailyExisting.stages_completed || 0) + 1,
        xp_earned: (dailyExisting.xp_earned || 0) + xpAwarded,
        submissions_count: (dailyExisting.submissions_count || 0) + 1
      }).eq('id', dailyExisting.id);
    } else {
      await supabase.from('daily_activity').insert({
        user_id: user.id,
        activity_date: todayStr,
        stages_completed: 1,
        xp_earned: xpAwarded,
        submissions_count: 1
      });
    }

    const { count: totalStages } = await supabase
      .from('stages')
      .select('*', { count: 'exact', head: true })
      .eq('tool_id', stage.tool_id);

    const { data: toolCompletedStages } = await supabase
      .from('stage_progress')
      .select('stage_id, stages!inner(tool_id)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .eq('stages.tool_id', stage.tool_id);

    const completedCount = toolCompletedStages.length;
    const progressPct = totalStages > 0 ? Math.round((completedCount / totalStages) * 100) : 0;
    
    await supabase
      .from('user_tools')
      .update({
        progress_pct: progressPct,
        status: progressPct === 100 ? 'mastered' : 'active',
        mastered_at: progressPct === 100 ? new Date().toISOString() : null
      })
      .eq('user_id', user.id)
      .eq('tool_id', stage.tool_id);

    const { data: badges } = await supabase.from('badges').select('*').eq('condition_type', 'stages');
    if (badges && badges.length > 0) {
      const { data: userBadges } = await supabase.from('user_badges').select('badge_id').eq('user_id', user.id);
      const earnedBadgeIds = new Set(userBadges.map(b => b.badge_id));
      
      const { count: totalCompletedByUser } = await supabase
        .from('stage_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      for (const badge of badges) {
        if (!earnedBadgeIds.has(badge.id) && totalCompletedByUser >= badge.condition_value) {
          await supabase.from('user_badges').insert({ user_id: user.id, badge_id: badge.id });
          badgesEarned.push(badge);
        }
      }
    }
  } else {
    await supabase
      .from('stage_progress')
      .upsert({
        user_id: user.id,
        stage_id: stageId,
        status: existingProgress?.status || 'in_progress',
        attempts: currentAttempts + 1,
        first_attempted_at: existingProgress?.first_attempted_at || new Date().toISOString()
      }, { onConflict: 'user_id, stage_id' });

    const todayStr = new Date().toISOString().split('T')[0];
    const { data: dailyExisting } = await supabase
      .from('daily_activity')
      .select('id, stages_completed, xp_earned, submissions_count')
      .eq('user_id', user.id)
      .eq('activity_date', todayStr)
      .single();

    if (dailyExisting) {
      await supabase.from('daily_activity').update({
        submissions_count: (dailyExisting.submissions_count || 0) + 1
      }).eq('id', dailyExisting.id);
    } else {
      await supabase.from('daily_activity').insert({
        user_id: user.id,
        activity_date: todayStr,
        stages_completed: 0,
        xp_earned: 0,
        submissions_count: 1
      });
    }
  }

  const safeResults = execution.results.map(r => {
    if (r.isHidden && !r.passed) {
      return {
        ...r,
        actualOutput: 'Hidden Test Case Failed',
        expectedOutput: 'Hidden Test Case',
        input: 'Hidden Input',
        stderr: 'Hidden'
      };
    }
    return r;
  });

  return NextResponse.json({
    success: allPassed,
    results: safeResults,
    xpAwarded,
    newRank: rankUp ? newRankName : null,
    rankUp,
    badgesEarned
  });
}

function getRank(xp) {
  if (xp >= 10000) return 'Archmage';
  if (xp >= 6000) return 'Wizard';
  if (xp >= 3000) return 'Knight';
  if (xp >= 1000) return 'Soldier';
  return 'Cadet';
}
