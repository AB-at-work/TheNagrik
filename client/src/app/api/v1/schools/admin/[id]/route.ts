import { withApi } from '@/lib/server/withApi';
import { raw, noContent } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as schoolsService from '@/server/modules/schools/schools.service';
import { updateSchoolSessionSchema } from '@/server/modules/schools/schools.validation';

export const runtime = 'nodejs';

type Params = { id: string };

// GET /api/v1/schools/admin/:id (editor+) — raw JSON
export const GET = withApi<Params>(
  async ({ params }) => {
    const session = await schoolsService.getSessionByIdOrSlug(params.id);
    return raw(session);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// PUT /api/v1/schools/admin/:id (editor+) — raw JSON
export const PUT = withApi<Params>(
  async ({ req, params }) => {
    const body = parse(updateSchoolSessionSchema, await req.json());
    const updated = await schoolsService.updateSession(params.id, body);
    revalidateSite();
    return raw(updated);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// DELETE /api/v1/schools/admin/:id (admin+) — 204 noContent
export const DELETE = withApi<Params>(
  async ({ params }) => {
    await schoolsService.deleteSession(params.id);
    revalidateSite();
    return noContent();
  },
  { roles: ['admin', 'super_admin'] },
);
