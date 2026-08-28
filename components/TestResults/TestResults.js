import styles from './TestResults.module.css';

export default function TestResults({ results, loading }) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Running tests...</div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Test Results</h3>
      <div className={styles.resultsList}>
        {results.tests?.map((test, idx) => (
          <div key={idx} className={`${styles.testCase} ${test.passed ? styles.passed : styles.failed}`}>
            <div className={styles.testHeader}>
              <span>{test.passed ? '✅' : '❌'} Test {idx + 1}: {test.description}</span>
              <span className={styles.time}>[{test.time || '0ms'}]</span>
            </div>
            
            {!test.passed && !test.hidden && (
              <div className={styles.details}>
                <div className={styles.expected}>Expected: {String(test.expected)}</div>
                <div className={styles.actual}>Got: {String(test.actual)}</div>
              </div>
            )}
            
            {!test.passed && test.hidden && (
              <div className={styles.details}>
                <div className={styles.hiddenMsg}>Hidden test case failed.</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
