'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './level-curriculum.module.css';

export default function LevelCurriculumPage() {
  const { toolSlug, level } = useParams();
  const [tool, setTool] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevelCurriculum = async () => {
      try {
        const questRes = await fetch(`/api/quest/${toolSlug}`);
        if (questRes.ok) {
          const questData = await questRes.json();
          setTool(questData.tool);
          
          const currentLevel = questData.levels?.find(l => l.slug === level);
          if (currentLevel) {
            setLevelData(currentLevel);
            setStages(currentLevel.stages || []);
          }
        }
      } catch (err) {
        console.error('Failed to load level curriculum:', err);
      }
      setLoading(false);
    };
    fetchLevelCurriculum();
  }, [toolSlug, level]);

  if (loading) return <div className="container">Loading level curriculum...</div>;
  if (!tool || !levelData) return <div className="container">Level not found.</div>;

  return (
    <div className={styles.levelCurriculum}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/curriculum">Curriculum</Link>
          <span> / </span>
          <Link href={`/curriculum/${toolSlug}`}>{tool.name}</Link>
          <span> / </span>
          <span className={styles.current}>{levelData.display_name || levelData.name}</span>
        </div>
        <h1>{tool.icon_emoji} {tool.name} — {levelData.display_name || levelData.name}</h1>
        <p className={styles.levelMeta}>
          Level {levelData.order_index} · {stages.length} stages · {levelData.xp_per_stage || '?'} XP per stage
        </p>
      </header>

      <section className={styles.stagesSection}>
        <h2>&gt; STAGE_SYLLABUS_</h2>
        <div className={styles.stagesList}>
          {stages.map((stage, index) => (
            <Link
              key={stage.id}
              href={`/curriculum/${toolSlug}/${level}/${stage.stage_number}`}
              className={styles.stageCard}
            >
              <div className={styles.stageIndex}>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className={styles.stageContent}>
                <h3>{stage.title}</h3>
                <p className={styles.questName}>{stage.quest_name}</p>
              </div>
              <div className={styles.stageMeta}>
                <span className={styles.xpBadge}>{stage.xp_reward} XP</span>
                <span className={styles.arrow}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.questCta}>
        <Link href={`/quest/${toolSlug}`} className={styles.questButton}>
          [ ⚔️ ENTER QUEST MODE ]
        </Link>
      </div>
    </div>
  );
}
