import styles from './Badge.module.css';

export default function Badge({ badge, earned }) {
  return (
    <div className={`${styles.badgeCard} ${earned ? styles.earned : styles.locked}`}>
      <div className={styles.icon}>{earned ? badge?.icon : '🔒'}</div>
      <div className={styles.info}>
        <h4 className={styles.name}>{badge?.name}</h4>
        <p className={styles.description}>{badge?.description}</p>
      </div>
    </div>
  );
}
