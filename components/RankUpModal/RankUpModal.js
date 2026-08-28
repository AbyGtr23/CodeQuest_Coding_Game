'use client'
import styles from './RankUpModal.module.css';

export default function RankUpModal({ isOpen, onClose, newRank, xpEarned }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.emoji}>{newRank?.emoji || '🏆'}</div>
        <h2 className={styles.title}>RANK UP!</h2>
        <div className={styles.rankName}>{newRank?.name || 'New Rank'}</div>
        <div className={styles.xp}>+{xpEarned || 0} XP</div>
        <button className={styles.btnClose} onClick={onClose}>CONTINUE</button>
      </div>
    </div>
  );
}
