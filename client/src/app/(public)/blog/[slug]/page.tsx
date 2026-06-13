import { getPublicBlogPostBySlug } from '@/services/blog.service';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './BlogPost.module.css';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const post = await getPublicBlogPostBySlug(slug);
    return {
      title: `${post.metaTitle || post.title} - The Nagrik`,
      description: post.metaDescription || post.excerpt,
      openGraph: {
        images: post.ogImageUrl ? [post.ogImageUrl] : [],
      }
    };
  } catch (error) {
    return {
      title: 'Blog Post Not Found - The Nagrik',
    };
  }
}

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let post;
  try {
    post = await getPublicBlogPostBySlug(slug);
  } catch (error) {
    notFound();
  }

  const publishDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className={styles.articleContainer}>
      <header className={styles.hero}>
        <div className={styles.meta}>
          {post.category && (
            <>
              <span className={styles.category}>{post.category.name}</span>
              <span className={styles.dot} />
            </>
          )}
          {post.readingTimeMinutes && (
            <span>{post.readingTimeMinutes} min read</span>
          )}
        </div>
        
        <h1 className={styles.title}>{post.title}</h1>
        
        {post.excerpt && (
          <p className={styles.excerpt}>{post.excerpt}</p>
        )}

        <div className={styles.authorMeta}>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>The Nagrik</span>
            <span className={styles.postDate}>{formattedDate}</span>
          </div>
        </div>
      </header>

      {post.featuredImageUrl && (
        <div className={styles.featuredImage}>
          <Image
            src={post.featuredImageUrl}
            alt={post.featuredImageAlt || post.title}
            fill
            className={styles.image}
            priority
          />
        </div>
      )}

      <div className={styles.content}>
        <div 
          className={styles.richText}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </div>
    </article>
  );
}
