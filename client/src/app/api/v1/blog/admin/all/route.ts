import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as blogService from '@/server/modules/blog/blog.service';

export const runtime = 'nodejs';

// GET /api/v1/blog/admin/all  (editor+) — raw JSON array
export const GET = withApi(
  async ({ req }) => {
    const sp = req.nextUrl.searchParams;
    const posts = await blogService.getAllBlogPosts({
      status: sp.get('status') ?? undefined,
      categoryId: sp.get('categoryId') ?? undefined,
      tag: sp.get('tag') ?? undefined,
    });
    return raw(posts);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
