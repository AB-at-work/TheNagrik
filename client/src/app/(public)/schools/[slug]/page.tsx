import { getSessionBySlug } from '@/services/schools.service';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './SchoolSession.module.css';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const session = await getSessionBySlug(slug);
    return {
      title: `${session.title} at ${session.schoolName} - The Nagrik`,
      description: session.description?.replace(/<[^>]*>/g, '').substring(0, 160),
    };
  } catch (error) {
    return {
      title: 'School Session Not Found - The Nagrik',
    };
  }
}

export default async function SchoolSessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let session;
  try {
    session = await getSessionBySlug(slug);
  } catch (error) {
    notFound();
  }

  const formattedDate = new Date(session.sessionDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className={styles.container}>
      <div className={styles.backButtonWrapper}>
        <Link href="/schools" className={styles.backButton}>
          <ArrowLeft size={16} /> Back to School Programs
        </Link>
      </div>

      <header className={styles.hero}>
        <div className={styles.date}>{formattedDate}</div>
        
        <h1 className={styles.title}>{session.title}</h1>
        
        <div className={styles.schoolName}>
          {session.schoolName}
        </div>

        <div className={styles.statsRow}>
          {session.city && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Location</span>
              <span className={styles.statValue}>{session.city}{session.state && `, ${session.state}`}</span>
            </div>
          )}
          {session.studentCount ? (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Impact</span>
              <span className={styles.statValue}>{session.studentCount} Students</span>
            </div>
          ) : null}
        </div>
      </header>

      {session.description && (
        <div className={styles.content}>
          <div 
            className={styles.richText}
            dangerouslySetInnerHTML={{ __html: session.description }}
          />
        </div>
      )}

      {session.photos && session.photos.length > 0 && (
        <div className={styles.photoGallery}>
          <h2 className={styles.galleryTitle}>Session Gallery</h2>
          <div className={styles.grid}>
            {session.photos.map((photo) => (
              <div key={photo.id} className={styles.photoWrapper}>
                <Image
                  src={photo.imageUrl}
                  alt={photo.altText || `Photo from ${session.title}`}
                  fill
                  className={styles.photo}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
