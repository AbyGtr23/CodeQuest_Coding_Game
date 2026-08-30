import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { it_role, tech_stack = [], weapon_slugs = [] } = body;

    if (!it_role) {
      return NextResponse.json({ error: 'IT role is required' }, { status: 400 });
    }

    if (!Array.isArray(weapon_slugs) || weapon_slugs.length === 0) {
      return NextResponse.json({ error: 'At least one weapon must be selected' }, { status: 400 });
    }

    if (weapon_slugs.length > 2) {
      return NextResponse.json({ error: 'You can select a maximum of 2 active weapons' }, { status: 400 });
    }

    // Lookup tool records for selected slugs
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('id, slug')
      .in('slug', weapon_slugs);

    if (toolsError || !tools || tools.length === 0) {
      return NextResponse.json({ error: 'Selected tools could not be found' }, { status: 400 });
    }

    // Persist selected tools in user_tools
    for (const tool of tools) {
      const { error: utErr } = await supabase
        .from('user_tools')
        .upsert(
          {
            user_id: user.id,
            tool_id: tool.id,
            status: 'active',
            progress_pct: 0
          },
          { onConflict: 'user_id, tool_id' }
        );

      if (utErr) {
        console.error('Error inserting user_tool during onboarding:', utErr);
      }
    }

    // Update user profile with onboarding info
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        it_role,
        tech_stack,
        onboarding_completed: true,
        last_active_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
