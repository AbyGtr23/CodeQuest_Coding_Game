import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userTools, error } = await supabase
    .from('user_tools')
    .select('*, tools(*)')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format response
  const formattedTools = userTools.map(ut => ({
    id: ut.tool_id,
    name: ut.tools.name,
    slug: ut.tools.slug,
    description: ut.tools.description,
    category: ut.tools.category,
    progress: ut.progress,
    mastered: ut.mastered
  }));

  return NextResponse.json(formattedTools);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { toolId } = await request.json();

  if (!toolId) {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
  }

  // Check how many active tools user has
  const { data: activeTools, error: countError } = await supabase
    .from('user_tools')
    .select('id')
    .eq('user_id', user.id)
    .eq('mastered', false);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (activeTools.length >= 2) {
    return NextResponse.json({ error: 'Maximum of 2 active tools allowed' }, { status: 400 });
  }

  // Insert new tool
  const { error: insertError } = await supabase
    .from('user_tools')
    .insert([
      { user_id: user.id, tool_id: toolId }
    ]);

  if (insertError) {
    if (insertError.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Tool already selected' }, { status: 400 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
