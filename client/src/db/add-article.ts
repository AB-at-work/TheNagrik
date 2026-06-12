import 'dotenv/config';
import { db } from './index';
import { articles, categories, users } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  const admin = await db.query.users.findFirst({
    where: eq(users.email, 'admin@thenagrik.org')
  });
  if (!admin) return;

  const category = await db.query.categories.findFirst();
  if (!category) return;

  const [created] = await db.insert(articles).values({
    title: 'Test Article for Deletion',
    slug: 'test-article-deletion',
    body: '<p>This is a test article to verify the delete button functionality.</p>',
    categoryId: category.id,
    authorId: admin.id,
    status: 'draft',
  }).returning();

  console.log('Created ID:', created?.id);
}

main().catch(console.error);
