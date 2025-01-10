import { type RequestHandler } from '@builder.io/qwik-city';
import { exampleUrls } from '../../../../data/example-urls';
import { type KVNamespace, createLocalKV } from "../../../../utils/local-kv";

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

// Generate a fake history entry
function generateFakeEntry(timestamp: Date): HistoryEntry {
  const domain = exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
  return {
    url: `https://${domain}`,
    domain,
    timestamp: timestamp.toISOString()
  };
}

export const onGet: RequestHandler = async ({ json, env, request }) => {
  const apiKey = env.get("API_KEY");
  const historyKV = (typeof env.get("HISTORY_KV") === 'object' ? 
    env.get("HISTORY_KV") : createLocalKV()) as KVNamespace;

  if (request.headers.get("X-API-Key") !== apiKey) {
    throw json(401, { error: "Unauthorized" });
  }

  try {
    // Get all entries from KV
    const list = await historyKV.list({ prefix: 'analysis:' });
    const entries = await Promise.all(
      list.keys.map(async (key) => {
        try {
          const value = await historyKV.get(key.name);
          if (!value) return null;
          const data = JSON.parse(value);
          return {
            url: data.url,
            domain: data.domain,
            timestamp: data.timestamp
          };
        } catch (e) {
          console.error(`Failed to parse history entry ${key.name}:`, e);
          return null;
        }
      })
    );

    // Filter out nulls and old entries
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const validEntries = entries
      .filter((entry): entry is HistoryEntry => entry !== null)
      .filter(entry => new Date(entry.timestamp) > oneHourAgo);

    // If we have less than 25 entries, generate and save fake ones
    if (validEntries.length < 25) {
      const neededEntries = 25 - validEntries.length;
      let lastTimestamp = oneHourAgo.getTime();
      
      for (let i = 0; i < neededEntries; i++) {
        const randomDelay = Math.floor(Math.random() * (180 - 60 + 1) + 60) * 1000; // 60-180 seconds
        lastTimestamp += randomDelay;
        const fakeEntry = generateFakeEntry(new Date(lastTimestamp));
        
        // Save fake entry to KV
        await historyKV.put(
          `analysis:${fakeEntry.domain}:${fakeEntry.timestamp}`, 
          JSON.stringify(fakeEntry)
        );
        validEntries.push(fakeEntry);
      }
    }

    // Sort by timestamp
    const sortedEntries = validEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    json(200, sortedEntries);
  } catch (error) {
    console.error('Error:', error);
    throw json(500, { error: 'Failed to fetch history' });
  }
};
