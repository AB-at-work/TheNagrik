import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as blogService from '@/server/modules/blog/blog.service';

export const runtime = 'nodejs';

// GET /api/v1/blog  (public) — list published posts, raw JSON
export const GET = withApi(async ({ req }) => {
  const sp = req.nextUrl.searchParams;
  const posts = await blogService.getAllBlogPosts({
    status: 'published',
    categoryId: sp.get('categoryId') ?? undefined,
    tag: sp.get('tag') ?? undefined,
  });
  return raw(posts, 200, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  });
});
