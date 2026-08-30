import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { toolSlug } = resolvedParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: tool, error: toolError } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', toolSlug)
    .single();

  if (toolError || !tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
  }

  const { data: levels } = await supabase
    .from('levels')
    .select('*')
    .order('order_index');

  const { data: stages } = await supabase
    .from('stages')
    .select('*, levels!inner(*)')
    .eq('tool_id', tool.id)
    .order('order_index', { referencedTable: 'levels' })
    .order('stage_number');

  const { data: progress } = await supabase
    .from('stage_progress')
    .select('stage_id, status')
    .eq('user_id', user.id);

  const completedStageIds = new Set(
    progress?.filter(p => p.status === 'completed').map(p => p.stage_id) || []
  );

  const levelsMap = new Map();
  levels?.forEach(level => {
    levelsMap.set(level.id, {
      slug: level.slug,
      name: level.name,
      display_name: level.display_name,
      order_index: level.order_index,
      stages: []
    });
  });

  let previousLevelUnlocked = true;
  let previousLevelStagesCompleted = true;

  const levelsArray = Array.from(levelsMap.values()).sort((a, b) => a.order_index - b.order_index);
  
  for (const levelObj of levelsArray) {
    const levelStages = stages?.filter(s => s.level_id === Array.from(levelsMap.entries()).find(([id, val]) => val.slug === levelObj.slug)[0]) || [];
    
    let isLevelUnlocked = previousLevelUnlocked && previousLevelStagesCompleted;
    let allCompleted = true;
    let previousStageCompleted = true;

    for (const stage of levelStages) {
      const isCompleted = completedStageIds.has(stage.id);
      const isUnlocked = isLevelUnlocked && previousStageCompleted;

      levelObj.stages.push({
        id: stage.id,
        stage_number: stage.stage_number,
        title: stage.title,
        quest_name: stage.quest_name,
        xp_reward: stage.xp_reward,
        completed: isCompleted,
        unlocked: isUnlocked
      });

      if (!isCompleted) {
        allCompleted = false;
        previousStageCompleted = false;
      } else {
        previousStageCompleted = true;
      }
    }
    
    if (levelStages.length === 0) allCompleted = false;
    previousLevelStagesCompleted = allCompleted;
  }

  return NextResponse.json({
    tool,
    levels: levelsArray
  });
}
