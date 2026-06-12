import { eq, desc, asc, and, isNull, inArray } from 'drizzle-orm';
import { db } from '../../../db/index';
import { projects } from '../../../db/schema';
import { AppError } from '../../utils/errors';
import { sanitizeRichText } from '../../utils/sanitize';

type CreateProjectData = typeof projects.$inferInsert;
type UpdateProjectData = Partial<CreateProjectData>;

export async function getAllProjects(options: { status?: string | string[] } = {}) {
  const conditions = [isNull(projects.deletedAt)];
  
  if (options.status) {
    if (Array.isArray(options.status)) {
      conditions.push(inArray(projects.status, options.status));
    } else {
      conditions.push(eq(projects.status, options.status));
    }
  }

  const results = await db
    .select()
    .from(projects)
    .where(and(...conditions))
    // Active projects first, then sort by start date/order
    .orderBy(asc(projects.sortOrder), desc(projects.createdAt));

  return results;
}

export async function getProjectByIdOrSlug(idOrSlug: string) {
  let condition;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)) {
    condition = eq(projects.id, idOrSlug);
  } else {
    condition = eq(projects.slug, idOrSlug);
  }

  const [row] = await db
    .select()
    .from(projects)
    .where(and(condition, isNull(projects.deletedAt)))
    .limit(1);

  if (!row) {
    throw AppError.notFound('Project not found');
  }

  return row;
}

export async function createProject(data: CreateProjectData) {
  const existing = await db.query.projects.findFirst({
    where: eq(projects.slug, data.slug),
  });

  if (existing) {
    throw AppError.conflict('Project with this slug already exists');
  }

  if (data.description) {
    // Strip XSS vectors from rich-text description before persistence.
    data.description = sanitizeRichText(data.description);
  }

  const [created] = await db.insert(projects).values(data).returning();
  return created;
}

export async function updateProject(id: string, data: UpdateProjectData) {
  if (data.slug) {
    const existing = await db.query.projects.findFirst({
      where: eq(projects.slug, data.slug),
    });
    if (existing && existing.id !== id) {
      throw AppError.conflict('Project with this slug already exists');
    }
  }

  if (data.description) {
    data.description = sanitizeRichText(data.description);
  }

  const [updated] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
    .returning();

  if (!updated) {
    throw AppError.notFound('Project not found');
  }

  return updated;
}

export async function deleteProject(id: string) {
  const [deleted] = await db
    .update(projects)
    .set({ deletedAt: new Date() })
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
    .returning();

  if (!deleted) {
    throw AppError.notFound('Project not found');
  }
  return deleted;
}
