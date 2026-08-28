'use client';

import { useEffect, useState } from 'react';
import styles from './catalog.module.css';
import Link from 'next/link';

export default function Catalog() {
  const [tools, setTools] = useState([]);
  const [activeTools, setActiveTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [toolsRes, activeRes] = await Promise.all([
          fetch('/api/tools'),
          fetch('/api/user/tools')
        ]);
        
        if (toolsRes.ok) {
          const allTools = await toolsRes.json();
          setTools(allTools);
        }
        
        if (activeRes.ok) {
          const userTools = await activeRes.json();
          setActiveTools(userTools.map(t => t.id));
        }
      } catch (err) {
        console.error('Failed to fetch catalog', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleSelectTool = async (toolId) => {
    if (activeTools.length >= 2 && !activeTools.includes(toolId)) {
      setWarning('Maximum of 2 active quests allowed. Complete or drop a quest to start a new one.');
      setTimeout(() => setWarning(null), 5000);
      return;
    }

    try {
      const res = await fetch('/api/user/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId })
      });
      
      if (res.ok) {
        // Just redirect to the quest map for that tool
        const tool = tools.find(t => t.id === toolId);
        window.location.href = `/quest/${tool.slug}`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container">Loading catalog...</div>;

  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className={styles.catalog}>
      <header className={styles.header}>
        <h1>&gt; CHOOSE_YOUR_WEAPONS_</h1>
        <div className={styles.slotsCounter}>
          ACTIVE SLOTS: <span className={activeTools.length >= 2 ? styles.full : styles.open}>{activeTools.length}/2</span>
        </div>
      </header>

      {warning && (
        <div className={styles.warningAlert}>
          [!] {warning}
        </div>
      )}

      {categories.map(category => (
        <section key={category} className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>-- {category} --</h2>
          <div className={styles.grid}>
            {tools.filter(t => t.category === category).map(tool => {
              const isActive = activeTools.includes(tool.id);
              return (
                <div key={tool.id} className={`${styles.toolCard} ${isActive ? styles.active : ''}`}>
                  <div className={styles.cardHeader}>
                    <h3>{tool.name}</h3>
                    {isActive && <span className={styles.activeBadge}>ACTIVE</span>}
                  </div>
                  <p className={styles.description}>{tool.description}</p>
                  <div className={styles.cardFooter}>
                    <button 
                      onClick={() => handleSelectTool(tool.id)}
                      className={isActive ? styles.resumeBtn : styles.selectBtn}
                    >
                      {isActive ? '[ RESUME QUEST ]' : '[ SELECT TOOL ]'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
