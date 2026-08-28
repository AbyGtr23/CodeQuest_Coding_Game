import styles from './HeatmapCalendar.module.css';

export default function HeatmapCalendar({ activities, onDayClick }) {
  const weeks = 52;
  const daysPerWeek = 7;
  const totalDays = weeks * daysPerWeek;
  
  const grid = Array.from({ length: totalDays }).map((_, i) => {
    const activity = activities?.[i];
    const completed = activity?.stages_completed || 0;
    
    let colorClass = styles.level0;
    if (completed >= 5) colorClass = styles.level4;
    else if (completed >= 3) colorClass = styles.level3;
    else if (completed >= 1) colorClass = styles.level2;
    else if (completed > 0) colorClass = styles.level1;
    
    return { completed, colorClass, date: activity?.date || null };
  });

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {grid.map((day, i) => (
          <div
            key={i}
            className={`${styles.cell} ${day.colorClass}`}
            onClick={() => onDayClick && onDayClick(day)}
            title={day.date ? `${day.completed} stages on ${day.date}` : `${day.completed} stages`}
          />
        ))}
      </div>
    </div>
  );
}
