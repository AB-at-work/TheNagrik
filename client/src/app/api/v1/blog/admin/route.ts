import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as blogService from '@/server/modules/blog/blog.service';
import { createBlogPostSchema } from '@/server/modules/blog/blog.validation';
import { AppError } from '@/server/utils/errors';

export const runtime = 'nodejs';

// POST /api/v1/blog/admin  (editor+) — raw JSON, 201
export const POST = withApi(
  async ({ req, user }) => {
    const body = parse(createBlogPostSchema, await req.json());
    if (!user.id) throw AppError.unauthorized();
    const created = await blogService.createBlogPost({ ...body, authorId: user.id });
    revalidateSite();
    return raw(created, 201);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
