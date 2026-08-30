'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './profile.module.css';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        } else {
          setError('Failed to load profile record.');
        }
      } catch (err) {
        setError('Network error loading profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <p style={{ color: 'var(--color-primary, #00ff66)' }}>&gt; LOADING OPERATIVE PROFILE...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="container" style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <p style={{ color: '#ef4444' }}>&gt; ERROR: {error || 'Profile not found.'}</p>
        <Link href="/dashboard" style={{ color: '#00ff66', marginTop: '1rem', display: 'inline-block' }}>
          [ RETURN TO DASHBOARD ]
        </Link>
      </div>
    );
  }

  const { user = {}, tools = [], badges = [], stats = {} } = profileData;

  return (
    <div className={styles.profilePage}>
      <header className={styles.heroCard}>
        <div className={styles.avatarSection}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className={styles.avatar} style={{ objectFit: 'cover' }} />
          ) : (
            <div className={styles.avatar}>
              {user.username ? user.username.substring(0, 2).toUpperCase() : '??'}
            </div>
          )}
          <div className={styles.userInfo}>
            <h1>{user.username || 'Operative'}</h1>
            <p className={styles.rankBadge}>{user.current_rank || 'Cadet'}</p>
            {user.it_role && (
              <p style={{ color: '#38bdf8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                ROLE: {user.it_role}
              </p>
            )}
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>TOTAL XP</span>
            <span className={styles.statValue}>{user.total_xp || 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>TOOLS MASTERED</span>
            <span className={styles.statValue}>{tools.filter(t => t.mastered).length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>MEMBER SINCE</span>
            <span className={styles.statValue}>
              {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Recent'}
            </span>
          </div>
        </div>
      </header>

      {user.tech_stack && user.tech_stack.length > 0 && (
        <section style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary, #121318)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color, #27272a)' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            &gt; REGISTERED_TECH_STACK_
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {user.tech_stack.map(tech => (
              <span key={tech} style={{ padding: '0.25rem 0.65rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', borderRadius: '16px', fontSize: '0.8rem', color: '#fff' }}>
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className={styles.grid}>
        <section className={styles.toolProgress}>
          <h2 className={styles.sectionTitle}>&gt; QUEST_PROGRESS_</h2>
          {tools && tools.length > 0 ? (
            <div className={styles.toolsList}>
              {tools.map(tool => (
                <Link key={tool.id || tool.slug} href={`/quest/${tool.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.toolItem}>
                    <div className={styles.toolHeader}>
                      <h3>{tool.icon_emoji} {tool.name}</h3>
                      <span className={styles.percent}>{tool.progress || 0}%</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div 
                        className={`${styles.progressBar} ${tool.mastered ? styles.mastered : ''}`} 
                        style={{ width: `${tool.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No weapons chosen yet. <Link href="/catalog" style={{ color: '#00ff66' }}>Browse Catalog</Link></p>
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
              <span className={styles.statName}>Longest Streak</span>
              <span className={styles.statNum}>{user.longest_streak || 0} days</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statName}>Quests Completed</span>
              <span className={styles.statNum}>{stats?.completed_stages || 0}</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>&gt; EARNED_BADGES_</h2>
          {badges && badges.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
              {badges.map(b => (
                <div key={b.id || b.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color, #27272a)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>{b.icon_emoji}</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', marginTop: '0.25rem' }}>{b.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '0.25rem' }}>{b.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No badges earned yet. Complete stages to unlock achievements.</p>
          )}
        </section>
      </div>
    </div>
  );
}
