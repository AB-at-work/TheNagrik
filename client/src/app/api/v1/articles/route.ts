import { withApi } from '@/lib/server/withApi';
import { ok } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as articlesService from '@/server/modules/articles/articles.service';
import { createArticleSchema } from '@/server/modules/articles/articles.validation';
import { AppError } from '@/server/utils/errors';

export const runtime = 'nodejs';

// GET /api/v1/articles?status=&categoryId=  (public) — envelope
export const GET = withApi(async ({ req }) => {
  const sp = req.nextUrl.searchParams;
  const articles = await articlesService.getAllArticles({
    status: sp.get('status') ?? undefined,
    categoryId: sp.get('categoryId') ?? undefined,
  });
  return ok(articles, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
});

// POST /api/v1/articles  (editor+) — envelope, 201
export const POST = withApi(
  async ({ req, user }) => {
    const body = parse(createArticleSchema, await req.json());
    if (!user.id) throw AppError.unauthorized();
    const created = await articlesService.createArticle({
      ...body,
      authorId: user.id,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    });
    revalidateSite();
    return ok(created, { status: 201 });
  },
  { roles: ['editor', 'admin', 'super_admin'] },
);
