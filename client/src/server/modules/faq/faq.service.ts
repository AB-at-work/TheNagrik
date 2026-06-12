import { eq, desc, asc, and, isNull } from 'drizzle-orm';
import { db } from '../../../db/index';
import { faqs } from '../../../db/schema';
import { AppError } from '../../utils/errors';
import { sanitizeRichText } from '../../utils/sanitize';

type CreateFaqData = typeof faqs.$inferInsert;
type UpdateFaqData = Partial<CreateFaqData>;

export async function getAllFaqs(options: { isActive?: boolean; category?: string } = {}) {
  const conditions = [isNull(faqs.deletedAt)];
  
  if (options.isActive !== undefined) {
    conditions.push(eq(faqs.isActive, options.isActive));
  }
  
  if (options.category) {
    conditions.push(eq(faqs.category, options.category));
  }

  const results = await db
    .select()
    .from(faqs)
    .where(and(...conditions))
    .orderBy(asc(faqs.sortOrder), desc(faqs.createdAt));

  return results;
}

export async function getFaqById(id: string) {
  const [row] = await db
    .select()
    .from(faqs)
    .where(and(eq(faqs.id, id), isNull(faqs.deletedAt)))
    .limit(1);

  if (!row) {
    throw AppError.notFound('FAQ not found');
  }

  return row;
}

export async function createFaq(data: CreateFaqData) {
  if (data.answer) {
    // Strip XSS vectors from rich-text answer before persistence.
    data.answer = sanitizeRichText(data.answer);
  }
  const [created] = await db.insert(faqs).values(data).returning();
  return created;
}

export async function updateFaq(id: string, data: UpdateFaqData) {
  if (data.answer) {
    data.answer = sanitizeRichText(data.answer);
  }
  const [updated] = await db
    .update(faqs)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(faqs.id, id), isNull(faqs.deletedAt)))
    .returning();

  if (!updated) {
    throw AppError.notFound('FAQ not found');
  }

  return updated;
}

export async function deleteFaq(id: string) {
  const [deleted] = await db
    .update(faqs)
    .set({ deletedAt: new Date() })
    .where(and(eq(faqs.id, id), isNull(faqs.deletedAt)))
    .returning();

  if (!deleted) {
    throw AppError.notFound('FAQ not found');
  }
  return deleted;
}
