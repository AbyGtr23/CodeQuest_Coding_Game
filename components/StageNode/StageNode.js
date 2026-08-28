import styles from './StageNode.module.css';

export default function StageNode({ stage, status, onClick, isActive }) {
  const isLocked = status === 'locked';
  
  const getIcon = () => {
    if (status === 'completed') return '✅';
    if (status === 'in-progress' || isActive) return '🔶';
    return '🔒';
  };

  return (
    <div 
      className={`${styles.node} ${styles[status]} ${isActive ? styles.active : ''}`}
      onClick={() => !isLocked && onClick(stage)}
    >
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.content}>
        <div className={styles.stageNumber}>Stage {stage.order}</div>
        <div className={styles.name}>{stage.name}</div>
      </div>
    </div>
  );
}
