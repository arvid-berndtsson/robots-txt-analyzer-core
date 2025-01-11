import { type RequestHandler } from '@builder.io/qwik-city';
import { exampleUrls } from "~/data/example-urls";
import type { D1Database } from "../../../../types/cloudflare";
import { createLocalDB } from "../../../../utils/local-db";

interface HistoryEntry {
  domain: string;
  url: string;
  timestamp: string;
  is_real: boolean;
}

// Generate a fake entry
function generateFakeEntry(timestamp: Date): HistoryEntry {
  const randomUrl = exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
  // Ensure URL has a protocol
  const fullUrl = randomUrl.startsWith('http') ? randomUrl : `https://${randomUrl}`;
  return {
    url: fullUrl,
    domain: new URL(fullUrl).hostname,
    timestamp: timestamp.toISOString(),
    is_real: false
  };
}

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
    // Get all entries (both real and fake)
    console.log('History: Fetching entries...');
    const stmt = db.prepare(`
      SELECT domain, url, timestamp, is_real
      FROM analyses 
      ORDER BY timestamp DESC
    `);
    console.log('History: Prepared statement:', stmt);
    const { results: existingEntries } = await stmt.all<HistoryEntry>();
    console.log('History: Found', existingEntries.length, 'total entries');

    // Check how many recent entries we have in the last 2 hours
    const twoHoursAgo = Date.now() - 7200000;
    const recentEntries = existingEntries.filter(
      entry => new Date(entry.timestamp).getTime() > twoHoursAgo
    );

    // If we have enough recent entries, return all entries
    if (recentEntries.length >= 10) {
      json(200, existingEntries);
      return;
    }

    // Delete any existing fake entries
    await db.prepare(`
      DELETE FROM analyses 
      WHERE is_real = false
    `).run();

    // Generate fake entries if needed to show activity in last 2 hours
    const neededEntries = 10 - recentEntries.length;
    const now = Date.now();
    console.log('History: Generating', neededEntries, 'fake entries');
    
    // Calculate time slots for even distribution
    const timeSlotSize = Math.floor(7200000 / neededEntries);
    const fakeEntries: HistoryEntry[] = [];

    // Generate all fake entries first
    for (let i = 0; i < neededEntries; i++) {
      // Calculate a random time within this slot
      const slotStart = now - (i * timeSlotSize);
      const slotEnd = slotStart - timeSlotSize;
      const randomTime = Math.floor(Math.random() * (slotStart - slotEnd) + slotEnd);
      
      const timestamp = new Date(randomTime);
      fakeEntries.push(generateFakeEntry(timestamp));
    }

    // Sort fake entries by timestamp
    fakeEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Insert all fake entries in a single batch
    const placeholders = fakeEntries.map(() => '(?, ?, ?, ?)').join(', ');
    const values = fakeEntries.flatMap(entry => [
      entry.domain,
      entry.url,
      entry.timestamp,
      false // Explicitly set is_real to false for fake entries
    ]);

    await db.prepare(`
      INSERT INTO analyses (domain, url, timestamp, is_real) 
      VALUES ${placeholders}
    `).bind(...values).run();

    // Get all entries including the newly added fake ones
    const { results: allEntries } = await db.prepare(`
      SELECT domain, url, timestamp, is_real
      FROM analyses 
      ORDER BY timestamp DESC
    `).all<HistoryEntry>();
    
    console.log('History: Returning', allEntries.length, 'total entries');

    json(200, allEntries);
  } catch (error) {
    console.error('Error:', error);
    throw json(500, { error: 'Failed to fetch history' });
  }
};
