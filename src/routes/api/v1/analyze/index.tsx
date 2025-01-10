import { type RequestHandler } from "@builder.io/qwik-city";
import { parseRobotsTxt, analyzeRobotsTxt } from "../../../../utils/robots-parser";
import { type KVNamespace, createLocalKV } from "../../../../utils/local-kv";

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
  // Use local KV implementation if running locally
  const historyKV = (typeof env.get("HISTORY_KV") === 'object' ? 
    env.get("HISTORY_KV") : createLocalKV()) as KVNamespace;

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
    const domain = new URL(normalizedUrl).hostname;
    
    // Check cache first
    const cachedResult = await historyKV.get(`analysis:${domain}`);
    if (cachedResult) {
      const parsed = JSON.parse(cachedResult);
      const cacheAge = Date.now() - new Date(parsed.timestamp).getTime();
      
      // If cache is less than 60 seconds old, return it
      if (cacheAge < 60000) {
        json(200, parsed);
        return;
      }
    }

    // Fetch and analyze if no cache or cache is too old
    const robotsUrl = `${new URL(normalizedUrl).origin}/robots.txt`;
    const response = await fetch(robotsUrl);
    if (!response.ok) {
      throw json(404, { error: 'Robots.txt not found' });
    }
    const content = await response.text();
    const parsedRules = parseRobotsTxt(content);
    const analysis = analyzeRobotsTxt(parsedRules, normalizedUrl);

    // Generate export data
    const jsonData = JSON.stringify({
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
      analysis: {
        summary: analysis.summary,
        rules: analysis.rules,
        sitemaps: analysis.sitemaps,
        recommendations: analysis.recommendations,
        urls: analysis.urls
      },
      attribution: {
        tool: "Robots.txt Analyzer",
        url: "https://robots-txt.arvid.tech/",
        author: "Arvid Berndtsson"
      }
    }, null, 2);

    const headers = ['User Agent', 'Type', 'Allowed Paths', 'Disallowed Paths', 'Crawl Delay'];
    const rows = parsedRules.map(rule => [
      rule.userAgent,
      rule.userAgent === '*' ? 'Global' : 'Specific',
      rule.allow.join('; '),
      rule.disallow.join('; '),
      rule.crawlDelay || ''
    ]);
    const csvData = [
      ['# Analysis generated using Robots.txt Analyzer (https://robots-txt.arvid.tech/) by Arvid Berndtsson'],
      ['# Generated at: ' + new Date().toISOString()],
      [''],
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');

    const result = { 
      url: normalizedUrl,
      robotsUrl,
      domain: new URL(normalizedUrl).hostname,
      timestamp: new Date().toISOString(),
      rules: analysis.rules,
      summary: analysis.summary,
      sitemaps: analysis.sitemaps,
      recommendations: analysis.recommendations,
      raw_content: content,
      export: {
        jsonData,
        csvData
      }
    };

    // Cache the result
    await historyKV.put(`analysis:${domain}`, JSON.stringify(result));

    json(200, result);
    return;
  } catch (error) {
    console.error('Error:', error);
    throw json(500, { error: 'Failed to analyze robots.txt' });
  }
};
