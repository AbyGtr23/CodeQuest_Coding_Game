'use client';

import { useEffect, useState } from 'react';
import styles from './leaderboard.module.css';

export default function Leaderboard() {
  const [period, setPeriod] = useState('all'); // all, month, week
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?period=${period}`);
        if (res.ok) {
          const data = await res.json();
          setLeaders(data.leaders);
          setCurrentUser(data.currentUser);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className={styles.leaderboardPage}>
      <header className={styles.header}>
        <h1>&gt; HALL_OF_LEGENDS_</h1>
        <p className={styles.subtitle}>Top developers by XP earned</p>
      </header>

      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${period === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setPeriod('all')}
        >
          ALL TIME
        </button>
        <button 
          className={`${styles.filterBtn} ${period === 'month' ? styles.activeFilter : ''}`}
          onClick={() => setPeriod('month')}
        >
          THIS MONTH
        </button>
        <button 
          className={`${styles.filterBtn} ${period === 'week' ? styles.activeFilter : ''}`}
          onClick={() => setPeriod('week')}
        >
          THIS WEEK
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>Loading leaderboard...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>RANK</th>
                <th>DEVELOPER</th>
                <th>RANK/TITLE</th>
                <th>XP EARNED</th>
              </tr>
            </thead>
            <tbody>
              {leaders.length > 0 ? (
                leaders.map((user, idx) => (
                  <tr 
                    key={user.id} 
                    className={currentUser?.id === user.id ? styles.currentUserRow : ''}
                  >
                    <td className={styles.rankCell}>{getMedal(idx)}</td>
                    <td className={styles.userCell}>
                      <span className={styles.username}>{user.username}</span>
                      {currentUser?.id === user.id && <span className={styles.youBadge}>(YOU)</span>}
                    </td>
                    <td className={styles.titleCell}>{user.rank || 'Novice'}</td>
                    <td className={styles.xpCell}>{user.xp_earned}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.emptyRow}>No legends found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
