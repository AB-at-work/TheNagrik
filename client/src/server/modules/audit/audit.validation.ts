import { z } from 'zod';

export const listAuditSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    entityType: z.string().optional(),
    action: z.string().optional(),
  }),
});
