import { z } from 'zod';


export const createFaqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(300),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().max(100).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateFaqSchema = createFaqSchema.partial();
