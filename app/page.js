import styles from './page.module.css';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.typing}>&gt; LEVEL UP YOUR CODE_</span>
        </h1>
        <p className={styles.subtitle}>&gt; CONQUER THE STACK_</p>
        <div className={styles.ctaWrapper}>
          <Link href="/auth/signup" className={styles.ctaButton}>
            [BEGIN YOUR QUEST &rarr;]
          </Link>
        </div>
      </header>

      <section className={styles.showcase}>
        <h2 className={styles.sectionTitle}>FEATURED TOOLS</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Python</h3>
            <p>Master data structures, algorithms, and scripting.</p>
          </div>
          <div className={styles.card}>
            <h3>JavaScript</h3>
            <p>Conquer the web with modern ES6+.</p>
          </div>
          <div className={styles.card}>
            <h3>Docker</h3>
            <p>Containerize your applications like a pro.</p>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>HOW IT WORKS</h2>
        <ol className={styles.steps}>
          <li>
            <div className={styles.icon}>⚔️</div>
            <p>Choose your weapons (tools)</p>
          </li>
          <li>
            <div className={styles.icon}>🗺️</div>
            <p>Follow the quest map</p>
          </li>
          <li>
            <div className={styles.icon}>💻</div>
            <p>Write code to solve challenges</p>
          </li>
          <li>
            <div className={styles.icon}>📈</div>
            <p>Earn XP and rank up</p>
          </li>
          <li>
            <div className={styles.icon}>🏆</div>
            <p>Climb the leaderboard</p>
          </li>
        </ol>
      </section>

      <footer className={styles.footer}>
        <p>Built for devs who dare to quest.</p>
      </footer>
    </div>
  );
}
