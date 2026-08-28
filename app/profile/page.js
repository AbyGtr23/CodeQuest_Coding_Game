'use client';

import { useEffect, useState } from 'react';
import styles from './profile.module.css';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="container">Loading profile...</div>;
  if (!profileData) return <div className="container">Failed to load profile.</div>;

  const { user, tools, stats } = profileData;

  return (
    <div className={styles.profilePage}>
      <header className={styles.heroCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {user.username ? user.username.substring(0, 2).toUpperCase() : '??'}
          </div>
          <div className={styles.userInfo}>
            <h1>{user.username}</h1>
            <p className={styles.rankBadge}>{user.rank || 'Novice'}</p>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>TOTAL XP</span>
            <span className={styles.statValue}>{user.total_xp || 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>TOOLS MASTERED</span>
            <span className={styles.statValue}>{tools?.filter(t => t.mastered)?.length || 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>MEMBER SINCE</span>
            <span className={styles.statValue}>
              {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.toolProgress}>
          <h2 className={styles.sectionTitle}>&gt; QUEST_PROGRESS_</h2>
          {tools && tools.length > 0 ? (
            <div className={styles.toolsList}>
              {tools.map(tool => (
                <div key={tool.id} className={styles.toolItem}>
                  <div className={styles.toolHeader}>
                    <h3>{tool.name}</h3>
                    <span className={styles.percent}>{tool.progress || 0}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div 
                      className={`${styles.progressBar} ${tool.mastered ? styles.mastered : ''}`} 
                      style={{ width: `${tool.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No tools started yet.</p>
          )}
        </section>

        <section className={styles.detailedStats}>
          <h2 className={styles.sectionTitle}>&gt; COMBAT_STATS_</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statName}>Total Submissions</span>
              <span className={styles.statNum}>{stats?.total_submissions || 0}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statName}>Current Streak</span>
              <span className={styles.statNum}>{user.current_streak || 0} days</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statName}>Highest Streak</span>
              <span className={styles.statNum}>{user.highest_streak || 0} days</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statName}>Quests Completed</span>
              <span className={styles.statNum}>{stats?.completed_stages || 0}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
