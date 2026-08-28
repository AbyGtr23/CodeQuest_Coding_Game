'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.terminal}>
        <div className={styles.header}>
          <span>login.exe</span>
        </div>
        <div className={styles.body}>
          <h2>&gt; AUTHENTICATE_</h2>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">EMAIL:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">PASSWORD:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.button}>
              [ LOGIN ]
            </button>
          </form>
          <div className={styles.divider}>-- OR --</div>
          <button onClick={handleGithubLogin} className={styles.githubButton}>
            [ LOGIN WITH GITHUB ]
          </button>
          <div className={styles.footer}>
            No account? <Link href="/auth/signup">Sign up here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
