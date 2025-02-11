import type { RequestHandler } from "@builder.io/qwik-city";
import { routes } from "@qwik-city-plan";
import { createSitemap } from "./create-sitemap";

// RouteConfig specifies that this route should not have a trailing slash.
export const onRequest: RequestHandler = ({ pathname, redirect }) => {
  if (pathname.endsWith("/")) {
    throw redirect(302, pathname.slice(0, -1));
  }
};

// Normalize path to ensure leading slash and add trailing slash (except for root which already has it)
function normalizePath(path: string): string {
  // Ensure path starts with /
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;

  // Add trailing slash if not root and doesn't end with slash
  if (withLeadingSlash === "/") return withLeadingSlash;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export const onGet: RequestHandler = async ({ env, send }) => {
  try {
    const origin = env.get("ORIGIN");
    if (!origin) {
      throw new Error("ORIGIN environment variable is not configured");
    }

    // Define predefined routes with normalized paths
    const predefinedRoutes = [
      { loc: "/", priority: 1.0 },
      { loc: "/about/", priority: 0.8 },
      { loc: "/what-is-robots-txt/", priority: 0.8 },
      { loc: "/analyzer/", priority: 0.9 },
      { loc: "/history/", priority: 0.7 },
    ];

    // Create a Set of normalized predefined paths for filtering
    const predefinedPaths = new Set(
      predefinedRoutes.map((route) => normalizePath(route.loc)),
    );

    // Get unique normalized routes from Qwik City plan
    const uniqueRoutes = new Set(
      routes
        .map(([route]) => normalizePath(route as string))
        .filter(
          (route) =>
            !predefinedPaths.has(route) && // Exclude predefined routes
            !route.includes("[") && // Exclude parameter routes
            !route.includes("api/") && // Exclude API routes
            !route.includes("sitemap.xml") && // Exclude sitemap itself
            !route.includes("robots.txt"), // Exclude robots.txt
        ),
    );

    // Create final sitemap entries
    const sitemapEntries = [
      ...predefinedRoutes,
      ...Array.from(uniqueRoutes).map((route) => ({
        loc: route,
        priority: 0.5,
      })),
    ];

    const sitemap = createSitemap(sitemapEntries, origin);

    if (!sitemap) {
      throw new Error("Failed to generate sitemap");
    }

    send(
      new Response(sitemap, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "X-Robots-Tag": "noindex",
        },
      }),
    );
  } catch (error) {
    console.error("Error generating sitemap:", error);
    send(
      new Response("Error generating sitemap", {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      }),
    );
  }
};
