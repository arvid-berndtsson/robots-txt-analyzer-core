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
    // Get real entries
    const realList = await historyKV.list({ prefix: 'history:' });
    const realEntries = await Promise.all(
      realList.keys.map(async (key) => {
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

    // Filter valid entries and sort by timestamp
    const validRealEntries = realEntries
      .filter((entry): entry is HistoryEntry => entry !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 25); // Only take latest 25

    // Get existing temporary entries
    const tempList = await historyKV.list({ prefix: 'temp-history:' });
    const tempEntries = await Promise.all(
      tempList.keys.map(async (key) => {
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
          console.error(`Failed to parse temp entry ${key.name}:`, e);
          return null;
        }
      })
    );

    const validTempEntries = tempEntries
      .filter((entry): entry is HistoryEntry => entry !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Combine real and temp entries
    const entries = [...validRealEntries];
    
    // If we have less than 25 entries, add existing temp entries and generate new ones if needed
    if (entries.length < 25) {
      entries.push(...validTempEntries);
      
      // If we still need more entries
      if (entries.length < 25) {
        const neededEntries = 25 - entries.length;
        
        // Start from most recent entry or current time
        let lastTimestamp = entries.length > 0 
          ? new Date(entries[0].timestamp).getTime()
          : Date.now();
        
        for (let i = 0; i < neededEntries; i++) {
          // Random delay between 1-5 minutes (60000-300000 ms)
          const randomDelay = Math.floor(Math.random() * (300000 - 60000 + 1) + 60000);
          lastTimestamp -= randomDelay; // Subtract delay to go backwards in time
          const tempEntry = generateFakeEntry(new Date(lastTimestamp));
          
          // Save temporary entry to KV
          await historyKV.put(
            `temp-history:${tempEntry.domain}:${tempEntry.timestamp}`, 
            JSON.stringify(tempEntry)
          );
          entries.push(tempEntry);
        }
      }

      // Sort all entries by timestamp
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    json(200, entries.slice(0, 25));
  } catch (error) {
    console.error('Error:', error);
    throw json(500, { error: 'Failed to fetch history' });
  }
};
