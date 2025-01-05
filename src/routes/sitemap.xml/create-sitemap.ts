export interface SitemapEntry {
  loc: string;
  priority: number;
  lastmod?: string;
}

export function createSitemap(entries: SitemapEntry[], origin: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries
  .map(
    (entry) => `  <url>
    <loc>${origin}${entry.loc.startsWith("/") ? "" : "/"}${entry.loc}</loc>
    <priority>${entry.priority}</priority>${
      entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
    }
  </url>`
  )
  .join("\n")}
</urlset>`.trim();
} 