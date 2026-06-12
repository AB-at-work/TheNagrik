import 'dotenv/config';
import { z } from 'zod';

/**
 * Validates and exposes environment variables.
 * Fails fast on boot if a required variable is missing or malformed so we never
 * run the server in a half-configured state. Integration-dependent secrets
 * (R2, Resend, Turnstile) are optional at boot — the relevant feature checks
 * for them at call time and degrades gracefully in development.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  REVALIDATION_SECRET: z.string().optional(),

  // Seed
  SEED_ADMIN_EMAIL: z.string().email().default('admin@thenagrik.org'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  SEED_ADMIN_NAME: z.string().default('Super Admin'),

  // Email (optional until configured)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('The Nagrik <noreply@thenagrik.org>'),
  ADMIN_EMAIL: z.string().email().default('thenagrik.org@gmail.com'),

  // Storage (optional until configured)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('thenagrik-media'),
  R2_PUBLIC_URL: z.string().default('https://media.thenagrik.org'),
  STORAGE_ENDPOINT: z.string().optional(),

  // CAPTCHA (optional until configured)
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    '❌ Invalid environment variables:\n',
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const isDev = env.NODE_ENV === 'development';

export const isStorageConfigured = Boolean(
  ((env.R2_ACCOUNT_ID && !env.R2_ACCOUNT_ID.includes('your_')) || env.STORAGE_ENDPOINT) &&
  env.R2_ACCESS_KEY_ID && !env.R2_ACCESS_KEY_ID.includes('your_') &&
  env.R2_SECRET_ACCESS_KEY && !env.R2_SECRET_ACCESS_KEY.includes('your_')
);

/** True only when Resend is configured. */
export const isEmailConfigured = Boolean(env.RESEND_API_KEY);

/** True only when Turnstile is configured. */
export const isTurnstileConfigured = Boolean(env.TURNSTILE_SECRET_KEY);
