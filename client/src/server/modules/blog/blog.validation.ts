import { z } from 'zod';
import { CONTENT_STATUSES } from '@thenagrik/shared';


const nullableUrl = (message?: string) =>
  z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().refine((val) => val.startsWith('/') || val.startsWith('http'), {
      message: message || 'Invalid URL',
    }).optional().nullable()
  );

export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  slug: z.string().min(1, 'Slug is required').max(320),
  categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  body: z.string().min(1, 'Body is required'),
  featuredImageUrl: nullableUrl('Invalid URL'),
  featuredImageAlt: z.string().max(300).optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(CONTENT_STATUSES as any).optional(),
  metaTitle: z.string().max(120).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  ogImageUrl: nullableUrl('Invalid URL'),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();
