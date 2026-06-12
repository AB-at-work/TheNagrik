import { z } from 'zod';

export const uploadMediaSchema = z.object({
  body: z.object({
    altText: z.string().optional(),
  }),
});

export const listMediaSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const deleteMediaSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
