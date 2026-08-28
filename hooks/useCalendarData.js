'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from './useAuth';

export function useCalendarData() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!user) return;
    
    async function fetchData() {
      const today = new Date();
      const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString();
      
      const { data, error } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', oneYearAgo);
        
      if (!error && data) {
        setActivities(data);
        
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sortedData.forEach((activity, i) => {
          if (activity.stages_completed > 0) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        });
        
        // Calculate current streak
        for (let i = sortedData.length - 1; i >= 0; i--) {
          if (sortedData[i].stages_completed > 0) currentStreak++;
          else break;
        }
        
        setStreakData({ currentStreak, longestStreak });
      }
      setLoading(false);
    }
    
    fetchData();
  }, [user]);

  return { activities, loading, streakData };
}
