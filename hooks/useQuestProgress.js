'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from './useAuth';

export function useQuestProgress(toolSlug) {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentStage, setCurrentStage] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!user || !toolSlug) return;
    
    async function fetchData() {
      const { data: tool } = await supabase
        .from('tools')
        .select('id')
        .eq('slug', toolSlug)
        .single();
        
      if (!tool) {
        setLoading(false);
        return;
      }
      
      const { data: stagesData } = await supabase
        .from('stages')
        .select('*')
        .eq('tool_id', tool.id)
        .order('order', { ascending: true });
        
      if (stagesData) setStages(stagesData);
      
      const { data: progressData } = await supabase
        .from('stage_progress')
        .select('*')
        .eq('user_id', user.id);
        
      if (progressData) setProgress(progressData);
      
      setLoading(false);
    }
    
    fetchData();
  }, [user, toolSlug]);

  return { stages, currentLevel, currentStage, progress, loading };
}
