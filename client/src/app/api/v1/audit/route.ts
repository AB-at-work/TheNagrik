import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { parse, searchParamsToObject } from '@/lib/server/validate';
import { auditService } from '@/server/modules/audit/audit.service';
import { listAuditSchema } from '@/server/modules/audit/audit.validation';

export const runtime = 'nodejs';

// GET /api/v1/audit?page=&limit=&entityType=&action=  (super_admin) — raw {data, meta}
export const GET = withApi(
  async ({ req }) => {
    const { query } = parse(listAuditSchema, {
      query: searchParamsToObject(req.nextUrl.searchParams),
    });
    const result = await auditService.list(query.page ?? 1, query.limit ?? 50, query.entityType, query.action);
    return raw(result);
  },
  { roles: ['super_admin'] },
);
