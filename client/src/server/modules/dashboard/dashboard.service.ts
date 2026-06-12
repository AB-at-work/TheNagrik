import { isNull } from 'drizzle-orm';
import { db } from '../../../db/index';
import { articles, blogPosts, projects, users, schoolSessions } from '../../../db/schema';
import { isStorageConfigured } from '../../config/env';

export const dashboardService = {
  async getMetrics() {
    const totalArticles = await db.$count(articles, isNull(articles.deletedAt));
    const totalBlogPosts = await db.$count(blogPosts, isNull(blogPosts.deletedAt));
    const totalProjects = await db.$count(projects, isNull(projects.deletedAt));
    const totalUsers = await db.$count(users);
    const totalSchoolSessions = await db.$count(schoolSessions, isNull(schoolSessions.deletedAt));

    return {
      totalArticles,
      totalBlogPosts,
      totalProjects,
      totalSchoolSessions,
      status: {
        database: 'online' as const,
        storage: isStorageConfigured ? 'online' as const : 'unconfigured' as const,
        search: 'updated' as const,
      }
    };
  }
};
