import { eq, desc, asc, and, isNull } from 'drizzle-orm';
import { db } from '../../../db/index';
import { schoolSessions, sessionPhotos } from '../../../db/schema';
import { AppError } from '../../utils/errors';
import { sanitizeRichText } from '../../utils/sanitize';

type CreateSessionData = typeof schoolSessions.$inferInsert;
type UpdateSessionData = Partial<CreateSessionData>;

export async function getAllSessions(publishedOnly: boolean = false) {
  const conditions = [isNull(schoolSessions.deletedAt)];
  
  if (publishedOnly) {
    conditions.push(eq(schoolSessions.status, 'published'));
  }
  
  const results = await db
    .select()
    .from(schoolSessions)
    .where(and(...conditions))
    .orderBy(desc(schoolSessions.sessionDate), desc(schoolSessions.createdAt));

  // In a real app we'd fetch thumbnails or eager load photos, but let's keep it simple or do a subquery
  return results;
}

export async function getSessionByIdOrSlug(idOrSlug: string) {
  let condition;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)) {
    condition = eq(schoolSessions.id, idOrSlug);
  } else {
    condition = eq(schoolSessions.slug, idOrSlug);
  }

  const [row] = await db
    .select()
    .from(schoolSessions)
    .where(and(condition, isNull(schoolSessions.deletedAt)))
    .limit(1);

  if (!row) {
    throw AppError.notFound('School session not found');
  }

  // Fetch photos
  const photos = await db.select().from(sessionPhotos).where(eq(sessionPhotos.sessionId, row.id)).orderBy(asc(sessionPhotos.sortOrder));

  return {
    ...row,
    photos
  };
}

export async function createSession(data: CreateSessionData & { photoGalleryUrls?: string[] }) {
  const { photoGalleryUrls, ...insertData } = data;

  if (insertData.description) {
    // Strip XSS vectors from rich-text description before persistence.
    insertData.description = sanitizeRichText(insertData.description);
  }

  const existing = await db.query.schoolSessions.findFirst({
    where: eq(schoolSessions.slug, insertData.slug),
  });

  if (existing) {
    throw AppError.conflict('Session with this slug already exists');
  }

  const [created] = await db.insert(schoolSessions).values(insertData).returning();
  
  if (!created) {
    throw AppError.internal('Failed to create outreach session');
  }
  
  if (photoGalleryUrls && photoGalleryUrls.length > 0) {
    for (const url of photoGalleryUrls) {
      await addSessionPhoto(created.id, url);
    }
  }
  
  return created;
}

export async function updateSession(id: string, data: UpdateSessionData & { photoGalleryUrls?: string[] }) {
  const { photoGalleryUrls, ...updateData } = data;

  if (updateData.description) {
    updateData.description = sanitizeRichText(updateData.description);
  }

  if (updateData.slug) {
    const existing = await db.query.schoolSessions.findFirst({
      where: eq(schoolSessions.slug, updateData.slug),
    });
    if (existing && existing.id !== id) {
      throw AppError.conflict('Session with this slug already exists');
    }
  }

  const [updated] = await db
    .update(schoolSessions)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(schoolSessions.id, id), isNull(schoolSessions.deletedAt)))
    .returning();

  if (!updated) {
    throw AppError.notFound('School session not found');
  }

  if (photoGalleryUrls !== undefined) {
    await db.delete(sessionPhotos).where(eq(sessionPhotos.sessionId, id));
    for (const url of photoGalleryUrls) {
      await addSessionPhoto(id, url);
    }
  }

  return updated;
}

export async function deleteSession(id: string) {
  const [deleted] = await db
    .update(schoolSessions)
    .set({ deletedAt: new Date() })
    .where(and(eq(schoolSessions.id, id), isNull(schoolSessions.deletedAt)))
    .returning();

  if (!deleted) {
    throw AppError.notFound('School session not found');
  }
  return deleted;
}

export async function addSessionPhoto(sessionId: string, url: string, altText: string = '') {
  // Mock function, real implementation would upload to R2 and then insert
  const [photo] = await db.insert(sessionPhotos).values({
    sessionId,
    imageUrl: url,
    thumbnailUrl: url,
    altText
  }).returning();
  
  return photo;
}

export async function deleteSessionPhoto(sessionId: string, photoId: string) {
  const [deleted] = await db.delete(sessionPhotos).where(and(
    eq(sessionPhotos.id, photoId),
    eq(sessionPhotos.sessionId, sessionId)
  )).returning();
  
  if (!deleted) throw AppError.notFound('Photo not found');
  return deleted;
}
