import styles from './TestResults.module.css';

export default function TestResults({ results, loading, onNext }) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Running tests...</div>
      </div>
    );
  }

  if (!results) return null;

  if (results.type === 'run') {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Execution Result</h3>
        <div className={styles.resultsList}>
          <div className={`${styles.testCase} ${results.status === 'accepted' ? styles.passed : styles.failed}`}>
            <div className={styles.testHeader}>
              <span>{results.status === 'accepted' ? '✅' : '❌'} Status: {results.status}</span>
              <span className={styles.time}>[{results.time || '0'}s]</span>
            </div>
            {results.compileOutput && (
              <div className={styles.details}>
                <div><strong>Compiler Output:</strong></div>
                <pre>{results.compileOutput}</pre>
              </div>
            )}
            {results.stdout && (
              <div className={styles.details}>
                <div><strong>Standard Output:</strong></div>
                <pre>{results.stdout}</pre>
              </div>
            )}
            {results.stderr && (
              <div className={styles.details}>
                <div><strong>Error Output:</strong></div>
                <pre>{results.stderr}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (results.type === 'submit') {
    const isSuccess = results.success;
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Submission Results</h3>
        {isSuccess && (
          <div className={styles.successMessage}>
            All tests passed! {results.xpAwarded > 0 ? `+${results.xpAwarded} XP Earned!` : '(Previously completed: +0 XP)'}
          </div>
        )}
        <div className={styles.resultsList}>
          {results.results?.map((test, idx) => (
            <div key={idx} className={`${styles.testCase} ${test.passed ? styles.passed : styles.failed}`}>
              <div className={styles.testHeader}>
                <span>{test.passed ? '✅' : '❌'} Test {test.testNumber}: {test.status}</span>
                <span className={styles.time}>[{test.executionTime || '0'}s]</span>
              </div>
              
              {!test.passed && !test.isHidden && (
                <div className={styles.details}>
                  <div className={styles.expected}>Expected: {String(test.expectedOutput)}</div>
                  <div className={styles.actual}>Got: {String(test.actualOutput)}</div>
                </div>
              )}
              
              {!test.passed && test.isHidden && (
                <div className={styles.details}>
                  <div className={styles.hiddenMsg}>Hidden test case failed.</div>
                </div>
              )}
            </div>
          ))}
        </div>
        {isSuccess && onNext && (
          <button className={styles.nextButton} onClick={onNext}>
            Next Stage
          </button>
        )}
      </div>
    );
  }

  return null;
}
