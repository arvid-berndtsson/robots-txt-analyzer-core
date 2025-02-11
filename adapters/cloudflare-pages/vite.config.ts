import { cloudflarePagesAdapter } from "@builder.io/qwik-city/adapters/cloudflare-pages/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.cloudflare-pages.tsx", "@qwik-city-plan"],
      },
    },
    plugins: [
      cloudflarePagesAdapter({
        ssg: {
          include: [
            '/robots.txt',                 // Robots file
            '/humans.txt',                 // Humans file
            '/.well-known/security.txt',   // Security file
            '/',                           // Homepage
            '/what-is-robots-txt',         // Learning page
            '/api/docs',                   // API documentation
            '/about',                      // About page
            '/privacy'                     // Privacy policy
          ],
          origin: process.env.ORIGIN || 'https://robots-txt.arvid.tech',
          sitemapOutFile: 'sitemap.xml'
        },
      }),
    ],
  };
});
