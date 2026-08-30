import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitCode } from '@/lib/judge0';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sourceCode, languageId, stdin } = await request.json();

  if (!sourceCode || !languageId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const result = await submitCode({ sourceCode, languageId, stdin: stdin || '' });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Execution service unavailable' }, { status: 503 });
  }
}
