import { z } from 'zod';

const nullableUrl = (message?: string) =>
  z.preprocess((val) => (val === '' ? null : val), z.string().url(message).optional().nullable());

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120),
  description: z.string().nullable().optional(),
  iconUrl: nullableUrl(),
  sortOrder: z.number().int().optional(),
  metaTitle: z.string().max(120).nullable().optional(),
  metaDescription: z.string().max(320).nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
