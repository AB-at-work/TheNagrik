import { WORDS_PER_MINUTE } from '../config/constants';

/** Strips HTML tags from a string (server-side, no DOM). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Reading time in whole minutes from rich-text HTML body
 * (BackendSchema §4.5: Math.ceil(words / 200), minimum 1).
 */
export function calculateReadingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
