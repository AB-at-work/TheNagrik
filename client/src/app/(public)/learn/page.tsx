import Link from 'next/link';
import { api } from '@/lib/api';
import styles from './Learn.module.css';
import { 
  BookOpen, 
  Flame, 
  Sprout, 
  Landmark, 
  Scale, 
  Vote, 
  UserCheck, 
  TrendingUp, 
  Globe 
} from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Learn - The Nagrik',
  description: 'Educational resources and civic guides from The Nagrik.',
};

export const dynamic = 'force-dynamic';

const CATEGORY_MAP: Record<string, { icon: React.ComponentType<any>; desc: string }> = {
  'Constitution': {
    icon: BookOpen,
    desc: 'Understand the foundational legal document of India, its structure, and its values.'
  },
  'Fundamental Rights': {
    icon: Flame,
    desc: 'Explore your core constitutional protections, freedoms, and civil liberties.'
  },
  'Fundamental Duties': {
    icon: Sprout,
    desc: 'Learn about the civic responsibilities of citizens to contribute to our society.'
  },
  'Parliament': {
    icon: Landmark,
    desc: 'Discover the legislative system, how bills are passed, and how policy is made.'
  },
  'Judiciary': {
    icon: Scale,
    desc: 'Study the role of courtrooms, judges, and the system of legal justice in India.'
  },
  'Elections': {
    icon: Vote,
    desc: 'Demystify the voting process, universal franchise, and election accountability.'
  },
  'Citizenship': {
    icon: UserCheck,
    desc: 'Examine what it means to be an active citizen and participant in India\'s democracy.'
  },
  'Public Policy': {
    icon: TrendingUp,
    desc: 'Analyze how policy is crafted, implemented, and monitored across the country.'
  },
  'Digital Citizenship': {
    icon: Globe,
    desc: 'Navigate the digital world safely, protecting your rights and privacy online.'
  }
};

export default async function LearnHubPage() {
  const [categories, articles, blogs, projects] = await Promise.all([
    api.get<any[]>('/categories').catch(() => []),
    api.get<any[]>('/articles?status=published&limit=3').catch(() => []),
    api.get<any[]>('/blog?status=published&limit=3').catch(() => []),
    api.get<any[]>('/projects?status=active&limit=3').catch(() => [])
  ]);

  const combinedItems = [
    ...articles.map(a => ({ ...a, type: 'Article', link: `/learn/${a.slug}` })),
    ...projects.map(p => ({ ...p, type: 'Project', link: `/projects/${p.slug}` }))
  ].sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()).slice(0, 6);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Learn Hub</h1>
        <p className={styles.subtitle}>
          Empowering citizens through knowledge. Explore guides, articles, and resources about your rights and governance.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Topics</h2>
        <div className={styles.categoryGrid}>
          {categories.map(category => {
            const meta = CATEGORY_MAP[category.name] || { icon: BookOpen, desc: category.description || '' };
            const Icon = meta.icon;
            return (
              <Link key={category.id} href={`/learn/category/${category.slug}`} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.categoryIcon} size={24} />
                  </div>
                </div>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.categoryDesc}>{meta.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Resources</h2>
        <div className={styles.articleGrid}>
          {combinedItems.map(item => (
            <Link key={item.id} href={item.link} className={styles.articleCard}>
              {item.featuredImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.featuredImageUrl} alt={item.title} className={styles.articleImage} />
              ) : (
                <div className={styles.articleImage} />
              )}
              <div className={styles.articleContent}>
                <div className={styles.articleMeta}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', 
                    background: 'var(--color-primary-light, #e0f2fe)', 
                    color: 'var(--color-primary, #0284c7)', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px',
                    marginRight: '0.5rem' 
                  }}>
                    {item.type}
                  </span>
                  <span>{item.readingTimeMinutes || 5} min read</span>
                </div>
                <h3 className={styles.articleTitle}>{item.title}</h3>
                {item.excerpt && <p className={styles.articleExcerpt}>{item.excerpt}</p>}
                <div className={styles.articleFooter}>
                  <span>By {item.author?.name || 'The Nagrik Team'}</span>
                  <span>{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
          {combinedItems.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
              No recent resources found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
