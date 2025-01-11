import { type RequestHandler } from '@builder.io/qwik-city';
import { exampleUrls } from "~/data/example-urls";
import type { D1Database } from "../../../../types/cloudflare";
import { createLocalDB } from "../../../../utils/local-db";

interface HistoryEntry {
  domain: string;
  url: string;
  timestamp: string;
}

// Generate a fake entry
function generateFakeEntry(timestamp: Date): HistoryEntry {
  const randomUrl = exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
  // Ensure URL has a protocol
  const fullUrl = randomUrl.startsWith('http') ? randomUrl : `https://${randomUrl}`;
  return {
    url: fullUrl,
    domain: new URL(fullUrl).hostname,
    timestamp: timestamp.toISOString()
  };
}

interface HistoryEntry {
  url: string;
  domain: string;
  timestamp: string;
  rules?: Array<{
    userAgent: string;
    isGlobal: boolean;
    disallowedPaths: string[];
    allowedPaths: string[];
    crawlDelay?: number;
  }>;
  summary?: {
    totalRules: number;
    hasGlobalRule: boolean;
    totalSitemaps: number;
    score: number;
    status: '✅ All Good' | '⚠️ Some Issues' | '❌ Major Issues' | '❓ Potential Issues';
  };
  sitemaps?: {
    urls: string[];
    issues: string[];
  };
  recommendations?: Array<{
    message: string;
    severity: 'error' | 'warning' | 'info' | 'potential';
    details?: string;
  }>;
  raw_content?: string;
}

// TODO: Make more secure with API key
export const onGet: RequestHandler = async ({ json, env, request }) => {
  console.log('=== HISTORY ENDPOINT CALLED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  const apiKey = env.get("API_KEY");
  console.log('History: DB from env:', typeof env.get("DB"));
  const db = (typeof env.get("DB") === 'object' ? 
    env.get("DB") : createLocalDB()) as D1Database;
  console.log('History: Using local DB:', typeof env.get("DB") !== 'object');

  if (request.headers.get("X-API-Key") !== apiKey) {
    throw json(401, { error: "Unauthorized" });
  }

  if (!db) {
    throw json(500, { error: 'Database not available' });
  }

  try {
    // Get the 25 most recent entries from the last 2 hours
    console.log('History: Fetching entries...');
    const stmt = db.prepare(`
      SELECT domain, url, timestamp 
      FROM analyses 
      WHERE timestamp > datetime('now', '-2 hours')
      ORDER BY timestamp DESC
      LIMIT 25
    `);
    console.log('History: Prepared statement:', stmt);
    const { results: entries } = await stmt.all<HistoryEntry>();
    console.log('History: Entries:', entries);

    // If we have 25 entries, return them
    if (entries.length >= 25) {
      json(200, entries);
      return;
    }

    // Delete any existing fake entries older than 2 hours
    await db.prepare(`
      DELETE FROM analyses 
      WHERE is_real = 0 
      AND timestamp < datetime('now', '-2 hours')
    `).run();

    // Generate fake entries if needed
    const neededEntries = 25 - entries.length;
    let lastTimestamp = Date.now();
    const fakeEntries: HistoryEntry[] = [];

    for (let i = 0; i < neededEntries; i++) {
      // Random delay between 1-7 minutes
      const randomDelay = Math.floor(Math.random() * (420000 - 60000 + 1) + 60000);
      lastTimestamp -= randomDelay;
      
      // Don't add entries older than 2 hours
      if (Date.now() - lastTimestamp > 7200000) break;

      const timestamp = new Date(lastTimestamp);
      const fakeEntry = generateFakeEntry(timestamp);
      
      // Save the fake entry to the database
      await db.prepare(`
        INSERT INTO analyses (domain, url, timestamp, is_real) 
        VALUES (?, ?, ?, 0)
      `).bind(
        fakeEntry.domain,
        fakeEntry.url,
        timestamp.toISOString()
      ).run();

      fakeEntries.push(fakeEntry);
    }

    // Combine all entries and sort by timestamp
    const allEntries = [...entries, ...fakeEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    json(200, allEntries);
  } catch (error) {
    console.error('Error:', error);
    throw json(500, { error: 'Failed to fetch history' });
  }
};
