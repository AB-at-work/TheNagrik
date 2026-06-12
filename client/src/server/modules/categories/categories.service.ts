import { eq } from 'drizzle-orm';
import { db } from '../../../db/index';
import { categories } from '../../../db/schema';
import { AppError } from '../../utils/errors';

type CreateCategoryData = typeof categories.$inferInsert;
type UpdateCategoryData = Partial<CreateCategoryData>;

export async function getAllCategories() {
  return db.query.categories.findMany({
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
  });
}

export async function getCategoryByIdOrSlug(idOrSlug: string) {
  let cat;
  
  // Try UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)) {
    cat = await db.query.categories.findFirst({
      where: eq(categories.id, idOrSlug),
    });
  }
  
  // Try slug
  if (!cat) {
    cat = await db.query.categories.findFirst({
      where: eq(categories.slug, idOrSlug),
    });
  }

  if (!cat) {
    throw AppError.notFound('Category not found');
  }

  return cat;
}

export async function createCategory(data: CreateCategoryData) {
  const existing = await db.query.categories.findFirst({
    where: eq(categories.slug, data.slug),
  });

  if (existing) {
    throw AppError.conflict('Category with this slug already exists');
  }

  const [created] = await db.insert(categories).values(data).returning();
  return created;
}

export async function updateCategory(id: string, data: UpdateCategoryData) {
  if (data.slug) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, data.slug),
    });
    if (existing && existing.id !== id) {
      throw AppError.conflict('Category with this slug already exists');
    }
  }

  const [updated] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();

  if (!updated) {
    throw AppError.notFound('Category not found');
  }

  return updated;
}

export async function deleteCategory(id: string) {
  try {
    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
    if (!deleted) {
      throw AppError.notFound('Category not found');
    }
    return deleted;
  } catch (error: any) {
    if (error.code === '23503') {
      throw AppError.conflict('Cannot delete category because it has associated articles');
    }
    throw error;
  }
}
