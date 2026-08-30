'use client';

import { useState } from 'react';

export function useCodeExecution() {
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const submitCode = async (code, stageId, languageId) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId, sourceCode: code, languageId })
      });
      const data = await res.json();
      setResults({ type: 'submit', ...data });
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const runCode = async (code, languageId, stdin) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: code, languageId, stdin })
      });
      const data = await res.json();
      setResults({ type: 'run', ...data });
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, results, error, submitCode, runCode };
}
