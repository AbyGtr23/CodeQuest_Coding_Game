'use client';

import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/providers/AuthProvider';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useContext(AuthContext);
  const [activeTools, setActiveTools] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      if (profile && !profile.onboarding_completed) {
        router.push('/onboarding');
        return;
      }
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch active tools via API
        const toolsRes = await fetch('/api/user/tools');
        if (toolsRes.ok) {
          const tools = await toolsRes.json();
          setActiveTools(tools || []);
        }

        // Fetch recent activity
        const activityRes = await fetch('/api/calendar?limit=5');
        if (activityRes.ok) {
          const activity = await activityRes.json();
          setRecentActivity(activity || []);
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <p style={{ color: 'var(--color-primary, #00ff66)' }}>&gt; LOADING COMMAND CONSOLE...</p>
      </div>
    );
  }

  const primaryActiveTool = activeTools.find(t => !t.mastered) || activeTools[0];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h1>&gt; OPERATIVE: {profile?.username?.toUpperCase() || user?.email?.split('@')[0]?.toUpperCase() || 'CADET'}</h1>
          <p className={styles.rank}>RANK: {profile?.current_rank || 'Cadet'}</p>
          {profile?.it_role && (
            <p style={{ color: '#38bdf8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              TRACK: {profile.it_role}
            </p>
          )}
        </div>
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>TOTAL XP</span>
            <span className={styles.statValue}>{profile?.total_xp || 0}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>STREAK</span>
            <span className={styles.statValue}>{profile?.current_streak || 0} 🔥</span>
          </div>
        </div>
      </header>

      {/* Primary Call to Action */}
      <div style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', background: 'rgba(0, 255, 102, 0.05)', border: '1px solid var(--color-primary, #00ff66)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>
            {primaryActiveTool ? `Resume Quest: ${primaryActiveTool.name}` : 'Begin Your Next Quest'}
          </h2>
          <p style={{ color: 'var(--text-secondary, #a1a1aa)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            {primaryActiveTool ? `Progress: ${primaryActiveTool.progress || 0}% complete` : 'Select an active weapon to level up your mastery.'}
          </p>
        </div>
        <div>
          {primaryActiveTool ? (
            <Link href={`/quest/${primaryActiveTool.slug}`} style={{ textDecoration: 'none', background: 'var(--color-primary, #00ff66)', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>
              [ BEGIN YOUR QUEST ▶ ]
            </Link>
          ) : (
            <Link href="/catalog" style={{ textDecoration: 'none', background: 'var(--color-primary, #00ff66)', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>
              [ CHOOSE WEAPONS IN CATALOG ]
            </Link>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        <section className={styles.activeQuests}>
          <h2>&gt; ACTIVE_WEAPONS_</h2>
          <div className={styles.toolsGrid}>
            {activeTools.length > 0 ? (
              activeTools.map(tool => (
                <div key={tool.id || tool.slug} className={styles.toolCard}>
                  <h3>{tool.icon_emoji || '⚔️'} {tool.name}</h3>
                  <div className={styles.progressContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${tool.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>{tool.progress || 0}% Complete</p>
                  <Link href={`/quest/${tool.slug}`} className={styles.resumeBtn}>
                    [ RESUME QUEST ]
                  </Link>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No active weapons chosen.</p>
                <Link href="/catalog" className={styles.browseBtn}>[ BROWSE CATALOG ]</Link>
              </div>
            )}
            
            {activeTools.length < 2 && activeTools.length > 0 && (
              <div className={`${styles.toolCard} ${styles.addToolCard}`}>
                <Link href="/catalog" className={styles.addBtn}>
                  + ADD WEAPON (1 SLOT AVAILABLE)
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
                  <span className={styles.date}>{activity.date}</span>
                  <span className={styles.action}>Stages Completed: {activity.stages_completed}</span>
                  <span className={styles.xp}>+{activity.xp_earned} XP</span>
                </li>
              ))
            ) : (
              <li className={styles.emptyActivity}>No activity recorded yet.</li>
            )}
          </ul>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <Link href="/calendar" style={{ color: '#00ff66', fontSize: '0.85rem' }}>
              View Activity Heatmap &gt;
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
