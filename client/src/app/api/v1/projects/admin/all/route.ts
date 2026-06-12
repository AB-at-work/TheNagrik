import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as projectsService from '@/server/modules/projects/projects.service';

export const runtime = 'nodejs';

// GET /api/v1/projects/admin/all  (editor+) — raw JSON array
export const GET = withApi(
  async ({ req }) => {
    const sp = req.nextUrl.searchParams;
    const projects = await projectsService.getAllProjects({
      status: sp.get('status') ?? undefined,
    });
    return raw(projects);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
