'use client';

import { useState } from 'react';
import { Mail, Instagram, Linkedin, Copy, Check, ArrowUpRight, Phone } from 'lucide-react';
import styles from './Contact.module.css';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const emailAddress = 'thenagrik.org@gmail.com';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Have a question, suggestion, or want to collaborate with us? We'd love to connect. Reach out directly through any of the channels below.
        </p>
      </header>

      <div className={styles.grid}>
        {/* Email Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper}>
              <Mail className={styles.cardIcon} size={28} />
            </div>
          </div>
          <h2 className={styles.cardTitle}>Email Us</h2>
          <p className={styles.cardDescription}>
            For general inquiries, collaborations, and school programs, write to us directly.
          </p>
          <a href={`mailto:${emailAddress}`} className={styles.emailLink}>
            {emailAddress}
          </a>
          <button 
            onClick={handleCopyEmail} 
            className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
            aria-label="Copy email address"
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Address</span>
              </>
            )}
          </button>
        </div>

        {/* Phone Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper}>
              <Phone className={styles.cardIcon} size={28} />
            </div>
          </div>
          <h2 className={styles.cardTitle}>Call Us</h2>
          <p className={styles.cardDescription}>
            Reach out directly to our founders for any urgent queries or direct discussions.
          </p>
          <div className={styles.phoneList}>
            <a href="tel:+919876468705" className={styles.phoneLink}>
              +91 98764 68705 - Mannat Dhindsa
            </a>
            <a href="tel:+919115775890" className={styles.phoneLink}>
              +91 91157 75890 - Abhiraj Mehsempuri
            </a>
          </div>
        </div>

        {/* Instagram Card */}
        <a 
          href="https://www.instagram.com/nagrikindia?igsh=enFqb2Vicnh6dTl1&utm_source=qr" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.linkCard}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper}>
              <Instagram className={styles.cardIcon} size={28} />
            </div>
            <ArrowUpRight className={styles.arrowIcon} size={20} />
          </div>
          <h2 className={styles.cardTitle}>Instagram</h2>
          <p className={styles.cardDescription}>
            Follow our journey, view session updates, and interact with our community daily.
          </p>
          <span className={styles.cardCta}>
            @nagrikindia
          </span>
        </a>

        {/* LinkedIn Card */}
        <a 
          href="https://www.linkedin.com/company/the-nagrik/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.linkCard}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper}>
              <Linkedin className={styles.cardIcon} size={28} />
            </div>
            <ArrowUpRight className={styles.arrowIcon} size={20} />
          </div>
          <h2 className={styles.cardTitle}>LinkedIn</h2>
          <p className={styles.cardDescription}>
            Connect with us professionally to discuss partnerships, research, and advisory roles.
          </p>
          <span className={styles.cardCta}>
            The Nagrik
          </span>
        </a>
      </div>
    </main>
  );
}
