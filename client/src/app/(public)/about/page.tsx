import { getPublicFaqs } from '@/services/faq.service';
import Image from 'next/image';
import styles from './About.module.css';
import { Metadata } from 'next';
import { Accessibility, Scale, Brain, HandHeart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - The Nagrik',
  description: 'Learn more about The Nagrik and our mission.',
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  // Fetch FAQs on the server
  const faqs = await getPublicFaqs().catch(() => []);

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>About The Nagrik</h1>
        <p className={styles.subtitle}>
          A student-led civic literacy and public awareness initiative.
        </p>
      </header>

      {/* 1. Introduction Section */}
      <section className={styles.introSection}>
        <h2 className={styles.sectionTitle}>Introduction</h2>
        <div className={styles.introContent}>
          <p className={styles.introText}>
            India is the world's largest democracy. Yet for many young Indians, civic knowledge remains confined to textbooks, examinations, and theoretical discussions. Concepts such as constitutional rights, public institutions, governance, policymaking, and citizenship are often studied, but rarely understood in a practical and meaningful way.
          </p>
          <p className={styles.introText}>
            Nagrik is a student-led civic literacy initiative dedicated to making law, governance, public policy, and citizenship understandable and accessible to young Indians. We seek to bridge the gap between academic civics and active citizenship by making law, governance, public policy, and democratic institutions understandable for young people.
          </p>
        </div>
      </section>

      {/* 2. Mission Statement Section */}
      <section className={styles.missionSection}>
        <span className={styles.missionTitle}>Our Mission Statement</span>
        <blockquote className={styles.missionQuote}>
          "To build a generation of informed citizens who understand their rights, value their responsibilities, and participate meaningfully in India's democracy."
        </blockquote>
        <p className={styles.missionSubquote}>
          A future where every student graduates not only as a learner, but as an informed citizen.
        </p>
        <p className={styles.missionSlogan}>
          Beyond Civics. Towards Citizenship.
        </p>
      </section>

      {/* 3. Core Principles Section */}
      <section className={styles.principlesSection}>
        <h2 className={styles.sectionTitle}>Our Core Principles</h2>
        <div className={styles.principlesGrid}>
          <div className={styles.principleCard}>
            <div className={styles.principleHeader}>
              <div className={styles.iconWrapper}>
                <Accessibility className={styles.principleIcon} size={24} />
              </div>
              <span className={styles.principleNumber}>01</span>
            </div>
            <h3 className={styles.principleTitle}>Accessibility</h3>
            <p className={styles.principleDesc}>
              Knowledge about governance, law, and citizenship should be understandable to everyone, regardless of background.
            </p>
          </div>
          <div className={styles.principleCard}>
            <div className={styles.principleHeader}>
              <div className={styles.iconWrapper}>
                <Scale className={styles.principleIcon} size={24} />
              </div>
              <span className={styles.principleNumber}>02</span>
            </div>
            <h3 className={styles.principleTitle}>Non-Partisanship</h3>
            <p className={styles.principleDesc}>
              Nagrik does not endorse political parties or political candidates. Our focus remains on civic education, institutional understanding, and informed participation.
            </p>
          </div>
          <div className={styles.principleCard}>
            <div className={styles.principleHeader}>
              <div className={styles.iconWrapper}>
                <Brain className={styles.principleIcon} size={24} />
              </div>
              <span className={styles.principleNumber}>03</span>
            </div>
            <h3 className={styles.principleTitle}>Critical Thinking</h3>
            <p className={styles.principleDesc}>
              We encourage students to question, analyze, and engage with public issues thoughtfully and responsibly.
            </p>
          </div>
          <div className={styles.principleCard}>
            <div className={styles.principleHeader}>
              <div className={styles.iconWrapper}>
                <HandHeart className={styles.principleIcon} size={24} />
              </div>
              <span className={styles.principleNumber}>04</span>
            </div>
            <h3 className={styles.principleTitle}>Service</h3>
            <p className={styles.principleDesc}>
              Citizenship is not only about rights; it is also about contributing positively to society and one's community.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQs Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        
        {faqs.length > 0 ? (
          <div className={styles.faqGrid}>
            {faqs.map((faq) => (
              <div key={faq.id} className={styles.faqItem}>
                <h3 className={styles.question}>{faq.question}</h3>
                <div 
                  className={styles.answer}
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No FAQs available at this time.</p>
          </div>
        )}
      </section>
    </main>
  );
}
