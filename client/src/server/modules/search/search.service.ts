import { db } from '../../../db/index';
import { articles, blogPosts, projects, schoolSessions, faqEntries } from '../../../db/schema';
import { sql } from 'drizzle-orm';
import type { SearchResultDTO, SearchResultType } from '@thenagrik/shared';

export const searchService = {
  async search(query: string, typeFilter?: string): Promise<SearchResultDTO[]> {
    const formattedQuery = query.trim().split(/\s+/).join(' | ');
    const tsQuery = sql`to_tsquery('english', ${formattedQuery})`;

    const results: SearchResultDTO[] = [];
    const limit = 10;

    // Search Articles
    if (!typeFilter || typeFilter === 'article') {
      const arts = await db.select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
      })
      .from(articles)
      .where(sql`${articles.searchVector} @@ ${tsQuery} AND ${articles.status} = 'published'`)
      .limit(limit);

      results.push(...arts.map(a => ({
        type: 'article' as SearchResultType,
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        section: 'Learn',
      })));
    }

    // Search Blog Posts
    if (!typeFilter || typeFilter === 'blog_post') {
      const blogs = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
      })
      .from(blogPosts)
      .where(sql`${blogPosts.searchVector} @@ ${tsQuery} AND ${blogPosts.status} = 'published'`)
      .limit(limit);

      results.push(...blogs.map(b => ({
        type: 'blog_post' as SearchResultType,
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        section: 'Blog',
      })));
    }

    // Search Projects
    if (!typeFilter || typeFilter === 'project') {
      const projs = await db.select({
        id: projects.id,
        slug: projects.slug,
        title: projects.title,
        excerpt: projects.shortDescription,
      })
      .from(projects)
      .where(sql`${projects.searchVector} @@ ${tsQuery} AND ${projects.status} = 'active'`)
      .limit(limit);

      results.push(...projs.map(p => ({
        type: 'project' as SearchResultType,
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        section: 'Projects',
      })));
    }

    // Search School Sessions
    if (!typeFilter || typeFilter === 'school_session') {
      const schools = await db.select({
        id: schoolSessions.id,
        slug: schoolSessions.slug,
        title: schoolSessions.title,
        excerpt: schoolSessions.description,
      })
      .from(schoolSessions)
      .where(sql`${schoolSessions.searchVector} @@ ${tsQuery}`)
      .limit(limit);

      results.push(...schools.map(s => ({
        type: 'school_session' as SearchResultType,
        id: s.id,
        slug: s.slug,
        title: s.title,
        excerpt: s.excerpt,
        section: 'Schools',
      })));
    }

    // Search FAQs
    if (!typeFilter || typeFilter === 'faq') {
      const faqs = await db.select({
        id: faqEntries.id,
        title: faqEntries.question,
        excerpt: faqEntries.answer,
      })
      .from(faqEntries)
      .where(sql`${faqEntries.searchVector} @@ ${tsQuery} AND ${faqEntries.isActive} = true`)
      .limit(limit);

      results.push(...faqs.map(f => ({
        type: 'faq' as SearchResultType,
        id: f.id,
        slug: null,
        title: f.title,
        excerpt: f.excerpt,
        section: 'FAQ',
      })));
    }

    return results;
  }
};
