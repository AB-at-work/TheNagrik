import { z } from 'zod';


export const createSchoolSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  slug: z.string().min(1, 'Slug is required').max(320),
  schoolName: z.string().min(1, 'School Name is required').max(300),
  sessionDate: z.string().min(1, 'Session Date is required'), // YYYY-MM-DD
  description: z.string().optional().nullable(),
  studentCount: z.number().int().min(0).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  sortOrder: z.number().int().optional(),
  photoGalleryUrls: z.array(z.string()).optional(),
});

export const updateSchoolSessionSchema = createSchoolSessionSchema.partial();
