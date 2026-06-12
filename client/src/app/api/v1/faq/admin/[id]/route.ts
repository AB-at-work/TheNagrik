import { withApi } from '@/lib/server/withApi';
import { raw, noContent } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as faqService from '@/server/modules/faq/faq.service';
import { updateFaqSchema } from '@/server/modules/faq/faq.validation';

export const runtime = 'nodejs';

type Params = { id: string };

// GET /api/v1/faq/admin/:id (editor+) — raw JSON
export const GET = withApi<Params>(
  async ({ params }) => {
    const faq = await faqService.getFaqById(params.id);
    return raw(faq);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);

// PUT /api/v1/faq/admin/:id (admin+) — raw JSON
export const PUT = withApi<Params>(
  async ({ req, params }) => {
    const body = parse(updateFaqSchema, await req.json());
    const updated = await faqService.updateFaq(params.id, {
      ...body,
      category: body.category ?? undefined,
    });
    revalidateSite();
    return raw(updated);
  },
  { roles: ['admin', 'super_admin'] },
);

// DELETE /api/v1/faq/admin/:id (admin only) — 204 noContent
export const DELETE = withApi<Params>(
  async ({ params }) => {
    await faqService.deleteFaq(params.id);
    revalidateSite();
    return noContent();
  },
  { roles: ['admin'] },
);
