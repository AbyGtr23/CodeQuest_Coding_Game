'use client'
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './Navbar.module.css';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          ░▒▓ CodeQuest ▓▒░
        </Link>

        <div className={styles.desktopMenu}>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
              <Link href="/catalog" className={styles.navLink}>Catalog</Link>
              <Link href="/calendar" className={styles.navLink}>Calendar</Link>
              <Link href="/profile" className={styles.navLink}>Profile</Link>
              <div className={styles.userSection}>
                <span className={styles.xpBadge}>{profile?.xp || 0} XP</span>
                <span className={styles.rankEmoji}>{profile?.rank_emoji || '🥚'}</span>
                <button onClick={signOut} className={styles.btnSecondary}>Sign Out</button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={styles.btnSecondary}>Login</Link>
              <Link href="/auth/signup" className={styles.btnPrimary}>Start Quest</Link>
            </>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
              <Link href="/catalog" className={styles.navLink}>Catalog</Link>
              <Link href="/calendar" className={styles.navLink}>Calendar</Link>
              <Link href="/profile" className={styles.navLink}>Profile</Link>
              <button onClick={signOut} className={styles.btnSecondary}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={styles.btnSecondary}>Login</Link>
              <Link href="/auth/signup" className={styles.btnPrimary}>Start Quest</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
