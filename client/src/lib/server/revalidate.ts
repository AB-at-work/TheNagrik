import { revalidatePath } from 'next/cache';

/**
 * Forcefully flushes the entire site's Next.js Data Cache and Route Cache.
 * Useful after an admin mutation (create/update/delete) so public pages update instantly.
 */
export function revalidateSite() {
  try {
    // Revalidate the root layout, effectively clearing everything.
    revalidatePath('/', 'layout');
  } catch (err) {
    console.error('Failed to revalidate site cache:', err);
  }
}
