import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { revalidateSite } from '@/lib/server/revalidate';
import * as faqService from '@/server/modules/faq/faq.service';
import { createFaqSchema } from '@/server/modules/faq/faq.validation';

export const runtime = 'nodejs';

// POST /api/v1/faq/admin (admin+) — raw JSON, 201
export const POST = withApi(
  async ({ req }) => {
    const body = parse(createFaqSchema, await req.json());
    const created = await faqService.createFaq({
      ...body,
      category: body.category ?? undefined,
    });
    revalidateSite();
    return raw(created, 201);
  },
  { roles: ['admin', 'super_admin'] },
);
