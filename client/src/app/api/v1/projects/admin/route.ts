import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as projectsService from '@/server/modules/projects/projects.service';
import { createProjectSchema } from '@/server/modules/projects/projects.validation';

export const runtime = 'nodejs';

// POST /api/v1/projects/admin  (editor+) — raw JSON, 201
export const POST = withApi(
  async ({ req }) => {
    const body = parse(createProjectSchema, await req.json());
    const created = await projectsService.createProject(body);
    revalidateSite();
    return raw(created, 201);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
