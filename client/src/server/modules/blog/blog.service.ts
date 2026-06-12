import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { db } from '../../../db/index';
import { blogPosts, categories, users } from '../../../db/schema';
import { AppError } from '../../utils/errors';
import { calculateReadingTime } from '../../utils/readingTime';
import { sanitizeRichText } from '../../utils/sanitize';

type CreateBlogPostData = typeof blogPosts.$inferInsert;
type UpdateBlogPostData = Partial<CreateBlogPostData>;

export async function getAllBlogPosts(options: { status?: string; categoryId?: string; tag?: string } = {}) {
  const conditions = [isNull(blogPosts.deletedAt)];
  
  if (options.status) {
    conditions.push(eq(blogPosts.status, options.status));
  }
  
  if (options.categoryId) {
    conditions.push(eq(blogPosts.categoryId, options.categoryId));
  }

  if (options.tag) {
    // Array overlap/contains using raw SQL
    conditions.push(sql`${options.tag} = ANY(${blogPosts.tags})`);
  }

  const results = await db
    .select({
      post: blogPosts,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
      author: {
        id: users.id,
        name: users.name,
        role: users.role,
      }
    })
    .from(blogPosts)
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(blogPosts.createdAt));

  return results.map(row => ({
    ...row.post,
    category: row.category,
    author: row.author,
  }));
}

export async function getBlogPostByIdOrSlug(idOrSlug: string) {
  let condition;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)) {
    condition = eq(blogPosts.id, idOrSlug);
  } else {
    condition = eq(blogPosts.slug, idOrSlug);
  }

  const [row] = await db
    .select({
      post: blogPosts,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
      author: {
        id: users.id,
        name: users.name,
        role: users.role,
      }
    })
    .from(blogPosts)
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(and(condition, isNull(blogPosts.deletedAt)))
    .limit(1);

  if (!row) {
    throw AppError.notFound('Blog post not found');
  }

  return {
    ...row.post,
    category: row.category,
    author: row.author,
  };
}

export async function createBlogPost(data: CreateBlogPostData & { authorId: string }) {
  const existing = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, data.slug),
  });

  if (existing) {
    throw AppError.conflict('Blog post with this slug already exists');
  }

  if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  if (data.body) {
    // Strip XSS vectors from Tiptap HTML before persistence (BackendSchema §18.1).
    data.body = sanitizeRichText(data.body);
    data.readingTimeMinutes = calculateReadingTime(data.body);
  }

  const [created] = await db.insert(blogPosts).values(data).returning();
  return created;
}

export async function updateBlogPost(id: string, data: UpdateBlogPostData) {
  if (data.slug) {
    const existing = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, data.slug),
    });
    if (existing && existing.id !== id) {
      throw AppError.conflict('Blog post with this slug already exists');
    }
  }

  if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  if (data.body) {
    data.body = sanitizeRichText(data.body);
    data.readingTimeMinutes = calculateReadingTime(data.body);
  }

  const [updated] = await db
    .update(blogPosts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(blogPosts.id, id), isNull(blogPosts.deletedAt)))
    .returning();

  if (!updated) {
    throw AppError.notFound('Blog post not found');
  }

  return updated;
}

export async function deleteBlogPost(id: string) {
  const [deleted] = await db
    .update(blogPosts)
    .set({ deletedAt: new Date() })
    .where(and(eq(blogPosts.id, id), isNull(blogPosts.deletedAt)))
    .returning();

  if (!deleted) {
    throw AppError.notFound('Blog post not found');
  }
  return deleted;
}
