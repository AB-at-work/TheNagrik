import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { settingsService } from '@/server/modules/settings/settings.service';

export const runtime = 'nodejs';

// GET /api/v1/settings  (public) — raw JSON (key→value map)
export const GET = withApi(async () => {
  const settings = await settingsService.getPublicSettings();
  return raw(settings);
});
