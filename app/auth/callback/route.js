import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();

      if (!profile || !profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
