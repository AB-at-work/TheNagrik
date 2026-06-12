import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as blogService from '@/server/modules/blog/blog.service';
import { AppError } from '@/server/utils/errors';

export const runtime = 'nodejs';

type Params = { slug: string };

// GET /api/v1/blog/:slug  (public) — raw JSON
export const GET = withApi<Params>(async ({ params }) => {
  const post = await blogService.getBlogPostByIdOrSlug(params.slug);
  if (post.status !== 'published') {
    throw AppError.notFound('Blog post not found');
  }
  return raw(post);
});
