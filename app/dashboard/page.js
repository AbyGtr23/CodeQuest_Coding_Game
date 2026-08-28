'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [activeTools, setActiveTools] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Fetch user profile stats
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserData(profile);

      // Fetch active tools via API
      const toolsRes = await fetch('/api/user/tools');
      if (toolsRes.ok) {
        const tools = await toolsRes.json();
        setActiveTools(tools);
      }

      // Fetch recent activity
      const activityRes = await fetch('/api/calendar?limit=5');
      if (activityRes.ok) {
        const activity = await activityRes.json();
        setRecentActivity(activity);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [router, supabase]);

  if (loading) return <div className="container">Loading data...</div>;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h1>&gt; WELCOME_BACK, {userData?.username || 'GUEST'}</h1>
          <p className={styles.rank}>RANK: {userData?.rank || 'Novice'}</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>TOTAL XP</span>
            <span className={styles.statValue}>{userData?.total_xp || 0}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>STREAK</span>
            <span className={styles.statValue}>{userData?.current_streak || 0} 🔥</span>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.activeQuests}>
          <h2>&gt; ACTIVE_QUESTS_</h2>
          <div className={styles.toolsGrid}>
            {activeTools.length > 0 ? (
              activeTools.map(tool => (
                <div key={tool.id} className={styles.toolCard}>
                  <h3>{tool.name}</h3>
                  <div className={styles.progressContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${tool.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>{tool.progress || 0}% Complete</p>
                  <Link href={`/quest/${tool.slug}`} className={styles.resumeBtn}>
                    [ RESUME ]
                  </Link>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No active quests.</p>
                <Link href="/catalog" className={styles.browseBtn}>[ BROWSE CATALOG ]</Link>
              </div>
            )}
            
            {activeTools.length < 2 && activeTools.length > 0 && (
              <div className={`${styles.toolCard} ${styles.addToolCard}`}>
                <Link href="/catalog" className={styles.addBtn}>
                  + ADD TOOL (1 SLOT OPEN)
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className={styles.activityFeed}>
          <h2>&gt; RECENT_ACTIVITY_</h2>
          <ul className={styles.activityList}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <li key={idx} className={styles.activityItem}>
                  <span className={styles.date}>{new Date(activity.date).toLocaleDateString()}</span>
                  <span className={styles.action}>Completed Stage: {activity.stage_name || `Stage ${activity.stage_id}`}</span>
                  <span className={styles.xp}>+{activity.xp_earned} XP</span>
                </li>
              ))
            ) : (
              <li className={styles.emptyActivity}>No recent activity.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
