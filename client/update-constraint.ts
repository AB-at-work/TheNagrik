import { db } from './src/db/index';
import { sql } from 'drizzle-orm';

async function updateConstraint() {
  try {
    await db.execute(sql`ALTER TABLE projects DROP CONSTRAINT projects_status_check`);
    console.log('Dropped old constraint');
  } catch (e: any) {
    console.log('Error dropping constraint (may not exist):', e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'active', 'completed', 'upcoming'))`);
    console.log('Added new constraint');
  } catch (e: any) {
    console.log('Error adding constraint:', e.message);
  }
  process.exit(0);
}

updateConstraint();
