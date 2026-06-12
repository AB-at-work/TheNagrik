import { eq, desc, and, isNull } from 'drizzle-orm';
import { db } from '../../../db/index';
import { articles, categories, users } from '../../../db/schema';
import { AppError } from '../../utils/errors';
import { calculateReadingTime } from '../../utils/readingTime';
import { sanitizeRichText } from '../../utils/sanitize';

type CreateArticleData = typeof articles.$inferInsert;
type UpdateArticleData = Partial<CreateArticleData>;

export async function getAllArticles(options: { status?: string; categoryId?: string } = {}) {
  const conditions = [isNull(articles.deletedAt)];
  
  if (options.status) {
    conditions.push(eq(articles.status, options.status));
  }
  
  if (options.categoryId) {
    conditions.push(eq(articles.categoryId, options.categoryId));
  }

  const results = await db
    .select({
      article: articles,
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
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(articles.createdAt));

  return results.map(row => ({
    ...row.article,
    category: row.category,
    author: row.author,
  }));
}

export async function getArticleByIdOrSlug(idOrSlug: string) {
  let condition;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)) {
    condition = eq(articles.id, idOrSlug);
  } else {
    condition = eq(articles.slug, idOrSlug);
  }

  const [row] = await db
    .select({
      article: articles,
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
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(condition, isNull(articles.deletedAt)))
    .limit(1);

  if (!row) {
    throw AppError.notFound('Article not found');
  }

  return {
    ...row.article,
    category: row.category,
    author: row.author,
  };
}

export async function createArticle(data: CreateArticleData & { authorId: string }) {
  const existing = await db.query.articles.findFirst({
    where: eq(articles.slug, data.slug),
  });

  if (existing) {
    throw AppError.conflict('Article with this slug already exists');
  }

  if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  if (data.body) {
    // Strip XSS vectors from Tiptap HTML before persistence (BackendSchema §18.1).
    data.body = sanitizeRichText(data.body);
    data.readingTimeMinutes = calculateReadingTime(data.body);
  }

  const [created] = await db.insert(articles).values(data).returning();
  return created;
}

export async function updateArticle(id: string, data: UpdateArticleData) {
  if (data.slug) {
    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, data.slug),
    });
    if (existing && existing.id !== id) {
      throw AppError.conflict('Article with this slug already exists');
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
    .update(articles)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
    .returning();

  if (!updated) {
    throw AppError.notFound('Article not found');
  }

  return updated;
}

export async function deleteArticle(id: string) {
  const [deleted] = await db
    .update(articles)
    .set({ deletedAt: new Date() })
    .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
    .returning();

  if (!deleted) {
    throw AppError.notFound('Article not found');
  }
  return deleted;
}
