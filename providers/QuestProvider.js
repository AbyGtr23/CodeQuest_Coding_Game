'use client'
import { createContext, useState, useEffect, useContext } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { AuthContext } from './AuthProvider';

export const QuestContext = createContext();

export function QuestProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [activeTools, setActiveTools] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const refreshTools = async () => {
    if (!user) {
      setActiveTools([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('user_tools')
      .select('*, tools(*)')
      .eq('user_id', user.id)
      .eq('status', 'active');
    if (!error && data) {
      setActiveTools(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshTools();
  }, [user]);

  return (
    <QuestContext.Provider value={{ activeTools, refreshTools, loading }}>
      {children}
    </QuestContext.Provider>
  );
}
