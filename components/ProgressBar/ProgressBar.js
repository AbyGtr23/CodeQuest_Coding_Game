import { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

export default function ProgressBar({ value, max, label, color = 'cyan', size = 'md' }) {
  const [fill, setFill] = useState(0);
  
  useEffect(() => {
    setTimeout(() => {
      setFill(Math.min(100, Math.max(0, (value / max) * 100)));
    }, 100);
  }, [value, max]);

  const blockCount = 10;
  const filledBlocks = Math.round((fill / 100) * blockCount);
  
  const renderBlocks = () => {
    let blocks = '';
    for (let i = 0; i < blockCount; i++) {
      blocks += i < filledBlocks ? '█' : '░';
    }
    return blocks;
  };

  return (
    <div className={`${styles.container} ${styles[size]} ${styles[color]}`}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.bar}>
        <span className={styles.blocks}>{renderBlocks()}</span>
        <span className={styles.percentage}>{Math.round(fill)}%</span>
      </div>
    </div>
  );
}
