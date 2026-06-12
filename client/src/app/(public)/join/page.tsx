'use client';

import { useEffect } from 'react';
import styles from './Join.module.css';

export default function JoinPage() {
  useEffect(() => {
    window.location.replace("https://docs.google.com/forms/d/e/1FAIpQLSdyQVYLJUkLqN-1RSo52kXh6rn-RlITBrYOWk85wRGgX_tsIw/viewform");
  }, []);

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Redirecting...</h1>
        <p className={styles.subtitle}>
          We are redirecting you to our application form. If you are not redirected automatically, please{' '}
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdyQVYLJUkLqN-1RSo52kXh6rn-RlITBrYOWk85wRGgX_tsIw/viewform" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            click here
          </a>.
        </p>
      </header>
    </main>
  );
}
