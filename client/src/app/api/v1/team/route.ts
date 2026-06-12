import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as teamService from '@/server/modules/team/team.service';

export const runtime = 'nodejs';

// GET /api/v1/team  (public) — active members only, raw JSON
export const GET = withApi(async () => {
  const members = await teamService.getAllTeamMembers({ isActive: true });
  return raw(members);
});
