import { z } from 'zod';
import { PROJECT_STATUSES } from '@thenagrik/shared';


const nullableUrl = (message?: string) =>
  z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().refine((val) => val.startsWith('/') || val.startsWith('http'), {
      message: message || 'Invalid URL',
    }).optional().nullable()
  );

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  slug: z.string().min(1, 'Slug is required').max(320),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(500).optional().nullable(),
  featuredImageUrl: nullableUrl('Invalid URL'),
  featuredImageAlt: z.string().max(300).optional().nullable(),
  status: z.enum(PROJECT_STATUSES as any).optional(),
  ctaText: z.string().max(100).optional().nullable(),
  ctaUrl: nullableUrl('Invalid URL'),
  startDate: z.string().optional().nullable(), // expecting date string YYYY-MM-DD
  endDate: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  metaTitle: z.string().max(120).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();
