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
    if (recentEntries.length >= 50) {
      json(200, existingEntries);
      return;
    }

    // Delete any existing fake entries
    await db.prepare(`
      DELETE FROM analyses 
      WHERE is_real = false
    `).run();

    // Generate fake entries if needed to show activity in last 2 hours
    const neededEntries = 50 - recentEntries.length;
    const now = Date.now();
    console.log('History: Generating', neededEntries, 'fake entries');
    
    // Create user session patterns (people coming in, doing a few scans, then leaving)
    const sessions = [
      { size: 4, timeSpan: 120000 },   // Someone scanning 4 sites in 2 minutes
      { size: 2, timeSpan: 60000 },    // Quick check of 2 sites in 1 minute
      { size: 7, timeSpan: 300000 },   // Thorough check of 7 sites in 5 minutes
      { size: 3, timeSpan: 90000 },    // 3 quick scans in 1.5 minutes
      { size: 5, timeSpan: 180000 },   // 5 scans in 3 minutes
      { size: 2, timeSpan: 45000 },    // 2 quick comparisons
      { size: 6, timeSpan: 240000 },   // 6 sites in 4 minutes
      { size: 3, timeSpan: 120000 },   // 3 scans in 2 minutes
      { size: 4, timeSpan: 150000 },   // 4 scans in 2.5 minutes
      { size: 3, timeSpan: 90000 },    // 3 more quick scans
    ];
    
    const fakeEntries: HistoryEntry[] = [];
    let entriesNeeded = neededEntries;
    let currentTime = now;

    // Distribute sessions across the 2-hour window
    while (entriesNeeded > 0 && sessions.length > 0) {
      // Pick a random session pattern
      const sessionIndex = Math.floor(Math.random() * sessions.length);
      const session = sessions[sessionIndex];
      sessions.splice(sessionIndex, 1); // Remove used session

      // Skip if this session would create too many entries
      if (session.size > entriesNeeded) {
        continue;
      }

      // Add some random gap between sessions (2-15 minutes)
      currentTime -= Math.floor(Math.random() * 780000) + 120000;

      // Generate entries for this session
      for (let i = 0; i < session.size; i++) {
        // Calculate time within session (slightly random intervals)
        const progress = i / (session.size - 1);
        const baseOffset = session.timeSpan * progress;
        const randomVariation = Math.floor(Math.random() * 15000); // Up to 15 seconds variation
        const timestamp = new Date(currentTime - baseOffset - randomVariation);

        fakeEntries.push(generateFakeEntry(timestamp));
      }

      entriesNeeded -= session.size;
    }

    // If we still need entries, add some individual scans
    while (entriesNeeded > 0) {
      // Random time in the remaining window
      const randomTime = Math.floor(Math.random() * 7200000);
      const timestamp = new Date(now - randomTime);
      fakeEntries.push(generateFakeEntry(timestamp));
      entriesNeeded--;
    }

    // Sort fake entries by timestamp
    fakeEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Insert fake entries one by one (more compatible with D1)
    for (const entry of fakeEntries) {
      await db.prepare(`
        INSERT INTO analyses (domain, url, timestamp, is_real) 
        VALUES (?, ?, ?, ?)
      `).bind(
        entry.domain,
        entry.url,
        entry.timestamp,
        0
      ).run();
    }

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
