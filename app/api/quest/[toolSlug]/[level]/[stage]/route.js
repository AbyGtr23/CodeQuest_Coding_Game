import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { toolSlug, level: levelSlug, stage: stageNumStr } = resolvedParams;
  const stageNumber = parseInt(stageNumStr);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: level } = await supabase
    .from('levels')
    .select('id, slug, order_index')
    .eq('slug', levelSlug)
    .single();

  if (!level) return NextResponse.json({ error: 'Level not found' }, { status: 404 });

  const { data: tool } = await supabase
    .from('tools')
    .select('id, slug')
    .eq('slug', toolSlug)
    .single();

  if (!tool) return NextResponse.json({ error: 'Tool not found' }, { status: 404 });

  const { data: stageData } = await supabase
    .from('stages')
    .select('*')
    .eq('tool_id', tool.id)
    .eq('level_id', level.id)
    .eq('stage_number', stageNumber)
    .single();

  if (!stageData) return NextResponse.json({ error: 'Stage not found' }, { status: 404 });

  const { data: testCases } = await supabase
    .from('test_cases')
    .select('input, expected_output')
    .eq('stage_id', stageData.id)
    .eq('is_hidden', false);

  const { data: nextStageData } = await supabase
    .from('stages')
    .select('stage_number, levels!inner(slug, order_index)')
    .eq('tool_id', tool.id)
    .or(`and(level_id.eq.${level.id},stage_number.eq.${stageNumber + 1}),levels.order_index.gt.${level.order_index}`)
    .order('order_index', { referencedTable: 'levels' })
    .order('stage_number')
    .limit(1)
    .single();

  const nextStage = nextStageData ? {
    level_slug: nextStageData.levels.slug,
    stage_number: nextStageData.stage_number
  } : null;

  return NextResponse.json({
    id: stageData.id,
    title: stageData.title,
    quest_name: stageData.quest_name,
    stage_number: stageData.stage_number,
    lesson_content_md: stageData.lesson_content_md,
    problem_statement_md: stageData.problem_statement_md,
    starter_code: stageData.starter_code,
    exercise_type: stageData.exercise_type,
    language_id: stageData.language_id,
    xp_reward: stageData.xp_reward,
    test_cases: testCases,
    next_stage: nextStage,
    level_slug: level.slug,
    tool_slug: tool.slug
  });
}
