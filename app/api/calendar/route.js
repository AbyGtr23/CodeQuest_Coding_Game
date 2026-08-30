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

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let query = supabase
    .from('daily_activity')
    .select(`
      activity_date,
      stages_completed,
      xp_earned,
      submissions_count
    `)
    .eq('user_id', user.id)
    .gte('activity_date', oneYearAgo.toISOString().split('T')[0])
    .order('activity_date', { ascending: false });
    
  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedData = data.map(d => ({
    date: d.activity_date,
    stages_completed: d.stages_completed,
    xp_earned: d.xp_earned,
    submissions_count: d.submissions_count
  }));

  return NextResponse.json(formattedData);
}
