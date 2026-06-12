import 'dotenv/config';
import { db } from './index';
import { articles } from './schema';
import { deleteArticle } from '../server/modules/articles/articles.service';
import { eq } from 'drizzle-orm';

async function main() {
  const article = await db.query.articles.findFirst();
  if (!article) {
    console.log('No articles found to delete');
    return;
  }

  console.log('Found article in DB:', article.id);

  try {
    const deleted = await deleteArticle(article.id);
    console.log('✓ Successfully deleted directly! Result:', deleted);
  } catch (error) {
    console.error('❌ Direct delete failed:', error);
  }
}

main().catch(console.error);
