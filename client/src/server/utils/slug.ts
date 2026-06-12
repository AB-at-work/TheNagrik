import { MAX_SLUG_LENGTH, RESERVED_SLUGS } from '../config/constants';

/**
 * Generates a URL-safe slug from a title (BackendSchema §9.2).
 * lowercase → strip diacritics → strip non-alphanumeric → collapse hyphens →
 * trim → truncate.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // remove diacritics
    .replace(/[\s_]+/g, '-') // spaces/underscores → hyphens (before stripping)
    .replace(/[^a-z0-9-]/g, '') // strip remaining non-alphanumeric, keep hyphens
    .replace(/-+/g, '-') // collapse hyphens
    .replace(/^-|-$/g, '') // trim leading/trailing hyphens
    .slice(0, MAX_SLUG_LENGTH);
}

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

/**
 * Ensures slug uniqueness given an existence-checking callback.
 * Appends -2, -3, … on collision. If the base slug is reserved, prefixes with
 * the entity type to keep it usable.
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
  reservedPrefix?: string,
): Promise<string> {
  let candidate = base || 'untitled';
  if (isReservedSlug(candidate) && reservedPrefix) {
    candidate = `${reservedPrefix}-${candidate}`.slice(0, MAX_SLUG_LENGTH);
  }
  if (!(await exists(candidate))) return candidate;

  let n = 2;
  // Reserve room for the numeric suffix within the length cap.
  for (;;) {
    const suffix = `-${n}`;
    const trimmed = candidate.slice(0, MAX_SLUG_LENGTH - suffix.length);
    const next = `${trimmed}${suffix}`;
    if (!(await exists(next))) return next;
    n += 1;
  }
}
