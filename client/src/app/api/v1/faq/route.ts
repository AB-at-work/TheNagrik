import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as faqService from '@/server/modules/faq/faq.service';

export const runtime = 'nodejs';

// GET /api/v1/faq  (public) — list active faqs, raw JSON
export const GET = withApi(async ({ req }) => {
  const sp = req.nextUrl.searchParams;
  const faqs = await faqService.getAllFaqs({
    isActive: true,
    category: sp.get('category') ?? undefined,
  });
  return raw(faqs);
});
