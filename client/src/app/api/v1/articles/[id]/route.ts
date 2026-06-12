import { withApi } from '@/lib/server/withApi';
import { ok, message } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as articlesService from '@/server/modules/articles/articles.service';
import { updateArticleSchema } from '@/server/modules/articles/articles.validation';

export const runtime = 'nodejs';

type Params = { id: string };

// GET /api/v1/articles/:id  (public; id-or-slug) — envelope
export const GET = withApi<Params>(async ({ params }) => {
  const article = await articlesService.getArticleByIdOrSlug(params.id);
  return ok(article, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
});

export const PUT = withApi<Params>(
  async ({ req, params }) => {
    const body = parse(updateArticleSchema, await req.json());
    const updated = await articlesService.updateArticle(params.id, {
      ...body,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : (body.publishedAt === null ? null : undefined),
    });
    revalidateSite();
    return ok(updated);
  },
  { roles: ['editor', 'admin', 'super_admin'] },
);

// DELETE /api/v1/articles/:id  (admin+) — envelope message
export const DELETE = withApi<Params>(
  async ({ params }) => {
    console.log('DELETE API Called. params:', params);
    await articlesService.deleteArticle(params.id);
    revalidateSite();
    return message('Article deleted successfully');
  },
  { roles: ['admin', 'super_admin'] },
);

