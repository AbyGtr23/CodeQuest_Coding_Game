import styles from './ToolCard.module.css';

export default function ToolCard({ tool, isActive, isLocked, onSelect, progress }) {
  return (
    <div className={`${styles.card} ${isActive ? styles.active : ''} ${isLocked ? styles.locked : ''}`}>
      <div className={styles.header}>
        <span className={styles.emoji}>{tool?.emoji}</span>
        <h3 className={styles.name}>{tool?.name}</h3>
      </div>
      <div className={styles.details}>
        <span className={styles.badge}>{tool?.category}</span>
        <span className={styles.stars}>{'★'.repeat(tool?.difficulty || 0)}</span>
        <span className={styles.stages}>{tool?.stage_count} stages</span>
      </div>
      
      {isActive && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress || 0}%` }}></div>
          </div>
          <button className={styles.btnResume} onClick={() => onSelect(tool)}>RESUME QUEST →</button>
        </div>
      )}
      
      {isLocked && (
        <div className={styles.lockedMessage}>
          🔒 Master current tools first
        </div>
      )}
      
      {!isActive && !isLocked && (
        <button className={styles.btnSelect} onClick={() => onSelect(tool)}>SELECT →</button>
      )}
    </div>
  );
}
