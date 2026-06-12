import { db } from '../../../db/index';
import { auditLogs } from '../../../db/schema';
import { desc, and, eq } from 'drizzle-orm';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export const auditService = {
  async list(page: number = 1, limit: number = 50, entityType?: string, action?: string) {
    const { limit: l, offset } = parsePagination(page, limit);

    const conditions = [];
    if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
    if (action) conditions.push(eq(auditLogs.action, action as any));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.auditLogs.findMany({
      where: whereClause,
      orderBy: [desc(auditLogs.createdAt)],
      limit: l,
      offset,
    });

    const totalRecords = await db.$count(auditLogs, whereClause);

    return {
      data,
      meta: buildPaginationMeta(totalRecords, { page, limit: l, perPage: limit, offset }),
    };
  }
};
