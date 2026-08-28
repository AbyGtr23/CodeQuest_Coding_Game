'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './stage.module.css';
import CodeEditor from '@/components/CodeEditor/CodeEditor';
import TestResults from '@/components/TestResults/TestResults';
import RankUpModal from '@/components/RankUpModal/RankUpModal';

export default function QuestStage() {
  const { toolSlug, level, stage } = useParams();
  const [stageData, setStageData] = useState(null);
  const [activeTab, setActiveTab] = useState('lesson'); // lesson, code, results
  const [sourceCode, setSourceCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchStage = async () => {
      const res = await fetch(`/api/quest/${toolSlug}/${level}/${stage}`);
      if (!res.ok) {
        router.push(`/quest/${toolSlug}`);
        return;
      }
      const data = await res.json();
      setStageData(data);
      setSourceCode(data.starter_code || '');
    };
    fetchStage();
  }, [toolSlug, level, stage, router]);

  const handleRun = async () => {
    setIsSubmitting(true);
    setActiveTab('results');
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceCode, 
          languageId: stageData.language_id,
          // Just running the first test case to see output
          stdin: stageData.test_cases?.[0]?.input_data || ''
        })
      });
      const result = await res.json();
      setTestResults({ type: 'run', data: result });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveTab('results');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stageId: stageData.id, 
          sourceCode, 
          languageId: stageData.language_id 
        })
      });
      const result = await res.json();
      setTestResults({ type: 'submit', data: result });

      if (result.success) {
        if (result.levelCompleted) {
          setShowRankUp(true);
        } else {
          // Could show a success toast here
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStage = () => {
    setShowRankUp(false);
    if (stageData.next_stage) {
      router.push(`/quest/${toolSlug}/${stageData.next_stage.level}/${stageData.next_stage.order}`);
    } else {
      router.push(`/quest/${toolSlug}`);
    }
  };

  if (!stageData) return <div className="container">Loading stage...</div>;

  return (
    <div className={styles.stageContainer}>
      <div className={styles.breadcrumb}>
        <Link href={`/quest/${toolSlug}`}>{toolSlug.toUpperCase()}</Link> &gt; LEVEL {level} &gt; {stageData.name}
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'lesson' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('lesson')}
        >
          [ 📖 LESSON ]
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'code' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('code')}
        >
          [ 💻 CODE ]
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'results' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('results')}
        >
          [ 📊 RESULTS ]
        </button>
      </div>

      <div className={styles.contentArea}>
        {activeTab === 'lesson' && (
          <div className={styles.lessonView}>
            <div className={styles.lessonPanel}>
              <h2>LESSON</h2>
              <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: stageData.content.lesson }} />
            </div>
            <div className={styles.problemPanel}>
              <h2>PROBLEM</h2>
              <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: stageData.content.problem }} />
              <h3>Examples</h3>
              {stageData.test_cases?.filter(tc => !tc.is_hidden).map((tc, idx) => (
                <div key={idx} className={styles.testCase}>
                  <div><strong>Input:</strong> <code>{tc.input_data}</code></div>
                  <div><strong>Output:</strong> <code>{tc.expected_output}</code></div>
                </div>
              ))}
              <button className={styles.primaryBtn} onClick={() => setActiveTab('code')}>
                START CODING &rarr;
              </button>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className={styles.codeView}>
            <CodeEditor 
              value={sourceCode} 
              onChange={setSourceCode}
              language={stageData.language_name || 'javascript'}
            />
            <div className={styles.actions}>
              <button className={styles.runBtn} onClick={handleRun} disabled={isSubmitting}>
                {isSubmitting ? 'RUNNING...' : '[ RUN ]'}
              </button>
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'SUBMITTING...' : '[ SUBMIT ]'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className={styles.resultsView}>
            {isSubmitting ? (
              <div className={styles.runningState}>
                <div className={styles.spinner}></div>
                <p>Executing code on remote servers...</p>
              </div>
            ) : testResults ? (
              <TestResults results={testResults} onNext={handleNextStage} />
            ) : (
              <div className={styles.emptyResults}>
                <p>Run or submit your code to see results here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showRankUp && (
        <RankUpModal 
          isOpen={showRankUp}
          onClose={handleNextStage}
          newRank={{ name: level, emoji: '⬆️' }}
          xpEarned={stageData?.xp_reward || 0}
        />
      )}
    </div>
  );
}
