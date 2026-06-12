import { withApi } from '@/lib/server/withApi';
import { raw } from '@/lib/server/respond';
import { dashboardService } from '@/server/modules/dashboard/dashboard.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/v1/dashboard/metrics  (admin+) — raw JSON
export const GET = withApi(
  async () => {
    const metrics = await dashboardService.getMetrics();
    return raw(metrics);
  },
  { roles: ['admin', 'super_admin'] },
);
