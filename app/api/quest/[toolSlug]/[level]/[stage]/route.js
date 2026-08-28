import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const { toolSlug, level, stage } = params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get tool ID
  const { data: tool } = await supabase
    .from('tools')
    .select('id')
    .eq('slug', toolSlug)
    .single();

  if (!tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
  }

  // Get stage details
  const { data: stageData, error: stageError } = await supabase
    .from('stages')
    .select(`
      *,
      languages (id, name, judge0_id)
    `)
    .eq('tool_id', tool.id)
    .eq('level', level)
    .eq('order', stage)
    .single();

  if (stageError || !stageData) {
    return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
  }

  // Get public test cases
  const { data: testCases, error: tcError } = await supabase
    .from('test_cases')
    .select('input_data, expected_output, is_hidden')
    .eq('stage_id', stageData.id)
    .eq('is_hidden', false);

  if (tcError) {
    return NextResponse.json({ error: tcError.message }, { status: 500 });
  }

  // Determine next stage
  const { data: nextStage } = await supabase
    .from('stages')
    .select('level, order')
    .eq('tool_id', tool.id)
    .or(`and(level.eq.${level},order.gt.${stage}),level.gt.${level}`)
    .order('level')
    .order('order')
    .limit(1)
    .single();

  return NextResponse.json({
    id: stageData.id,
    name: stageData.name,
    level: stageData.level,
    order: stageData.order,
    content: stageData.content,
    starter_code: stageData.starter_code,
    language_id: stageData.languages.judge0_id,
    language_name: stageData.languages.name,
    xp_reward: stageData.xp_reward,
    test_cases: testCases,
    next_stage: nextStage || null
  });
}
