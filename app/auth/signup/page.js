'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: username,
        }
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      // In a full implementation, you might want to wait for email verification
      // Or automatically redirect if email confirmation is off
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleGithubSignup = async () => {
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
          <span>register.exe</span>
        </div>
        <div className={styles.body}>
          <h2>&gt; NEW_RECRUIT_</h2>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleSignup} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">USERNAME:</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
              />
            </div>
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
              [ INITIALIZE ]
            </button>
          </form>
          <div className={styles.divider}>-- OR --</div>
          <button onClick={handleGithubSignup} className={styles.githubButton}>
            [ REGISTER WITH GITHUB ]
          </button>
          <div className={styles.footer}>
            Already have an account? <Link href="/auth/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
