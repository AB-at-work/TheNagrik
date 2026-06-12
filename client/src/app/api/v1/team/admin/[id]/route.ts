import { withApi } from '@/lib/server/withApi';
import { raw, noContent } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as teamService from '@/server/modules/team/team.service';
import { updateTeamMemberSchema } from '@/server/modules/team/team.validation';

export const runtime = 'nodejs';

type Params = { id: string };

// GET /api/v1/team/admin/:id (editor+) — raw JSON
export const GET = withApi<Params>(
  async ({ params }) => {
    const member = await teamService.getTeamMemberById(params.id);
    return raw(member);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// PUT /api/v1/team/admin/:id (admin+) — raw JSON
export const PUT = withApi<Params>(
  async ({ req, params }) => {
    const body = parse(updateTeamMemberSchema, await req.json());
    const { role, imageUrl, ...rest } = body;
    const updated = await teamService.updateTeamMember(params.id, {
      ...rest,
      ...(role !== undefined ? { roleTitle: role } : {}),
      ...(imageUrl !== undefined ? { photoUrl: imageUrl } : {}),
    });
    revalidateSite();
    return raw(updated);
  },
  { roles: ['admin', 'super_admin'] },
);

// DELETE /api/v1/team/admin/:id (admin only) — 204 noContent
export const DELETE = withApi<Params>(
  async ({ params }) => {
    await teamService.deleteTeamMember(params.id);
    revalidateSite();
    return noContent();
  },
  { roles: ['admin'] },
);
