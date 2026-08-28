'use client';

import { useEffect, useState } from 'react';
import styles from './calendar.module.css';
import HeatmapCalendar from '@/components/HeatmapCalendar/HeatmapCalendar';

export default function CalendarPage() {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayActivities, setDayActivities] = useState([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setActivityData(data);
        
        // Filter activities for selected date initially
        const todayData = data.filter(d => d.date.startsWith(selectedDate));
        setDayActivities(todayData);
      }
      setLoading(false);
    };
    fetchActivity();
  }, [selectedDate]);

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    const activities = activityData.filter(d => d.date.startsWith(dateStr));
    setDayActivities(activities);
  };

  // Calculate basic stats
  const totalDaysActive = new Set(activityData.map(d => d.date.split('T')[0])).size;
  const totalXp = activityData.reduce((acc, curr) => acc + curr.xp_earned, 0);

  if (loading) return <div className="container">Loading calendar...</div>;

  return (
    <div className={styles.calendarPage}>
      <header className={styles.header}>
        <h1>&gt; ACTIVITY_LOG_</h1>
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>DAYS ACTIVE</span>
            <span className={styles.statValue}>{totalDaysActive}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>XP EARNED (YEAR)</span>
            <span className={styles.statValue}>{totalXp}</span>
          </div>
        </div>
      </header>

      <section className={styles.heatmapSection}>
        <h2>CONTRIBUTIONS</h2>
        <div className={styles.heatmapWrapper}>
          <HeatmapCalendar 
            data={activityData} 
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </div>
      </section>

      <section className={styles.dayDetails}>
        <h2>ACTIVITY FOR {selectedDate}</h2>
        {dayActivities.length > 0 ? (
          <ul className={styles.activityList}>
            {dayActivities.map((activity, idx) => (
              <li key={idx} className={styles.activityItem}>
                <div className={styles.activityInfo}>
                  <span className={styles.time}>{new Date(activity.date).toLocaleTimeString()}</span>
                  <span className={styles.action}>Completed: {activity.stage_name}</span>
                </div>
                <div className={styles.activityXp}>+{activity.xp_earned} XP</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyActivity}>
            No quests completed on this date.
          </div>
        )}
      </section>
    </div>
  );
}
