import { withApi } from '@/lib/server/withApi';
import { ok, message } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as categoriesService from '@/server/modules/categories/categories.service';
import { updateCategorySchema } from '@/server/modules/categories/categories.validation';

export const runtime = 'nodejs';

type Params = { id: string };

// GET /api/v1/categories/:id  (public; id-or-slug)
export const GET = withApi<Params>(async ({ params }) => {
  const category = await categoriesService.getCategoryByIdOrSlug(params.id);
  return ok(category);
});

// PUT /api/v1/categories/:id  (editor+)
export const PUT = withApi<Params>(
  async ({ req, params }) => {
    const body = parse(updateCategorySchema, await req.json());
    const updated = await categoriesService.updateCategory(params.id, body);
    revalidateSite();
    return ok(updated);
  },
  { roles: ['editor', 'admin', 'super_admin'] },
);

// DELETE /api/v1/categories/:id  (admin+)
export const DELETE = withApi<Params>(
  async ({ params }) => {
    await categoriesService.deleteCategory(params.id);
    revalidateSite();
    return message('Category deleted successfully');
  },
  { roles: ['admin', 'super_admin'] },
);
