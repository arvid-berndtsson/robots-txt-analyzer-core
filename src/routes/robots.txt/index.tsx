import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ env, send }) => {
  const origin = env.get("ORIGIN");
  if (!origin) {
    throw new Error("ORIGIN environment variable is not configured");
  }

  const robotsTxt = `# Allow all web crawlers
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${origin}/sitemap.xml`;

  send(
    new Response(robotsTxt, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600",
      },
    })
  );
}; 