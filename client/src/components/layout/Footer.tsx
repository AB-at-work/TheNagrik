import * as React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              The Nagrik.
            </Link>
            <p className={styles.description}>
              Empowering citizens through civic literacy and constitutional awareness across India.
            </p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.column}>
              <h3 className={styles.heading}>Organization</h3>
              <Link href="/about" className={styles.link}>About Us</Link>
              <Link href="/projects" className={styles.link}>Projects</Link>
              <Link href="/schools" className={styles.link}>School Programs</Link>
              <Link href="/blog" className={styles.link}>Blog</Link>
            </div>
            
            <div className={styles.column}>
              <h3 className={styles.heading}>Connect</h3>
              <Link href="/contact" className={styles.link}>Contact</Link>
              <Link href="/join" className={styles.link}>Volunteer</Link>
              <a href="https://www.instagram.com/nagrikindia?igsh=enFqb2Vicnh6dTl1&utm_source=qr" target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
              <a href="https://www.linkedin.com/company/the-nagrik/" target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn</a>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} The Nagrik. All rights reserved.
          </p>
          <div className={styles.legal}>
            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
            <Link href="/terms" className={styles.link}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
