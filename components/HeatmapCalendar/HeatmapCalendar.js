import styles from './HeatmapCalendar.module.css';

export default function HeatmapCalendar({ activities, onDayClick, selectedDate }) {
  const days = 365;
  const today = new Date();
  
  const activitiesMap = new Map();
  if (activities) {
    activities.forEach(a => {
      activitiesMap.set(a.date, a);
    });
  }

  const grid = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const dateString = d.toISOString().split('T')[0];
    
    const activity = activitiesMap.get(dateString);
    const completed = activity?.stages_completed || 0;
    
    let colorClass = styles.level0;
    if (completed >= 6) colorClass = styles.level4;
    else if (completed >= 4) colorClass = styles.level3;
    else if (completed >= 2) colorClass = styles.level2;
    else if (completed === 1) colorClass = styles.level1;
    
    const isSelected = selectedDate === dateString;
    
    return { completed, colorClass, date: dateString, isSelected };
  });

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {grid.map((day, i) => (
          <div
            key={i}
            className={`${styles.cell} ${day.colorClass} ${day.isSelected ? styles.selected : ''}`}
            onClick={() => onDayClick && onDayClick(day.date)}
            title={day.date ? `${day.completed} stages on ${day.date}` : `${day.completed} stages`}
          />
        ))}
      </div>
    </div>
  );
}
