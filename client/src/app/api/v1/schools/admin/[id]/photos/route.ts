import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as schoolsService from '@/server/modules/schools/schools.service';
import { AppError } from '@/server/utils/errors';

export const runtime = 'nodejs';

type Params = { id: string };

// POST /api/v1/schools/admin/:id/photos  (editor+) — raw JSON, 201
export const POST = withApi<Params>(
  async ({ req, params }) => {
    const { url, altText } = await req.json();
    if (!url) {
      throw AppError.badRequest('Missing URL');
    }
    const photo = await schoolsService.addSessionPhoto(params.id, url, altText);
    return raw(photo, 201);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
