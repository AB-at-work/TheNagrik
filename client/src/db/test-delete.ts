import 'dotenv/config';
import { db } from './index';
import { users, articles, categories } from './schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

async function main() {
  console.log('Testing DELETE article endpoint...');

  // 1. Get super_admin user
  const admin = await db.query.users.findFirst({
    where: eq(users.email, 'admin@thenagrik.org')
  });

  if (!admin) {
    console.error('Super admin not found');
    return;
  }

  // 2. Generate a valid access token
  const token = jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET || 'replace-with-a-secure-256-bit-secret',
    { expiresIn: '15m' }
  );

  // 3. Find an article
  const article = await db.query.articles.findFirst();
  if (!article) {
    console.log('No articles found to delete. Seeding might be needed.');
    return;
  }

  console.log(`Attempting to delete article: ${article.title} (${article.id})`);

  try {
    const res = await fetch(`http://localhost:3000/api/v1/articles/${article.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('HTTP Status:', res.status);
    const body = await res.json();
    console.log('Response Body:', JSON.stringify(body, null, 2));
  } catch (error) {
    console.error('Request failed:', error);
  }
}

main().catch(console.error);
