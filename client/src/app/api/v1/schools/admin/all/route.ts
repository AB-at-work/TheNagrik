import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as schoolsService from '@/server/modules/schools/schools.service';

export const runtime = 'nodejs';

// GET /api/v1/schools/admin/all  (editor+) — raw JSON array
export const GET = withApi(
  async () => {
    const sessions = await schoolsService.getAllSessions();
    return raw(sessions);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
