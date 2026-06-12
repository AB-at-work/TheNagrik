import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './Article.module.css';

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const article = await api.get<any>(`/articles/${slug}`);
    return {
      title: `${article.metaTitle || article.title} - The Nagrik`,
      description: article.metaDescription || article.excerpt,
      openGraph: {
        images: [article.ogImageUrl || article.featuredImageUrl].filter(Boolean),
      }
    };
  } catch {
    return { title: 'Article - The Nagrik' };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let article;
  try {
    article = await api.get<any>(`/articles/${slug}`, { next: { revalidate: 3600 } });
  } catch {
    notFound();
  }

  if (article.status !== 'published') {
    notFound();
  }

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        {article.category && (
          <Link href={`/learn/category/${article.category.slug}`} className={styles.category}>
            {article.category.name}
          </Link>
        )}
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.meta}>
          <span>By {article.author?.name || 'The Nagrik Team'}</span>
          <span className={styles.metaDivider}>•</span>
          <time dateTime={article.publishedAt || article.createdAt}>
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span className={styles.metaDivider}>•</span>
          <span>{article.readingTimeMinutes || 5} min read</span>
        </div>
      </header>

      {article.featuredImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={article.featuredImageUrl} 
          alt={article.featuredImageAlt || article.title} 
          className={styles.heroImage} 
        />
      )}

      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: article.body }} 
      />
    </article>
  );
}
