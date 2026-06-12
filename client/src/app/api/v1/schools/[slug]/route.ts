import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as schoolsService from '@/server/modules/schools/schools.service';

export const runtime = 'nodejs';

type Params = { slug: string };

// GET /api/v1/schools/:slug  (public) — raw JSON
export const GET = withApi<Params>(async ({ params }) => {
  const session = await schoolsService.getSessionByIdOrSlug(params.slug);
  return raw(session);
});
