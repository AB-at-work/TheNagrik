import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.thenagrik.org';

  const routes = [
    '',
    '/about',
    '/learn',
    '/blog',
    '/projects',
    '/schools',
    '/contact',
    '/join',
    '/privacy',
    '/terms',
  ];

  const sitemap: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return sitemap;
}
