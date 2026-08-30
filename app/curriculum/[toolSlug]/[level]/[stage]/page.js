'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from './stage-curriculum.module.css';

export default function StageCurriculumPage() {
  const { toolSlug, level, stage } = useParams();
  const [stageData, setStageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStage = async () => {
      try {
        // Fetch the exact same stage data that the quest page uses
        // This ensures Single Source of Truth (Amendment 6)
        const res = await fetch(`/api/quest/${toolSlug}/${level}/${stage}`);
        if (res.ok) {
          const data = await res.json();
          setStageData(data);
        }
      } catch (err) {
        console.error('Failed to load stage:', err);
      }
      setLoading(false);
    };
    fetchStage();
  }, [toolSlug, level, stage]);

  if (loading) return <div className="container">Loading stage reference...</div>;
  if (!stageData) return <div className="container">Stage not found.</div>;

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={styles.inlineCode} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className={styles.stageCurriculum}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/curriculum">Curriculum</Link>
          <span> / </span>
          <Link href={`/curriculum/${toolSlug}`}>{toolSlug}</Link>
          <span> / </span>
          <Link href={`/curriculum/${toolSlug}/${level}`}>{level}</Link>
          <span> / </span>
          <span className={styles.current}>Stage {stageData.stage_number}</span>
        </div>
        <h1>Stage {stageData.stage_number}: {stageData.title}</h1>
        <div className={styles.metaBar}>
          <span className={styles.xpBadge}>{stageData.xp_reward} XP</span>
          <span className={styles.typeBadge}>{stageData.exercise_type}</span>
          <span className={styles.langBadge}>Language ID: {stageData.language_id}</span>
        </div>
      </header>

      {/* LESSON */}
      <section className={styles.section}>
        <h2>📖 Lesson</h2>
        <div className={styles.markdownContent}>
          <ReactMarkdown components={markdownComponents}>
            {stageData.lesson_content_md || '*No lesson content available.*'}
          </ReactMarkdown>
        </div>
      </section>

      {/* PROBLEM STATEMENT */}
      <section className={styles.section}>
        <h2>⚔️ Problem Statement</h2>
        <div className={styles.markdownContent}>
          <ReactMarkdown components={markdownComponents}>
            {stageData.problem_statement_md || '*No problem statement available.*'}
          </ReactMarkdown>
        </div>
      </section>

      {/* EXAMPLES (Visible Test Cases) */}
      {stageData.test_cases && stageData.test_cases.length > 0 && (
        <section className={styles.section}>
          <h2>📋 Examples</h2>
          <div className={styles.testCases}>
            {stageData.test_cases.filter(tc => !tc.is_hidden).map((tc, idx) => (
              <div key={idx} className={styles.testCase}>
                <div className={styles.testCaseHeader}>Example {idx + 1}</div>
                <div className={styles.testCaseBody}>
                  <div className={styles.ioRow}>
                    <span className={styles.ioLabel}>Input:</span>
                    <code className={styles.ioValue}>{tc.input}</code>
                  </div>
                  <div className={styles.ioRow}>
                    <span className={styles.ioLabel}>Output:</span>
                    <code className={styles.ioValue}>{tc.expected_output}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STARTER CODE */}
      {stageData.starter_code && (
        <section className={styles.section}>
          <h2>💻 Starter Code</h2>
          <div className={styles.codeBlock}>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={stageData.language_id === '71' ? 'python' : stageData.language_id === '63' ? 'javascript' : 'plaintext'}
              PreTag="div"
            >
              {stageData.starter_code}
            </SyntaxHighlighter>
          </div>
        </section>
      )}

      {/* QUEST MODE CTA */}
      <div className={styles.questCta}>
        <Link 
          href={`/quest/${toolSlug}/${level}/${stage}`}
          className={styles.questButton}
        >
          [ ⚔️ SOLVE IN QUEST MODE ]
        </Link>
        {stageData.next_stage && (
          <Link
            href={`/curriculum/${toolSlug}/${stageData.next_stage.level_slug}/${stageData.next_stage.stage_number}`}
            className={styles.nextLink}
          >
            Next Stage →
          </Link>
        )}
      </div>
    </div>
  );
}
