import 'dotenv/config';
import { db, pool } from './index';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Connecting to database...');
  console.log(`URL: ${process.env.DATABASE_URL?.split('@')[1]}`); // log host only for security

  console.log('Dropping dead-weight tables (contact_submissions, volunteer_registrations, newsletter_subscribers) if they exist...');
  
  await db.execute(sql`DROP TABLE IF EXISTS contact_submissions CASCADE;`);
  console.log('✓ Dropped contact_submissions (if existed)');
  
  await db.execute(sql`DROP TABLE IF EXISTS volunteer_registrations CASCADE;`);
  console.log('✓ Dropped volunteer_registrations (if existed)');
  
  await db.execute(sql`DROP TABLE IF EXISTS newsletter_subscribers CASCADE;`);
  console.log('✓ Dropped newsletter_subscribers (if existed)');

  console.log('Cleanup script executed successfully.');
}

main()
  .catch((err) => {
    console.error('❌ Cleanup script failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
