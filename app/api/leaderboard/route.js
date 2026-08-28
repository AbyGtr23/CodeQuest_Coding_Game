import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user: currentUserAuth } } = await supabase.auth.getUser();
  
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'all'; // all, month, week

  // Base query for top users by total_xp (for 'all' period)
  let query = supabase
    .from('users')
    .select('id, username, rank, total_xp')
    .order('total_xp', { ascending: false })
    .limit(50);

  // Note: For month/week we would ideally aggregate from daily_activity
  // In a full implementation, we'd use a postgres function or view for this
  // For simplicity in this demo, we'll just return overall XP if month/week logic isn't complexly defined in DB
  if (period !== 'all') {
    // Basic approximation if we don't have views set up
    // In reality, this requires a group by query over daily_activity which supabase js client doesn't support easily without an RPC
    // So we'll fallback to overall XP for now but structure it to allow expansion
  }

  const { data: leaders, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format to match expected frontend structure
  const formattedLeaders = leaders.map(l => ({
    id: l.id,
    username: l.username,
    rank: l.rank,
    xp_earned: l.total_xp // Map total_xp to xp_earned for display
  }));

  let currentUser = null;
  if (currentUserAuth) {
    currentUser = formattedLeaders.find(l => l.id === currentUserAuth.id);
    if (!currentUser) {
      // If current user isn't in top 50, fetch them separately
      const { data: userProfile } = await supabase
        .from('users')
        .select('id, username, rank, total_xp')
        .eq('id', currentUserAuth.id)
        .single();
        
      if (userProfile) {
        currentUser = {
          id: userProfile.id,
          username: userProfile.username,
          rank: userProfile.rank,
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
