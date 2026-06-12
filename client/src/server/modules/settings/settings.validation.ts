import { z } from 'zod';

export const updateSettingSchema = z.object({
  body: z.object({
    value: z.string(),
  }),
  params: z.object({
    key: z.string().min(1),
  }),
});
