# Design Tokens
## **THE NAGRIK** — Civic Literacy Initiative

This document serves as the absolute source of truth for the UI implementation. All frontend components must use these exact values (or their CSS variable equivalents).

---

## 1. Colors

### Brand Core
| Token | Hex Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#F5F5F0` | Main application background (Off-White) |
| `--color-bg-dark` | `#1A2332` | Dark sections, Footer background (Deep Navy) |
| `--color-accent` | `#C45C3C` | Primary buttons, important links, hover states (Terracotta) |
| `--color-accent-hover` | `#A34B31` | Button hover states |

### Text & Surfaces
| Token | Hex Value | Usage |
|---|---|---|
| `--color-text-primary` | `#1A2332` | Default text color on light backgrounds |
| `--color-text-secondary` | `#4A5568` | Muted text, timestamps, subtitles |
| `--color-text-inverted` | `#F5F5F0` | Text on dark backgrounds (e.g., inside buttons, footer) |
| `--color-surface` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `--color-surface-muted` | `#EDEAE3` | Secondary elevated surfaces, tag backgrounds |
| `--color-border` | `#D4D0C8` | Input borders, dividers |

### Feedback / Semantic
| Token | Hex Value | Usage |
|---|---|---|
| `--color-success` | `#2D7A4D` | Success toasts, valid states |
| `--color-error` | `#D32F2F` | Error states, destructive actions |
| `--color-warning` | `#ED6C02` | Warning states |
| `--color-info` | `#0288D1` | Informational highlights |

---

## 2. Typography

**Font Families:**
- Serif: `--font-serif: 'DM Serif Display', Georgia, serif;`
- Sans-serif: `--font-sans: 'DM Sans', -apple-system, sans-serif;`

### Type Scale
*(Assuming base `16px = 1rem`)*

| Token | Size (px) | Size (rem) | Line Height | Font Family | Weight | Usage |
|---|---|---|---|---|---|---|
| `--text-h1-hero` | `72px` | `4.5rem` | `1.1` | Serif | 400 | Homepage hero headline |
| `--text-h1` | `52px` | `3.25rem` | `1.1` | Serif | 400 | Page titles (H1) |
| `--text-h2` | `40px` | `2.5rem` | `1.2` | Serif | 400 | Section headings (H2) |
| `--text-h3` | `32px` | `2rem` | `1.3` | Serif | 400 | Subsection headings (H3) |
| `--text-h4` | `24px` | `1.5rem` | `1.4` | Sans | 500 | Card titles |
| `--text-h5` | `20px` | `1.25rem` | `1.4` | Sans | 500 | Small headings |
| `--text-body-lg`| `18px` | `1.125rem` | `1.6` | Sans | 400 | Article body, intro paragraphs |
| `--text-body` | `16px` | `1rem` | `1.6` | Sans | 400 | Default body text |
| `--text-sm` | `14px` | `0.875rem`| `1.5` | Sans | 400 | Metadata, timestamps, tags |
| `--text-caption`| `12px` | `0.75rem` | `1.4` | Sans | 400 | Tiny labels, legal text |

---

## 3. Spacing

| Token | Size (px) | Size (rem) | Usage |
|---|---|---|---|
| `--space-xs` | `4px` | `0.25rem` | Tight clusters |
| `--space-sm` | `8px` | `0.5rem` | Between icons and text |
| `--space-md` | `16px` | `1rem` | Standard padding, small gaps |
| `--space-lg` | `24px` | `1.5rem` | Inner card padding, form gaps |
| `--space-xl` | `32px` | `2rem` | Between minor sections |
| `--space-2xl` | `48px` | `3rem` | Standard section vertical padding |
| `--space-3xl` | `64px` | `4rem` | Between major page sections |
| `--space-4xl` | `96px` | `6rem` | Hero section padding |
| `--space-5xl` | `128px`| `8rem` | Extremely airy layouts |

---

## 4. Radii & Borders

| Token | Size | Usage |
|---|---|---|
| `--radius-sm` | `2px` | Checkboxes |
| `--radius-md` | `4px` | Buttons, inputs, small badges |
| `--radius-lg` | `8px` | Cards, modals, images |
| `--radius-full` | `9999px` | Avatar circles, pill badges |

---

## 5. Animation

| Token | Duration | Usage |
|---|---|---|
| `--duration-fast` | `0.2s` | Hover states, color transitions, button presses |
| `--duration-normal`| `0.4s` | Modals, drawer openings, simple reveals |
| `--duration-slow` | `0.8s` | Hero entrance, page transitions |
| `--duration-reveal`| `1.2s` | Intricate scroll-based narratives |

**Easings:**
- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` (Default for UI)
- `--ease-in-out`: `cubic-bezier(0.65, 0, 0.35, 1)`
- `--ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (Bouncy UI elements)
