'use client'
import { createContext, useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasCredentials = !!(supabaseUrl && supabaseKey);

  const supabase = useMemo(() => {
    if (!hasCredentials) return null;
    return createBrowserClient(supabaseUrl, supabaseKey);
  }, [supabaseUrl, supabaseKey, hasCredentials]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchProfileWithRetry(userId) {
      let retryCount = 0;
      let userProfile = null;
      while (retryCount < 3 && !userProfile) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        userProfile = data;
        if (!userProfile) {
          retryCount++;
          if (retryCount < 3) await new Promise(r => setTimeout(r, 500));
        }
      }
      return userProfile;
    }

    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          const userProfile = await fetchProfileWithRetry(session.user.id);
          if (mounted) setProfile(userProfile);
        }
      } catch (err) {
        console.error('Auth session fetch failed:', err);
      }
      if (mounted) setLoading(false);
    }
    
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfileWithRetry(session.user.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
