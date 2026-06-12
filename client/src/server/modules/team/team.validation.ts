import { z } from 'zod';

const nullableUrl = (message?: string) =>
  z.preprocess((val) => (val === '' ? null : val), z.string().url(message).optional().nullable());

const nullableEmail = (message?: string) =>
  z.preprocess((val) => (val === '' ? null : val), z.string().email(message).optional().nullable());

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  role: z.string().min(1, 'Role is required').max(150),
  bio: z.string().max(500).optional().nullable(),
  imageUrl: nullableUrl('Invalid URL'),
  email: nullableEmail('Invalid email'),
  linkedInUrl: nullableUrl('Invalid URL'),
  twitterUrl: nullableUrl('Invalid URL'),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();
