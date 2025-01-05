import { type RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ html }) => {
  const baseUrl = 'https://robots-txt.arvid.tech';
  const routes = [
    '/',
    '/analyzer',
    '/history',
    '/about',
    '/faq',
    '/privacy',
    '/terms',
    '/contact'
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  `).join('')}
</urlset>`;

  html(200, sitemap);
};
