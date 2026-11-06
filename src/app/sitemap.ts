import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wnbahoopsnews.com';
  const routes = [
    '',
    '/news',
    '/scores',
    '/standings',
    '/players',
    '/stats',
    '/teams',
    '/schedule',
    '/about',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/scores' || route === '' ? 'hourly' : 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
