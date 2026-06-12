import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as projectsService from '@/server/modules/projects/projects.service';

export const runtime = 'nodejs';

// GET /api/v1/projects  (public) — list public projects, raw JSON
export const GET = withApi(async () => {
  const projects = await projectsService.getAllProjects({ status: ['active', 'completed', 'upcoming'] });
  return raw(projects, 200, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  });
});
