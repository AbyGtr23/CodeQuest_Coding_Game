'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './curriculum.module.css';

export default function CurriculumPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await fetch('/api/tools');
        if (res.ok) {
          const data = await res.json();
          setTools(data);
        }
      } catch (err) {
        console.error('Failed to load tools:', err);
      }
      setLoading(false);
    };
    fetchTools();
  }, []);

  if (loading) return <div className="container">Loading curriculum...</div>;

  const categories = {
    language: tools.filter(t => t.category === 'language'),
    tool: tools.filter(t => t.category === 'tool'),
    framework: tools.filter(t => t.category === 'framework'),
  };

  const categoryLabels = {
    language: { label: 'Programming Languages', emoji: '💻' },
    tool: { label: 'Developer Tools', emoji: '🔧' },
    framework: { label: 'Frameworks', emoji: '⚡' },
  };

  return (
    <div className={styles.curriculumPage}>
      <header className={styles.header}>
        <h1>&gt; CURRICULUM_REFERENCE_</h1>
        <p className={styles.subtitle}>
          Complete structured learning paths for every tool. Browse topics, concepts, 
          lessons, and problems — or jump into Quest Mode to solve challenges.
        </p>
        <div className={styles.statsBar}>
          <span>{tools.length} Tools</span>
          <span>5 Levels</span>
          <span>Cadet → Archmage</span>
        </div>
      </header>

      {Object.entries(categories).map(([key, catTools]) => {
        if (catTools.length === 0) return null;
        const cat = categoryLabels[key];
        return (
          <section key={key} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>
              {cat.emoji} {cat.label}
            </h2>
            <div className={styles.toolsGrid}>
              {catTools.map(tool => (
                <Link 
                  key={tool.id} 
                  href={`/curriculum/${tool.slug}`}
                  className={styles.toolCard}
                >
                  <div className={styles.toolIcon}>{tool.icon_emoji}</div>
                  <div className={styles.toolInfo}>
                    <h3>{tool.name}</h3>
                    <p className={styles.toolDesc}>{tool.description}</p>
                    <div className={styles.toolMeta}>
                      <span className={styles.difficulty}>
                        {'★'.repeat(tool.difficulty_rating || 0)}{'☆'.repeat(5 - (tool.difficulty_rating || 0))}
                      </span>
                      <span className={styles.stageCount}>
                        {tool.total_stages} stages
                      </span>
                    </div>
                  </div>
                  <div className={styles.arrow}>→</div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
