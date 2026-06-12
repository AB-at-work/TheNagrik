import { withApi } from '@/lib/server/withApi';
import { raw, noContent } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as blogService from '@/server/modules/blog/blog.service';
import { updateBlogPostSchema } from '@/server/modules/blog/blog.validation';

export const runtime = 'nodejs';

type Params = { id: string };

// GET /api/v1/blog/admin/:id (editor+) — raw JSON
export const GET = withApi<Params>(
  async ({ params }) => {
    const post = await blogService.getBlogPostByIdOrSlug(params.id);
    return raw(post);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// PUT /api/v1/blog/admin/:id (editor+) — raw JSON
export const PUT = withApi<Params>(
  async ({ req, params }) => {
    const body = parse(updateBlogPostSchema, await req.json());
    const updated = await blogService.updateBlogPost(params.id, body);
    revalidateSite();
    return raw(updated);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// DELETE /api/v1/blog/admin/:id (admin+) — 204 noContent
export const DELETE = withApi<Params>(
  async ({ params }) => {
    await blogService.deleteBlogPost(params.id);
    revalidateSite();
    return noContent();
  },
  { roles: ['admin', 'super_admin'] },
);
