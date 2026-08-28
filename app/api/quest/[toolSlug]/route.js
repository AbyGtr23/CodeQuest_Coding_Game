import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const { toolSlug } = params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get tool details
  const { data: tool, error: toolError } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', toolSlug)
    .single();

  if (toolError || !tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
  }

  // Get stages for this tool
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('id, level, order, name, xp_reward')
    .eq('tool_id', tool.id)
    .order('level')
    .order('order');

  if (stagesError) {
    return NextResponse.json({ error: stagesError.message }, { status: 500 });
  }

  // Get user's progress for these stages
  const { data: progress, error: progressError } = await supabase
    .from('stage_progress')
    .select('stage_id, status')
    .eq('user_id', user.id)
    .in('stage_id', stages.map(s => s.id));

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  const completedStageIds = new Set(
    progress.filter(p => p.status === 'completed').map(p => p.stage_id)
  );

  // Group by level
  const levelsMap = new Map();
  
  stages.forEach(stage => {
    const levelNum = stage.level;
    if (!levelsMap.has(levelNum)) {
      levelsMap.set(levelNum, {
        level: levelNum,
        name: getLevelName(levelNum),
        stages: []
      });
    }
    
    levelsMap.get(levelNum).stages.push({
      ...stage,
      completed: completedStageIds.has(stage.id)
    });
  });

  const levels = Array.from(levelsMap.values());

  return NextResponse.json({
    tool,
    levels
  });
}

function getLevelName(level) {
  const names = {
    1: 'Cadet',
    2: 'Apprentice',
    3: 'Artisan',
    4: 'Sorcerer',
    5: 'Archmage'
  };
  return names[level] || `Level ${level}`;
}
