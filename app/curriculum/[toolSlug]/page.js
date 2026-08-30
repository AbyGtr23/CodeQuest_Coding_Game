'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './tool-curriculum.module.css';

export default function ToolCurriculumPage() {
  const { toolSlug } = useParams();
  const [tool, setTool] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToolCurriculum = async () => {
      try {
        // Fetch tool details
        const toolsRes = await fetch('/api/tools');
        if (toolsRes.ok) {
          const allTools = await toolsRes.json();
          const currentTool = allTools.find(t => t.slug === toolSlug);
          setTool(currentTool);
        }

        // Fetch quest data which includes levels and stages
        const questRes = await fetch(`/api/quest/${toolSlug}`);
        if (questRes.ok) {
          const questData = await questRes.json();
          setTool(questData.tool);
          setLevels(questData.levels || []);
        }
      } catch (err) {
        console.error('Failed to load tool curriculum:', err);
      }
      setLoading(false);
    };
    fetchToolCurriculum();
  }, [toolSlug]);

  if (loading) return <div className="container">Loading curriculum...</div>;
  if (!tool) return <div className="container">Tool not found.</div>;

  const totalStages = levels.reduce((acc, lvl) => acc + (lvl.stages?.length || 0), 0);

  return (
    <div className={styles.toolCurriculum}>
      <header className={styles.header}>
        <Link href="/curriculum" className={styles.backLink}>&lt; ALL TOOLS</Link>
        <div className={styles.titleRow}>
          <span className={styles.icon}>{tool.icon_emoji}</span>
          <div>
            <h1>{tool.name} Curriculum</h1>
            <p className={styles.description}>{tool.description}</p>
          </div>
        </div>
        <div className={styles.metaBar}>
          <span>{levels.length} Levels</span>
          <span>{totalStages} Stages</span>
          <span>{'★'.repeat(tool.difficulty_rating || 0)} Difficulty</span>
          <span>{tool.category}</span>
        </div>
      </header>

      <section className={styles.roadmap}>
        <h2>&gt; LEARNING_ROADMAP_</h2>
        <div className={styles.levelsContainer}>
          {levels.map((level, index) => (
            <div key={level.slug} className={styles.levelCard}>
              <div className={styles.levelHeader}>
                <div className={styles.levelBadge}>
                  <span className={styles.levelIndex}>{index + 1}</span>
                </div>
                <div className={styles.levelInfo}>
                  <h3>
                    <Link href={`/curriculum/${toolSlug}/${level.slug}`}>
                      {level.display_name || level.name}
                    </Link>
                  </h3>
                  <p className={styles.levelMeta}>
                    {level.stages?.length || 0} stages · {level.xp_per_stage || '?'} XP per stage
                  </p>
                </div>
              </div>
              
              <div className={styles.stageList}>
                {level.stages?.slice(0, 5).map(stage => (
                  <Link
                    key={stage.id}
                    href={`/curriculum/${toolSlug}/${level.slug}/${stage.stage_number}`}
                    className={styles.stageLink}
                  >
                    <span className={styles.stageNum}>#{stage.stage_number}</span>
                    <span className={styles.stageTitle}>{stage.title}</span>
                    <span className={styles.stageXp}>{stage.xp_reward} XP</span>
                  </Link>
                ))}
                {(level.stages?.length || 0) > 5 && (
                  <Link 
                    href={`/curriculum/${toolSlug}/${level.slug}`}
                    className={styles.moreLink}
                  >
                    + {level.stages.length - 5} more stages →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
