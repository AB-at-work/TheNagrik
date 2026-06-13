import { getPublicProjectBySlug } from '@/services/projects.service';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Project.module.css';

// Fallback project details matching page.tsx for offline resilience
const FALLBACK_PROJECTS_DETAIL: Record<string, {
  title: string;
  shortDescription?: string;
  description: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  status: string;
  ctaText?: string;
  ctaUrl?: string;
}> = {
  'civic-literacy-survey-2026': {
    title: 'Civic Literacy Survey 2026',
    shortDescription: 'Empowering citizens to share their views on constitutional values and democratic awareness.',
    description: `<h2>About the Survey</h2><p>The Civic Literacy Survey 2026 is an initiative designed to gather data on the current state of constitutional awareness, democratic values, and civic understanding among young adults in India.</p><h2>Why Participate?</h2><p>Your responses are completely anonymous and will directly help us design better learning workshops, mock parliament frameworks, and digital toolkits for classrooms. It takes less than 3 minutes to complete.</p><h2>How the Data is Used</h2><p>We compile the insights into our annual reports and share recommendations with educators and public policy researchers to help improve secondary school civic education curriculum.</p>`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    featuredImageAlt: 'Survey dashboard shown on laptop.',
    status: 'active',
    ctaText: 'Take the Survey (Tally.so)',
    ctaUrl: 'https://tally.so/r/68PNAo'
  },
  'state-of-civic-literacy-report': {
    title: 'State of Civic Literacy Report',
    shortDescription: 'A data-backed report evaluating civic understanding and engagement levels nationwide.',
    description: `<h2>The Report Scope</h2><p>This upcoming report is our signature research publication compiling insights from over 2,000+ respondents, school sessions, and interviews with educators across multiple states.</p><h2>Key Focus Areas</h2><ul><li><strong>Awareness Levels:</strong> Measuring understanding of basic rights, duties, and government institutions.</li><li><strong>Curriculum Gap:</strong> Identifying where traditional textbooks fall short in preparing active citizens.</li><li><strong>Digital Literacy:</strong> Evaluating how well young citizens navigate online public services and government portals.</li></ul><p>We are currently compiling the final dataset. The comprehensive PDF report will be downloadable directly from this page once released.</p>`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=1200&q=80',
    featuredImageAlt: 'A classic report representation.',
    status: 'upcoming'
  },
  'school-outreach-program': {
    title: 'School Outreach Program',
    shortDescription: 'Our flagship outreach program bringing civic learning directly to school students.',
    description: `<h2>Program Overview</h2><p>The School Outreach Program is designed to bring interactive constitutional literacy workshops directly to middle and high school classrooms. Rather than memorizing articles, students participate in active simulated experiences.</p><h2>What We Host</h2><ul><li><strong>Mock Parliaments:</strong> Students learn how laws are drafted, debated, and voted on.</li><li><strong>Constitutional Roleplay:</strong> Active discussion on rights, liberty, and public duties in local scenarios.</li><li><strong>Interactive Quizzes:</strong> Engaging team games covering public institutions and democratic values.</li></ul><p>We are launching partnerships starting July 2026. If you want to bring this program to your school, please fill out our partnership form on the schools page.</p>`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    featuredImageAlt: 'A classroom interactive session.',
    status: 'upcoming',
    ctaText: 'View Schools Section',
    ctaUrl: '/schools'
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const project = await getPublicProjectBySlug(slug);
    return {
      title: `${project.metaTitle || project.title} - The Nagrik`,
      description: project.metaDescription || project.shortDescription || project.description.substring(0, 150),
    };
  } catch (error) {
    const fallback = FALLBACK_PROJECTS_DETAIL[slug];
    if (fallback) {
      return {
        title: `${fallback.title} - The Nagrik`,
        description: fallback.shortDescription || fallback.description.substring(0, 150),
      };
    }
    return {
      title: 'Project Not Found - The Nagrik',
    };
  }
}

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let project;
  try {
    project = await getPublicProjectBySlug(slug);
  } catch (error) {
    project = FALLBACK_PROJECTS_DETAIL[slug];
    if (!project) {
      notFound();
    }
  }

  return (
    <article className={styles.container}>
      <header className={styles.hero}>
        <span className={styles.status} data-status={project.status}>
          {project.status === 'active' ? 'Active' : project.status === 'upcoming' ? 'Coming Soon' : 'Completed'}
        </span>
        
        <h1 className={styles.title}>{project.title}</h1>
        
        {project.shortDescription && (
          <p className={styles.shortDescription}>{project.shortDescription}</p>
        )}
      </header>

      {project.featuredImageUrl && (
        <div className={styles.featuredImage}>
          <Image
            src={project.featuredImageUrl}
            alt={project.featuredImageAlt || project.title}
            fill
            className={styles.image}
            priority
          />
        </div>
      )}

      <div className={styles.content}>
        <div 
          className={styles.richText}
          dangerouslySetInnerHTML={{ __html: project.description }}
        />

        {project.ctaUrl && project.ctaText && (
          <div className={styles.ctaWrapper}>
            <Link 
              href={project.ctaUrl} 
              className={styles.ctaButton} 
              target={project.ctaUrl.startsWith('http') ? '_blank' : '_self'}
            >
              {project.ctaText}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
