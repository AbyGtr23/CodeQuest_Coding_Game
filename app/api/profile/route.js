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
    .select('id, progress_pct, status, tools(id, name, slug)')
    .eq('user_id', user.id);

  const formattedTools = tools?.map(t => ({
    id: t.tools.id,
    name: t.tools.name,
    slug: t.tools.slug,
    progress: t.progress_pct,
    mastered: t.status === 'mastered'
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
    user: profile,
    tools: formattedTools,
    stats: {
      total_submissions: totalSubmissions || 0,
      completed_stages: completedStages || 0,
    }
  });
}
