import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as schoolsService from '@/server/modules/schools/schools.service';

export const runtime = 'nodejs';

// GET /api/v1/schools/sessions  (public) — list sessions, raw JSON
export const GET = withApi(async () => {
  const sessions = await schoolsService.getAllSessions(true);
  return raw(sessions);
});
