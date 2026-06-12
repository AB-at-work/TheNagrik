import { getPublicBlogPosts } from '@/services/blog.service';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Blog.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - The Nagrik',
  description: 'Latest updates, thoughts, and announcements from The Nagrik.',
};

export default async function BlogPage() {
  const posts = await getPublicBlogPosts().catch(() => []);

  return (
    <main className={styles.blogContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Journal & Updates</h1>
        <p className={styles.subtitle}>
          Thoughts, announcements, and deep dives from the team at The Nagrik.
        </p>
      </header>

      <div className={styles.grid}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                {post.featuredImageUrl ? (
                  <Image
                    src={post.featuredImageUrl}
                    alt={post.featuredImageAlt || post.title}
                    fill
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imagePlaceholder} />
                )}
              </div>
              <div className={styles.content}>
                <div className={styles.meta}>
                  {post.category && (
                    <>
                      <span className={styles.category}>{post.category.name}</span>
                      <span className={styles.dot} />
                    </>
                  )}
                  <time dateTime={post.publishedAt || post.createdAt}>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                  {post.readingTimeMinutes && (
                    <>
                      <span className={styles.dot} />
                      <span>{post.readingTimeMinutes} min read</span>
                    </>
                  )}
                </div>
                <h2 className={styles.cardTitle}>{post.title}</h2>
                {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
                
                <div className={styles.footer}>
                  <span className={styles.readMore}>
                    Read Article <span>→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h2>No posts available yet</h2>
            <p>Check back later for new updates.</p>
          </div>
        )}
      </div>
    </main>
  );
}
