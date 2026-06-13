import Link from 'next/link';
import Image from 'next/image';
import { getPublicBlogPosts } from '@/services/blog.service';
import { getPublicProjects } from '@/services/projects.service';
import { Button } from '@/components/ui/Button';
import styles from './Home.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch featured content concurrently on the server
  const [blogs, projects] = await Promise.all([
    getPublicBlogPosts().catch(() => []),
    getPublicProjects().catch(() => [])
  ]);

  // Limit content for landing display
  const featuredBlogs = blogs.slice(0, 3);
  const featuredProjects = projects.slice(0, 2);

  return (
    <>
      {/* 1. Hero Section (Concept A - Editorial Split) */}
      <section className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTagline}>
              <span>“Don't just live here.</span>
              <span>Shape it.”</span>
            </h1>
            <p className={styles.heroDescription}>
              The Nagrik is a student-led civic literacy and public awareness initiative. We make law, governance, and democracy understandable.
            </p>
            <div className={styles.heroActions}>
              <Link href="/join">
                <Button variant="primary" size="lg">Get Involved</Button>
              </Link>
              <Link href="/about" className={styles.secondaryLink}>
                <span>Learn More</span> <span className={styles.arrow}>→</span>
              </Link>
            </div>
          </div>

          <div className={styles.heroGraphic}>
            <Image
              src="/logo.png"
              alt="The Nagrik Logo"
              width={400}
              height={400}
              className={styles.heroLogo}
              priority
            />
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* 2. Provocative Snippet */}
      <section className={styles.aboutSnippet}>
        <div className={styles.container}>
          <div className={styles.snippetContent}>
            <h2 className={styles.snippetTitle}>
              India has 1.4 billion citizens.
            </h2>
            <p className={styles.snippetText}>
              But how many actually understand how democracy works? Civic knowledge shouldn't be confined to dry textbooks. We break down the complex worlds of law, governance, and public policy into clear, accessible knowledge.
            </p>
            <Link href="/about">
              <Button variant="primary" size="lg">Know Our Story</Button>
            </Link>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* 3. Bento Grid (Asymmetric) */}
      <section className={`${styles.container} ${styles.bentoSection}`}>
        <div className={styles.bentoGrid}>
          {/* Card 1: Why Civic Literacy */}
          <div className={`${styles.bentoCard} ${styles.card1}`}>
            <div>
              <div className={styles.bentoHeader}>
                <div className={styles.bentoIconWrapper}>
                  {/* Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </div>
                <h3 className={styles.bentoTitle}>Why Civic Literacy?</h3>
              </div>
              <p className={styles.bentoDescription}>
                Democracy is inherited, but active citizenship must be learned. We bridge the gap between civics in school and active engagement in society.
              </p>
            </div>
            <Link href="/learn" className={styles.secondaryLink} style={{ marginTop: '1.5rem' }}>
              <span>Explore Topics</span> <span className={styles.arrow}>→</span>
            </Link>
          </div>

          {/* Card 2: Student Power */}
          <div className={`${styles.bentoCard} ${styles.card2}`}>
            <div>
              <div className={styles.bentoHeader}>
                <div className={styles.bentoIconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className={styles.bentoTitle}>Student Power</h3>
              </div>
              <p className={styles.bentoDescription}>
                Led entirely by students and young professionals. We talk to our peers in their language, showing that civic engagement can be vibrant and collaborative.
              </p>
            </div>
            <Link href="/join" className={styles.secondaryLink} style={{ marginTop: '1.5rem' }}>
              <span>Join Our Team</span> <span className={styles.arrow}>→</span>
            </Link>
          </div>

          {/* Card 3: Impact at Scale */}
          <div className={`${styles.bentoCard} ${styles.card3}`}>
            <div>
              <div className={styles.bentoHeader}>
                <div className={styles.bentoIconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className={styles.bentoTitle}>Impact at Scale</h3>
              </div>
              <p className={styles.bentoDescription}>
                Through the 100 Schools Initiative launching in July 2026, we aim to bring hands-on workshops and civic literacy resources directly to classroom doors across the nation.
              </p>
            </div>
            <Link href="/schools" className={styles.secondaryLink} style={{ marginTop: '1.5rem' }}>
              <span>Our School Program</span> <span className={styles.arrow}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Mission Block (Deep Navy block) */}
      <section className={styles.missionBlock}>
        <div className={styles.container}>
          <div className={styles.missionContent}>
            <span className={styles.missionLabel}>Our Mission</span>
            <blockquote className={styles.missionQuote}>
              "To build a generation of informed citizens who understand their rights, value their responsibilities, and participate meaningfully in India's democracy."
            </blockquote>
            <p className={styles.missionAuthor}>— The Nagrik Team</p>
          </div>
        </div>
      </section>

      {/* 5. Featured Projects */}
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Key Initiatives</h2>
            <Link href="/projects" className={styles.secondaryLink}>
              <span>All Projects</span> <span className={styles.arrow}>→</span>
            </Link>
          </div>

          <div className={`${styles.grid} ${styles.grid2}`}>
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    {project.featuredImageUrl ? (
                      <Image
                        src={project.featuredImageUrl}
                        alt={project.featuredImageAlt || project.title}
                        fill
                        className={styles.image}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <span className={styles.statusBadge}>{project.status}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    <p className={styles.cardDescription}>
                      {project.shortDescription || project.description.substring(0, 120) + '...'}
                    </p>
                    <div className={styles.cardFooter}>
                      <span>Explore Initiative</span>
                      <span className={styles.arrow}>→</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.card} style={{ gridColumn: 'span 2', padding: 'var(--space-2xl)', textAlign: 'center' }}>
                <p>New projects and campaigns are coming soon. Check back shortly!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* 6. Featured Journal / Blog */}
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Journal & Insights</h2>
            <Link href="/blog" className={styles.secondaryLink}>
              <span>View All Posts</span> <span className={styles.arrow}>→</span>
            </Link>
          </div>

          <div className={`${styles.grid} ${styles.grid3}`}>
            {featuredBlogs.length > 0 ? (
              featuredBlogs.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    {post.featuredImageUrl ? (
                      <Image
                        src={post.featuredImageUrl}
                        alt={post.featuredImageAlt || post.title}
                        fill
                        className={styles.image}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      {post.category && <span className={styles.categoryBadge}>{post.category.name}</span>}
                      <span>•</span>
                      <span>{post.readingTimeMinutes || 3} min read</span>
                    </div>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    {post.excerpt && <p className={styles.cardDescription}>{post.excerpt}</p>}
                    <div className={styles.cardFooter}>
                      <span>Read More</span>
                      <span className={styles.arrow}>→</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.card} style={{ gridColumn: 'span 3', padding: 'var(--space-2xl)', textAlign: 'center' }}>
                <p>Stay tuned for articles, essays, and resources from our team.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Democracy is inherited.<br />
            Citizenship is learned.
          </h2>
          <p className={styles.ctaDescription}>
            Help us build India's most civic-conscious generation. Partner with us, volunteer, or support our school programs today.
          </p>
          <Link href="/join">
            <Button variant="primary" size="lg">Get Started</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
