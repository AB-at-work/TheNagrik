import { withApi } from '@/lib/server/withApi';
import { noContent } from '@/lib/server/respond';
import { mediaService } from '@/server/modules/media/media.service';

export const runtime = 'nodejs';

type Params = { id: string };

// DELETE /api/v1/media/:id  (editor+) — 204 noContent
export const DELETE = withApi<Params>(
  async ({ params, user }) => {
    await mediaService.delete(params.id, user.id, user.email);
    return noContent();
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
