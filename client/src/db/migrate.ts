/**
 * Migration runner: applies generated Drizzle migrations, then the hand-written
 * SQL (triggers, partial indexes) that Drizzle Kit does not generate.
 *
 * Run with: npm run db:migrate
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db, pool } from './index';
import { logger } from '../server/config/logger';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run(): Promise<void> {
  logger.info('Running Drizzle migrations…');
  await migrate(db, { migrationsFolder: join(__dirname, 'migrations') });

  logger.info('Applying custom SQL (triggers, partial indexes)…');
  const customSql = await readFile(join(__dirname, 'sql', 'functions.sql'), 'utf8');
  await pool.query(customSql);

  logger.info('✅ Migrations complete.');
  await pool.end();
}

run().catch((err) => {
  logger.error({ err }, '❌ Migration failed');
  process.exitCode = 1;
  void pool.end();
});
