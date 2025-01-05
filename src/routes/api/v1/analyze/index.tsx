import { type RequestHandler } from "@builder.io/qwik-city";
import { parseRobotsTxt, analyzeRobotsTxt } from "../../../../utils/robots-parser";

// Normalize URL to ensure HTTPS and protocol presence
const normalizeUrl = (url: string): string => {
  let normalizedUrl = url.trim();
  
  // Add protocol if missing
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  
  // Upgrade HTTP to HTTPS
  if (normalizedUrl.startsWith('http://')) {
    normalizedUrl = 'https://' + normalizedUrl.slice(7);
  }
  
  return normalizedUrl;
};

export const onPost: RequestHandler = async ({ json, parseBody, env, request }) => {
  const apiKey = env.get("API_KEY");

  if (request.headers.get("X-API-Key") !== apiKey) {
    throw json(401, { error: "Unauthorized" });
  }

  const body = await parseBody();
  const { url } = body as { url: string };

  if (!url) {
    throw json(400, { error: 'URL is required in the request body' });
  }

  try {
    const normalizedUrl = normalizeUrl(url);
    const robotsUrl = `${new URL(normalizedUrl).origin}/robots.txt`;
    const response = await fetch(robotsUrl);
    if (!response.ok) {
      throw json(404, { error: 'Robots.txt not found' });
    }
    const content = await response.text();
    const parsedRules = parseRobotsTxt(content);
    const analysis = analyzeRobotsTxt(parsedRules);

    json(200, { 
      url: normalizedUrl,
      robotsUrl,
      timestamp: new Date().toISOString(),
      rules: analysis.rules,
      summary: analysis.summary,
      sitemaps: analysis.sitemaps,
      recommendations: analysis.recommendations,
      raw_content: content
    });
  } catch (error) {
    console.error('Error:', error);
    throw json(500, { error: 'Failed to analyze robots.txt' });
  }
};
