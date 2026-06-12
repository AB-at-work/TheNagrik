/**
 * Database connection.
 *
 * In a serverless deployment (Vercel) each warm function instance re-evaluates
 * modules, so a plain module-level `new Pool()` would leak a fresh pool on every
 * cold start and across HMR reloads in dev. We cache a single pool on
 * `globalThis` so warm invocations reuse it. `max` is kept small because each
 * instance holds its own pool — 10 × N instances would exhaust a small Postgres.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { env, isProd } from '../server/config/env';
import * as schema from './schema';

const { Pool } = pg;

const globalForDb = globalThis as unknown as { __nagrikPool?: pg.Pool };

export const pool =
  globalForDb.__nagrikPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 3,
    // Managed Postgres (Neon/Supabase/Railway) requires SSL in production.
    ssl: isProd ? { rejectUnauthorized: false } : undefined,
  });

globalForDb.__nagrikPool = pool;

export const db = drizzle(pool, { schema });

export type Database = typeof db;
export { schema };
