import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from './LessonPanel.module.css';

export default function LessonPanel({ content }) {
  return (
    <div className={styles.panel}>
      <ReactMarkdown
        components={{
          code({node, inline, className, children, ...props}) {
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
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}
