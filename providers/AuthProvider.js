'use client'
import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export const AuthContext = createContext({
  user: null,
  profile: null,
  onboardingCompleted: false,
  loading: true,
  refreshProfile: async () => {},
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

  const fetchProfileWithRetry = useCallback(async (userId) => {
    if (!supabase) return null;
    let retryCount = 0;
    let userProfile = null;
    while (retryCount < 3 && !userProfile) {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        userProfile = data;
      } catch (err) {
        // Continue to retry
      }
      if (!userProfile) {
        retryCount++;
        if (retryCount < 3) await new Promise(r => setTimeout(r, 500));
      }
    }
    return userProfile;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const p = await fetchProfileWithRetry(user.id);
      if (p) setProfile(p);
    }
  }, [user, fetchProfileWithRetry]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

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
        if (mounted) setProfile(userProfile);
      } else {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfileWithRetry]);

  const signOut = async () => {
    if (supabase) {
      setUser(null);
      setProfile(null);
      await supabase.auth.signOut();
    }
  };

  const onboardingCompleted = profile?.onboarding_completed ?? false;

  return (
    <AuthContext.Provider value={{ user, profile, onboardingCompleted, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
