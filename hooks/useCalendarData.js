'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export function useCalendarData() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    
    async function fetchData() {
      const today = new Date();
      const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString();
      
      const { data, error } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .gte('activity_date', oneYearAgo);
        
      if (!error && data) {
        setActivities(data);
        
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const sortedData = [...data].sort((a, b) => new Date(a.activity_date) - new Date(b.activity_date));
        
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
