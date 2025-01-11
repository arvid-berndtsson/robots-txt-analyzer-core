import { type RequestHandler } from "@builder.io/qwik-city";
import { parseRobotsTxt, analyzeRobotsTxt } from "../../../../utils/robots-parser";
import type { D1Database } from "../../../../types/cloudflare";
import { createLocalDB } from "../../../../utils/local-db";

interface CacheEntry {
  result: string;
  timestamp: string;
}

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
  console.log('\n=== ANALYZE ENDPOINT CALLED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers));
  console.log('=== END REQUEST INFO ===\n');

  try {
    const apiKey = env.get("API_KEY");
    const db = (typeof env.get("DB") === 'object' ? 
      env.get("DB") : createLocalDB()) as D1Database;

    if (request.headers.get("X-API-Key") !== apiKey) {
      json(401, { error: "Unauthorized" });
      return;
    }

    if (!db) {
      json(500, { error: 'Database not available' });
      return;
    }

    const body = await parseBody();
    const { url } = body as { url: string };

    if (!url) {
      json(400, { error: 'URL is required in the request body' });
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    const domain = new URL(normalizedUrl).hostname;

    // Check cache first
    const { results: [cached] } = await db.prepare(
      "SELECT result, timestamp FROM cache WHERE domain = ?"
    ).bind(domain).all<CacheEntry>();

    let result;
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
      
      // If cache is less than 60 seconds old, use it
      if (cacheAge < 60000) {
        result = JSON.parse(cached.result);
        // Don't save to history if we're using cached result
        json(200, result);
        return;
      }
    }

    if (!result) {
      // Fetch and analyze if no cache or cache is too old
      const robotsUrl = `${new URL(normalizedUrl).origin}/robots.txt`;
      console.log('Fetching robots.txt from:', robotsUrl);
      
      const response = await fetch(robotsUrl, { 
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        if (response.status === 404) {
          json(404, { 
            error: 'Robots.txt not found',
            details: `No robots.txt file found at ${robotsUrl}`
          });
          return;
        }
        json(response.status, { 
          error: 'Failed to fetch robots.txt',
          details: `Server returned ${response.status} ${response.statusText}`
        });
        return;
      }

      const content = await response.text();
      if (!content.trim()) {
        json(400, { 
          error: 'Empty robots.txt',
          details: 'The robots.txt file exists but is empty'
        });
        return;
      }

      const parsedRules = parseRobotsTxt(content);
      const analysis = analyzeRobotsTxt(parsedRules, normalizedUrl);

      // Generate timestamp once and reuse it
      const timestamp = new Date().toISOString();

      // Generate export data
      const jsonData = JSON.stringify({
        url: normalizedUrl,
        timestamp,
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
        ['# Generated at: ' + timestamp],
        [''],
        headers,
        ...rows
      ].map(row => row.join(',')).join('\n');

      result = { 
        url: normalizedUrl,
        robotsUrl,
        timestamp,
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

      try {
        // Save to cache (for quick lookups)
        await db.prepare(
          "INSERT OR REPLACE INTO cache (domain, result, timestamp) VALUES (?, ?, ?)"
        ).bind(domain, JSON.stringify(result), timestamp).run();

        // Save to history (as a log entry)
        await db.prepare(`
          INSERT INTO analyses (domain, url, timestamp, is_real) 
          VALUES (?, ?, ?, 1)
        `).bind(
          domain,
          normalizedUrl,
          timestamp
        ).run();
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if saving to DB fails
      }
    }

    json(200, result);
  } catch (error) {
    console.error('Error:', error);
    
    // Handle specific error types
    if (error instanceof TypeError && error.message.includes('URL')) {
      json(400, { 
        error: 'Invalid URL',
        details: 'The provided URL is not properly formatted'
      });
      return;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      json(504, { 
        error: 'Request timeout',
        details: 'The request to fetch robots.txt timed out'
      });
      return;
    }
    if (error instanceof Error && error.message.includes('parse')) {
      json(400, { 
        error: 'Invalid robots.txt format',
        details: 'Failed to parse the robots.txt file content'
      });
      return;
    }
    if (error instanceof Error && error.message.includes('database')) {
      json(500, { 
        error: 'Database error',
        details: 'Failed to interact with the database'
      });
      return;
    }

    // Default error response
    json(500, { 
      error: 'Internal server error',
      details: 'An unexpected error occurred while analyzing robots.txt'
    });
  }
};
