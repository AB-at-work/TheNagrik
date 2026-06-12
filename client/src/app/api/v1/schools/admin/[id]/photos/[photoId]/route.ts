import { withApi } from '@/lib/server/withApi';
import { noContent } from '@/lib/server/respond';
import * as schoolsService from '@/server/modules/schools/schools.service';

export const runtime = 'nodejs';

type Params = { id: string; photoId: string };

// DELETE /api/v1/schools/admin/:id/photos/:photoId  (editor+) — 204 noContent
export const DELETE = withApi<Params>(
  async ({ params }) => {
    await schoolsService.deleteSessionPhoto(params.id, params.photoId);
    return noContent();
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
