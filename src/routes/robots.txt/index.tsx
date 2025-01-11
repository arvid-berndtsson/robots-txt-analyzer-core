import { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = ({ text }) => {
  const content = `# If you want to know more about how robots.txt works, please go to https://robots-txt.arvid.tech/
User-agent: *
Allow: /

Disallow: /api/
Sitemap: https://robots-txt.arvid.tech/sitemap.xml`;

  text(200, content);
}; 