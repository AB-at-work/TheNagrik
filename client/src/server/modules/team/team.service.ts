import { eq, desc, asc, and } from 'drizzle-orm';
import { db } from '../../../db/index';
import { teamMembers } from '../../../db/schema';
import { AppError } from '../../utils/errors';
import { sanitizeRichText } from '../../utils/sanitize';

type CreateTeamMemberData = typeof teamMembers.$inferInsert;
type UpdateTeamMemberData = Partial<CreateTeamMemberData>;

export async function getAllTeamMembers(options: { isActive?: boolean } = {}) {
  const conditions = [];
  
  if (options.isActive !== undefined) {
    conditions.push(eq(teamMembers.isActive, options.isActive));
  }

  const results = await db
    .select()
    .from(teamMembers)
    .where(and(...conditions))
    .orderBy(asc(teamMembers.sortOrder), desc(teamMembers.createdAt));

  return results;
}

export async function getTeamMemberById(id: string) {
  const [row] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.id, id)))
    .limit(1);

  if (!row) {
    throw AppError.notFound('Team member not found');
  }

  return row;
}

export async function createTeamMember(data: CreateTeamMemberData) {
  if (data.bio) {
    // Strip XSS vectors from rich-text bio before persistence.
    data.bio = sanitizeRichText(data.bio);
  }
  const [created] = await db.insert(teamMembers).values(data).returning();
  return created;
}

export async function updateTeamMember(id: string, data: UpdateTeamMemberData) {
  if (data.bio) {
    data.bio = sanitizeRichText(data.bio);
  }
  const [updated] = await db
    .update(teamMembers)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(teamMembers.id, id)))
    .returning();

  if (!updated) {
    throw AppError.notFound('Team member not found');
  }

  return updated;
}

export async function deleteTeamMember(id: string) {
  const [deleted] = await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.id, id)))
    .returning();

  if (!deleted) {
    throw AppError.notFound('Team member not found');
  }
  return deleted;
}
