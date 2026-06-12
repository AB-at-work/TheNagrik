import { withApi } from '@/lib/server/withApi';
import { raw, noContent } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as projectsService from '@/server/modules/projects/projects.service';
import { updateProjectSchema } from '@/server/modules/projects/projects.validation';

export const runtime = 'nodejs';

type Params = { id: string };

// GET /api/v1/projects/admin/:id (editor+) — raw JSON
export const GET = withApi<Params>(
  async ({ params }) => {
    const project = await projectsService.getProjectByIdOrSlug(params.id);
    return raw(project);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// PUT /api/v1/projects/admin/:id (editor+) — raw JSON
export const PUT = withApi<Params>(
  async ({ req, params }) => {
    const body = parse(updateProjectSchema, await req.json());
    const updated = await projectsService.updateProject(params.id, body);
    revalidateSite();
    return raw(updated);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// DELETE /api/v1/projects/admin/:id (admin+) — 204 noContent
export const DELETE = withApi<Params>(
  async ({ params }) => {
    await projectsService.deleteProject(params.id);
    revalidateSite();
    return noContent();
  },
  { roles: ['admin', 'super_admin'] },
);
