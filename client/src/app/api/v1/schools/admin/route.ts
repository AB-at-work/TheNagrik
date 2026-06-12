import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as schoolsService from '@/server/modules/schools/schools.service';
import { createSchoolSessionSchema } from '@/server/modules/schools/schools.validation';

export const runtime = 'nodejs';

// POST /api/v1/schools/admin  (editor+) — raw JSON, 201
export const POST = withApi(
  async ({ req }) => {
    const body = parse(createSchoolSessionSchema, await req.json());
    const created = await schoolsService.createSession(body);
    revalidateSite();
    return raw(created, 201);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
