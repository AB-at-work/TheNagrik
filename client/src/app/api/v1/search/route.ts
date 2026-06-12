import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { parse, searchParamsToObject } from '@/lib/server/validate';
import { searchService } from '@/server/modules/search/search.service';
import { searchQuerySchema } from '@/server/modules/search/search.validation';

export const runtime = 'nodejs';

// GET /api/v1/search?q=&type=  (public) — raw JSON array
export const GET = withApi(async ({ req }) => {
  const { query } = parse(searchQuerySchema, {
    query: searchParamsToObject(req.nextUrl.searchParams),
  });
  const results = await searchService.search(query.q, query.type);
  return raw(results);
});
