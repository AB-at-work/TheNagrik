import { z } from 'zod';
import { CONTENT_STATUSES } from '@thenagrik/shared';


const nullableUrl = (message?: string) =>
  z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().refine((val) => val.startsWith('/') || val.startsWith('http'), {
      message: message || 'Invalid URL',
    }).optional().nullable()
  );

export const createArticleSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(320),
  excerpt: z.string().max(500).nullable().optional(),
  body: z.string().min(1),
  featuredImageUrl: nullableUrl(),
  featuredImageAlt: z.string().max(300).nullable().optional(),
  status: z.enum(CONTENT_STATUSES as unknown as [string, ...string[]]).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  metaTitle: z.string().max(120).nullable().optional(),
  metaDescription: z.string().max(320).nullable().optional(),
  ogImageUrl: nullableUrl(),
  readingTimeMinutes: z.number().int().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateArticleSchema = createArticleSchema.partial();
