import { db } from './src/db/index';
import { blogPosts } from './src/db/schema';
import { isNull } from 'drizzle-orm';

async function test() {
  try {
    const c1 = await db.$count(blogPosts, isNull(blogPosts.deletedAt));
    console.log('c1:', c1);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
