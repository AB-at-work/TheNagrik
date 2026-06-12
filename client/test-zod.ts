import { z } from 'zod';

const createSchoolSessionSchema = z.object({
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
  photoGalleryUrls: z.array(z.string().url()).optional(),
});

const payload = {
  title: 'Test Outreach Session 1',
  slug: 'test-session',
  schoolName: 'Greenwood High School',
  city: 'Bangalore',
  state: 'Karnataka',
  status: 'published',
  sessionDate: '2026-06-11',
  studentCount: 150,
  description: 'We conducted a civic literacy workshop for high school students, covering basic rights and active citizenship.',
  photoGalleryUrls: []
};

const result = createSchoolSessionSchema.safeParse(payload);
if (!result.success) {
  console.log(JSON.stringify(result.error.issues, null, 2));
} else {
  console.log('Success!');
}
