'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './quest-map.module.css';

export default function QuestMap() {
  const { toolSlug } = useParams();
  const [questData, setQuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQuest = async () => {
      const res = await fetch(`/api/quest/${toolSlug}`);
      if (!res.ok) {
        if (res.status === 404) router.push('/catalog');
        return;
      }
      const data = await res.json();
      setQuestData(data);
      setLoading(false);
    };
    fetchQuest();
  }, [toolSlug, router]);

  if (loading) return <div className="container">Loading map data...</div>;
  if (!questData) return <div className="container">Quest not found.</div>;

  const { tool, levels } = questData;

  // Calculate overall progress
  const totalStages = levels.reduce((acc, lvl) => acc + lvl.stages.length, 0);
  const completedStages = levels.reduce((acc, lvl) => 
    acc + lvl.stages.filter(s => s.completed).length, 0);
  const progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return (
    <div className={styles.questMap}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <Link href="/catalog" className={styles.backLink}>&lt; BACK TO CATALOG</Link>
          <h1>{tool.name.toUpperCase()} QUEST</h1>
        </div>
        <div className={styles.progressSection}>
          <div className={styles.progressText}>PROGRESS: {progressPercent}%</div>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </header>

      <div className={styles.mapContainer}>
        {levels.map((level, lIndex) => {
          const levelCompleted = level.stages.every(s => s.completed);
          // rely on stage.unlocked property
          
          return (
            <div 
              key={level.slug} 
              className={`${styles.levelSection} ${levelCompleted ? styles.completedLevel : ''}`}
            >
              <h2 className={styles.levelTitle}>
                {level.name.toUpperCase()}
                {levelCompleted && <span className={styles.levelBadge}>COMPLETED</span>}
              </h2>
              
              <div className={styles.nodesContainer}>
                {level.stages.map((stage, sIndex) => {
                  const stageUnlocked = stage.unlocked;
                  
                  return (
                    <div key={stage.id} className={styles.nodeWrapper}>
                      {sIndex > 0 && <div className={`${styles.nodeConnector} ${stageUnlocked ? styles.connectorActive : ''}`}></div>}
                      
                      <Link 
                        href={stageUnlocked ? `/quest/${toolSlug}/${level.slug}/${stage.stage_number}` : '#'}
                        className={`
                          ${styles.stageNode} 
                          ${stage.completed ? styles.nodeCompleted : ''} 
                          ${!stage.completed && stageUnlocked ? styles.nodeCurrent : ''}
                          ${!stageUnlocked ? styles.nodeLocked : ''}
                        `}
                      >
                        <div className={styles.nodeIcon}>
                          {stage.completed ? '✓' : (!stageUnlocked ? '🔒' : '●')}
                        </div>
                        <div className={styles.nodeInfo}>
                          <span className={styles.stageNum}>STAGE {stage.stage_number}</span>
                          <span className={styles.stageName}>{stage.title}</span>
                        </div>
                        <div className={styles.nodeXp}>{stage.xp_reward} XP</div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
