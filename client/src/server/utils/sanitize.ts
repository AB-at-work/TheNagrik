import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes rich-text HTML produced by Tiptap before storage (BackendSchema
 * §18.1 — XSS protection). Allows a conservative editorial tag set; strips
 * scripts, styles, event handlers, and disallowed attributes.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em',
    'u', 's', 'code', 'pre', 'br', 'hr', 'img', 'figure', 'figcaption', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    span: ['class'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
