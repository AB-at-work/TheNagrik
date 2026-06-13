import Link from 'next/link';
import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import styles from '../../Learn.module.css';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const category = await api.get<any>(`/categories/${slug}`);
    return {
      title: `${category.metaTitle || category.name} - The Nagrik`,
      description: category.metaDescription || category.description,
    };
  } catch {
    return { title: 'Category - The Nagrik' };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  let category;
  try {
    category = await api.get<any>(`/categories/${slug}`);
  } catch {
    notFound();
  }

  const articles = await api.get<any[]>(`/articles?status=published&categoryId=${category.id}`).catch(() => []);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{category.name}</h1>
        {category.description && (
          <p className={styles.subtitle}>{category.description}</p>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.articleGrid}>
          {articles.map(item => (
            <Link key={item.id} href={`/learn/${item.slug}`} className={styles.articleCard}>
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
                    ARTICLE
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
          {articles.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
              No content found in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
