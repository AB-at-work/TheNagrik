import { z } from 'zod';

export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().min(2).max(100),
    type: z.enum(['article', 'blog_post', 'project', 'faq', 'school_session']).optional(),
  }),
});
