'use client';

import { useState } from 'react';

export function useCodeExecution() {
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const submitCode = async (code, stageId) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stageId })
      });
      const data = await res.json();
      setResults(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const runCode = async (code, stageId) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stageId })
      });
      const data = await res.json();
      setResults(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, results, error, submitCode, runCode };
}
