export interface SitemapEntry {
  loc: string;
  priority: number;
  lastmod?: string;
}

// CreateSitemap generates a valid XML sitemap from the provided entries.
export function createSitemap(entries: SitemapEntry[], origin: string): string {
  if (entries.length === 0) {
    throw new Error("No entries provided for sitemap");
  }

  if (!origin) {
    throw new Error("Origin is required for sitemap generation");
  }

  const xmlEntries = entries
    .map(
      (entry) => `  <url>
    <loc>${origin}${entry.loc.startsWith("/") ? "" : "/"}${entry.loc}</loc>
    <priority>${entry.priority.toFixed(1)}</priority>${
        entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
      }
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlEntries}
</urlset>`;
}