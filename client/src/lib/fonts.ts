import { DM_Sans, DM_Serif_Display } from 'next/font/google';

/**
 * Self-hosted Google Fonts via next/font (no layout shift, font-display: swap).
 * Exposes CSS variables consumed by tokens.css.
 */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
});
