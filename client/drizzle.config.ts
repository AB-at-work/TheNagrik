import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit configuration for the monolithic Next.js app.
 * Schema is the single source of truth; migrations are generated into
 * src/db/migrations. Custom SQL (triggers, partial indexes) is applied by
 * src/db/migrate.ts alongside the generated migrations.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://nagrik:nagrik@localhost:5432/thenagrik_dev',
  },
  verbose: true,
  strict: true,
});
