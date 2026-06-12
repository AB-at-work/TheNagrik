import { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy - The Nagrik',
  description: 'Privacy Policy for The Nagrik.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: June 2026</p>
      </header>

      <section className={styles.content}>
        <p>
          At The Nagrik, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information when you interact with our website, programs, and community initiatives.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          When you participate in our programs or contact us, we may collect:
        </p>
        <ul>
          <li><strong>Contact Information:</strong> Such as your name, email address, and phone number when you fill out forms or communicate with us.</li>
          <li><strong>Usage Data:</strong> Anonymous data about how visitors use our website, to help us improve the civic education resources we provide.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>
          The information we collect is solely used to further our mission of civic education. We use it to:
        </p>
        <ul>
          <li>Respond to your inquiries and collaborate on school programs.</li>
          <li>Send updates regarding our workshops, resources, and initiatives (only if you have opted in).</li>
          <li>Improve the accessibility and effectiveness of our website.</li>
        </ul>

        <h2>3. Data Sharing and Protection</h2>
        <p>
          We are committed to maintaining your trust. <strong>We do not sell, rent, or trade your personal information to third parties.</strong> Data is stored securely and only accessible by authorized members of The Nagrik team for the purposes mentioned above.
        </p>

        <h2>4. Your Rights</h2>
        <p>
          You have the right to request access to the personal data we hold about you, or ask that we delete or correct it. To exercise these rights, simply contact us at thenagrik.org@gmail.com.
        </p>

        <h2>5. Changes to This Policy</h2>
        <p>
          We may occasionally update this Privacy Policy to reflect changes in our operations or legal obligations. We encourage you to review this page periodically.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions or concerns regarding this Privacy Policy, please reach out to us at:
        </p>
        <p>
          <strong>Email:</strong> thenagrik.org@gmail.com<br />
        </p>
      </section>
    </main>
  );
}
