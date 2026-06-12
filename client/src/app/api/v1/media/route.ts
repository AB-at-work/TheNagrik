import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { readUpload } from '@/lib/server/multipart';
import { mediaService } from '@/server/modules/media/media.service';

export const runtime = 'nodejs';

// GET /api/v1/media  (editor+) — raw JSON (paginated list)
export const GET = withApi(
  async ({ req }) => {
    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') ?? '1') || 1;
    const limit = parseInt(sp.get('limit') ?? '20') || 20;

    const result = await mediaService.list(page, limit);
    return raw(result);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// POST /api/v1/media  (editor+) — raw JSON, 201
export const POST = withApi(
  async ({ req, user }) => {
    const { file, fields } = await readUpload(req);
    const altText = fields.altText || null;
    const media = await mediaService.upload(file, altText, user.id, user.email);
    return raw(media, 201);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
