import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock client during SSG/build when env vars aren't available
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        getUser: async () => ({ data: { user: null } }),
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signInWithOAuth: async () => ({ error: new Error('Supabase not configured') }),
        signUp: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => {},
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        exchangeCodeForSession: async () => ({ error: new Error('Supabase not configured') }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null }), order: () => ({ data: [] }), data: [] }), order: () => ({ data: [] }), gte: () => ({ lte: () => ({ order: () => ({ data: [] }) }) }), limit: () => ({ data: [] }), data: [] }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
        delete: () => ({ eq: () => ({ data: null, error: null }) }),
        upsert: () => ({ data: null, error: null }),
      }),
    };
  }

  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(url, key);
  }
  return supabaseInstance;
}
