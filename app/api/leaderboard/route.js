import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user: currentUserAuth } } = await supabase.auth.getUser();
  
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'all';

  let query = supabase
    .from('users')
    .select('id, username, current_rank, total_xp')
    .order('total_xp', { ascending: false })
    .limit(50);

  const { data: leaders, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedLeaders = leaders.map(l => ({
    id: l.id,
    username: l.username,
    rank: l.current_rank,
    xp_earned: l.total_xp
  }));

  let currentUser = null;
  if (currentUserAuth) {
    currentUser = formattedLeaders.find(l => l.id === currentUserAuth.id);
    if (!currentUser) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('id, username, current_rank, total_xp')
        .eq('id', currentUserAuth.id)
        .single();
        
      if (userProfile) {
        currentUser = {
          id: userProfile.id,
          username: userProfile.username,
          rank: userProfile.current_rank,
          xp_earned: userProfile.total_xp
        };
      }
    }
  }

  return NextResponse.json({
    leaders: formattedLeaders,
    currentUser
  });
}
