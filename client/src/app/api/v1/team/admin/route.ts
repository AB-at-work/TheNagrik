import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as teamService from '@/server/modules/team/team.service';
import { createTeamMemberSchema } from '@/server/modules/team/team.validation';

export const runtime = 'nodejs';

// POST /api/v1/team/admin (admin+) — raw JSON, 201
export const POST = withApi(
  async ({ req }) => {
    const body = parse(createTeamMemberSchema, await req.json());
    const { role, imageUrl, ...rest } = body;
    const created = await teamService.createTeamMember({
      ...rest,
      roleTitle: role,
      photoUrl: imageUrl,
    });
    revalidateSite();
    return raw(created, 201);
  },
  { roles: ['admin', 'super_admin'] },
);
