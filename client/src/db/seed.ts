/**
 * Seed script — idempotent initial data.
 *
 *  - 1 super_admin user (credentials from SEED_ADMIN_* env vars)
 *  - 12 settings (BackendSchema §4.17)
 *  - 9 Learn categories + 4 core principles (PRD / TRD §21.4) so the public
 *    site has structure on first boot.
 *
 * Run with: npm run db:seed
 */
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { db, pool } from './index';
import { users, settings, categories, corePrinciples, projects, blogPosts, schoolSessions, sessionPhotos, teamMembers, faqs } from './schema';
import { env } from '../server/config/env';
import { generateSlug } from '../server/utils/slug';
import { logger } from '../server/config/logger';

interface SeedSetting {
  key: string;
  value: string;
  type: string;
  group: string;
  label: string;
}

const SEED_SETTINGS: SeedSetting[] = [
  { key: 'site.title', value: 'The Nagrik', type: 'string', group: 'general', label: 'Site Title' },
  {
    key: 'site.tagline',
    value: 'Student-Led Civic Literacy Initiative',
    type: 'string',
    group: 'general',
    label: 'Tagline',
  },
  {
    key: 'site.description',
    value: 'Building informed citizens',
    type: 'string',
    group: 'general',
    label: 'Site Description',
  },
  {
    key: 'contact.email',
    value: 'thenagrik.org@gmail.com',
    type: 'string',
    group: 'contact',
    label: 'Contact Email',
  },
  {
    key: 'social.instagram',
    value: 'https://www.instagram.com/nagrikindia?igsh=enFqb2Vicnh6dTl1&utm_source=qr',
    type: 'url',
    group: 'social',
    label: 'Instagram URL',
  },
  { key: 'social.linkedin', value: 'https://www.linkedin.com/company/the-nagrik/', type: 'url', group: 'social', label: 'LinkedIn URL' },
  { key: 'social.twitter', value: '', type: 'url', group: 'social', label: 'Twitter URL' },
  {
    key: 'seo.default_title_suffix',
    value: ' | The Nagrik',
    type: 'string',
    group: 'seo',
    label: 'Default Title Suffix',
  },
  {
    key: 'analytics.ga_measurement_id',
    value: '',
    type: 'string',
    group: 'analytics',
    label: 'GA Measurement ID',
  },
  {
    key: 'impact.students_reached',
    value: '0',
    type: 'number',
    group: 'general',
    label: 'Students Reached',
  },
];

const SEED_CATEGORIES = [
  'Constitution',
  'Fundamental Rights',
  'Fundamental Duties',
  'Parliament',
  'Judiciary',
  'Elections',
  'Citizenship',
  'Public Policy',
  'Digital Citizenship',
];

const SEED_PRINCIPLES = [
  {
    title: 'Accessibility',
    description: 'Civic knowledge should be free, clear, and available to every young Indian.',
    iconName: 'unlock',
  },
  {
    title: 'Non-Partisanship',
    description: 'We teach how democracy works, never whom to support.',
    iconName: 'scale',
  },
  {
    title: 'Critical Thinking',
    description: 'We equip citizens to question, verify, and reason for themselves.',
    iconName: 'lightbulb',
  },
  {
    title: 'Service',
    description: 'Citizenship is learned by doing — we turn understanding into action.',
    iconName: 'hand-heart',
  },
];

async function seed(): Promise<void> {
  logger.info('Seeding database…');

  // ── Super admin ──
  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, env.BCRYPT_ROUNDS);
  await db
    .insert(users)
    .values({
      email: env.SEED_ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      name: env.SEED_ADMIN_NAME,
      role: 'super_admin',
      status: 'active',
    })
    .onConflictDoNothing({ target: users.email });
  logger.info(`  ✓ super_admin: ${env.SEED_ADMIN_EMAIL}`);

  // ── Settings ──
  for (const s of SEED_SETTINGS) {
    await db.insert(settings).values(s).onConflictDoNothing({ target: settings.key });
  }
  logger.info(`  ✓ ${SEED_SETTINGS.length} settings`);

  // ── Categories ──
  let order = 0;
  for (const name of SEED_CATEGORIES) {
    await db
      .insert(categories)
      .values({ name, slug: generateSlug(name), sortOrder: order })
      .onConflictDoNothing({ target: categories.slug });
    order += 1;
  }
  logger.info(`  ✓ ${SEED_CATEGORIES.length} categories`);

  // ── Core principles ──
  let pOrder = 0;
  for (const p of SEED_PRINCIPLES) {
    await db
      .insert(corePrinciples)
      .values({ ...p, sortOrder: pOrder })
      .onConflictDoNothing();
    pOrder += 1;
  }
  logger.info(`  ✓ ${SEED_PRINCIPLES.length} core principles`);

  // ── Seeding Content for Public Pages (Sprint UI Alignment) ──
  logger.info('Seeding visual public content (team, projects, blogs, schools)...');

  // 1. Fetch super admin user ID
  const adminUsers = await db.select().from(users).where(eq(users.email, env.SEED_ADMIN_EMAIL.toLowerCase()));
  const adminUser = adminUsers[0];
  if (!adminUser) {
    throw new Error('Super admin user not found. Seeding aborted.');
  }
  const adminUserId = adminUser.id;

  // 2. Fetch categories map
  const dbCategories = await db.select().from(categories);
  const categoryMap = new Map(dbCategories.map(c => [c.name, c.id]));

  // 3. Seed Team Members
  const SEED_TEAM = [
    {
      name: 'Siddharth Verma',
      roleTitle: 'Executive Director',
      bio: 'Siddharth is a law graduate passionate about public education. He founded The Nagrik to make civic education interactive, accessible, and collaborative for students across India.',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
      sortOrder: 0,
      status: 'active'
    },
    {
      name: 'Anjali Rao',
      roleTitle: 'Head of Curriculum',
      bio: 'Anjali has over 5 years of experience in educational design. She leads curriculum creation at The Nagrik, transforming legal texts into visual school workshops.',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
      sortOrder: 1,
      status: 'active'
    },
    {
      name: 'Kabir Mehta',
      roleTitle: 'Chief Editor',
      bio: 'Kabir is a public policy analyst who writes and edits our civic journalism articles. He works to translate complex legislative updates into readable briefs.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
      sortOrder: 2,
      status: 'active'
    }
  ];

  for (const t of SEED_TEAM) {
    await db.insert(teamMembers).values(t).onConflictDoNothing();
  }
  logger.info(`  ✓ ${SEED_TEAM.length} team members`);

  // 4. Seed Projects
  const SEED_PROJECTS = [
    {
      title: 'Civic Literacy Survey 2026',
      slug: 'civic-literacy-survey-2026',
      description: 'Participate in our nation-wide Civic Literacy Survey for 2026. Your voice matters in shaping our civic education initiatives and understanding constitutional awareness across demographics.',
      shortDescription: 'Empowering citizens to share their views on constitutional values and democratic awareness.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      featuredImageAlt: 'Laptop with charts and survey details on the screen.',
      status: 'active',
      ctaText: 'Take Survey',
      ctaUrl: 'https://tally.so/r/68PNAo',
      sortOrder: 0
    },
    {
      title: 'State of Civic Literacy Report',
      slug: 'state-of-civic-literacy-report',
      description: 'Our comprehensive analysis on the state of civic literacy across schools and communities. The full report and PDF publication will be available here soon.',
      shortDescription: 'A data-backed report evaluating civic understanding and engagement levels nationwide.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=1200&q=80',
      featuredImageAlt: 'A person reading a classic report.',
      status: 'upcoming',
      ctaText: 'Coming Soon',
      ctaUrl: '',
      sortOrder: 1
    },
    {
      title: 'School Outreach Program',
      slug: 'school-outreach-program',
      description: 'Bringing interactive workshops, mock parliaments, and hands-on civic learning to classrooms. Launching in schools starting July 2026.',
      shortDescription: 'Our flagship outreach program bringing civic learning directly to school students.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
      featuredImageAlt: 'Students sitting in a classroom raising hands.',
      status: 'upcoming',
      ctaText: 'Launching July 2026',
      ctaUrl: '',
      sortOrder: 2
    }
  ];

  for (const p of SEED_PROJECTS) {
    await db.insert(projects).values(p).onConflictDoNothing({ target: projects.slug });
  }
  logger.info(`  ✓ ${SEED_PROJECTS.length} projects`);

  // 5. Seed Blog Posts
  const SEED_BLOGS = [
    {
      authorId: adminUserId,
      categoryId: categoryMap.get('Constitution') || null,
      title: 'Understanding Article 21: The Right to Life and Liberty',
      slug: 'article-21-right-to-life-and-liberty',
      excerpt: 'A basic guide to Article 21 of the Indian Constitution, exploring how judicial interpretations have expanded your rights to cover shelter, privacy, and clean environments.',
      body: '<h2>What is Article 21?</h2><p>Article 21 of the Constitution of India is one of the most vital articles guaranteeing a fundamental right. It reads: <em>"No person shall be deprived of his life or personal liberty except according to procedure established by law."</em></p><p>While this sentence seems short, the Supreme Court of India has given it an extremely wide interpretation over the decades. It is no longer just the right to exist; it is the right to live with human dignity.</p><h2>The Expanded Rights</h2><p>Through landmark judgements, the judiciary has held that the right to "life" includes several implied rights, such as:</p><ul><li>The right to clean air and drinking water.</li><li>The right to personal privacy (K.S. Puttaswamy judgment).</li><li>The right to free legal aid for underprivileged citizens.</li><li>The right to a clean environment.</li></ul><p>Understanding these rights is the first step towards active citizenship. When you know your rights, you can participate in local governance and demand accountability from public systems.</p>',
      featuredImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      featuredImageAlt: 'A courthouse facade representing law and justice.',
      status: 'published',
      publishedAt: new Date(),
      readingTimeMinutes: 5
    },
    {
      authorId: adminUserId,
      categoryId: categoryMap.get('Elections') || null,
      title: 'The Journey of Indian Voting Rights: Universal Franchise',
      slug: 'journey-indian-voting-rights-universal-franchise',
      excerpt: 'Exploring how India adopted universal adult suffrage from day one of the republic, bypassing the incremental steps taken by Western democracies.',
      body: '<h2>A Bold Democratic Experiment</h2><p>When India gained independence in 1947 and enacted the Constitution in 1950, it embarked on the largest democratic experiment in human history by adopting **Universal Adult Suffrage** immediately. Unlike many Western nations where voting rights were extended incrementally—first to property-owning men, then to all men, and much later to women—India gave every citizen aged 21 and above (later reduced to 18) the right to vote from the very first election in 1951-52.</p><p>This was a courageous decision by the framers of the Constitution, given the massive scale, diverse demographics, and low literacy rates at the time.</p><h2>The Core Principles</h2><p>The voting system in India rests on three fundamental pillars:</p><ol><li><strong>No Discrimination:</strong> No citizen can be excluded from electoral rolls on the grounds of religion, race, caste, or sex.</li><li><strong>One Person, One Vote:</strong> Every vote has equal weight.</li><li><strong>Secret Ballot:</strong> Protecting the privacy of choice to ensure free and fair decision-making.</li></ol><p>Voting is not just a privilege; it is a civic duty that shapes our collective future. By learning the history of the ballot, we can better appreciate the power of our voice.</p>',
      featuredImageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
      featuredImageAlt: 'People casting votes at a polling station.',
      status: 'published',
      publishedAt: new Date(),
      readingTimeMinutes: 6
    }
  ];

  for (const b of SEED_BLOGS) {
    await db.insert(blogPosts).values(b).onConflictDoNothing({ target: blogPosts.slug });
  }
  logger.info(`  ✓ ${SEED_BLOGS.length} blog posts`);

  // 6. Seed School Sessions & Photos
  const SEED_SCHOOL_SESSIONS = [
    {
      title: 'Interactive Civic Workshop at DPS Bangalore',
      slug: 'civic-workshop-dps-bangalore',
      schoolName: 'Delhi Public School, Bangalore East',
      sessionDate: '2026-06-05',
      description: 'We hosted an engaging hands-on workshop for over 150 middle-school students. The session focused on Fundamental Rights and Duties using custom visual charts, interactive roleplay debates, and a mock polling session.',
      studentCount: 150,
      city: 'Bangalore',
      state: 'Karnataka',
      sortOrder: 0
    },
    {
      title: 'Constitutional Awareness at Model School Delhi',
      slug: 'constitutional-awareness-model-school-delhi',
      schoolName: 'Model Senior Secondary School, New Delhi',
      sessionDate: '2026-06-06',
      description: 'A dedicated session on the Preamble of the Constitution of India. Over 200 high school students participated in dissecting key terms like Sovereign, Socialist, Secular, Democratic, Republic, Justice, Liberty, Equality, and Fraternity.',
      studentCount: 200,
      city: 'New Delhi',
      state: 'Delhi',
      sortOrder: 1
    }
  ];

  for (const s of SEED_SCHOOL_SESSIONS) {
    // Check if session already exists by slug
    const existing = await db.select().from(schoolSessions).where(eq(schoolSessions.slug, s.slug));
    if (existing.length === 0) {
      const res = await db.insert(schoolSessions).values(s).returning({ id: schoolSessions.id });
      const inserted = res[0];
      if (!inserted) continue;
      const sessionId = inserted.id;
      // Add photos
      await db.insert(sessionPhotos).values([
        {
          sessionId,
          imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
          altText: 'Students interacting in class'
        },
        {
          sessionId,
          imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
          altText: 'Classroom environment'
        }
      ]);
    }
  }
  logger.info(`  ✓ ${SEED_SCHOOL_SESSIONS.length} school sessions and photos`);

  // 7. Seed FAQs
  const SEED_FAQS = [
    {
      question: 'What is Nagrik?',
      answer: 'Nagrik is a student-led civic literacy initiative working to make citizenship, governance, rights, and public institutions more accessible to young people.',
      category: 'general',
      isActive: true,
      sortOrder: 0,
    },
    {
      question: 'Why does Nagrik focus on civic literacy?',
      answer: 'Many students learn about civics in school, but often have limited opportunities to connect these concepts to real-world issues, institutions, and public life. Nagrik aims to bridge that gap.',
      category: 'general',
      isActive: true,
      sortOrder: 1,
    },
    {
      question: 'Who can participate?',
      answer: "Anyone interested in understanding citizenship, governance, public policy, law, or civic engagement can participate in Nagrik's activities and projects.",
      category: 'general',
      isActive: true,
      sortOrder: 2,
    },
    {
      question: 'Does Nagrik support any political party?',
      answer: 'No. Nagrik is non-partisan and focuses on civic education, public awareness, and informed citizenship.',
      category: 'general',
      isActive: true,
      sortOrder: 3,
    },
    {
      question: 'How can I get involved?',
      answer: 'You can contribute through surveys, research projects, school outreach programs, workshops, content creation, and future volunteer opportunities.',
      category: 'general',
      isActive: true,
      sortOrder: 4,
    },
    {
      question: 'Can schools or organizations partner with Nagrik?',
      answer: 'Yes. Nagrik welcomes collaborations with schools, MUNs, student organizations, debate societies, and other educational initiatives.',
      category: 'general',
      isActive: true,
      sortOrder: 5,
    },
    {
      question: 'How can I contact Nagrik?',
      answer: 'You can reach us through our website contact form, Instagram, or email.',
      category: 'general',
      isActive: true,
      sortOrder: 6,
    }
  ];

  for (const f of SEED_FAQS) {
    const existing = await db.select().from(faqs).where(eq(faqs.question, f.question));
    if (existing.length === 0) {
      await db.insert(faqs).values(f);
    }
  }
  logger.info(`  ✓ ${SEED_FAQS.length} FAQs`);

  logger.info('✅ Seed complete.');
}

seed()
  .catch((err) => {
    logger.error({ err }, '❌ Seed failed');
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
