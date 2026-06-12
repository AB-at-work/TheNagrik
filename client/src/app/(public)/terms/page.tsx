import { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service - The Nagrik',
  description: 'Terms of Service for The Nagrik.',
};

export default function TermsOfServicePage() {
  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last Updated: June 2026</p>
      </header>

      <section className={styles.content}>
        <p>
          Welcome to The Nagrik. By accessing our website, resources, and participating in our programs, you agree to be bound by these Terms of Service.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By using our platform or engaging with our civic literacy materials, you agree to these terms. If you disagree with any part of these terms, please do not use our services.
        </p>

        <h2>2. Our Mission and Non-Partisanship</h2>
        <p>
          The Nagrik is an educational, non-partisan initiative. Our materials are intended solely for educational purposes to foster civic understanding. We do not endorse any political party or candidate, and users of our platform are expected to engage respectfully.
        </p>

        <h2>3. Intellectual Property</h2>
        <p>
          All content, including articles, blog posts, curriculum materials, graphics, and logos on this website are the intellectual property of The Nagrik. They are provided for educational use. You may share our content for non-commercial, educational purposes provided proper attribution is given to The Nagrik.
        </p>

        <h2>4. User Conduct</h2>
        <p>
          When interacting with our community—whether online or at our workshops—you agree to conduct yourself respectfully. Harassment, hate speech, and disruptive behavior will not be tolerated and may result in a ban from our platforms and events.
        </p>

        <h2>5. Disclaimer of Liability</h2>
        <p>
          The information provided on our website is for general educational purposes. While we strive for accuracy in our legal and civic explanations, The Nagrik is not a law firm, and our content should not be construed as professional legal advice. We are not liable for any actions taken based on the information provided.
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Significant changes will be communicated through our website. Continued use of our services following any changes indicates your acceptance of the new terms.
        </p>

        <h2>7. Contact Information</h2>
        <p>
          If you have any questions regarding these Terms of Service, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> thenagrik.org@gmail.com
        </p>
      </section>
    </main>
  );
}
