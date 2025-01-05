import type { RequestHandler } from "@builder.io/qwik-city";

// RouteConfig specifies that this route should not have a trailing slash.
export const onRequest: RequestHandler = ({ pathname, redirect }) => {
  if (pathname.endsWith("/")) {
    throw redirect(302, pathname.slice(0, -1));
  }
};

// RobotsTxt returns the robots.txt file content.
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
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Robots-Tag": "noindex",
      },
    })
  );
};