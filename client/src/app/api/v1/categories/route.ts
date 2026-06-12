import { withApi } from '@/lib/server/withApi';
import { ok } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as categoriesService from '@/server/modules/categories/categories.service';
import { createCategorySchema } from '@/server/modules/categories/categories.validation';

export const runtime = 'nodejs';

// GET /api/v1/categories  (public)
export const GET = withApi(async () => {
  const categories = await categoriesService.getAllCategories();
  return ok(categories);
});

// POST /api/v1/categories  (editor+)
export const POST = withApi(
  async ({ req }) => {
    const body = parse(createCategorySchema, await req.json());
    const created = await categoriesService.createCategory(body);
    revalidateSite();
    return ok(created, { status: 201 });
  },
  { roles: ['editor', 'admin', 'super_admin'] },
);
