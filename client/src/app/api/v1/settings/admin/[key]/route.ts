import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { settingsService } from '@/server/modules/settings/settings.service';
import { updateSettingSchema } from '@/server/modules/settings/settings.validation';

export const runtime = 'nodejs';

type Params = { key: string };

// PUT /api/v1/settings/admin/:key  (admin+) — raw JSON
export const PUT = withApi<Params>(
  async ({ req, params, user }) => {
    const { body } = parse(updateSettingSchema, {
      body: await req.json(),
      params: { key: params.key },
    });
    const updated = await settingsService.updateSetting(params.key, body.value, user.id, user.email);
    return raw(updated);
  },
  { roles: ['admin', 'super_admin'] },
);
