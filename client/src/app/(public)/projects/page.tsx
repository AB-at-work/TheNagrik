import { getPublicProjects } from '@/services/projects.service';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Projects.module.css';
import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { ExternalLink, ArrowRight, Calendar, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Projects - The Nagrik',
  description: 'Explore the initiatives and projects led by The Nagrik to drive digital and social change.',
};

// Fallback projects used if the database is empty/offline
const FALLBACK_PROJECTS = [
  {
    id: '1',
    title: 'Civic Literacy Survey 2026',
    slug: 'civic-literacy-survey-2026',
    shortDescription: 'Empowering citizens to share their views on constitutional values and democratic awareness.',
    description: 'Participate in our nation-wide Civic Literacy Survey for 2026. Your voice matters in shaping our civic education initiatives and understanding constitutional awareness across demographics.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    featuredImageAlt: 'Laptop showing surveys and statistics.',
    status: 'active',
    ctaText: 'Take Survey',
    ctaUrl: 'https://tally.so/r/68PNAo'
  },
  {
    id: '2',
    title: 'State of Civic Literacy Report',
    slug: 'state-of-civic-literacy-report',
    shortDescription: 'A data-backed report evaluating civic understanding and engagement levels nationwide.',
    description: 'Our comprehensive analysis on the state of civic literacy across schools and communities. The full report and PDF publication will be available here soon.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80',
    featuredImageAlt: 'A classic report and book representing knowledge.',
    status: 'upcoming',
    ctaText: 'Coming Soon',
    ctaUrl: ''
  },
  {
    id: '3',
    title: 'School Outreach Program',
    slug: 'school-outreach-program',
    shortDescription: 'Our flagship outreach program bringing civic learning directly to school students.',
    description: 'Bringing interactive workshops, mock parliaments, and hands-on civic learning to classrooms. Launching in schools starting July 2026.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    featuredImageAlt: 'Students raising hands in class.',
    status: 'upcoming',
    ctaText: 'Launching July 2026',
    ctaUrl: ''
  }
];

export default async function ProjectsPage() {
  const dbProjects = await getPublicProjects().catch(() => []);
  
  // Use DB projects if populated, otherwise use fallback projects
  const projects = dbProjects.length > 0 ? dbProjects : FALLBACK_PROJECTS;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badgeWrapper}>
          <span className={styles.badge}><Sparkles size={14} /> Initiatives</span>
        </div>
        <h1 className={styles.title}>Ideas become impact through projects.</h1>
        <p className={styles.subtitle}>
          Discover how we are building active civic engagement and spreading constitutional awareness.
        </p>
      </header>

      <div className={styles.grid}>
        {projects.map((project) => {
          const isSurvey = project.slug === 'civic-literacy-survey-2026' || project.ctaUrl === 'https://tally.so/r/68PNAo';
          const isUpcoming = project.status === 'upcoming';
          
          return (
            <div key={project.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {project.featuredImageUrl ? (
                  <Image
                    src={project.featuredImageUrl}
                    alt={project.featuredImageAlt || project.title}
                    fill
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imagePlaceholder} />
                )}
                
                <span className={styles.statusBadge} data-status={project.status}>
                  {project.status === 'active' ? 'Active' : isUpcoming ? 'Coming Soon' : 'Completed'}
                </span>
              </div>
              
              <div className={styles.content}>
                <h2 className={styles.cardTitle}>{project.title}</h2>
                <p className={styles.description}>
                  {project.shortDescription || project.description.substring(0, 150) + '...'}
                </p>
                
                <div className={styles.footer}>
                  {isSurvey && project.ctaUrl ? (
                    <a 
                      href={project.ctaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.surveyButton}
                    >
                      <Button variant="primary" size="md" style={{ width: '100%' }}>
                        Take Survey <ExternalLink size={16} style={{ marginLeft: '4px' }} />
                      </Button>
                    </a>
                  ) : isUpcoming ? (
                    <div className={styles.upcomingWrapper}>
                      <span className={styles.upcomingBadge}>
                        {project.slug === 'school-outreach-program' ? 'Launching July 2026' : 'Coming Soon'}
                      </span>
                      {/* Allow link to custom details page if desired */}
                      <Link href={`/projects/${project.slug}`} className={styles.detailsLink}>
                        Read Info →
                      </Link>
                    </div>
                  ) : (
                    <Link href={`/projects/${project.slug}`} className={styles.detailsButton}>
                      <Button variant="outline" size="md" style={{ width: '100%' }}>
                        View Project <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
