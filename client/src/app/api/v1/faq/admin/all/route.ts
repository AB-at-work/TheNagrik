import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import * as faqService from '@/server/modules/faq/faq.service';

export const runtime = 'nodejs';

// GET /api/v1/faq/admin/all  (editor+) — raw JSON array
export const GET = withApi(
  async ({ req }) => {
    const sp = req.nextUrl.searchParams;
    const category = sp.get('category') ?? undefined;
    const isActiveParam = sp.get('isActive');
    
    const options: any = { category };
    if (isActiveParam !== null && isActiveParam !== undefined) {
      options.isActive = isActiveParam === 'true';
    }
    
    const faqs = await faqService.getAllFaqs(options);
    return raw(faqs);
  },
  { roles: ['admin', 'super_admin', 'editor'] },
);
