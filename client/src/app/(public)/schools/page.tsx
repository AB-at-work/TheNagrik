import { getPublicSessions } from '@/services/schools.service';
import Link from 'next/link';
import styles from './Schools.module.css';
import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen, Calendar, MapPin, Users, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Programs - The Nagrik',
  description: 'Bringing civic literacy beyond textbooks. Partner with us to cultivate active citizenship in schools.',
};

export default async function SchoolsPage() {
  const sessions = await getPublicSessions().catch(() => []);

  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.tag}>School Programs</div>
          <h1 className={styles.heroTitle}>Bringing civic literacy beyond textbooks.</h1>
          <p className={styles.heroSubtitle}>
            Nagrik works with schools to make civic learning practical, relevant, and accessible.
          </p>
          <div className={styles.heroCta}>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdYw135feFhdPLfo_uRvuEKlJVscsVHBleW69NSTZnrB8-QAQ/viewform" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg">
                Partner With Us <ArrowRight size={18} className={styles.ctaArrow} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why Schools Section */}
      <section className={styles.whySection}>
        <div className={styles.sectionGrid}>
          <div className={styles.whyHeader}>
            <h2 className={styles.sectionTitle}>Why Schools?</h2>
            <div className={styles.whyCallout}>
              "Every student learns about democracy. Few learn how to engage with it."
            </div>
          </div>
          <div className={styles.whyBody}>
            <p className={styles.whyText}>
              By introducing students to governance, constitutional values, rights, duties, and public institutions, we aim to cultivate informed citizens prepared to participate in society beyond the classroom.
            </p>
            <p className={styles.whyTextEmphasis}>
              Because citizenship should not begin after graduation—it should begin in school.
            </p>
          </div>
        </div>
      </section>

      {/* 100 Schools Initiative Banner */}
      <section className={styles.initiativeSection}>
        <div className={styles.initiativeCard}>
          <div className={styles.initiativeContent}>
            <div className={styles.comingSoonBadge}>Coming Soon</div>
            <h2 className={styles.initiativeTitle}>100 Schools Initiative</h2>
            <p className={styles.initiativeDescription}>
              A scaled campaign to bring interactive constitutional awareness workshops and student-led civic projects to 100 schools across India.
            </p>
            <div className={styles.launchDate}>
              <Award size={18} /> Launching July 2026
            </div>
          </div>
        </div>
      </section>

      {/* Past Sessions/visits Section */}
      <section className={styles.sessionsSection}>
        <div className={styles.sessionsHeader}>
          <h2 className={styles.sessionsTitle}>Our Sessions in Action</h2>
          <p className={styles.sessionsSubtitle}>
            Real-world impact across classrooms. See how we engage students in active civic dialogues.
          </p>
        </div>

        <div className={styles.grid}>
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <Link key={session.id} href={`/schools/${session.slug}`} className={styles.card}>
                <div className={styles.cardContent}>
                  <div className={styles.dateRow}>
                    <Calendar size={14} />
                    <span>
                      {new Date(session.sessionDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{session.title}</h3>
                  <div className={styles.schoolRow}>
                    <BookOpen size={14} />
                    <span>{session.schoolName}</span>
                  </div>
                  {session.city && (
                    <div className={styles.locationRow}>
                      <MapPin size={14} />
                      <span>{session.city}{session.state ? `, ${session.state}` : ''}</span>
                    </div>
                  )}
                  {session.description && (
                    <p className={styles.description}>{session.description}</p>
                  )}
                  
                  <div className={styles.cardFooter}>
                    {session.studentCount ? (
                      <span className={styles.stat}>
                        <Users size={16} /> {session.studentCount} Students
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className={styles.viewMore}>View Details →</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.emptyState}>
              <h3>No school sessions documented yet</h3>
              <p>Check back later for updates on our school outreach programs.</p>
            </div>
          )}
        </div>
      </section>

      {/* Partner With Us CTA Block */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Bring Nagrik to Your School</h2>
          <p className={styles.ctaText}>
            Ready to empower your students with practical civic literacy? Partner with us to host interactive workshops, start civic clubs, or collaborate on educational resources.
          </p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdYw135feFhdPLfo_uRvuEKlJVscsVHBleW69NSTZnrB8-QAQ/viewform" target="_blank" rel="noopener noreferrer" className={styles.ctaButtonWrapper}>
            <Button variant="primary" size="lg">
              Fill Out the Interest Form
            </Button>
          </a>
        </div>
      </section>
    </main>
  );
}
