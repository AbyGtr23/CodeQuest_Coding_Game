import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const limit = url.searchParams.get('limit');

  // Get activity from last 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let query = supabase
    .from('daily_activity')
    .select(`
      id,
      date,
      xp_earned,
      stage_id,
      stages (name)
    `)
    .eq('user_id', user.id)
    .gte('date', oneYearAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });
    
  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedData = data.map(d => ({
    date: d.date,
    xp_earned: d.xp_earned,
    stage_id: d.stage_id,
    stage_name: d.stages?.name || `Stage ${d.stage_id}`
  }));

  return NextResponse.json(formattedData);
}
