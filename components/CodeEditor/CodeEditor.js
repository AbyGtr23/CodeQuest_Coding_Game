'use client'
import dynamic from 'next/dynamic';
import { useState } from 'react';
import styles from './CodeEditor.module.css';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function CodeEditor({ value, onChange, language = 'javascript', readOnly = false, onSubmit, onRun }) {
  const handleEditorDidMount = (editor, monaco) => {
    monaco.editor.defineTheme('terminal-noir', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '0a0e17' }
      ],
      colors: {
        'editor.background': '#0a0e17',
        'editor.lineHighlightBackground': '#1e293b',
      }
    });
    monaco.editor.setTheme('terminal-noir');
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.languageBadge}>{language}</div>
        <div className={styles.actions}>
          {onRun && <button onClick={onRun} className={styles.btnRun}>Run Code</button>}
          {onSubmit && <button onClick={onSubmit} className={styles.btnSubmit}>Submit Quest</button>}
        </div>
      </div>
      <div className={styles.editorWrapper}>
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            wordWrap: 'on',
            fontFamily: 'JetBrains Mono',
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
          onMount={handleEditorDidMount}
          loading={<div className={styles.loading}>Initializing terminal..._</div>}
        />
      </div>
    </div>
  );
}
