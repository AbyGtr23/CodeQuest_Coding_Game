import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: tools } = await supabase
    .from('user_tools')
    .select('id, progress_pct, status, tools(id, name, slug, icon_emoji)')
    .eq('user_id', user.id);

  const formattedTools = tools?.map(t => ({
    id: t.tools?.id,
    name: t.tools?.name,
    slug: t.tools?.slug,
    icon_emoji: t.tools?.icon_emoji || '⚔️',
    progress: t.progress_pct || 0,
    status: t.status,
    mastered: t.status === 'mastered'
  })) || [];

  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('earned_at, badges(id, name, description, icon_emoji)')
    .eq('user_id', user.id);

  const formattedBadges = userBadges?.map(ub => ({
    id: ub.badges?.id,
    name: ub.badges?.name,
    description: ub.badges?.description,
    icon_emoji: ub.badges?.icon_emoji || '🏅',
    earned_at: ub.earned_at
  })) || [];

  const { count: totalSubmissions } = await supabase
    .from('code_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: completedStages } = await supabase
    .from('stage_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');

  return NextResponse.json({
    user: profile || {
      username: user.email?.split('@')[0] || 'Cadet',
      email: user.email,
      current_rank: 'Cadet',
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      created_at: new Date().toISOString()
    },
    tools: formattedTools,
    badges: formattedBadges,
    stats: {
      total_submissions: totalSubmissions || 0,
      completed_stages: completedStages || 0,
    }
  });
}
