import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as projectsService from '@/server/modules/projects/projects.service';
import { AppError } from '@/server/utils/errors';

export const runtime = 'nodejs';

type Params = { slug: string };

// GET /api/v1/projects/:slug  (public) — raw JSON
export const GET = withApi<Params>(async ({ params }) => {
  const project = await projectsService.getProjectByIdOrSlug(params.slug);
  if (project.status !== 'active' && project.status !== 'completed' && project.status !== 'upcoming') {
    throw AppError.notFound('Project not found');
  }
  return raw(project);
});
